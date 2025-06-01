
export interface PersonaProfile {
  id: string;
  name: string;
  description: string;
  linkedUserId?: string;
  tagsOfInterest: string[];
  ideaCatalog: string[]; // idea_ids of liked/kept ideas
  reviewQueue: string[]; // idea_ids pending review
  conceptDocCatalog: string[]; // concept_doc_ids of liked/kept docs
  conceptDocReviewQueue: string[]; // concept_doc_ids pending review
  lastReviewed: string;
  createdAt: string;
  isActive: boolean;
}

export interface ConceptDoc {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  htmlUrl: string;
  pdfUrl?: string;
  tags: string[];
  status: 'draft' | 'curated_review' | 'ready_for_public' | 'published' | 'archived';
  targetPersonas: string[]; // persona_ids
  createdAt: string;
  lastUpdated: string;
  uploadedBy: string; // user_id
}

export interface PersonaReview {
  id: string;
  personaId: string;
  conceptDocId: string;
  action: 'keep' | 'reject';
  reviewedAt: string;
  notes?: string;
}
