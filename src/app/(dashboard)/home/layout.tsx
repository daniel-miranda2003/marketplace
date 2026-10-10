import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Database } from "@/lib/supabase/database.types";

export const instant = false;

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, subscription")
    .eq("id", data.user.id)
    .single();

  const role: Database["public"]["Enums"]["user_role"] =
    profile?.role ?? "buyer";

  return (
    <DashboardShell
      userId={data.user.id}
      role={role}
      email={data.user.email ?? ""}
      firstName={profile?.first_name ?? null}
      lastName={profile?.last_name ?? null}
      subscription={profile?.subscription ?? "free"}
    >
      {children}
    </DashboardShell>
  );
}
