import ProductCatalog from "./ProductCatalog";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog/queries";

interface MarketplaceSectionProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function MarketplaceSection({
  searchParams,
}: MarketplaceSectionProps) {
  const params = await searchParams;
  const categories = await getCategories();
  const initialCategory =
    categories.find((option) => option.slug === params.category)?.slug ?? null;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("products")
    .select("category, colorimetry_tag")
    .eq("is_active", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .limit(500);

  const counts: Record<string, number> = {};
  const seasonCounts: Record<string, number> = {};

  for (const row of rows ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
    if (row.colorimetry_tag) {
      seasonCounts[row.colorimetry_tag] =
        (seasonCounts[row.colorimetry_tag] ?? 0) + 1;
    }
  }

  return (
    <ProductCatalog
      key={initialCategory ?? "all"}
      categories={categories}
      counts={counts}
      seasonCounts={seasonCounts}
      initialCategory={initialCategory}
    />
  );
}
