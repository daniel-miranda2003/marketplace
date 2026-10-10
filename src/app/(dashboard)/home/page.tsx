import { redirect } from "next/navigation";
import { connection } from "next/server";
import BuyerFreeView from "@/components/dashboard/BuyerFreeView";
import BuyerPremiumView from "@/components/dashboard/BuyerPremiumView";
import StoreOnboarding from "@/components/dashboard/StoreOnboarding";
import VendorDashboard from "@/components/dashboard/VendorDashboard";
import { getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

export const instant = false;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function getFeaturedProducts(
  supabase: SupabaseServerClient,
): Promise<Tables<"products">[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("is_sponsored", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

export default async function HomePage() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "vendor") {
    const { data: stores } = await supabase
      .from("stores")
      .select("id, name, city, description")
      .eq("owner_id", data.user.id)
      .limit(1);
    const store = stores?.[0] ?? null;

    if (!store) {
      return <StoreOnboarding />;
    }

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false })
      .limit(24);

    const rows = products ?? [];

    return (
      <VendorDashboard
        store={store}
        products={rows.filter((product) => product.deleted_at === null)}
        deletedProducts={rows.filter((product) => product.deleted_at !== null)}
        categories={await getCategories()}
      />
    );
  }

  if (profile?.subscription === "premium") {
    const { data: colorimetry } = await supabase
      .from("colorimetry_profiles")
      .select("season, recommended_palette, analysis")
      .eq("user_id", data.user.id)
      .single();
    const season = colorimetry?.season ?? null;
    let matches: Tables<"products">[] = [];
    if (season) {
      const { data: matched } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .eq("is_published", true)
        .is("deleted_at", null)
        .eq("colorimetry_tag", season)
        .limit(12);
      matches = matched ?? [];
    }
    return (
      <BuyerPremiumView
        season={season}
        palette={colorimetry?.recommended_palette ?? []}
        products={matches}
        analysis={
          colorimetry?.analysis && typeof colorimetry.analysis === "object"
            ? (colorimetry.analysis as Record<string, unknown>)
            : null
        }
      />
    );
  }

  return <BuyerFreeView products={await getFeaturedProducts(supabase)} />;
}
