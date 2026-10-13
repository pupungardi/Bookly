import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      support_conversations: {
        Row: {
          id: string
          user_id: string | null
          status: 'open' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: 'open' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          user_id: string | null
          status: 'open' | 'closed'
          updated_at: string
        }>
        Relationships: []
      }
      support_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          sender_role: 'user' | 'agent'
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          sender_role?: 'user' | 'agent'
          body: string
          created_at?: string
        }
        Update: Partial<{
          conversation_id: string
          sender_id: string | null
          sender_role: 'user' | 'agent'
          body: string
        }>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

let client: ReturnType<typeof createSupabaseClient<Database>> | undefined

export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'preview-placeholder-key'

  client = createSupabaseClient<Database>(url, key)
  return client
}
