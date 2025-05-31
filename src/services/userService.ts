
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
  getDocs,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, AdminStats, AdminActivity } from '@/types';

const ADMIN_EMAIL = 'lenox.paris@outlook.com';

export const createUserProfile = async (userId: string, email: string, displayName: string) => {
  const userRef = doc(db, 'users', userId);
  const userData = {
    id: userId,
    email,
    displayName,
    signalPoints: 0,
    ideasInfluenced: 0,
    estimatedTake: 0,
    isAdmin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
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

// Admin-only functions
export const getAllUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
};

export const getAdminStats = async (): Promise<AdminStats> => {
  // Get user count
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const totalUsers = usersSnapshot.size;

  // Get ideas count
  const ideasSnapshot = await getDocs(collection(db, 'ideas'));
  const ideas = ideasSnapshot.docs.map(doc => doc.data());
  const totalIdeas = ideas.length;
  const totalPainPoints = ideas.filter(idea => idea.isPainPoint).length;

  // Calculate total signal points
  const totalSignalPoints = usersSnapshot.docs.reduce((total, doc) => {
    return total + (doc.data().signalPoints || 0);
  }, 0);

  // Get recent activity (mock for now - will implement real activity tracking later)
  const recentActivity: AdminActivity[] = [];

  return {
    totalUsers,
    totalIdeas,
    totalPainPoints,
    totalSignalPoints,
    recentActivity
  };
};

export const isAdmin = (user: User | null): boolean => {
  return user?.isAdmin === true || user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const upgradeUserToAdmin = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isAdmin: true,
    lastActive: new Date()
  });
};
