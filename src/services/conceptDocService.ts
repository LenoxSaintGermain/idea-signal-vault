
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
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ConceptDoc } from '@/types/persona';
import { addToPersonaReviewQueue } from './personaService';

export const createConceptDoc = async (
  conceptDoc: Omit<ConceptDoc, 'id' | 'createdAt' | 'lastUpdated'>, 
  userId: string
) => {
  const docData = {
    ...conceptDoc,
    uploadedBy: userId,
    createdAt: Timestamp.now(),
    lastUpdated: Timestamp.now(),
    status: 'draft' as const
  };
  
  const docRef = await addDoc(collection(db, 'concept_docs'), docData);
  
  // Route to target personas for review
  if (conceptDoc.targetPersonas && conceptDoc.targetPersonas.length > 0) {
    for (const personaId of conceptDoc.targetPersonas) {
      await addToPersonaReviewQueue(personaId, docRef.id);
    }
    
    // Update status to curated_review
    await updateDoc(docRef, {
      status: 'curated_review'
    });
  }
  
  return docRef.id;
};

export const getAllConceptDocs = async (): Promise<ConceptDoc[]> => {
  const q = query(collection(db, 'concept_docs'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    lastUpdated: doc.data().lastUpdated?.toDate()?.toISOString() || new Date().toISOString()
  })) as ConceptDoc[];
};

export const getConceptDocById = async (docId: string): Promise<ConceptDoc | null> => {
  const docs = await getAllConceptDocs();
  return docs.find(d => d.id === docId) || null;
};

export const updateConceptDoc = async (docId: string, updates: Partial<ConceptDoc>) => {
  const docRef = doc(db, 'concept_docs', docId);
  await updateDoc(docRef, {
    ...updates,
    lastUpdated: Timestamp.now()
  });
};

export const deleteConceptDoc = async (docId: string) => {
  const docRef = doc(db, 'concept_docs', docId);
  await deleteDoc(docRef);
};

export const updateConceptDocStatus = async (
  docId: string, 
  status: ConceptDoc['status']
) => {
  const docRef = doc(db, 'concept_docs', docId);
  await updateDoc(docRef, {
    status,
    lastUpdated: Timestamp.now()
  });
};

export const getConceptDocsByPersona = async (personaId: string): Promise<ConceptDoc[]> => {
  const q = query(
    collection(db, 'concept_docs'), 
    where('targetPersonas', 'array-contains', personaId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    lastUpdated: doc.data().lastUpdated?.toDate()?.toISOString() || new Date().toISOString()
  })) as ConceptDoc[];
};

export const subscribeToConceptDocs = (callback: (docs: ConceptDoc[]) => void) => {
  const q = query(collection(db, 'concept_docs'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      lastUpdated: doc.data().lastUpdated?.toDate()?.toISOString() || new Date().toISOString()
    })) as ConceptDoc[];
    
    callback(docs);
  });
};
