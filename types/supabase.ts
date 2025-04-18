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
      households: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          household_id: string
          email: string
          name: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          email: string
          name: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          email?: string
          name?: string
          role?: string
          created_at?: string
        }
      }
      income: {
        Row: {
          id: string
          household_id: string
          name: string
          amount: number
          type: string
          frequency: string
          month: number
          year: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          amount: number
          type: string
          frequency: string
          month: number
          year: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          amount?: number
          type?: string
          frequency?: string
          month?: number
          year?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          household_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      line_items: {
        Row: {
          id: string
          category_id: string
          name: string
          month: number
          year: number
          planned_amount: number
          spent_amount: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          month: number
          year: number
          planned_amount: number
          spent_amount?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          month?: number
          year?: number
          planned_amount?: number
          spent_amount?: number
          created_by?: string
          created_at?: string
          updated_at?: string
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