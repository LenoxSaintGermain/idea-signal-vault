
import { categorizeFirebaseError, getFirebaseConnectionState } from '@/lib/firebase';

// Enhanced retry logic with exponential backoff and Firebase state awareness
export const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const errorType = categorizeFirebaseError(error);
      
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} failed (${errorType}):`, error);
      
      // Don't retry auth errors, permission errors, or quota errors
      if (errorType === 'auth' || errorType === 'permission' || errorType === 'quota') {
        console.log('🚫 Not retrying auth/permission/quota error');
        throw error;
      }
      
      // Don't retry if browser is offline
      if (!navigator.onLine) {
        console.log('🌐 Browser offline, not retrying');
        throw error;
      }
      
      if (i === maxRetries - 1) {
        console.log('🔄 Max retries reached, throwing error');
        throw error;
      }
      
      // Exponential backoff: 1s, 3s with jitter
      const baseDelay = Math.pow(3, i) * 1000;
      const jitter = Math.random() * 500;
      const delay = baseDelay + jitter;
      
      console.log(`⏳ Waiting ${delay.toFixed(0)}ms before retry ${i + 2}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
