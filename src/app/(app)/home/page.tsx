import { redirect } from "next/navigation";
import { connection } from "next/server";
import StoreOnboarding from "@/components/dashboard/StoreOnboarding";
import VendorDashboard from "@/components/dashboard/VendorDashboard";
import { getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function HomePage() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth");
  }

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, city, description, phone")
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
