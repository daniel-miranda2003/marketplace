import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

type ChromaticSeason = Database["public"]["Enums"]["chromatic_season"];

export const MAX_IMAGES = 3;
export const MAX_BODY_BYTES = 15 * 1024 * 1024;
export const MAX_BODY_LABEL = "15 MB";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = "5 MB";
export const ALLOWED_IMAGE_TYPES: string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const CHROMATIC_SEASONS: { value: ChromaticSeason; label: string }[] = [
  { value: "spring", label: "Primavera" },
  { value: "summer", label: "Verano" },
  { value: "autumn", label: "Otoño" },
  { value: "winter", label: "Invierno" },
];

const seasonValues = CHROMATIC_SEASONS.map((option) => option.value) as [
  ChromaticSeason,
  ...ChromaticSeason[],
];

export const productSchema = z.object({
  title: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(120, "Máximo 120 caracteres"),
  description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  price: z.preprocess(
    (value) =>
      value === "" || (typeof value === "number" && Number.isNaN(value))
        ? undefined
        : value,
    z
      .number("Ingresa un precio válido")
      .positive("Debe ser mayor que cero")
      .max(999999, "Máximo 999999"),
  ),
  category: z.string().min(1, "Selecciona una categoría"),
  season: z.union([z.enum(seasonValues), z.literal("")]),
  isPublished: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductFormInput = z.input<typeof productSchema>;
export type ProductFormOutput = z.output<typeof productSchema>;
