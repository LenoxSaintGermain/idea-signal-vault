
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, categorizeFirebaseError } from '@/lib/firebase';
import { createUserProfile } from '@/services/userService';
import { retryWithBackoff } from '@/utils/authRetry';
import { setCachedUser, clearUserCache } from '@/utils/authCache';
import { ConnectionStatus } from './useConnectionStatus';

export const useAuthOperations = (
  setConnectionStatus: (status: ConnectionStatus) => void,
  setLastError: (error: string | null) => void
) => {
  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting sign in process');
    const signInStart = performance.now();
    
    try {
      setConnectionStatus('connecting');
      setLastError(null);
      await retryWithBackoff(async () => {
        await signInWithEmailAndPassword(auth, email, password);
      });
      console.log(`✅ Sign in completed in ${(performance.now() - signInStart).toFixed(0)}ms`);
      setConnectionStatus('online');
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      const errorType = categorizeFirebaseError(error);
      setConnectionStatus('error');
      setLastError(`Sign in failed: ${errorType}`);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('📝 Starting sign up process');
    const signUpStart = performance.now();
    
    try {
      setConnectionStatus('connecting');
      setLastError(null);
      const userCredential = await retryWithBackoff(async () => {
        return await createUserWithEmailAndPassword(auth, email, password);
      });
      
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      const profileStart = performance.now();
      const userProfile = await retryWithBackoff(async () => {
        return await createUserProfile(userCredential.user.uid, email, displayName);
      });
      
      console.log(`📊 Profile creation completed in ${(performance.now() - profileStart).toFixed(0)}ms`);
      
      // Cache the new profile
      setCachedUser(userCredential.user.uid, userProfile);
      
      console.log(`✅ Sign up completed in ${(performance.now() - signUpStart).toFixed(0)}ms`);
      setConnectionStatus('online');
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      const errorType = categorizeFirebaseError(error);
      setConnectionStatus('error');
      setLastError(`Sign up failed: ${errorType}`);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process');
    const logoutStart = performance.now();
    
    try {
      await signOut(auth);
      clearUserCache();
      setConnectionStatus('offline');
      setLastError(null);
      console.log(`✅ Logout completed in ${(performance.now() - logoutStart).toFixed(0)}ms`);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      const errorType = categorizeFirebaseError(error);
      setLastError(`Logout failed: ${errorType}`);
      throw error;
    }
  };

  return { signIn, signUp, logout };
};
