import { Server } from 'socket.io';

const io = new Server(3000, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

console.log('🚀 WebSocket Gateway running on ws://localhost:3000');

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.emit('connected', { message: 'Connected to gateway' });

  // Track presence
  socket.on('presence_update', (data) => {
    console.log('Presence update:', data);
    io.emit('presence_update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit('presence_update', { userId: socket.id, isOnline: false });
  });
});
