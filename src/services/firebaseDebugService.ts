
import { getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';

export class FirebaseDebugService {
  private db: any;
  private auth: any;

  constructor() {
    this.db = getFirestore();
    this.auth = getAuth();
  }

  // Main debug function
  debugFirebaseConnection = () => {
    console.log('🔍 FIREBASE DEBUG START');
    
    // 1. Check Firebase Apps
    const apps = getApps();
    console.log('📱 Firebase Apps:', apps.length, apps.map(app => app.name));
    
    // 2. Check Firebase Config
    const app = apps[0];
    if (app) {
      console.log('⚙️ Firebase Config:', {
        projectId: app.options.projectId,
        apiKey: app.options.apiKey ? '✅ Present' : '❌ Missing',
        authDomain: app.options.authDomain,
        storageBucket: app.options.storageBucket
      });
    }
    
    // 3. Check Auth State
    console.log('🔐 Auth State:', {
      currentUser: this.auth.currentUser?.uid || 'Not authenticated',
      isReady: !!this.auth.currentUser
    });
    
    // 4. Check Firestore Connection
    console.log('🗄️ Firestore:', {
      app: this.db.app.name,
      settings: this.db._settings || 'Default settings'
    });
    
    // 5. Test Network Connectivity
    fetch('https://www.google.com/favicon.ico')
      .then(() => console.log('🌐 Network: ✅ Online'))
      .catch(() => console.log('🌐 Network: ❌ Offline'));
      
    // 6. Check if using emulators
    console.log('🧪 Emulator Check:', {
      isEmulator: window.location.hostname === 'localhost',
      currentHost: window.location.hostname
    });
    
    console.log('🔍 FIREBASE DEBUG END');
  };

  // Force Firestore online
  forceFirestoreOnline = async () => {
    try {
      await enableNetwork(this.db);
      console.log('✅ Firestore forced online');
      return true;
    } catch (error) {
      console.error('❌ Failed to force Firestore online:', error);
      return false;
    }
  };

  // Test basic Firestore operations
  testFirestoreConnection = async () => {
    try {
      console.log('🧪 Testing Firestore connection...');
      
      // First force online
      await this.forceFirestoreOnline();
      
      // Test write
      const testDoc = doc(this.db, 'debug', 'connection-test');
      await setDoc(testDoc, {
        timestamp: serverTimestamp(),
        message: 'Connection test successful',
        testId: Date.now()
      });
      console.log('✅ Firestore write test passed');
      
      // Test read
      const testCollection = collection(this.db, 'debug');
      const snapshot = await getDocs(testCollection);
      console.log('✅ Firestore read test passed, docs:', snapshot.size);
      
      return true;
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      return false;
    }
  };

  // Get comprehensive status
  getConnectionStatus = async () => {
    const apps = getApps();
    const app = apps[0];
    
    return {
      firebase: {
        appsCount: apps.length,
        projectId: app?.options.projectId,
        hasConfig: !!app?.options.apiKey
      },
      auth: {
        isAuthenticated: !!this.auth.currentUser,
        userId: this.auth.currentUser?.uid
      },
      network: navigator.onLine,
      timestamp: new Date().toISOString()
    };
  };

  // Recovery sequence
  performRecoverySequence = async () => {
    console.log('🚑 Starting Firebase recovery sequence...');
    
    try {
      // Step 1: Debug current state
      this.debugFirebaseConnection();
      
      // Step 2: Force network enable
      const networkEnabled = await this.forceFirestoreOnline();
      if (!networkEnabled) {
        throw new Error('Failed to enable network');
      }
      
      // Step 3: Test connection
      const connectionTest = await this.testFirestoreConnection();
      if (!connectionTest) {
        throw new Error('Connection test failed');
      }
      
      console.log('✅ Recovery sequence completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Recovery sequence failed:', error);
      return false;
    }
  };
}

// Export singleton instance
export const firebaseDebugService = new FirebaseDebugService();

// Utility functions for external use
export const debugFirebaseConnection = () => firebaseDebugService.debugFirebaseConnection();
export const forceFirestoreOnline = () => firebaseDebugService.forceFirestoreOnline();
export const testFirestoreConnection = () => firebaseDebugService.testFirestoreConnection();
export const performRecoverySequence = () => firebaseDebugService.performRecoverySequence();
