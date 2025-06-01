import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const profileSubscriptionRef = useRef<(() => void) | null>(null);
  
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
      console.log('⚡ Loading cached user data for fast startup');
      setUser(cachedUser);
    }
  }, []);

  // Enhanced profile loading with better error handling
  const loadUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    console.log('📊 Loading user profile for:', firebaseUser.uid);
    
    // Check cache first
    const cachedProfile = getCachedUser(firebaseUser.uid);
    if (cachedProfile) {
      console.log('⚡ Using cached user profile');
      return cachedProfile;
    }
    
    console.log('💾 Fetching profile from Firestore');
    
    try {
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
      }, 2);
      
      setCachedUser(firebaseUser.uid, userProfile);
      return userProfile;
      
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      
      // Fallback to cached data
      const fallbackCachedUser = loadCachedUserData();
      if (fallbackCachedUser && fallbackCachedUser.id === firebaseUser.uid) {
        console.log('💾 Using cached user data as fallback');
        return fallbackCachedUser;
      }
      
      // Create offline fallback profile
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
      
      setCachedUser(firebaseUser.uid, offlineProfile);
      return offlineProfile;
    }
  };

  // Setup real-time subscription with proper cleanup
  const setupProfileSubscription = (uid: string) => {
    // Clean up existing subscription
    if (profileSubscriptionRef.current) {
      profileSubscriptionRef.current();
      profileSubscriptionRef.current = null;
    }

    try {
      console.log('🔔 Setting up real-time profile subscription');
      const unsubscribe = subscribeToUserProfile(uid, (updatedUser) => {
        if (updatedUser) {
          console.log('🔄 Real-time profile update received');
          setCachedUser(uid, updatedUser);
          setUser(updatedUser);
        }
      });
      
      profileSubscriptionRef.current = unsubscribe;
    } catch (error) {
      console.warn('🔔 Failed to set up real-time subscription:', error);
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener');
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;
      
      console.log('🔐 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          setConnectionStatus('connecting');
          
          const userProfile = await loadUserProfile(firebaseUser);
          
          if (!mounted) return;
          
          if (userProfile) {
            setUser(userProfile);
            setConnectionStatus('online', null);
            
            // Set up subscription after a brief delay to avoid conflicts
            setTimeout(() => {
              if (mounted) {
                setupProfileSubscription(firebaseUser.uid);
              }
            }, 500);
          } else {
            throw new Error('Failed to load or create user profile');
          }
          
        } catch (error) {
          if (!mounted) return;
          console.error('❌ Error in auth state change handler:', error);
          setConnectionStatus('error', 'Profile loading failed - using offline mode');
          
          // Keep existing cached user data if available
          const existingCachedUser = loadCachedUserData();
          if (existingCachedUser && existingCachedUser.id === firebaseUser.uid) {
            setUser(existingCachedUser);
          }
        }
      } else {
        // Clean up subscription on logout
        if (profileSubscriptionRef.current) {
          profileSubscriptionRef.current();
          profileSubscriptionRef.current = null;
        }
        setUser(null);
        setConnectionStatus('offline', null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      console.log('🛑 Cleaning up auth listener');
      unsubscribe();
      if (profileSubscriptionRef.current) {
        profileSubscriptionRef.current();
        profileSubscriptionRef.current = null;
      }
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
