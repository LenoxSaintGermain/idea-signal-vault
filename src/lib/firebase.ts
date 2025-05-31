
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDf9Pi-I8vYQRCmv0oGUIOlLVYca4hdluU",
  authDomain: "lsgp-consulting.firebaseapp.com",
  projectId: "lsgp-consulting",
  storageBucket: "lsgp-consulting.firebasestorage.app",
  messagingSenderId: "427639708635",
  appId: "1:427639708635:web:331cb4aa780c4ff5f625fe",
  measurementId: "G-Q6G5SHBYMS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
