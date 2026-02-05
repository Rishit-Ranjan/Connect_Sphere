const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  console.log('Starting migration: create userPrivacy docs for existing users...');
  const usersSnap = await db.collection('users').get();
  let count = 0;
  const batch = db.batch();
  usersSnap.forEach(doc => {
    const data = doc.data();
    const privacyRef = db.collection('userPrivacy').doc(doc.id);
    const payload = {
      statusMessage: data.statusMessage || '',
      statusVisibility: data.statusVisibility || 'everyone',
      presenceVisibility: data.presenceVisibility || 'everyone',
      isOnline: data.isOnline || false,
      lastSeen: data.lastSeen || null
    };
    batch.set(privacyRef, payload, { merge: true });
    count++;
  });
  if (count > 0) {
    await batch.commit();
    console.log(`Created/updated ${count} userPrivacy docs.`);
  } else {
    console.log('No users found.');
  }
  process.exit(0);
})();