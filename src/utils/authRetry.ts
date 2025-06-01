
import { categorizeFirebaseError, getFirebaseConnectionState } from '@/lib/firebase';

// Enhanced retry logic with Firebase state awareness and exponential backoff
export const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const errorType = categorizeFirebaseError(error);
      const firebaseState = getFirebaseConnectionState();
      
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} failed (${errorType}):`, error);
      console.log('🔥 Firebase state during retry:', firebaseState);
      
      // Don't retry auth errors or permission errors
      if (errorType === 'auth' || errorType === 'permission') {
        console.log('🚫 Not retrying auth/permission error');
        throw error;
      }
      
      // Don't retry if browser is offline
      if (!navigator.onLine) {
        console.log('🌐 Browser offline, not retrying');
        throw error;
      }
      
      // Don't retry if Firebase is definitely offline
      if (!firebaseState.isOnline && !firebaseState.hasPersistence) {
        console.log('🔥 Firebase offline without persistence, not retrying');
        throw error;
      }
      
      if (i === maxRetries - 1) {
        console.log('🔄 Max retries reached, throwing error');
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s with jitter
      const baseDelay = Math.pow(2, i) * 1000;
      const jitter = Math.random() * 500; // Add up to 500ms jitter
      const delay = baseDelay + jitter;
      
      console.log(`⏳ Waiting ${delay.toFixed(0)}ms before retry ${i + 2}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
