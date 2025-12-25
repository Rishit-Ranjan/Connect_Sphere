let admin;
try {
    admin = require('firebase-admin');
} catch (e) {
    console.error("Error: 'firebase-admin' module not found.");
    console.error("Please run: npm install firebase-admin");
    process.exit(1);
}

try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (e) {
    console.error("Error: serviceAccountKey.json not found. Please download it from Firebase Console.");
    process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Usage: node scripts/createAdmin.js <email> <password> <name>');
    process.exit(1);
}

const [email, password, name] = args;

async function createAdmin() {
    try {
        console.log(`Creating user ${email}...`);
        
        // 1. Create User in Authentication
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name,
        });
        console.log(`Successfully created auth user: ${userRecord.uid}`);

        // 2. Create User Document in Firestore
        // Note: We don't generate crypto keys here. Your App.jsx's ensureUserKeyPair 
        // function will handle key generation automatically on the first login.
        const userData = {
            id: userRecord.uid,
            name: name,
            email: email,
            role: 'admin', 
            gender: 'Not Specified', 
            status: 'active',
            followers: [],
            following: [],
            isOnline: false,
            emailNotifications: true,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log('Successfully created admin profile in Firestore.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();