
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDf9Pi-I8vYQRCmv0oGUIOlLVYca4hdluU",
  authDomain: "lsgp-consulting.firebaseapp.com",
  projectId: "lsgp-consulting",
  storageBucket: "lsgp-consulting.firebasestorage.app",
  messagingSenderId: "427639708635",
  appId: "1:427639708635:web:331cb4aa780c4ff5f625fe",
  measurementId: "G-Q6G5SHBYMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with error handling
export const auth = getAuth(app);

// Initialize Firestore with enhanced configuration
export const db = getFirestore(app);

// Initialize Analytics only if supported (prevents browser compatibility issues)
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(error => {
    console.warn('Analytics not supported:', error);
  });
}

export { analytics };

// Enhanced connection management
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('✅ Firestore network enabled');
    return true;
  } catch (error) {
    console.error('❌ Failed to enable Firestore network:', error);
    return false;
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('🔌 Firestore network disabled');
    return true;
  } catch (error) {
    console.error('❌ Failed to disable Firestore network:', error);
    return false;
  }
};

// Connection health checker
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple connectivity test
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.error('🔌 Firebase connection check failed:', error);
    return false;
  }
};

// Error categorization helper
export const categorizeFirebaseError = (error: any): 'network' | 'auth' | 'permission' | 'quota' | 'unknown' => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';
  
  if (errorCode.includes('network') || errorCode.includes('unavailable') || errorMessage.includes('offline')) {
    return 'network';
  }
  if (errorCode.includes('auth') || errorCode.includes('permission')) {
    return 'auth';
  }
  if (errorCode.includes('quota') || errorCode.includes('limit')) {
    return 'quota';
  }
  if (errorCode.includes('permission-denied')) {
    return 'permission';
  }
  
  return 'unknown';
};
