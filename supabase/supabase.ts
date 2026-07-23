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
      categories: {
        Row: {
          created_at: string
          household_id: string
          id: string
          month: number | null
          name: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          month?: number | null
          name?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          month?: number | null
          name?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      household: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          household_id: string
          name: string
          institution: string | null
          account_type: string
          purpose: string
          currency: string
          current_balance: number | null
          external_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          household_id: string
          name: string
          institution?: string | null
          account_type?: string
          purpose?: string
          currency?: string
          current_balance?: number | null
          external_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          household_id?: string
          name?: string
          institution?: string | null
          account_type?: string
          purpose?: string
          currency?: string
          current_balance?: number | null
          external_id?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "accounts_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      spend_categories: {
        Row: {
          id: string
          created_at: string
          household_id: string
          name: string
          group_kind: string
          is_system: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          household_id: string
          name: string
          group_kind?: string
          is_system?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          household_id?: string
          name?: string
          group_kind?: string
          is_system?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "spend_categories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          household_id: string
          account_id: string
          spend_category_id: string | null
          amount: number
          posted_at: string
          description: string | null
          merchant: string | null
          source: string
          external_id: string | null
          transfer_group_id: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          household_id: string
          account_id: string
          spend_category_id?: string | null
          amount: number
          posted_at: string
          description?: string | null
          merchant?: string | null
          source?: string
          external_id?: string | null
          transfer_group_id?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          household_id?: string
          account_id?: string
          spend_category_id?: string | null
          amount?: number
          posted_at?: string
          description?: string | null
          merchant?: string | null
          source?: string
          external_id?: string | null
          transfer_group_id?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_spend_category_id_fkey"
            columns: ["spend_category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      category_rules: {
        Row: {
          id: string
          created_at: string
          household_id: string
          match_field: string
          match_type: string
          match_value: string
          spend_category_id: string
          account_id: string | null
          priority: number
        }
        Insert: {
          id?: string
          created_at?: string
          household_id: string
          match_field?: string
          match_type?: string
          match_value: string
          spend_category_id: string
          account_id?: string | null
          priority?: number
        }
        Update: {
          id?: string
          created_at?: string
          household_id?: string
          match_field?: string
          match_type?: string
          match_value?: string
          spend_category_id?: string
          account_id?: string | null
          priority?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_rules_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_rules_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_rules_spend_category_id_fkey"
            columns: ["spend_category_id"]
            isOneToOne: false
            referencedRelation: "spend_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          household_id: string
          id: string
          month: number | null
          name: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string
          household_id: string
          id?: string
          month?: number | null
          name?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          household_id?: string
          id?: string
          month?: number | null
          name?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "income_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          category_id: string
          created_at: string
          created_by: string | null
          id: string
          month: number | null
          name: string | null
          planned_amount: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number | null
          name?: string | null
          planned_amount?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number | null
          name?: string | null
          planned_amount?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "line_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          household_id: string
          id: string
          line_item_id: string | null
          month: number | null
          type: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          household_id: string
          id?: string
          line_item_id?: string | null
          month?: number | null
          type?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          household_id?: string
          id?: string
          line_item_id?: string | null
          month?: number | null
          type?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_line_item_id_fkey"
            columns: ["line_item_id"]
            isOneToOne: false
            referencedRelation: "line_items"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          household_id: string
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          household_id: string
          id?: string
          last_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          household_id?: string
          id?: string
          last_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "household"
            referencedColumns: ["id"]
          },
        ]
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
