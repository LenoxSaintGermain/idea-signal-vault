
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // This would be replaced with actual Firebase config
  apiKey: "demo-api-key",
  authDomain: "signal-vault-demo.firebaseapp.com",
  projectId: "signal-vault-demo",
  storageBucket: "signal-vault-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
