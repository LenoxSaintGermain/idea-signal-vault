import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Initialize Firestore with enhanced configuration and offline persistence
export const db = getFirestore(app);

// Firebase connection state with better management
let isFirebaseOnline = true;
let persistenceEnabled = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_COOLDOWN = 10000; // 10 seconds cooldown

// Enable offline persistence
const enableOfflinePersistence = async () => {
  if (persistenceEnabled) return true;
  
  try {
    await enableIndexedDbPersistence(db);
    persistenceEnabled = true;
    console.log('✅ Firebase offline persistence enabled');
    return true;
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.warn('🔌 Firebase persistence failed: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      console.warn('🔌 Firebase persistence not available in this browser');
    } else {
      console.warn('🔌 Firebase persistence failed:', error);
    }
    return false;
  }
};

// Initialize offline persistence immediately
enableOfflinePersistence();

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

// Enhanced connection management with Firebase state awareness
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    isFirebaseOnline = true;
    console.log('✅ Firestore network enabled');
    return true;
  } catch (error) {
    console.error('❌ Failed to enable Firestore network:', error);
    isFirebaseOnline = false;
    return false;
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    isFirebaseOnline = false;
    console.log('🔌 Firestore network disabled');
    return true;
  } catch (error) {
    console.error('❌ Failed to disable Firestore network:', error);
    return false;
  }
};

// Optimized connection health checker with cooldown
export const checkFirebaseConnection = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Respect cooldown to prevent excessive checks
  if (now - lastConnectionCheck < CONNECTION_CHECK_COOLDOWN) {
    console.log('🔥 Using cached connection status (cooldown active)');
    return isFirebaseOnline;
  }
  
  lastConnectionCheck = now;
  
  try {
    if (!navigator.onLine) {
      console.log('🌐 Browser offline');
      isFirebaseOnline = false;
      return false;
    }
    
    // Quick connectivity test
    await enableNetwork(db);
    isFirebaseOnline = true;
    console.log('✅ Firebase connection verified');
    return true;
  } catch (error) {
    console.error('🔌 Firebase connection check failed:', error);
    isFirebaseOnline = false;
    return false;
  }
};

// Get Firebase connection state
export const getFirebaseConnectionState = () => {
  return {
    isOnline: isFirebaseOnline,
    hasPersistence: persistenceEnabled,
    browserOnline: navigator.onLine
  };
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
