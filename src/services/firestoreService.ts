
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  increment, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Idea, Contribution } from '@/types';

export const createIdea = async (idea: Omit<Idea, 'id' | 'createdAt'>, userId: string) => {
  const ideaData = {
    ...idea,
    authorId: userId,
    createdAt: Timestamp.now(),
    voteCount: 0,
    commentCount: 0,
    totalPoints: 0,
    isFeatured: false
  };
  
  const docRef = await addDoc(collection(db, 'ideas'), ideaData);
  
  // Log the idea creation activity
  await logUserActivity(userId, docRef.id, 'idea_submission', 5);
  
  return docRef.id;
};

export const getAllIdeas = async (): Promise<Idea[]> => {
  const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  })) as Idea[];
};

export const updateIdea = async (ideaId: string, updates: Partial<Idea>) => {
  const ideaRef = doc(db, 'ideas', ideaId);
  await updateDoc(ideaRef, updates);
};

export const deleteIdea = async (ideaId: string) => {
  const ideaRef = doc(db, 'ideas', ideaId);
  await deleteDoc(ideaRef);
};

export const toggleIdeaFeatured = async (ideaId: string, featured: boolean) => {
  const ideaRef = doc(db, 'ideas', ideaId);
  await updateDoc(ideaRef, {
    isFeatured: featured
  });
};

export const upvoteIdea = async (ideaId: string, userId: string) => {
  const ideaRef = doc(db, 'ideas', ideaId);
  await updateDoc(ideaRef, {
    voteCount: increment(1),
    totalPoints: increment(2)
  });
  
  // Log the upvote activity
  await logUserActivity(userId, ideaId, 'upvote', 2);
};

export const commentOnIdea = async (ideaId: string, userId: string, comment: string) => {
  const ideaRef = doc(db, 'ideas', ideaId);
  await updateDoc(ideaRef, {
    commentCount: increment(1)
  });
  
  // Add comment to comments collection
  await addDoc(collection(db, 'comments'), {
    ideaId,
    userId,
    comment,
    createdAt: Timestamp.now()
  });
  
  // Log the comment activity
  await logUserActivity(userId, ideaId, 'comment', 3);
};

export const submitDetailedFeedback = async (ideaId: string, userId: string, feedback: string) => {
  await addDoc(collection(db, 'detailed_feedback'), {
    ideaId,
    userId,
    feedback,
    createdAt: Timestamp.now()
  });
  
  // Log the detailed feedback activity (higher points)
  await logUserActivity(userId, ideaId, 'detailed_feedback', 5);
};

// Core activity logging function
export const logUserActivity = async (
  userId: string, 
  ideaId: string, 
  action: 'upvote' | 'comment' | 'detailed_feedback' | 'enhancement_accepted' | 'idea_submission',
  points: number
) => {
  await addDoc(collection(db, 'user_activities'), {
    userId,
    ideaId,
    action,
    points,
    timestamp: Timestamp.now()
  });
};

// Get user's activity history
export const getUserActivities = async (userId: string): Promise<Contribution[]> => {
  const q = query(
    collection(db, 'user_activities'), 
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    ideaId: doc.data().ideaId,
    action: doc.data().action,
    points: doc.data().points,
    timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
  })) as Contribution[];
};

// Get all platform activities for admin view
export const getAllActivities = async (limitCount: number = 100) => {
  const q = query(
    collection(db, 'user_activities'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    ideaId: doc.data().ideaId,
    action: doc.data().action,
    points: doc.data().points,
    timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
  }));
};

// Real-time activity subscription
export const subscribeToActivities = (callback: (activities: any[]) => void, limitCount: number = 20) => {
  const q = query(
    collection(db, 'user_activities'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      ideaId: doc.data().ideaId,
      action: doc.data().action,
      points: doc.data().points,
      timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
    }));
    
    callback(activities);
  });
};

export const subscribeToIdeas = (callback: (ideas: Idea[]) => void) => {
  const q = query(collection(db, 'ideas'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const ideas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    })) as Idea[];
    
    callback(ideas);
  });
};
