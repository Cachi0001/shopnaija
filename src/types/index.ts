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
          paystack_fee: number | null
          price: number
          superadmin_fee: number | null
          title: string
          updated_at: string | null
          units_available: number
          original_price: number
          name: string
          category: string
          agerange: string | null
          size: string | null
          color: string | null
          skintype: string | null
          material: string | null
          location_state: string
          location_address: string
          lga: string
          locationstate: string | null
          locationaddress: string | null
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
          paystack_fee?: number | null
          price: number
          superadmin_fee?: number | null
          title: string
          updated_at?: string | null
          units_available?: number
          original_price?: number
          name: string
          category: string
          agerange?: string | null
          size?: string | null
          color?: string | null
          skintype?: string | null
          material?: string | null
          location_state?: string
          location_address?: string
          lga?: string
          locationstate?: string | null
          locationaddress?: string | null
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
          paystack_fee?: number | null
          price?: number
          superadmin_fee?: number | null
          title?: string
          updated_at?: string | null
          units_available?: number
          original_price?: number
          name?: string
          category?: string
          agerange?: string | null
          size?: string | null
          color?: string | null
          skintype?: string | null
          material?: string | null
          location_state?: string
          location_address?: string
          lga?: string
          locationstate?: string | null
          locationaddress?: string | null
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
          bank_code: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_active: boolean | null
          is_plan_active: boolean | null
          location: string | null
          logo_url: string | null
          must_reset_password: boolean | null
          name: string
          nin: string | null
          payment_status: string | null
          paystack_subaccount_code: string | null
          phone: string | null
          phone_verified: boolean | null
          primary_color: string | null
          referral_code: string | null
          referral_discount: number | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          subdomain: string | null
          temp_password: string | null
          updated_at: string | null
          website_name: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bank_code?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          is_plan_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          must_reset_password?: boolean | null
          name: string
          nin?: string | null
          payment_status?: string | null
          paystack_subaccount_code?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          primary_color?: string | null
          referral_code?: string | null
          referral_discount?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subdomain?: string | null
          temp_password?: string | null
          updated_at?: string | null
          website_name?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          bank_code?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_active?: boolean | null
          is_plan_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          must_reset_password?: boolean | null
          name?: string
          nin?: string | null
          payment_status?: string | null
          paystack_subaccount_code?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          primary_color?: string | null
          referral_code?: string | null
          referral_discount?: number | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subdomain?: string | null
          temp_password?: string | null
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
        | "sale_notification",
        | "admin_created",
        | "admin_deactivated",
        | "feedback_received",
        | "order_failed",
        | "payment_confirmed",
      payment_status: "pending" | "completed" | "failed",
      tracking_status:
        | "processing",
        | "shipped",
        | "out for delivery",
        | "delivered",
        | "cancelled",
      user_role: "superadmin" | "admin" | "customer",
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never


// Custom application-specific types
export interface CartItem {
  product_id: string;
  quantity: number;
  title?: string;
  price?: number;
  original_price?: number;
  image_url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'superadmin' | 'admin' | 'customer';
  subdomain: string | null;
  logo_url: string | null;
  website_name: string | null;
  primary_color: string | null;
  account_name: string | null;
  account_number: string | null;
  bank_name: string | null;
  bank_code: string | null;
  location: string | null;
  nin: string | null;
  is_active: boolean | null;
  referral_code: string | null;
  referral_discount: number | null;
  referred_by: string | null;
  email_verified: boolean | null;
  phone_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  payment_status: string | null;
  must_reset_password: boolean | null;
  is_plan_active: boolean | null;
  paystack_subaccount_code: string | null;
  temp_password?: string | null;
}

export interface AdminCreateData {
  name: string;
  email: string;
  password: string;
  role: 'admin';
  phone?: string;
  nin: string;
  subdomain: string;
  website_name: string;
  location?: string;
  primary_color?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  bank_code?: string;
  is_active?: boolean;
  referral_code?: string;
}

export interface Product {
  id: string;
  admin_id: string;
  category_id: string | null;
  title: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number;
  adjusted_price: number | null;
  paystack_fee: number | null;
  superadmin_fee: number | null;
  image_url: string | null;
  image_public_id: string | null;
  units_available: number;
  category: string;
  agerange: string | null;
  size: string | null;
  color: string | null;
  skintype: string | null;
  material: string | null;
  location_state: string;
  location_address: string;
  lga: string;
  locationstate: string | null;
  locationaddress: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  admin_id: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_details: any; // Consider creating a more specific type for order_details
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_date?: string;
  tracking_status?: 'processing' | 'shipped' | 'out for delivery' | 'delivered' | 'cancelled';
  order_reference?: string;
  verification_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Feedback {
  id: string;
  admin_id: string;
  customer_id?: string;
  product_id?: string;
  customer_name: string;
  rating: number;
  comment?: string;
  date?: string;
  is_approved: boolean;
  is_review?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  message: string;
  type: 'sale_notification' | 'admin_created' | 'admin_deactivated' | 'feedback_received' | 'order_failed' | 'payment_confirmed';
  timestamp: string;
  is_read: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: string;
  customer_id?: string;
  admin_id: string;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  admin_id?: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}
