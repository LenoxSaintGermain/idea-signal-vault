
import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  mockLogin: () => void;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  // Mock user data for testing
  const mockUser: User = {
    id: 'mock-user-123',
    email: 'demo@signalvault.com',
    displayName: 'Demo User',
    signalPoints: 412,
    ideasInfluenced: 7,
    estimatedTake: 3280
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser && !isMockMode) {
        // Real Firebase user
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Anonymous',
          signalPoints: 412,
          ideasInfluenced: 7,
          estimatedTake: 3280
        });
      } else if (!isMockMode) {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isMockMode]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isMockMode) {
      setIsMockMode(false);
      setUser(null);
    } else {
      await signOut(auth);
    }
  };

  const mockLogin = () => {
    setIsMockMode(true);
    setUser(mockUser);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signUp, logout, mockLogin, isMockMode }}>
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
