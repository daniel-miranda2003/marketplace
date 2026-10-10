"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  analyzeFaceColorimetry,
  type ColorimetryResult,
} from "@/lib/ai/gemini";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface ColorimetryActionResult {
  success: boolean;
  error?: string;
  ok?: boolean;
  message?: string;
}

function isAllowedMimeType(type: string): type is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type);
}

export async function submitColorimetryAnalysis(
  formData: FormData,
): Promise<ColorimetryActionResult> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();

  if (authError || !data.user) {
    return {
      success: false,
      error: "Debes iniciar sesión para continuar.",
      ok: false,
      message: "Debes iniciar sesión para continuar.",
    };
  }

  const userId = data.user.id;

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return {
      success: false,
      error: "Selecciona una fotografía válida.",
      ok: false,
      message: "Selecciona una fotografía válida.",
    };
  }

  if (!isAllowedMimeType(file.type)) {
    return {
      success: false,
      error: "Formato no válido. Usa JPG, PNG o WebP.",
      ok: false,
      message: "Formato no válido. Usa JPG, PNG o WebP.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: "La imagen supera los 4 MB permitidos.",
      ok: false,
      message: "La imagen supera los 4 MB permitidos.",
    };
  }

  let analysis: ColorimetryResult;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    analysis = await analyzeFaceColorimetry(buffer, file.type);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error desconocido";
    console.error("[colorimetry] AI analysis failed:", detail);
    return {
      success: false,
      error: "No pudimos completar el análisis. Asegúrate de que la foto muestre tu rostro con buena iluminación e intenta de nuevo.",
      ok: false,
      message: "No pudimos completar el análisis. Asegúrate de que la foto muestre tu rostro con buena iluminación e intenta de nuevo.",
    };
  }

  const { error: upsertError } = await supabase
    .from("colorimetry_profiles")
    .upsert(
      {
        user_id: userId,
        season: analysis.season,
        recommended_palette: analysis.recommended_palette,
        analysis: {
          subtype: analysis.subtype,
          undertone: analysis.undertone,
          contrast: analysis.contrast,
          avoid_palette: analysis.avoid_palette,
          explanation: analysis.explanation,
        },
      },
      { onConflict: "user_id" },
    );

  if (upsertError) {
    console.error("[colorimetry] DB upsert failed:", upsertError.message);
    return {
      success: false,
      error: "No se pudo guardar el resultado. Intenta de nuevo.",
      ok: false,
      message: "No se pudo guardar el resultado. Intenta de nuevo.",
    };
  }

  revalidatePath("/home");
  revalidatePath("/home/analysis");

  return {
    success: true,
    ok: true,
    message: "¡Análisis completado con éxito!",
  };
}
