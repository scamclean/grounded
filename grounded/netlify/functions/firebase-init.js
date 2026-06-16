const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure FIREBASE_CONFIG environment variable is set
let firebaseApp;

function initFirebase() {
  if (firebaseApp) return firebaseApp;
  
  const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: process.env.FIREBASE_DB_URL
  });
  
  return firebaseApp;
}

function getDb() {
  initFirebase();
  return admin.firestore();
}

function getUserId(request) {
  // For now, use a simple session ID from localStorage on client
  // In production, you'd use proper auth (Firebase Auth, etc.)
  return request.headers.get('x-user-id') || 'default-user';
}

module.exports = { getDb, getUserId, initFirebase };
