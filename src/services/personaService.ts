import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy, 
  where,
  Timestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PersonaProfile, PersonaReview } from '@/types/persona';

export const createPersona = async (persona: Omit<PersonaProfile, 'id' | 'createdAt'>) => {
  const personaData = {
    ...persona,
    createdAt: Timestamp.now(),
    ideaCatalog: [],
    reviewQueue: [],
    conceptDocCatalog: [],
    conceptDocReviewQueue: [],
    lastReviewed: Timestamp.now(),
    isActive: true
  };
  
  const docRef = await addDoc(collection(db, 'personas'), personaData);
  return docRef.id;
};

export const getAllPersonas = async (): Promise<PersonaProfile[]> => {
  const q = query(collection(db, 'personas'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    lastReviewed: doc.data().lastReviewed?.toDate()?.toISOString() || new Date().toISOString()
  })) as PersonaProfile[];
};

export const getPersonaById = async (personaId: string): Promise<PersonaProfile | null> => {
  const personas = await getAllPersonas();
  return personas.find(p => p.id === personaId) || null;
};

export const updatePersona = async (personaId: string, updates: Partial<PersonaProfile>) => {
  const personaRef = doc(db, 'personas', personaId);
  await updateDoc(personaRef, updates);
};

export const deletePersona = async (personaId: string) => {
  const personaRef = doc(db, 'personas', personaId);
  await deleteDoc(personaRef);
};

export const addToPersonaReviewQueue = async (personaId: string, conceptDocId: string) => {
  const personaRef = doc(db, 'personas', personaId);
  await updateDoc(personaRef, {
    conceptDocReviewQueue: arrayUnion(conceptDocId)
  });
};

export const reviewConceptDoc = async (
  personaId: string, 
  conceptDocId: string, 
  action: 'keep' | 'reject',
  notes?: string
) => {
  const personaRef = doc(db, 'personas', personaId);
  
  // Remove from review queue
  await updateDoc(personaRef, {
    conceptDocReviewQueue: arrayRemove(conceptDocId),
    lastReviewed: Timestamp.now()
  });
  
  // If keeping, add to catalog
  if (action === 'keep') {
    await updateDoc(personaRef, {
      conceptDocCatalog: arrayUnion(conceptDocId)
    });
  }
  
  // Log the review
  await addDoc(collection(db, 'persona_reviews'), {
    personaId,
    conceptDocId,
    action,
    reviewedAt: Timestamp.now(),
    notes: notes || ''
  });
  
  return true;
};

export const subscribeToPersonas = (callback: (personas: PersonaProfile[]) => void) => {
  const q = query(collection(db, 'personas'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const personas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      lastReviewed: doc.data().lastReviewed?.toDate()?.toISOString() || new Date().toISOString()
    })) as PersonaProfile[];
    
    callback(personas);
  });
};
