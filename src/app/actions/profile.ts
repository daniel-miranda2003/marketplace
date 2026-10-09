"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";

export interface UpdateProfileResult {
  ok: boolean;
  message: string;
}

export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para editar tu perfil.",
    };
  }

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos del formulario." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
    })
    .eq("id", data.user.id);

  if (profileError) {
    return { ok: false, message: "No se pudo actualizar el perfil." };
  }

  const authUpdates: { email?: string } = {};

  if (parsed.data.email !== data.user.email) {
    authUpdates.email = parsed.data.email;
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabase.auth.updateUser(authUpdates);
    if (authError) {
      return { ok: false, message: "No se pudo actualizar la cuenta." };
    }
  }

  revalidatePath("/dashboard");
  return {
    ok: true,
    message:
      parsed.data.email !== data.user.email
        ? "Perfil actualizado. Revisa tu correo para confirmar el cambio."
        : "Perfil actualizado correctamente.",
  };
}

export interface DeleteAccountResult {
  ok: boolean;
  message: string;
}

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para eliminar tu cuenta.",
    };
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return {
      ok: false,
      message: "La eliminación de cuentas no está disponible.",
    };
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    serviceKey,
  );
  const { error } = await admin.auth.admin.deleteUser(data.user.id);

  if (error) {
    return { ok: false, message: "No se pudo eliminar la cuenta." };
  }

  await supabase.auth.signOut();
  revalidatePath("/");
  return { ok: true, message: "Cuenta eliminada correctamente." };
}
