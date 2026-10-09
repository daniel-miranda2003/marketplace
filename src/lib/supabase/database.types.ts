export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          label: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          label?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      colorimetry_profiles: {
        Row: {
          analysis: Json;
          created_at: string;
          id: string;
          recommended_palette: string[];
          season: Database["public"]["Enums"]["chromatic_season"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          analysis?: Json;
          created_at?: string;
          id?: string;
          recommended_palette?: string[];
          season: Database["public"]["Enums"]["chromatic_season"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          analysis?: Json;
          created_at?: string;
          id?: string;
          recommended_palette?: string[];
          season?: Database["public"]["Enums"]["chromatic_season"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "colorimetry_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          buyer_id: string;
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          status: Database["public"]["Enums"]["order_status"];
          store_id: string;
          total_price: number;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["order_status"];
          store_id: string;
          total_price: number;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["order_status"];
          store_id?: string;
          total_price?: number;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      premium_payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          receipt_url: string;
          reviewed_at: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          receipt_url: string;
          reviewed_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          receipt_url?: string;
          reviewed_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "premium_payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category: Database["public"]["Enums"]["garment_category"];
          colorimetry_tag:
            | Database["public"]["Enums"]["chromatic_season"]
            | null;
          created_at: string;
          description: string | null;
          id: string;
          image_urls: string[];
          is_active: boolean;
          is_published: boolean;
          is_sponsored: boolean;
          name: string;
          price: number;
          sizes: string[];
          stock: number;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          category: Database["public"]["Enums"]["garment_category"];
          colorimetry_tag?:
            | Database["public"]["Enums"]["chromatic_season"]
            | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_urls?: string[];
          is_active?: boolean;
          is_published?: boolean;
          is_sponsored?: boolean;
          name: string;
          price: number;
          sizes?: string[];
          stock?: number;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["garment_category"];
          colorimetry_tag?:
            | Database["public"]["Enums"]["chromatic_season"]
            | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_urls?: string[];
          is_active?: boolean;
          is_published?: boolean;
          is_sponsored?: boolean;
          name?: string;
          price?: number;
          sizes?: string[];
          stock?: number;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          first_name: string | null;
          full_name: string | null;
          id: string;
          last_name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          subscription: Database["public"]["Enums"]["subscription_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          first_name?: string | null;
          full_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          subscription?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          first_name?: string | null;
          full_name?: string | null;
          id?: string;
          last_name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          subscription?: Database["public"]["Enums"]["subscription_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      stores: {
        Row: {
          city: string | null;
          created_at: string;
          description: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          owner_id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          owner_id: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          owner_id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      vendor_ledger: {
        Row: {
          created_at: string;
          gross_amount: number;
          id: string;
          net_amount: number;
          order_id: string;
          platform_fee: number;
          settled_at: string | null;
          settlement_status: Database["public"]["Enums"]["settlement_status"];
          store_id: string;
        };
        Insert: {
          created_at?: string;
          gross_amount: number;
          id?: string;
          net_amount: number;
          order_id: string;
          platform_fee: number;
          settled_at?: string | null;
          settlement_status?: Database["public"]["Enums"]["settlement_status"];
          store_id: string;
        };
        Update: {
          created_at?: string;
          gross_amount?: number;
          id?: string;
          net_amount?: number;
          order_id?: string;
          platform_fee?: number;
          settled_at?: string | null;
          settlement_status?: Database["public"]["Enums"]["settlement_status"];
          store_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vendor_ledger_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vendor_ledger_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      chromatic_season: "spring" | "summer" | "autumn" | "winter";
      garment_category:
        | "accessories"
        | "bottoms"
        | "coats"
        | "denim"
        | "dresses"
        | "footwear"
        | "tops";
      order_status: "delivered" | "paid" | "pending_payment";
      payment_status: "approved" | "pending" | "rejected";
      settlement_status: "pending" | "settled";
      subscription_status: "free" | "premium";
      user_role: "admin" | "buyer" | "vendor";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
