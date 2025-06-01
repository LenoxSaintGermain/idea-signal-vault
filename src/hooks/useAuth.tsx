import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, getFirebaseConnectionState } from '@/lib/firebase';
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

  // Load cached user data immediately for faster initial load
  useEffect(() => {
    const cachedUser = loadCachedUserData();
    if (cachedUser) {
      console.log('⚡ Loading cached user data for fast startup');
      setUser(cachedUser);
    }
  }, []);

  // Enhanced profile loading with better fallback mechanisms
  const loadUserProfile = async (firebaseUser: FirebaseUser, allowCache = true): Promise<User | null> => {
    const profileStart = performance.now();
    console.log('📊 Loading user profile for:', firebaseUser.uid);
    
    // Check cache first if allowed
    if (allowCache) {
      const cachedProfile = getCachedUser(firebaseUser.uid);
      if (cachedProfile) {
        console.log('⚡ Using cached user profile');
        return cachedProfile;
      }
    }
    
    console.log('💾 User profile not in cache, fetching from Firestore');
    
    // Check Firebase connection state
    const firebaseState = getFirebaseConnectionState();
    console.log('🔥 Firebase state during profile load:', firebaseState);
    
    try {
      // Try to fetch with enhanced retry logic
      const userProfile = await retryWithBackoff(async () => {
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
      }, 2); // Reduced retries for faster fallback
      
      // Cache the profile
      setCachedUser(firebaseUser.uid, userProfile);
      console.log(`📊 Profile loaded in ${(performance.now() - profileStart).toFixed(0)}ms`);
      return userProfile;
      
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      
      // Enhanced fallback: try cached data even if it wasn't initially found
      const fallbackCachedUser = loadCachedUserData();
      if (fallbackCachedUser && fallbackCachedUser.id === firebaseUser.uid) {
        console.log('💾 Using cached user data as fallback after error');
        return fallbackCachedUser;
      }
      
      // If offline, create minimal profile from Firebase user data
      if (!navigator.onLine || !firebaseState.isOnline) {
        console.log('🔌 Creating offline fallback profile');
        const offlineProfile: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anonymous',
          signalPoints: 0,
          ideasInfluenced: 0,
          estimatedTake: 0,
          isAdmin: false,
          joinedAt: new Date(),
          lastActive: new Date()
        };
        
        // Cache the offline profile
        setCachedUser(firebaseUser.uid, offlineProfile);
        return offlineProfile;
      }
      
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener');
    const authStart = performance.now();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          setConnectionStatus('connecting');
          
          const userProfile = await loadUserProfile(firebaseUser);
          
          if (userProfile) {
            setUser(userProfile);
            setConnectionStatus('online');
            setLastError(null);
            
            // Set up real-time subscription after successful profile load
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
                // Don't set error for subscription failures if we have the profile
              }
            }, 100);
          } else {
            throw new Error('Failed to load or create user profile');
          }
          
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
          setConnectionStatus('error');
          setLastError('Profile loading failed - using offline mode');
          
          // Final fallback: keep any existing user data
          const existingCachedUser = loadCachedUserData();
          if (existingCachedUser && existingCachedUser.id === firebaseUser.uid) {
            console.log('💾 Keeping existing cached user data');
            setUser(existingCachedUser);
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
