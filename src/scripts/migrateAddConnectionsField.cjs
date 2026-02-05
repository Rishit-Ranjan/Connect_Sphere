const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  console.log('Starting migration: ensure users have connections & statusMessage & isOnline fields...');
  const usersSnap = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  usersSnap.forEach(doc => {
    const data = doc.data();
    const updates = {};
    if (!('connections' in data)) updates.connections = [];
    if (!('statusMessage' in data)) updates.statusMessage = '';
    if (!('isOnline' in data)) updates.isOnline = false;
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
  });
  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} user docs.`);
  } else {
    console.log('No migrations needed.');
  }
  process.exit(0);
})();