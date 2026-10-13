"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storeSchema, updateStoreSchema } from "@/lib/validations/store";
import type { TablesInsert } from "@/lib/supabase/database.types";

export interface CreateStoreResult {
  ok: boolean;
  message: string;
}

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "store";
};

export async function createStore(
  formData: FormData,
): Promise<CreateStoreResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para crear una tienda.",
    };
  }

  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    city: formData.get("city"),
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos del formulario." };
  }

  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", data.user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return { ok: false, message: "Ya tienes una tienda creada." };
  }

  const payload: TablesInsert<"stores"> = {
    owner_id: data.user.id,
    name: parsed.data.name,
    slug: `${slugify(parsed.data.name)}-${data.user.id.slice(0, 8)}`,
    description: parsed.data.description || null,
    city: parsed.data.city,
    phone: parsed.data.phone || null,
  };

  const { error } = await supabase.from("stores").insert(payload);

  if (error) {
    if (error.code === "23505" && error.message.includes("stores_phone")) {
      return {
        ok: false,
        message: "Este número de celular ya está registrado en otra tienda.",
      };
    }
    return { ok: false, message: "No se pudo crear la tienda." };
  }

  await supabase
    .from("profiles")
    .update({ role: "vendor" })
    .eq("id", data.user.id);

  revalidatePath("/home");
  return { ok: true, message: "Tienda creada correctamente." };
}

export interface UpdateStoreResult {
  ok: boolean;
  message: string;
}

export async function updateStore(
  formData: FormData,
): Promise<UpdateStoreResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para editar una tienda.",
    };
  }

  const parsed = updateStoreSchema.safeParse({
    name: formData.get("storeName"),
    description: formData.get("storeDescription") ?? "",
    city: formData.get("storeCity"),
    phone: formData.get("storePhone") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: "Revisa los datos del formulario." };
  }

  const storeId = formData.get("storeId");

  if (typeof storeId !== "string" || storeId.length === 0) {
    return { ok: false, message: "Tienda no válida." };
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_id", data.user.id)
    .maybeSingle();

  if (!store) {
    return { ok: false, message: "Tienda no encontrada." };
  }

  const phone = parsed.data.phone === "" ? null : parsed.data.phone;

  if (phone) {
    const { data: clash } = await supabase
      .from("stores")
      .select("id")
      .eq("phone", phone)
      .neq("id", store.id)
      .maybeSingle();

    if (clash) {
      return {
        ok: false,
        message: "Ese número de celular ya está registrado en otra tienda.",
      };
    }
  }

  const { error } = await supabase
    .from("stores")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      city: parsed.data.city,
      phone,
    })
    .eq("id", store.id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "Ese número de celular ya está registrado en otra tienda.",
      };
    }
    return { ok: false, message: "No se pudo actualizar la tienda." };
  }

  revalidatePath("/home");
  return { ok: true, message: "Tienda actualizada correctamente." };
}
