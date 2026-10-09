import { z } from "zod";

export const storeSchema = z.object({
  name: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(80, "Máximo 80 caracteres"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  city: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
});

export type StoreInput = z.infer<typeof storeSchema>;

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(80, "Máximo 80 caracteres"),
  city: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
});

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
