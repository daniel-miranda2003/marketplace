import { z } from "zod";

export const BOLIVIA_DEPARTMENTS = [
  "Beni",
  "Chuquisaca",
  "Cochabamba",
  "La Paz",
  "Oruro",
  "Pando",
  "Potosí",
  "Santa Cruz",
  "Tarija",
] as const;

export type BoliviaDepartment = (typeof BOLIVIA_DEPARTMENTS)[number];

export const storeSchema = z.object({
  name: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(80, "Máximo 80 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  city: z.string().min(1, "Selecciona un departamento"),
  phone: z
    .string()
    .regex(
      /^[567][0-9]{7}$/,
      "Debe tener 8 dígitos y empezar con 5, 6 o 7",
    ),
});

export type StoreInput = z.infer<typeof storeSchema>;

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(80, "Máximo 80 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  city: z.string().min(1, "Selecciona un departamento"),
  phone: z.union([
    z
      .string()
      .regex(
        /^[567][0-9]{7}$/,
        "Debe tener 8 dígitos y empezar con 5, 6 o 7",
      ),
    z.literal(""),
  ]),
});

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
