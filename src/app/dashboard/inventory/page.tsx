import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog/queries";
import AddProductForm from "@/components/dashboard/AddProductForm";

export const instant = false;

export default async function InventoryPage() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth");
  }

  const [{ data: store }, { data: profile }, categories] = await Promise.all([
    supabase
      .from("stores")
      .select("name, city")
      .eq("owner_id", data.user.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("first_name, last_name, full_name")
      .eq("id", data.user.id)
      .single(),
    getCategories(),
  ]);

  const personName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.full_name ||
    data.user.email ||
    "";

  return (
    <AddProductForm
      categories={categories}
      sellerName={store?.name ?? personName}
      sellerCity={store?.city ?? null}
    />
  );
}
