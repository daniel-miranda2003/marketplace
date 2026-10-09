import type { Database } from "@/lib/supabase/database.types";

export type GarmentCategory = Database["public"]["Enums"]["garment_category"];

export interface CategoryOption {
  value: GarmentCategory;
  label: string;
}
