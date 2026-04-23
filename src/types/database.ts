export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          client_name: string | null
          content: string
          created_at: string | null
          deal_company: string | null
          id: string
          owner: string | null
          type: string
        }
        Insert: {
          client_name?: string | null
          content: string
          created_at?: string | null
          deal_company?: string | null
          id?: string
          owner?: string | null
          type?: string
        }
        Update: {
          client_name?: string | null
          content?: string
          created_at?: string | null
          deal_company?: string | null
          id?: string
          owner?: string | null
          type?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          billing_type: string | null
          client_status: string | null
          contact_name: string | null
          contract_start: string | null
          contract_value: number | null
          created_at: string | null
          description: string | null
          email: string | null
          github_owner: string | null
          github_pat: string | null
          id: string
          mrr: number
          name: string
          owner: string | null
          project_health: number
          service: string | null
          setup_fee: number | null
          tech_profile: Json | null
          tech_summary: string | null
          tech_synced_at: string | null
        }
        Insert: {
          billing_type?: string | null
          client_status?: string | null
          contact_name?: string | null
          contract_start?: string | null
          contract_value?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          github_owner?: string | null
          github_pat?: string | null
          id?: string
          mrr?: number
          name: string
          owner?: string | null
          project_health?: number
          service?: string | null
          setup_fee?: number | null
          tech_profile?: Json | null
          tech_summary?: string | null
          tech_synced_at?: string | null
        }
        Update: {
          billing_type?: string | null
          client_status?: string | null
          contact_name?: string | null
          contract_start?: string | null
          contract_value?: number | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          github_owner?: string | null
          github_pat?: string | null
          id?: string
          mrr?: number
          name?: string
          owner?: string | null
          project_health?: number
          service?: string | null
          setup_fee?: number | null
          tech_profile?: Json | null
          tech_summary?: string | null
          tech_synced_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          binding_months: number | null
          client_name: string
          created_at: string | null
          end_date: string
          id: string
          monthly_value: number
          note: string | null
          notice_months: number | null
          start_date: string
          total_value: number | null
        }
        Insert: {
          binding_months?: number | null
          client_name: string
          created_at?: string | null
          end_date: string
          id?: string
          monthly_value: number
          note?: string | null
          notice_months?: number | null
          start_date: string
          total_value?: number | null
        }
        Update: {
          binding_months?: number | null
          client_name?: string
          created_at?: string | null
          end_date?: string
          id?: string
          monthly_value?: number
          note?: string | null
          notice_months?: number | null
          start_date?: string
          total_value?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_original: number | null
          amount_sek: number
          billing_cycle: string | null
          category: string
          created_at: string | null
          currency: string | null
          expense_month: string | null
          expense_type: string | null
          id: string
          name: string
          next_date: string | null
          note: string | null
          status: string | null
          url: string | null
        }
        Insert: {
          amount_original?: number | null
          amount_sek: number
          billing_cycle?: string | null
          category: string
          created_at?: string | null
          currency?: string | null
          expense_month?: string | null
          expense_type?: string | null
          id?: string
          name: string
          next_date?: string | null
          note?: string | null
          status?: string | null
          url?: string | null
        }
        Update: {
          amount_original?: number | null
          amount_sek?: number
          billing_cycle?: string | null
          category?: string
          created_at?: string | null
          currency?: string | null
          expense_month?: string | null
          expense_type?: string | null
          id?: string
          name?: string
          next_date?: string | null
          note?: string | null
          status?: string | null
          url?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          category: string | null
          client_name: string
          created_at: string | null
          due_date: string
          id: string
          reminder_sent_at: string | null
          status: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_name: string
          created_at?: string | null
          due_date: string
          id?: string
          reminder_sent_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_name?: string
          created_at?: string | null
          due_date?: string
          id?: string
          reminder_sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      mrr_history: {
        Row: {
          client_count: number | null
          id: string
          month: string
          mrr: number
          recorded_at: string | null
        }
        Insert: {
          client_count?: number | null
          id?: string
          month: string
          mrr: number
          recorded_at?: string | null
        }
        Update: {
          client_count?: number | null
          id?: string
          month?: string
          mrr?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      pipeline: {
        Row: {
          client_id: string | null
          company: string
          contact_name: string | null
          created_at: string | null
          deal_date: string | null
          id: string
          note: string | null
          phase: string
          value: number
        }
        Insert: {
          client_id?: string | null
          company: string
          contact_name?: string | null
          created_at?: string | null
          deal_date?: string | null
          id?: string
          note?: string | null
          phase?: string
          value?: number
        }
        Update: {
          client_id?: string | null
          company?: string
          contact_name?: string | null
          created_at?: string | null
          deal_date?: string | null
          id?: string
          note?: string | null
          phase?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'pipeline_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      quotes: {
        Row: {
          client_name: string
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          items: Json | null
          monthly_fee: number | null
          note: string | null
          owner: string | null
          public_token: string | null
          setup_fee: number | null
          status: string | null
          total: number | null
          valid_until: string | null
        }
        Insert: {
          client_name: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          items?: Json | null
          monthly_fee?: number | null
          note?: string | null
          owner?: string | null
          public_token?: string | null
          setup_fee?: number | null
          status?: string | null
          total?: number | null
          valid_until?: string | null
        }
        Update: {
          client_name?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          items?: Json | null
          monthly_fee?: number | null
          note?: string | null
          owner?: string | null
          public_token?: string | null
          setup_fee?: number | null
          status?: string | null
          total?: number | null
          valid_until?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          client_name: string | null
          created_at: string | null
          deal_company: string | null
          done: boolean | null
          due_date: string
          id: string
          owner: string | null
          title: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          deal_company?: string | null
          done?: boolean | null
          due_date: string
          id?: string
          owner?: string | null
          title: string
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          deal_company?: string | null
          done?: boolean | null
          due_date?: string
          id?: string
          owner?: string | null
          title?: string
        }
        Relationships: []
      }
      scrive_documents: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string | null
          document_url: string | null
          id: string
          owner: string | null
          scrive_id: string | null
          scrive_url: string | null
          signatory_email: string | null
          signatory_name: string | null
          signed_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string | null
          document_url?: string | null
          id?: string
          owner?: string | null
          scrive_id?: string | null
          scrive_url?: string | null
          signatory_email?: string | null
          signatory_name?: string | null
          signed_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          document_url?: string | null
          id?: string
          owner?: string | null
          scrive_id?: string | null
          scrive_url?: string | null
          signatory_email?: string | null
          signatory_name?: string | null
          signed_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'scrive_documents_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      time_entries: {
        Row: {
          client_name: string
          created_at: string | null
          date: string
          description: string | null
          hours: number
          id: string
          owner: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          date?: string
          description?: string | null
          hours: number
          id?: string
          owner?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          date?: string
          description?: string | null
          hours?: number
          id?: string
          owner?: string | null
        }
        Relationships: []
      }
      tech_repos: {
        Row: {
          architecture: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          flags: Json
          github_owner: string
          has_cicd: boolean | null
          has_tests: boolean | null
          has_typescript: boolean | null
          host: string | null
          id: string
          key_dependencies: Json
          last_synced_at: string | null
          narrative: string | null
          primary_language: string | null
          repo_name: string
          stack: Json
          suggestions: Json
          summary: string | null
        }
        Insert: {
          architecture?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          flags?: Json
          github_owner: string
          has_cicd?: boolean | null
          has_tests?: boolean | null
          has_typescript?: boolean | null
          host?: string | null
          id?: string
          key_dependencies?: Json
          last_synced_at?: string | null
          narrative?: string | null
          primary_language?: string | null
          repo_name: string
          stack?: Json
          suggestions?: Json
          summary?: string | null
        }
        Update: {
          architecture?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          flags?: Json
          github_owner?: string
          has_cicd?: boolean | null
          has_tests?: boolean | null
          has_typescript?: boolean | null
          host?: string | null
          id?: string
          key_dependencies?: Json
          last_synced_at?: string | null
          narrative?: string | null
          primary_language?: string | null
          repo_name?: string
          stack?: Json
          suggestions?: Json
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tech_repos_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      user_preferences: {
        Row: {
          avatar_color: string | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_color?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

/* -- Convenient row aliases -- */
export type Client = Tables<'clients'>
export type Pipeline = Tables<'pipeline'>
export type Invoice = Tables<'invoices'>
export type Contract = Tables<'contracts'>
export type Expense = Tables<'expenses'>
export type Quote = Tables<'quotes'>
export type Reminder = Tables<'reminders'>
export type MrrHistory = Tables<'mrr_history'>
export type ScriveDocument = Tables<'scrive_documents'>
export type TimeEntry = Tables<'time_entries'>
export type ActivityLog = Tables<'activity_log'>
export type UserPreferences = Tables<'user_preferences'>
export type TechRepoRow = Tables<'tech_repos'>
