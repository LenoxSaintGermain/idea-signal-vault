
import { supabase } from '@/lib/supabase';
import { PersonaProfile } from '@/types/persona';

export const createPersona = async (persona: Omit<PersonaProfile, 'id' | 'createdAt'>) => {
  const personaData = {
    name: persona.name,
    description: persona.description,
    linked_user_id: persona.linkedUserId || null,
    tags_of_interest: persona.tagsOfInterest,
    idea_catalog: persona.ideaCatalog || [],
    review_queue: persona.reviewQueue || [],
    concept_doc_catalog: persona.conceptDocCatalog || [],
    concept_doc_review_queue: persona.conceptDocReviewQueue || [],
    last_reviewed: persona.lastReviewed || new Date().toISOString(),
    is_active: persona.isActive !== undefined ? persona.isActive : true
  };
  
  const { data, error } = await supabase
    .from('personas')
    .insert([personaData])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getAllPersonas = async (): Promise<PersonaProfile[]> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    linkedUserId: row.linked_user_id,
    tagsOfInterest: row.tags_of_interest,
    ideaCatalog: row.idea_catalog,
    reviewQueue: row.review_queue,
    conceptDocCatalog: row.concept_doc_catalog,
    conceptDocReviewQueue: row.concept_doc_review_queue,
    lastReviewed: row.last_reviewed,
    createdAt: row.created_at,
    isActive: row.is_active
  }));
};

export const getPersonaById = async (personaId: string): Promise<PersonaProfile | null> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', personaId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    linkedUserId: data.linked_user_id,
    tagsOfInterest: data.tags_of_interest,
    ideaCatalog: data.idea_catalog,
    reviewQueue: data.review_queue,
    conceptDocCatalog: data.concept_doc_catalog,
    conceptDocReviewQueue: data.concept_doc_review_queue,
    lastReviewed: data.last_reviewed,
    createdAt: data.created_at,
    isActive: data.is_active
  };
};

export const updatePersona = async (personaId: string, updates: Partial<PersonaProfile>) => {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.description) updateData.description = updates.description;
  if (updates.linkedUserId !== undefined) updateData.linked_user_id = updates.linkedUserId;
  if (updates.tagsOfInterest) updateData.tags_of_interest = updates.tagsOfInterest;
  if (updates.ideaCatalog) updateData.idea_catalog = updates.ideaCatalog;
  if (updates.reviewQueue) updateData.review_queue = updates.reviewQueue;
  if (updates.conceptDocCatalog) updateData.concept_doc_catalog = updates.conceptDocCatalog;
  if (updates.conceptDocReviewQueue) updateData.concept_doc_review_queue = updates.conceptDocReviewQueue;
  if (updates.lastReviewed) updateData.last_reviewed = updates.lastReviewed;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

  const { error } = await supabase
    .from('personas')
    .update(updateData)
    .eq('id', personaId);

  if (error) throw error;
};

export const deletePersona = async (personaId: string) => {
  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('id', personaId);

  if (error) throw error;
};
