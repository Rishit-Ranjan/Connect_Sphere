// c:\Users\Asus\OneDrive\Documents\web_dev\connect_sphere\functions\index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Callable function to delete a user account.
 * Only accessible by users with the 'admin' role.
 * Deletes from: Authentication, Firestore (users, userPrivacy), and Realtime Database.
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }

    const callerUid = context.auth.uid;
    const targetUserId = data.userId;

    if (!targetUserId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with a userId.'
        );
    }

    // 2. Verify Admin Role (Security Check)
    try {
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
        if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Only admins can delete users.'
            );
        }
    } catch (error) {
        console.error("Error verifying admin role:", error);
        throw new functions.https.HttpsError('internal', 'Unable to verify permissions.');
    }

    // 3. Delete from Firebase Authentication
    try {
        await admin.auth().deleteUser(targetUserId);
        console.log(`Successfully deleted user ${targetUserId} from Auth.`);
    } catch (error) {
        console.error("Error deleting auth user:", error);
        // If the user doesn't exist in Auth, we continue to clean up the DBs.
        if (error.code !== 'auth/user-not-found') {
            throw new functions.https.HttpsError('internal', 'Failed to delete user authentication.');
        }
    }

    // 4. Clean up Database Records (Atomic Batch)
    const db = admin.firestore();
    const batch = db.batch();

    // Delete User Profile
    const userRef = db.collection('users').doc(targetUserId);
    batch.delete(userRef);

    // Delete Privacy Settings
    const privacyRef = db.collection('userPrivacy').doc(targetUserId);
    batch.delete(privacyRef);

    // Commit Firestore changes
    await batch.commit();

    // 5. Clean up Realtime Database Presence
    await admin.database().ref('status/' + targetUserId).remove();

    return { success: true, message: `User ${targetUserId} account deleted successfully.` };
});
