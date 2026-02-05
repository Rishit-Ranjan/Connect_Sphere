const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize app (if not initialized already)
try {
  admin.initializeApp();
} catch (e) {
  // already initialized
}

const db = admin.firestore();

// Trigger when a connection request is created
exports.onConnectionRequestCreated = functions.firestore
  .document('connectionRequests/{reqId}')
  .onCreate(async (snap, context) => {
    const req = snap.data();
    if (!req) return null;

    const notification = {
      recipientId: req.toId,
      type: 'connection_request',
      triggeringUserId: req.fromId,
      postId: null,
      messageContent: 'You have a new connection request',
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('notifications').add(notification);
    return null;
  });

// Trigger when a connection request is updated (accepted/declined)
exports.onConnectionRequestUpdated = functions.firestore
  .document('connectionRequests/{reqId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return null;

    if (before.status === 'pending' && after.status === 'accepted') {
      const notification = {
        recipientId: after.fromId,
        type: 'connection_accepted',
        triggeringUserId: after.toId,
        postId: null,
        messageContent: 'Your connection request was accepted',
        read: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('notifications').add(notification);
    } else if (before.status === 'pending' && after.status === 'declined') {
      const notification = {
        recipientId: after.fromId,
        type: 'connection_declined',
        triggeringUserId: after.toId,
        postId: null,
        messageContent: 'Your connection request was declined',
        read: false,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('notifications').add(notification);
    }

    return null;
  });
