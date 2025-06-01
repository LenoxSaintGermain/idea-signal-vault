
import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { getUserProfile, createUserProfile, subscribeToUserProfile } from '@/services/userService';
import { useConnectionStatus } from './useConnectionStatus';
import { useAuthOperations } from './useAuthOperations';
import { getCachedUser, setCachedUser, loadCachedUserData } from '@/utils/authCache';
import { retryWithBackoff } from '@/utils/authRetry';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  connectionStatus: 'online' | 'offline' | 'connecting' | 'error';
  lastError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  retryConnection: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    connectionStatus, 
    lastError, 
    retryConnection, 
    clearError,
    setConnectionStatus,
    setLastError
  } = useConnectionStatus();
  
  const { signIn, signUp, logout } = useAuthOperations(setConnectionStatus, setLastError);

  // Load cached user data immediately
  useEffect(() => {
    const cachedUser = loadCachedUserData();
    if (cachedUser) {
      console.log('⚡ Loading cached user data');
      setUser(cachedUser);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener');
    const authStart = performance.now();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          setConnectionStatus('connecting');
          const profileStart = performance.now();
          console.log('📊 Loading user profile for:', firebaseUser.uid);
          
          // Check cache first
          let userProfile = getCachedUser(firebaseUser.uid);
          
          if (!userProfile) {
            console.log('💾 User profile not in cache, fetching from Firestore');
            
            // Try to fetch with retry logic
            userProfile = await retryWithBackoff(async () => {
              const profile = await getUserProfile(firebaseUser.uid);
              
              if (!profile) {
                console.log('👤 Creating new user profile');
                return await createUserProfile(
                  firebaseUser.uid,
                  firebaseUser.email || '',
                  firebaseUser.displayName || 'Anonymous'
                );
              }
              
              return profile;
            });
            
            // Cache the profile
            setCachedUser(firebaseUser.uid, userProfile);
          } else {
            console.log('⚡ Using cached user profile');
          }
          
          setUser(userProfile);
          setConnectionStatus('online');
          setLastError(null);
          console.log(`📊 Profile loaded in ${(performance.now() - profileStart).toFixed(0)}ms`);
          
          // Set up real-time subscription after initial load (with error handling)
          setTimeout(() => {
            try {
              console.log('🔔 Setting up real-time profile subscription');
              const unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (updatedUser) => {
                if (updatedUser) {
                  console.log('🔄 Real-time profile update received');
                  setCachedUser(firebaseUser.uid, updatedUser);
                  setUser(updatedUser);
                  setConnectionStatus('online');
                  setLastError(null);
                }
              });
              
              return () => {
                console.log('🛑 Cleaning up profile subscription');
                unsubscribeProfile();
              };
            } catch (error) {
              console.warn('🔔 Failed to set up real-time subscription:', error);
              setLastError(`Real-time updates unavailable`);
            }
          }, 100);
          
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setConnectionStatus('error');
          setLastError(`Profile loading failed`);
          
          // Try to use cached data as fallback
          const cachedUser = loadCachedUserData();
          if (cachedUser && cachedUser.id === firebaseUser.uid) {
            console.log('💾 Using cached user data as fallback');
            setUser(cachedUser);
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
        setConnectionStatus('offline');
        setLastError(null);
      }
      
      setLoading(false);
      const totalTime = performance.now() - authStart;
      console.log(`🎉 Auth state processing completed in ${totalTime.toFixed(0)}ms`);
    });

    return () => {
      console.log('🛑 Cleaning up auth listener');
      unsubscribe();
    };
  }, [setConnectionStatus, setLastError]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      connectionStatus, 
      lastError,
      signIn, 
      signUp, 
      logout, 
      retryConnection,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
