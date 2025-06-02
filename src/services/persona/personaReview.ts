import { supabase } from '@/lib/supabase';
import { getPersonaById } from './personaCRUD';

export const addToPersonaReviewQueue = async (personaId: string, conceptDocId: string) => {
  // Get current review queue
  const { data: persona, error: fetchError } = await supabase
    .from('personas')
    .select('concept_doc_review_queue')
    .eq('id', personaId)
    .single();

  if (fetchError) throw fetchError;

  const currentQueue = persona.concept_doc_review_queue || [];
  if (!currentQueue.includes(conceptDocId)) {
    const { error } = await supabase
      .from('personas')
      .update({ 
        concept_doc_review_queue: [...currentQueue, conceptDocId]
      })
      .eq('id', personaId);

    if (error) throw error;
  }
};

export const reviewConceptDoc = async (
  personaId: string, 
  conceptDocId: string, 
  action: 'keep' | 'reject',
  notes?: string
) => {
  // Get current persona data
  const { data: persona, error: fetchError } = await supabase
    .from('personas')
    .select('concept_doc_review_queue, concept_doc_catalog')
    .eq('id', personaId)
    .single();

  if (fetchError) throw fetchError;

  const reviewQueue = persona.concept_doc_review_queue || [];
  const catalog = persona.concept_doc_catalog || [];

  // Remove from review queue
  const updatedQueue = reviewQueue.filter((id: string) => id !== conceptDocId);
  
  // Add to catalog if keeping
  const updatedCatalog = action === 'keep' 
    ? [...catalog, conceptDocId].filter((id, index, arr) => arr.indexOf(id) === index)
    : catalog;

  // Update persona
  const { error: updateError } = await supabase
    .from('personas')
    .update({
      concept_doc_review_queue: updatedQueue,
      concept_doc_catalog: updatedCatalog,
      last_reviewed: new Date().toISOString()
    })
    .eq('id', personaId);

  if (updateError) throw updateError;

  // Log the review
  const { error: reviewError } = await supabase
    .from('persona_reviews')
    .insert([{
      persona_id: personaId,
      concept_doc_id: conceptDocId,
      action: action,
      notes: notes || ''
    }]);

  if (reviewError) throw reviewError;

  return true;
};

export const getPersonaConceptDocs = async (personaId: string) => {
  // Get the persona to access its concept doc catalog
  const persona = await getPersonaById(personaId);
  if (!persona) return [];
  
  // Import the concept doc service to get the actual docs
  const { getConceptDocById } = await import('../supabaseConceptDocService');
  
  // Fetch all concept docs in the persona's catalog
  const conceptDocs = [];
  for (const docId of persona.conceptDocCatalog) {
    try {
      const doc = await getConceptDocById(docId);
      if (doc) conceptDocs.push(doc);
    } catch (error) {
      console.error(`Failed to fetch concept doc ${docId}:`, error);
    }
  }
  
  return conceptDocs;
};
