export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          timestamp: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          idea_id: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          idea_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          idea_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_docs: {
        Row: {
          author: string
          created_at: string | null
          html_url: string
          id: string
          last_updated: string | null
          pdf_url: string | null
          status: string | null
          subtitle: string
          tags: string[] | null
          target_personas: string[] | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          author: string
          created_at?: string | null
          html_url: string
          id?: string
          last_updated?: string | null
          pdf_url?: string | null
          status?: string | null
          subtitle: string
          tags?: string[] | null
          target_personas?: string[] | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          author?: string
          created_at?: string | null
          html_url?: string
          id?: string
          last_updated?: string | null
          pdf_url?: string | null
          status?: string | null
          subtitle?: string
          tags?: string[] | null
          target_personas?: string[] | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concept_docs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      detailed_feedback: {
        Row: {
          created_at: string | null
          feedback: string
          id: string
          idea_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback: string
          id?: string
          idea_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string
          id?: string
          idea_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "detailed_feedback_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detailed_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          author_id: string | null
          comment_count: number | null
          created_at: string | null
          cta: string | null
          headline: string | null
          id: string
          is_featured: boolean | null
          is_pain_point: boolean | null
          pain_point: string | null
          solution: string | null
          subheadline: string | null
          summary: string
          tags: string[] | null
          target_personas: string[] | null
          title: string
          total_points: number | null
          valuation_estimate: number | null
          vote_count: number | null
        }
        Insert: {
          author_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          cta?: string | null
          headline?: string | null
          id?: string
          is_featured?: boolean | null
          is_pain_point?: boolean | null
          pain_point?: string | null
          solution?: string | null
          subheadline?: string | null
          summary: string
          tags?: string[] | null
          target_personas?: string[] | null
          title: string
          total_points?: number | null
          valuation_estimate?: number | null
          vote_count?: number | null
        }
        Update: {
          author_id?: string | null
          comment_count?: number | null
          created_at?: string | null
          cta?: string | null
          headline?: string | null
          id?: string
          is_featured?: boolean | null
          is_pain_point?: boolean | null
          pain_point?: string | null
          solution?: string | null
          subheadline?: string | null
          summary?: string
          tags?: string[] | null
          target_personas?: string[] | null
          title?: string
          total_points?: number | null
          valuation_estimate?: number | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_reviews: {
        Row: {
          action: string
          concept_doc_id: string | null
          id: string
          notes: string | null
          persona_id: string | null
          reviewed_at: string | null
        }
        Insert: {
          action: string
          concept_doc_id?: string | null
          id?: string
          notes?: string | null
          persona_id?: string | null
          reviewed_at?: string | null
        }
        Update: {
          action?: string
          concept_doc_id?: string | null
          id?: string
          notes?: string | null
          persona_id?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_reviews_concept_doc_id_fkey"
            columns: ["concept_doc_id"]
            isOneToOne: false
            referencedRelation: "concept_docs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_reviews_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          concept_doc_catalog: string[] | null
          concept_doc_review_queue: string[] | null
          created_at: string | null
          description: string
          id: string
          idea_catalog: string[] | null
          is_active: boolean | null
          last_reviewed: string | null
          linked_user_id: string | null
          name: string
          review_queue: string[] | null
          tags_of_interest: string[] | null
        }
        Insert: {
          concept_doc_catalog?: string[] | null
          concept_doc_review_queue?: string[] | null
          created_at?: string | null
          description: string
          id?: string
          idea_catalog?: string[] | null
          is_active?: boolean | null
          last_reviewed?: string | null
          linked_user_id?: string | null
          name: string
          review_queue?: string[] | null
          tags_of_interest?: string[] | null
        }
        Update: {
          concept_doc_catalog?: string[] | null
          concept_doc_review_queue?: string[] | null
          created_at?: string | null
          description?: string
          id?: string
          idea_catalog?: string[] | null
          is_active?: boolean | null
          last_reviewed?: string | null
          linked_user_id?: string | null
          name?: string
          review_queue?: string[] | null
          tags_of_interest?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          action: string
          id: string
          idea_id: string | null
          points: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          idea_id?: string | null
          points?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          idea_id?: string | null
          points?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          display_name: string
          email: string
          estimated_take: number | null
          id: string
          ideas_influenced: number | null
          is_admin: boolean | null
          joined_at: string | null
          last_active: string | null
          signal_points: number | null
        }
        Insert: {
          display_name: string
          email: string
          estimated_take?: number | null
          id: string
          ideas_influenced?: number | null
          is_admin?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          signal_points?: number | null
        }
        Update: {
          display_name?: string
          email?: string
          estimated_take?: number | null
          id?: string
          ideas_influenced?: number | null
          is_admin?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          signal_points?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
