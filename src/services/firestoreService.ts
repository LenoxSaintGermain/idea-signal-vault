
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
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Idea } from '@/types';

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
  
  // Track user contribution
  await addDoc(collection(db, 'user_contributions'), {
    userId,
    ideaId,
    action: 'upvote',
    points: 2,
    timestamp: Timestamp.now()
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
