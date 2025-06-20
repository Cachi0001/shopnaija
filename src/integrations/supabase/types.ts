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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          admin_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          items: Json
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          items: Json
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          items?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_id: string
          comment: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string
          date: string | null
          id: string
          is_approved: boolean | null
          is_review: boolean | null
          product_id: string | null
          rating: number
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name: string
          date?: string | null
          id?: string
          is_approved?: boolean | null
          is_review?: boolean | null
          product_id?: string | null
          rating: number
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string
          date?: string | null
          id?: string
          is_approved?: boolean | null
          is_review?: boolean | null
          product_id?: string | null
          rating?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          timestamp: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id: string
          timestamp?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          timestamp?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_id: string
          created_at: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          id: string
          order_details: Json
          order_reference: string | null
          payment_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          tracking_status: Database["public"]["Enums"]["tracking_status"] | null
          updated_at: string | null
          verification_code: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          order_details: Json
          order_reference?: string | null
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          tracking_status?:
            | Database["public"]["Enums"]["tracking_status"]
            | null
          updated_at?: string | null
          verification_code?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          order_details?: Json
          order_reference?: string | null
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount?: number
          tracking_status?:
            | Database["public"]["Enums"]["tracking_status"]
            | null
          updated_at?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          adjusted_price: number | null
          admin_id: string
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_public_id: string | null
          image_url: string | null
          location: string | null
          original_price: number // Added, NOT NULL
          paystack_fee: number | null
          price: number
          superadmin_fee: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          adjusted_price?: number | null
          admin_id: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_public_id?: string | null
          image_url?: string | null
          location?: string | null
          original_price: number // Added, required for insert
          paystack_fee?: number | null
          price: number
          superadmin_fee?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          adjusted_price?: number | null
          admin_id?: string
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_public_id?: string | null
          image_url?: string | null
          location?: string | null
          original_price?: number // Optional for update, but should align with NOT NULL constraint
          paystack_fee?: number | null
          price?: number
          superadmin_fee?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          bank_code: string | null; /* Added bank_code */
          paystack_subaccount_code: string | null; /* Added paystack_subaccount_code */
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          nin: string | null
          phone: string | null
          phone_verified: boolean | null
          primary_color: string | null
          referral_code: string | null
          referral_discount: number | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          subdomain: string | null
          updated_at: string | null
          website_name: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bank_code?: string | null; /* Added bank_code */
          paystack_subaccount_code?: string | null; /* Added paystack_subaccount_code */
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          nin?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          primary_color?: string | null
          referral_code?: string | null
          referral_discount?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subdomain?: string | null
          updated_at?: string | null
          website_name?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bank_code?: string | null; /* Added bank_code */
          paystack_subaccount_code?: string | null; /* Added paystack_subaccount_code */
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          nin?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          primary_color?: string | null
          referral_code?: string | null
          referral_discount?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subdomain?: string | null
          updated_at?: string | null
          website_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_id_by_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      notification_type:
        | "sale_notification"
        | "admin_created"
        | "admin_deactivated"
        | "feedback_received"
        | "order_failed"
        | "payment_confirmed"
      payment_status: "pending" | "completed" | "failed"
      tracking_status:
        | "processing"
        | "shipped"
        | "out for delivery"
        | "delivered"
        | "cancelled"
      user_role: "superadmin" | "admin" | "customer"
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
    Enums: {
      notification_type: [
        "sale_notification",
        "admin_created",
        "admin_deactivated",
        "feedback_received",
        "order_failed",
        "payment_confirmed",
      ],
      payment_status: ["pending", "completed", "failed"],
      tracking_status: [
        "processing",
        "shipped",
        "out for delivery",
        "delivered",
        "cancelled",
      ],
      user_role: ["superadmin", "admin", "customer"],
    },
  },
} as const
