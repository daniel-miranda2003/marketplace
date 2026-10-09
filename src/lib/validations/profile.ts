import { z } from "zod";

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
  lastName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
  email: z.string().email("Correo electrónico no válido"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
