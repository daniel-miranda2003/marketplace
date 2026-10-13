"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/api/products";
import {
  analyzeFaceColorimetry,
  type ColorimetryResult,
} from "@/lib/ai/gemini";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_MATCHES = 6;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface ColorimetryAnalysis {
  season: "spring" | "summer" | "autumn" | "winter";
  subtype: string;
  undertone: string;
  contrast: string;
  recommended_palette: string[];
  avoid_palette: string[];
  explanation: string;
}

export interface ColorimetryActionResult {
  success: boolean;
  error?: string;
  ok?: boolean;
  message?: string;
  errorType?: "HIGH_DEMAND";
  analysis?: ColorimetryAnalysis;
  matches?: Product[];
  gender?: "men" | "women";
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

  const genderValue = formData.get("gender");
  if (genderValue !== "men" && genderValue !== "women") {
    return {
      success: false,
      error: "Selecciona para quién es el análisis: Hombre o Mujer.",
      ok: false,
      message: "Selecciona para quién es el análisis: Hombre o Mujer.",
    };
  }
  const gender = genderValue;

  let analysis: ColorimetryResult;
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const outcome = await analyzeFaceColorimetry(buffer, file.type);
    if (!outcome.success) {
      const message =
        "Todos nuestros modelos están a máxima capacidad. Por favor, intenta de nuevo en unos segundos.";
      return {
        success: false,
        errorType: outcome.errorType,
        error: message,
        message,
        ok: false,
      };
    }
    analysis = outcome.analysis;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Error desconocido";
    console.error("[colorimetry] AI analysis failed:", detail);
    return {
      success: false,
      error:
        "No pudimos completar el análisis. Asegúrate de que la foto muestre tu rostro con buena iluminación e intenta de nuevo.",
      ok: false,
      message:
        "No pudimos completar el análisis. Asegúrate de que la foto muestre tu rostro con buena iluminación e intenta de nuevo.",
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
  revalidatePath("/analysis");

  const buildMatchQuery = (targetGender: "men" | "women" | "unisex") =>
    supabase
      .from("products")
      .select("*, stores ( id, name, city )")
      .eq("is_active", true)
      .eq("is_published", true)
      .eq("is_sold", false)
      .is("deleted_at", null)
      .eq("colorimetry_tag", analysis.season)
      .eq("gender", targetGender)
      .order("is_sponsored", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);

  const [{ data: exactGenderRows }, { data: unisexRows }] = await Promise.all([
    buildMatchQuery(gender),
    buildMatchQuery("unisex"),
  ]);

  const seen = new Set<string>();
  const pool: Product[] = [];
  for (const row of [...(exactGenderRows ?? []), ...(unisexRows ?? [])]) {
    if (!seen.has(row.id)) {
      seen.add(row.id);
      pool.push(row as Product);
    }
  }

  const sponsored = pool.filter((product) => product.is_sponsored);
  const regular = shuffle(pool.filter((product) => !product.is_sponsored));
  const matches = [...sponsored, ...regular].slice(0, MAX_MATCHES);
  return {
    success: true,
    ok: true,
    message: "¡Análisis completado con éxito!",
    analysis: {
      season: analysis.season,
      subtype: analysis.subtype,
      undertone: analysis.undertone,
      contrast: analysis.contrast,
      recommended_palette: analysis.recommended_palette,
      avoid_palette: analysis.avoid_palette,
      explanation: analysis.explanation,
    },
    matches: (matches ?? []) as Product[],
    gender,
  };
}
