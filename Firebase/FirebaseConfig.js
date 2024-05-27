// Import the individual Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAr5fkLdfysLCKD0IrTqTjQ4DhbQok_uW0",
  authDomain: "chatx-2294c.firebaseapp.com",
  databaseURL: "https://chatx-2294c-default-rtdb.firebaseio.com",
  projectId: "chatx-2294c",
  storageBucket: "chatx-2294c.appspot.com",
  messagingSenderId: "551385344314",
  appId: "1:551385344314:web:d311a25c12c4272e520803",
  measurementId: "G-GECBR334KY"
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const firestore = getFirestore(firebaseApp);
export { auth, database, firestore };

