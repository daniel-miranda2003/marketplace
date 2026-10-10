import { createClient } from "@/lib/supabase/client";
import type { Database, Tables } from "@/lib/supabase/database.types";
import type { GarmentCategory } from "@/lib/catalog/categories";

export type Product = Tables<"products"> & {
  stores?: Pick<Tables<"stores">, "id" | "name" | "city"> | null;
};
export type ChromaticSeason = Database["public"]["Enums"]["chromatic_season"];
export type ProductSort = "recent" | "price_asc" | "price_desc";

export interface ProductFilters {
  category?: GarmentCategory | null;
  season?: ChromaticSeason | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  search?: string;
  sort?: ProductSort | null;
}

const PAGE_SIZE = 12;

export interface ProductPage {
  items: Product[];
  total: number;
}

export async function fetchProducts(
  filters: ProductFilters,
  page = 1,
): Promise<ProductPage> {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("products")
    .select("*, stores ( id, name, city )", { count: "exact" })
    .eq("is_active", true)
    .eq("is_published", true)
    .is("deleted_at", null);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.season) {
    query = query.eq("colorimetry_tag", filters.season);
  }
  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }
  if (filters.search && filters.search.trim() !== "") {
    query = query.ilike("name", `%${filters.search.trim()}%`);
  }
  if (!filters.sort || filters.sort === "recent") {
    query = query
      .order("is_sponsored", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else {
    query = query.order("price", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return { items: data, total: count ?? 0 };
}

export interface StoreShowcase {
  store: Pick<Tables<"stores">, "id" | "name" | "city" | "description">;
  products: Product[];
}

export async function fetchStoreShowcase(
  storeId: string,
): Promise<StoreShowcase> {
  const supabase = createClient();
  const [
    { data: store, error: storeError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from("stores")
      .select("id, name, city, description")
      .eq("id", storeId)
      .maybeSingle(),
    supabase
      .from("products")
      .select("*, stores ( id, name, city )")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  if (storeError || productsError || !store) {
    throw new Error("No se pudo cargar la tienda.");
  }

  return { store, products };
}
