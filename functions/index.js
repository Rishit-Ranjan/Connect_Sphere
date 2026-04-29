const { onCall } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

// ============================================
// SCALABILITY: Batch Presence Update
// ============================================
exports.batchUpdatePresence = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new Error("unauthenticated");
  }

  const { statuses } = request.data;
  
  if (!statuses || !Array.isArray(statuses)) {
    throw new Error("Invalid data: statuses array required");
  }

  const limitedStatuses = statuses.slice(0, 50);
  const batch = admin.firestore().batch();
  
  limitedStatuses.forEach(({ userId, isOnline }) => {
    const userPrivacyRef = admin.firestore().doc(`userPrivacy/${userId}`);
    batch.set(userPrivacyRef, { 
      isOnline, 
      lastSeen: admin.firestore.FieldValue.serverTimestamp() 
    }, { merge: true });
  });
  
  await batch.commit();
  
  return { success: true, processed: limitedStatuses.length };
});

// ============================================
// SCALABILITY: Batch Get Users
// ============================================
exports.batchGetUsers = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new Error("unauthenticated");
  }

  const { userIds } = request.data;
  
  if (!userIds || !Array.isArray(userIds)) {
    throw new Error("Invalid data: userIds array required");
  }

  const limitedIds = userIds.slice(0, 10);
  
  const snapshot = await admin.firestore()
    .collection("users")
    .where(admin.firestore.FieldPath.documentId(), "in", limitedIds)
    .get();
  
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return { users };
});

// ============================================
// SCALABILITY: Batch Get Posts
// ============================================
exports.batchGetPosts = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new Error("unauthenticated");
  }

  const { postIds } = request.data;
  
  if (!postIds || !Array.isArray(postIds)) {
    throw new Error("Invalid data: postIds array required");
  }

  const limitedIds = postIds.slice(0, 10);
  
  const snapshot = await admin.firestore()
    .collection("posts")
    .where(admin.firestore.FieldPath.documentId(), "in", limitedIds)
    .get();
  
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return { posts };
});

// ============================================
// Trigger: Send push notification on new notification
// ============================================
exports.onNewNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const recipientId = data.recipientId;

    const userDoc = await admin.firestore().doc(`users/${recipientId}`).get();
    const userData = userDoc.data();

    if (userData?.fcmToken) {
      const message = {
        notification: {
          title: "New Notification",
          body: data.messageContent || "You have a new notification"
        },
        token: userData.fcmToken,
        data: {
          type: data.type,
          triggeringUserId: data.triggeringUserId
        }
      };

      await admin.messaging().send(message);
    }
  }
);

// ============================================
// Trigger: Clean up old notifications (scheduled)
// ============================================
exports.cleanupOldNotifications = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new Error("unauthenticated");
  }

  const userDoc = await admin.firestore().doc(`users/${request.auth.uid}`).get();
  if (userDoc.data()?.role !== "admin") {
    throw new Error("unauthorized");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldNotifications = await admin.firestore()
    .collection("notifications")
    .where("timestamp", "<", thirtyDaysAgo)
    .limit(500)
    .get();

  const batch = admin.firestore().batch();
  oldNotifications.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return { success: true, deleted: oldNotifications.size };
});

// ============================================
// HTTP Endpoint: Get online users count
// ============================================
exports.getOnlineUsersCount = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new Error("unauthenticated");
  }

  const snapshot = await admin.firestore()
    .collection("userPrivacy")
    .where("isOnline", "==", true)
    .get();

  return { count: snapshot.size };
});
