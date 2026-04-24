const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
// Fallback to '(default)' if firestoreDatabaseId is missing
const databaseId = config.firestoreDatabaseId || '(default)';
const db = getFirestore(app, databaseId);

async function run() {
  try {
    const querySnapshot = await getDocs(collection(db, 'tracks'));
    console.log(`Success! Found ${querySnapshot.size} tracks.`);
  } catch (error) {
    console.error('Error fetching tracks:', error);
  }
}
run();
