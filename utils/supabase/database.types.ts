export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_goals: {
        Row: {
          id: string
          user_id: string
          daily_calories: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_calories?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_calories?: number
          created_at?: string
          updated_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          description: string
          calories: number
          meal_type: 'café' | 'almoço' | 'lanche' | 'jantar' | 'ceia'
          consumed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          calories: number
          meal_type: 'café' | 'almoço' | 'lanche' | 'jantar' | 'ceia'
          consumed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          calories?: number
          meal_type?: 'café' | 'almoço' | 'lanche' | 'jantar' | 'ceia'
          consumed_at?: string
          created_at?: string
        }
      }
      fasts: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          protocol: string
          duration_hours: number
          plan_type: '16:8' | '18:6' | '20:4' | '24h' | 'personalizado' | null
          status: 'ativo' | 'concluido' | 'cancelado' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time?: string
          end_time?: string | null
          protocol: string
          duration_hours: number
          plan_type?: '16:8' | '18:6' | '20:4' | '24h' | 'personalizado' | null
          status?: 'ativo' | 'concluido' | 'cancelado' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          protocol?: string
          duration_hours?: number
          plan_type?: '16:8' | '18:6' | '20:4' | '24h' | 'personalizado' | null
          status?: 'ativo' | 'concluido' | 'cancelado' | null
          created_at?: string
        }
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
  }
}