
import { categorizeFirebaseError } from '@/lib/firebase';

// Enhanced retry logic with exponential backoff and error categorization
export const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const errorType = categorizeFirebaseError(error);
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} failed (${errorType}):`, error);
      
      // Don't retry auth errors
      if (errorType === 'auth' || errorType === 'permission') {
        throw error;
      }
      
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
