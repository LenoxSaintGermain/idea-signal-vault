
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  onSnapshot,
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

export const createUserProfile = async (userId: string, email: string, displayName: string) => {
  const userRef = doc(db, 'users', userId);
  const userData = {
    id: userId,
    email,
    displayName,
    signalPoints: 0,
    ideasInfluenced: 0,
    estimatedTake: 0,
    joinedAt: new Date(),
    lastActive: new Date()
  };
  
  await setDoc(userRef, userData);
  return userData;
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};

export const updateUserStats = async (userId: string, points: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    signalPoints: increment(points),
    estimatedTake: increment(points * 8), // Rough conversion rate
    lastActive: new Date()
  });
};

export const getUserContributions = async (userId: string) => {
  const q = query(
    collection(db, 'user_contributions'), 
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const subscribeToUserProfile = (userId: string, callback: (user: User | null) => void) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as User);
    } else {
      callback(null);
    }
  });
};
