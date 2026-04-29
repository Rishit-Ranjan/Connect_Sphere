import { Server } from 'socket.io';
import admin from 'firebase-admin';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'))
});

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const io = new Server(process.env.PORT || 3000, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Track connected users
const connectedUsers = new Map();

// ============================================
// Authentication Middleware
// ============================================
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('authentication-error'));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.user = decodedToken;
    next();
  } catch (error) {
    next(new Error('authentication-error'));
  }
});

// ============================================
// Connection Handling
// ============================================
io.on('connection', (socket) => {
  const userId = socket.user.uid;
  console.log(`User ${userId} connected via WebSocket`);

  // Track user connection
  connectedUsers.set(userId, {
    socketId: socket.id,
    connectedAt: Date.now()
  });

  // Join user's personal room for targeted messages
  socket.join(`user:${userId}`);

  // Subscribe to user's events
  redis.subscribe(`user:${userId}`);

  // ============================================
  // Handle: Presence Update
  // ============================================
  socket.on('presence_update', async (data) => {
    const { isOnline } = data;
    
    // Update Redis cache
    await redis.hset('presence', userId, JSON.stringify({
      isOnline,
      lastSeen: Date.now()
    }));

    // Broadcast to all connected clients
    io.emit('presence_update', {
      userId,
      isOnline
    });

    // Also update Firestore (async, non-blocking)
    admin.firestore().doc(`userPrivacy/${userId}`).set({
      isOnline,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(console.error);
  });

  // ============================================
  // Handle: New Notification
  // ============================================
  socket.on('notification_read', async (notificationId) => {
    // Mark notification as read in Firestore
    admin.firestore().doc(`notifications/${notificationId}`).set({
      read: true
    }, { merge: true }).catch(console.error);
  });

  // ============================================
  // Handle: Chat Message
  // ============================================
  socket.on('typing_start', (data) => {
    const { chatId, recipientId } = data;
    socket.to(`user:${recipientId}`).emit('user_typing', {
      chatId,
      userId
    });
  });

  socket.on('typing_stop', (data) => {
    const { chatId, recipientId } = data;
    socket.to(`user:${recipientId}`).emit('user_stopped_typing', {
      chatId,
      userId
    });
  });

  // ============================================
  // Handle: Disconnect
  // ============================================
  socket.on('disconnect', async () => {
    console.log(`User ${userId} disconnected`);

    connectedUsers.delete(userId);

    // Update presence to offline
    await redis.hset('presence', userId, JSON.stringify({
      isOnline: false,
      lastSeen: Date.now()
    }));

    // Broadcast offline status
    io.emit('presence_update', {
      userId,
      isOnline: false
    });

    // Update Firestore
    admin.firestore().doc(`userPrivacy/${userId}`).set({
      isOnline: false,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(console.error);
  });
});

// ============================================
// Redis Message Handler (Pub/Sub)
// ============================================
redis.on('message', (channel, message) => {
  if (channel.startsWith('user:')) {
    const userId = channel.split(':')[1];
    io.to(`user:${userId}`).emit('server_message', JSON.parse(message));
  }
});

// ============================================
// Health Check Endpoint
// ============================================
io.on('health_check', () => {
  io.emit('health_check_response', {
    status: 'healthy',
    connectedUsers: connectedUsers.size,
    timestamp: Date.now()
  });
});

console.log(`
╔═══════════════════════════════════════════════════╗
║     ConnectSphere WebSocket Gateway               ║
║     Running on port ${process.env.PORT || 3000}                         ║
╚═══════════════════════════════════════════════════╝
`);

export default io;