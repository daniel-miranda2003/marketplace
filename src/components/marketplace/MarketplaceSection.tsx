import ProductCatalog from "./ProductCatalog";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog/queries";
import type { ChromaticSeason } from "@/lib/api/products";

interface MarketplaceSectionProps {
  searchParams: Promise<{
    category?: string;
    gender?: string;
    season?: string;
    product?: string;
  }>;
}

const CHROMATIC_SEASONS: ChromaticSeason[] = [
  "spring",
  "summer",
  "autumn",
  "winter",
];

export default async function MarketplaceSection({
  searchParams,
}: MarketplaceSectionProps) {
  const params = await searchParams;
  const categories = await getCategories();
  const initialCategory =
    categories.find((option) => option.slug === params.category)?.slug ?? null;
  const initialProductId =
    typeof params.product === "string" && params.product.trim() !== ""
      ? params.product.trim()
      : null;
  const initialGender =
    params.gender === "men" || params.gender === "women"
      ? params.gender
      : null;
  const initialSeason = CHROMATIC_SEASONS.includes(
    params.season as ChromaticSeason,
  )
    ? (params.season as ChromaticSeason)
    : null;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("products")
    .select("category, colorimetry_tag, gender")
    .eq("is_active", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .limit(500);

  const counts: Record<string, number> = {};
  const seasonCounts: Record<string, number> = {};
  const genderCounts: Record<"men" | "women", number> = { men: 0, women: 0 };

  for (const row of rows ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
    if (row.colorimetry_tag) {
      seasonCounts[row.colorimetry_tag] =
        (seasonCounts[row.colorimetry_tag] ?? 0) + 1;
    }
    if (row.gender === "men" || row.gender === "unisex") {
      genderCounts.men += 1;
    }
    if (row.gender === "women" || row.gender === "unisex") {
      genderCounts.women += 1;
    }
  }

  return (
    <ProductCatalog
      key={`${initialCategory ?? "all"}-${initialSeason ?? "all"}`}
      categories={categories}
      counts={counts}
      seasonCounts={seasonCounts}
      genderCounts={genderCounts}
      initialCategory={initialCategory}
      initialGender={initialGender}
      initialSeason={initialSeason}
      initialProductId={initialProductId}
    />
  );
}
