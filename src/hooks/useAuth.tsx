
import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { createUserProfile, getUserProfile, subscribeToUserProfile } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  connectionStatus: 'online' | 'offline' | 'connecting' | 'error';
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  retryConnection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced cache with offline support
const userProfileCache = new Map<string, User>();
const CACHE_KEY = 'signal_vault_user_cache';

// Utility functions for offline support
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('💾 Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('💾 Failed to load from localStorage:', error);
    return null;
  }
};

// Retry logic with exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} failed:`, error);
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting' | 'error'>('connecting');

  // Network connectivity detection
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network back online');
      setConnectionStatus('connecting');
    };
    
    const handleOffline = () => {
      console.log('🌐 Network went offline');
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial network check
    if (!navigator.onLine) {
      setConnectionStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached user data immediately
  useEffect(() => {
    const cachedUser = loadFromLocalStorage(CACHE_KEY);
    if (cachedUser) {
      console.log('⚡ Loading cached user data');
      setUser(cachedUser);
      userProfileCache.set(cachedUser.id, cachedUser);
    }
  }, []);

  const retryConnection = () => {
    console.log('🔄 Manual connection retry triggered');
    setConnectionStatus('connecting');
    // The auth state listener will handle the actual reconnection
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
          const profileStart = performance.now();
          console.log('📊 Loading user profile for:', firebaseUser.uid);
          
          // Check cache first
          let userProfile = userProfileCache.get(firebaseUser.uid);
          
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
            
            // Cache the profile both in memory and localStorage
            userProfileCache.set(firebaseUser.uid, userProfile);
            saveToLocalStorage(CACHE_KEY, userProfile);
          } else {
            console.log('⚡ Using cached user profile');
          }
          
          setUser(userProfile);
          setConnectionStatus('online');
          console.log(`📊 Profile loaded in ${(performance.now() - profileStart).toFixed(0)}ms`);
          
          // Set up real-time subscription after initial load (with error handling)
          setTimeout(() => {
            try {
              console.log('🔔 Setting up real-time profile subscription');
              const unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (updatedUser) => {
                if (updatedUser) {
                  console.log('🔄 Real-time profile update received');
                  userProfileCache.set(firebaseUser.uid, updatedUser);
                  saveToLocalStorage(CACHE_KEY, updatedUser);
                  setUser(updatedUser);
                  setConnectionStatus('online');
                }
              });
              
              return () => {
                console.log('🛑 Cleaning up profile subscription');
                unsubscribeProfile();
              };
            } catch (error) {
              console.warn('🔔 Failed to set up real-time subscription:', error);
              // Don't fail the auth process if subscription fails
            }
          }, 100);
          
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setConnectionStatus('error');
          
          // Try to use cached data as fallback
          const cachedUser = loadFromLocalStorage(CACHE_KEY);
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
        userProfileCache.clear();
        localStorage.removeItem(CACHE_KEY);
      }
      
      setLoading(false);
      const totalTime = performance.now() - authStart;
      console.log(`🎉 Auth state processing completed in ${totalTime.toFixed(0)}ms`);
    });

    return () => {
      console.log('🛑 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting sign in process');
    const signInStart = performance.now();
    
    try {
      setConnectionStatus('connecting');
      await retryWithBackoff(async () => {
        await signInWithEmailAndPassword(auth, email, password);
      });
      console.log(`✅ Sign in completed in ${(performance.now() - signInStart).toFixed(0)}ms`);
      setConnectionStatus('online');
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      setConnectionStatus('error');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('📝 Starting sign up process');
    const signUpStart = performance.now();
    
    try {
      setConnectionStatus('connecting');
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
      userProfileCache.set(userCredential.user.uid, userProfile);
      saveToLocalStorage(CACHE_KEY, userProfile);
      
      console.log(`✅ Sign up completed in ${(performance.now() - signUpStart).toFixed(0)}ms`);
      setConnectionStatus('online');
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      setConnectionStatus('error');
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process');
    const logoutStart = performance.now();
    
    try {
      await signOut(auth);
      userProfileCache.clear();
      localStorage.removeItem(CACHE_KEY);
      setConnectionStatus('offline');
      console.log(`✅ Logout completed in ${(performance.now() - logoutStart).toFixed(0)}ms`);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      connectionStatus, 
      signIn, 
      signUp, 
      logout, 
      retryConnection 
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
