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
import { getAllActivities } from './firestoreService';
import { adminSecurity } from './adminSecurityService';
import { validation } from './validationService';

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

export const createUserProfileSecure = async (userId: string, email: string, displayName: string) => {
  // Validate inputs
  if (!validation.validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  const sanitizedDisplayName = validation.validateTextInput(displayName, 100);

  const userRef = doc(db, 'users', userId);
  const userData = {
    id: userId,
    email: email.toLowerCase().trim(),
    displayName: sanitizedDisplayName,
    signalPoints: 0,
    ideasInfluenced: 0,
    estimatedTake: 0,
    isAdmin: false,
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
    collection(db, 'user_activities'), 
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
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

  // Get real recent activity
  const activitiesData = await getAllActivities(10);
  const usersData = usersSnapshot.docs.reduce((acc, doc) => {
    acc[doc.id] = doc.data();
    return acc;
  }, {} as Record<string, any>);

  const ideasData = ideasSnapshot.docs.reduce((acc, doc) => {
    acc[doc.id] = doc.data();
    return acc;
  }, {} as Record<string, any>);

  const recentActivity: AdminActivity[] = activitiesData.map((activity, index) => {
    const user = usersData[activity.userId];
    const idea = ideasData[activity.ideaId];
    
    return {
      id: activity.id || `activity-${index}`,
      userId: activity.userId,
      userName: user?.displayName || 'Unknown User',
      action: getActionDescription(activity.action),
      target: idea?.title || idea?.headline || 'Unknown Idea',
      timestamp: new Date(activity.timestamp),
      points: activity.points
    };
  });

  return {
    totalUsers,
    totalIdeas,
    totalPainPoints,
    totalSignalPoints,
    recentActivity
  };
};

const getActionDescription = (action: string): string => {
  switch (action) {
    case 'upvote': return 'Upvoted';
    case 'comment': return 'Commented on';
    case 'detailed_feedback': return 'Provided detailed feedback on';
    case 'enhancement_accepted': return 'Enhancement accepted for';
    case 'idea_submission': return 'Submitted';
    default: return 'Interacted with';
  }
};

export const isAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  // Use secure admin verification
  return await adminSecurity.verifyAdminRole(user.id);
};

export const upgradeUserToAdmin = async (userId: string, currentAdminId: string) => {
  // Use secure admin role granting
  await adminSecurity.grantAdminRole(userId, currentAdminId);
};

export const revokeAdminRole = async (userId: string, currentAdminId: string) => {
  // Use secure admin role revocation
  await adminSecurity.revokeAdminRole(userId, currentAdminId);
};
