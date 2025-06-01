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
const CONNECTION_CHECK_COOLDOWN = 5000; // Reduced to 5 seconds for faster recovery
let connectionRecoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;

// Enable offline persistence with enhanced error handling
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

// Enhanced connection management with aggressive recovery
export const enableFirestoreNetwork = async () => {
  try {
    console.log('🔄 Attempting to enable Firestore network...');
    await enableNetwork(db);
    isFirebaseOnline = true;
    connectionRecoveryAttempts = 0; // Reset on success
    console.log('✅ Firestore network enabled successfully');
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

// Aggressive connection recovery
export const performConnectionRecovery = async (): Promise<boolean> => {
  if (connectionRecoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
    console.log('🚫 Max recovery attempts reached, skipping recovery');
    return false;
  }

  connectionRecoveryAttempts++;
  console.log(`🚑 Performing connection recovery attempt ${connectionRecoveryAttempts}/${MAX_RECOVERY_ATTEMPTS}`);

  try {
    // Step 1: Check browser network
    if (!navigator.onLine) {
      console.log('🌐 Browser reports offline, waiting for network...');
      return false;
    }

    // Step 2: Disable then re-enable network
    console.log('🔄 Cycling Firestore network connection...');
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await enableNetwork(db);

    // Step 3: Test connection
    const connectionTest = await checkFirebaseConnection();
    if (connectionTest) {
      console.log('✅ Connection recovery successful');
      connectionRecoveryAttempts = 0; // Reset on success
      return true;
    } else {
      console.log('❌ Connection recovery failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection recovery error:', error);
    return false;
  }
};

// Enhanced connection health checker with recovery
export const checkFirebaseConnection = async (): Promise<boolean> => {
  const now = Date.now();
  
  // More frequent checks during recovery
  const cooldown = connectionRecoveryAttempts > 0 ? 2000 : CONNECTION_CHECK_COOLDOWN;
  
  if (now - lastConnectionCheck < cooldown) {
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
    
    // Quick connectivity test with timeout
    const enablePromise = enableNetwork(db);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );
    
    await Promise.race([enablePromise, timeoutPromise]);
    isFirebaseOnline = true;
    connectionRecoveryAttempts = 0; // Reset on success
    console.log('✅ Firebase connection verified');
    return true;
  } catch (error) {
    console.error('🔌 Firebase connection check failed:', error);
    isFirebaseOnline = false;
    
    // Attempt recovery if this is the first failure
    if (connectionRecoveryAttempts === 0) {
      console.log('🚑 Triggering connection recovery...');
      setTimeout(() => performConnectionRecovery(), 1000);
    }
    
    return false;
  }
};

// Auto-recovery initialization
if (typeof window !== 'undefined') {
  // Start connection monitoring
  setTimeout(() => {
    console.log('🔄 Starting Firebase connection monitoring...');
    checkFirebaseConnection();
  }, 2000);

  // Monitor network changes
  window.addEventListener('online', () => {
    console.log('🌐 Network came online, checking Firebase connection...');
    setTimeout(() => checkFirebaseConnection(), 1000);
  });

  window.addEventListener('offline', () => {
    console.log('🌐 Network went offline');
    isFirebaseOnline = false;
  });
}

// Get Firebase connection state
export const getFirebaseConnectionState = () => {
  return {
    isOnline: isFirebaseOnline,
    hasPersistence: persistenceEnabled,
    browserOnline: navigator.onLine,
    recoveryAttempts: connectionRecoveryAttempts
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
