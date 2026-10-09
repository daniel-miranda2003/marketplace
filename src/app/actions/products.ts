"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  productSchema,
} from "@/lib/validations/product";
import type { TablesInsert } from "@/lib/supabase/database.types";
import type { GarmentCategory } from "@/lib/catalog/categories";

export interface CreateProductResult {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<
    Record<"title" | "description" | "price" | "category" | "season", string>
  >;
}

const IMAGE_BUCKET = "product_images";

const pathFromPublicUrl = (url: string): string | null => {
  const marker = `/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.slice(index + marker.length);
};

const extensionFor = (mimeType: string) => {
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }
  return "jpg";
};

export async function createProduct(
  formData: FormData,
): Promise<CreateProductResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para publicar prendas.",
    };
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    price: Number(formData.get("price")),
    category: formData.get("category"),
    season: formData.get("season") ?? "",
    isPublished: formData.get("isPublished") !== "false",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Revisa los datos del formulario.",
      fieldErrors: {
        title: flat.fieldErrors.title?.[0],
        description: flat.fieldErrors.description?.[0],
        price: flat.fieldErrors.price?.[0],
        category: flat.fieldErrors.category?.[0],
        season: flat.fieldErrors.season?.[0],
      },
    };
  }

  const { data: stores } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", data.user.id)
    .limit(1);
  const store = stores?.[0];

  if (!store) {
    return {
      ok: false,
      message: "Crea tu tienda antes de publicar prendas.",
    };
  }

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true);

  if (!categoryRows?.some((row) => row.slug === parsed.data.category)) {
    return { ok: false, message: "Categoría no válida." };
  }

  const images = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)
    .slice(0, MAX_IMAGES);

  if (images.length === 0) {
    return {
      ok: false,
      message: "Selecciona una imagen para la prenda.",
    };
  }

  for (const image of images) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return {
        ok: false,
        message: "Formato no válido. Usa JPG, PNG o WebP.",
      };
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        ok: false,
        message: `La imagen supera ${MAX_IMAGE_SIZE_LABEL}.`,
      };
    }
  }

  const uploadedPaths: string[] = [];
  const imageUrls: string[] = [];

  for (const image of images) {
    const path = `${store.id}/${crypto.randomUUID()}.${extensionFor(image.type)}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
      return { ok: false, message: "No se pudo subir la imagen." };
    }

    uploadedPaths.push(path);
    imageUrls.push(
      supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
    );
  }

  const payload: TablesInsert<"products"> = {
    store_id: store.id,
    name: parsed.data.title,
    description: parsed.data.description || null,
    price: parsed.data.price,
    category: parsed.data.category as GarmentCategory,
    colorimetry_tag: parsed.data.season === "" ? null : parsed.data.season,
    image_urls: imageUrls,
    is_active: true,
    is_published: parsed.data.isPublished ?? true,
  };

  const { error: insertError } = await supabase
    .from("products")
    .insert(payload);

  if (insertError) {
    await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
    return { ok: false, message: "No se pudo publicar la prenda." };
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  if (parsed.data.isPublished === false) {
    return { ok: true, message: "Borrador guardado correctamente." };
  }
  return { ok: true, message: "Prenda publicada correctamente." };
}

async function getOwnedStoreId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data: stores } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", userId)
    .limit(1);
  return stores?.[0]?.id ?? null;
}

export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<CreateProductResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para editar publicaciones.",
    };
  }

  const storeId = await getOwnedStoreId(supabase, data.user.id);

  if (!storeId) {
    return {
      ok: false,
      message: "Crea tu tienda antes de editar publicaciones.",
    };
  }

  const { data: product } = await supabase
    .from("products")
    .select("store_id, image_urls")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.store_id !== storeId) {
    return {
      ok: false,
      message: "No tienes permiso para editar esta publicación.",
    };
  }

  const currentUrls = product.image_urls ?? [];

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    price: Number(formData.get("price")),
    category: formData.get("category"),
    season: formData.get("season") ?? "",
    isPublished: formData.get("isPublished") !== "false",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Revisa los datos del formulario.",
      fieldErrors: {
        title: flat.fieldErrors.title?.[0],
        description: flat.fieldErrors.description?.[0],
        price: flat.fieldErrors.price?.[0],
        category: flat.fieldErrors.category?.[0],
        season: flat.fieldErrors.season?.[0],
      },
    };
  }

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("slug")
    .eq("is_active", true);

  if (!categoryRows?.some((row) => row.slug === parsed.data.category)) {
    return { ok: false, message: "Categoría no válida." };
  }

  const keepRaw = formData.get("keepImages");
  let keepUrls = currentUrls;
  if (typeof keepRaw === "string" && keepRaw.trim() !== "") {
    try {
      const parsedKeep: unknown = JSON.parse(keepRaw);
      if (!Array.isArray(parsedKeep)) {
        return { ok: false, message: "Fotos no válidas." };
      }
      const current = new Set(currentUrls);
      keepUrls = parsedKeep.filter(
        (url): url is string => typeof url === "string" && current.has(url),
      );
    } catch {
      return { ok: false, message: "Fotos no válidas." };
    }
  }

  const newImages = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (keepUrls.length + newImages.length === 0) {
    return {
      ok: false,
      message: "Selecciona una imagen para la prenda.",
    };
  }

  if (keepUrls.length + newImages.length > MAX_IMAGES) {
    return { ok: false, message: "Máximo 3 fotos." };
  }

  for (const image of newImages) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return {
        ok: false,
        message: "Formato no válido. Usa JPG, PNG o WebP.",
      };
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        ok: false,
        message: `La imagen supera ${MAX_IMAGE_SIZE_LABEL}.`,
      };
    }
  }

  const uploadedPaths: string[] = [];
  const imageUrls = [...keepUrls];

  for (const image of newImages) {
    const path = `${storeId}/${crypto.randomUUID()}.${extensionFor(image.type)}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
      return { ok: false, message: "No se pudo subir la imagen." };
    }

    uploadedPaths.push(path);
    imageUrls.push(
      supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
    );
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
      category: parsed.data.category as GarmentCategory,
      colorimetry_tag: parsed.data.season === "" ? null : parsed.data.season,
      is_published: parsed.data.isPublished ?? true,
      image_urls: imageUrls,
    })
    .eq("id", productId);

  if (updateError) {
    await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
    return { ok: false, message: "No se pudo actualizar la publicación." };
  }

  const removedPaths = currentUrls
    .filter((url) => !keepUrls.includes(url))
    .map(pathFromPublicUrl)
    .filter(
      (path): path is string =>
        path !== null && path.startsWith(`${storeId}/`),
    );

  if (removedPaths.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(removedPaths);
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  return { ok: true, message: "Publicación actualizada correctamente." };
}

export async function setProductPublished(
  productId: string,
  published: boolean,
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return { ok: false, message: "Debes iniciar sesión." };
  }

  const storeId = await getOwnedStoreId(supabase, data.user.id);

  if (!storeId) {
    return { ok: false, message: "Crea tu tienda primero." };
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ is_published: published })
    .eq("id", productId)
    .eq("store_id", storeId);

  if (updateError) {
    return { ok: false, message: "No se pudo actualizar el estado." };
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: published
      ? "Publicación visible en el marketplace."
      : "Publicación guardada como borrador.",
  };
}
