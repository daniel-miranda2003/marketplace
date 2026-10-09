import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { GarmentCategory } from "./categories";

export interface CategoryRow {
  id: string;
  slug: GarmentCategory;
  label: string;
}

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, label")
    .eq("is_active", true)
    .order("sort_order");
  if (!data) {
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    slug: row.slug as GarmentCategory,
    label: row.label,
  }));
});
