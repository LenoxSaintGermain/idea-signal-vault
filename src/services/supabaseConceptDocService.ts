
import { supabase } from '@/integrations/supabase/client';
import { ConceptDoc } from '@/types/persona';
import { addToPersonaReviewQueue } from './supabasePersonaService';

export const createConceptDoc = async (
  conceptDoc: Omit<ConceptDoc, 'id' | 'createdAt' | 'lastUpdated'>, 
  userId: string
) => {
  const docData = {
    title: conceptDoc.title,
    subtitle: conceptDoc.subtitle,
    author: conceptDoc.author,
    html_url: conceptDoc.htmlUrl,
    pdf_url: conceptDoc.pdfUrl || null,
    tags: conceptDoc.tags,
    status: 'draft',
    target_personas: conceptDoc.targetPersonas || [],
    uploaded_by: userId
  };
  
  const { data, error } = await supabase
    .from('concept_docs')
    .insert([docData])
    .select()
    .single();

  if (error) throw error;

  // Route to target personas for review
  if (conceptDoc.targetPersonas && conceptDoc.targetPersonas.length > 0) {
    for (const personaId of conceptDoc.targetPersonas) {
      await addToPersonaReviewQueue(personaId, data.id);
    }
    
    // Update status to curated_review
    await updateConceptDocStatus(data.id, 'curated_review');
  }
  
  return data.id;
};

export const getAllConceptDocs = async (): Promise<ConceptDoc[]> => {
  const { data, error } = await supabase
    .from('concept_docs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    author: row.author,
    htmlUrl: row.html_url,
    pdfUrl: row.pdf_url,
    tags: row.tags,
    status: row.status as ConceptDoc['status'],
    targetPersonas: row.target_personas,
    createdAt: row.created_at,
    lastUpdated: row.last_updated,
    uploadedBy: row.uploaded_by
  }));
};

export const getConceptDocById = async (docId: string): Promise<ConceptDoc | null> => {
  const { data, error } = await supabase
    .from('concept_docs')
    .select('*')
    .eq('id', docId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle,
    author: data.author,
    htmlUrl: data.html_url,
    pdfUrl: data.pdf_url,
    tags: data.tags,
    status: data.status as ConceptDoc['status'],
    targetPersonas: data.target_personas,
    createdAt: data.created_at,
    lastUpdated: data.last_updated,
    uploadedBy: data.uploaded_by
  };
};

export const updateConceptDoc = async (docId: string, updates: Partial<ConceptDoc>) => {
  const updateData: any = { last_updated: new Date().toISOString() };
  
  if (updates.title) updateData.title = updates.title;
  if (updates.subtitle) updateData.subtitle = updates.subtitle;
  if (updates.author) updateData.author = updates.author;
  if (updates.htmlUrl) updateData.html_url = updates.htmlUrl;
  if (updates.pdfUrl !== undefined) updateData.pdf_url = updates.pdfUrl;
  if (updates.tags) updateData.tags = updates.tags;
  if (updates.status) updateData.status = updates.status;
  if (updates.targetPersonas) updateData.target_personas = updates.targetPersonas;

  const { error } = await supabase
    .from('concept_docs')
    .update(updateData)
    .eq('id', docId);

  if (error) throw error;
};

export const deleteConceptDoc = async (docId: string) => {
  const { error } = await supabase
    .from('concept_docs')
    .delete()
    .eq('id', docId);

  if (error) throw error;
};

export const updateConceptDocStatus = async (
  docId: string, 
  status: ConceptDoc['status']
) => {
  const { error } = await supabase
    .from('concept_docs')
    .update({ 
      status,
      last_updated: new Date().toISOString()
    })
    .eq('id', docId);

  if (error) throw error;
};

export const getConceptDocsByPersona = async (personaId: string): Promise<ConceptDoc[]> => {
  const { data, error } = await supabase
    .from('concept_docs')
    .select('*')
    .contains('target_personas', [personaId])
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(row => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    author: row.author,
    htmlUrl: row.html_url,
    pdfUrl: row.pdf_url,
    tags: row.tags,
    status: row.status as ConceptDoc['status'],
    targetPersonas: row.target_personas,
    createdAt: row.created_at,
    lastUpdated: row.last_updated,
    uploadedBy: row.uploaded_by
  }));
};

export const subscribeToConceptDocs = (callback: (docs: ConceptDoc[]) => void) => {
  const subscription = supabase
    .channel('concept_docs_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'concept_docs' },
      async () => {
        const docs = await getAllConceptDocs();
        callback(docs);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
