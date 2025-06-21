
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging to help identify missing environment variables
console.log('Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is missing. Please set up your Supabase environment variables.');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is missing. Please set up your Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Tables Type Definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          signal_points: number
          ideas_influenced: number
          estimated_take: number
          is_admin: boolean
          joined_at: string
          last_active: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          signal_points?: number
          ideas_influenced?: number
          estimated_take?: number
          is_admin?: boolean
          joined_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          signal_points?: number
          ideas_influenced?: number
          estimated_take?: number
          is_admin?: boolean
          joined_at?: string
          last_active?: string
        }
      }
      ideas: {
        Row: {
          id: string
          title: string
          summary: string
          tags: string[]
          valuation_estimate: number
          vote_count: number
          comment_count: number
          created_at: string
          author_id: string
          total_points: number
          is_featured: boolean
          headline: string | null
          subheadline: string | null
          pain_point: string | null
          solution: string | null
          is_pain_point: boolean
          cta: string | null
          target_personas: string[] | null
        }
        Insert: {
          id?: string
          title: string
          summary: string
          tags: string[]
          valuation_estimate: number
          vote_count?: number
          comment_count?: number
          created_at?: string
          author_id: string
          total_points?: number
          is_featured?: boolean
          headline?: string | null
          subheadline?: string | null
          pain_point?: string | null
          solution?: string | null
          is_pain_point?: boolean
          cta?: string | null
          target_personas?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          tags?: string[]
          valuation_estimate?: number
          vote_count?: number
          comment_count?: number
          created_at?: string
          author_id?: string
          total_points?: number
          is_featured?: boolean
          headline?: string | null
          subheadline?: string | null
          pain_point?: string | null
          solution?: string | null
          is_pain_point?: boolean
          cta?: string | null
          target_personas?: string[] | null
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          idea_id: string
          action: string
          points: number
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id: string
          action: string
          points: number
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string
          action?: string
          points?: number
          timestamp?: string
        }
      }
      comments: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          comment?: string
          created_at?: string
        }
      }
      detailed_feedback: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          feedback: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          feedback: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          feedback?: string
          created_at?: string
        }
      }
      personas: {
        Row: {
          id: string
          name: string
          description: string
          linked_user_id: string | null
          tags_of_interest: string[]
          idea_catalog: string[]
          review_queue: string[]
          concept_doc_catalog: string[]
          concept_doc_review_queue: string[]
          last_reviewed: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          linked_user_id?: string | null
          tags_of_interest: string[]
          idea_catalog?: string[]
          review_queue?: string[]
          concept_doc_catalog?: string[]
          concept_doc_review_queue?: string[]
          last_reviewed?: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          linked_user_id?: string | null
          tags_of_interest?: string[]
          idea_catalog?: string[]
          review_queue?: string[]
          concept_doc_catalog?: string[]
          concept_doc_review_queue?: string[]
          last_reviewed?: string
          created_at?: string
          is_active?: boolean
        }
      }
      concept_docs: {
        Row: {
          id: string
          title: string
          subtitle: string
          author: string
          html_url: string
          pdf_url: string | null
          tags: string[]
          status: string
          target_personas: string[]
          created_at: string
          last_updated: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          author: string
          html_url: string
          pdf_url?: string | null
          tags: string[]
          status: string
          target_personas: string[]
          created_at?: string
          last_updated?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          author?: string
          html_url?: string
          pdf_url?: string | null
          tags?: string[]
          status?: string
          target_personas?: string[]
          created_at?: string
          last_updated?: string
          uploaded_by?: string
        }
      }
      persona_reviews: {
        Row: {
          id: string
          persona_id: string
          concept_doc_id: string
          action: string
          reviewed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          persona_id: string
          concept_doc_id: string
          action: string
          reviewed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          persona_id?: string
          concept_doc_id?: string
          action?: string
          reviewed_at?: string
          notes?: string | null
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_user_id: string
          action: string
          details: any
          timestamp: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          admin_user_id: string
          action: string
          details: any
          timestamp?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          admin_user_id?: string
          action?: string
          details?: any
          timestamp?: string
          ip_address?: string | null
        }
      }
    }
  }
}
