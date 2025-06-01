
import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { createUserProfile, getUserProfile, subscribeToUserProfile } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache for user profiles to avoid repeated Firestore calls
const userProfileCache = new Map<string, User>();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth state listener');
    const authStart = performance.now();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const profileStart = performance.now();
        console.log('📊 Loading user profile for:', firebaseUser.uid);
        
        try {
          // Check cache first for faster subsequent loads
          let userProfile = userProfileCache.get(firebaseUser.uid);
          
          if (!userProfile) {
            console.log('💾 User profile not in cache, fetching from Firestore');
            userProfile = await getUserProfile(firebaseUser.uid);
            
            if (!userProfile) {
              console.log('👤 Creating new user profile');
              const createStart = performance.now();
              userProfile = await createUserProfile(
                firebaseUser.uid,
                firebaseUser.email || '',
                firebaseUser.displayName || 'Anonymous'
              );
              console.log(`✅ User profile created in ${(performance.now() - createStart).toFixed(0)}ms`);
            }
            
            // Cache the profile
            userProfileCache.set(firebaseUser.uid, userProfile);
          } else {
            console.log('⚡ Using cached user profile');
          }
          
          setUser(userProfile);
          console.log(`📊 Profile loaded in ${(performance.now() - profileStart).toFixed(0)}ms`);
          
          // Set up real-time subscription after initial load to avoid blocking
          setTimeout(() => {
            console.log('🔔 Setting up real-time profile subscription');
            const subscriptionStart = performance.now();
            
            const unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (updatedUser) => {
              if (updatedUser) {
                console.log('🔄 Real-time profile update received');
                userProfileCache.set(firebaseUser.uid, updatedUser); // Update cache
                setUser(updatedUser);
              }
            });
            
            console.log(`🔔 Subscription setup in ${(performance.now() - subscriptionStart).toFixed(0)}ms`);
            
            return () => {
              console.log('🛑 Cleaning up profile subscription');
              unsubscribeProfile();
            };
          }, 100); // Small delay to prioritize initial UI render
          
        } catch (error) {
          console.error('❌ Error loading user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        userProfileCache.clear(); // Clear cache on logout
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
      await signInWithEmailAndPassword(auth, email, password);
      console.log(`✅ Sign in completed in ${(performance.now() - signInStart).toFixed(0)}ms`);
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    console.log('📝 Starting sign up process');
    const signUpStart = performance.now();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user profile in Firestore
      const profileStart = performance.now();
      const userProfile = await createUserProfile(userCredential.user.uid, email, displayName);
      console.log(`📊 Profile creation completed in ${(performance.now() - profileStart).toFixed(0)}ms`);
      
      // Cache the new profile
      userProfileCache.set(userCredential.user.uid, userProfile);
      
      console.log(`✅ Sign up completed in ${(performance.now() - signUpStart).toFixed(0)}ms`);
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Starting logout process');
    const logoutStart = performance.now();
    
    try {
      await signOut(auth);
      userProfileCache.clear(); // Clear cache on logout
      console.log(`✅ Logout completed in ${(performance.now() - logoutStart).toFixed(0)}ms`);
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signUp, logout }}>
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
