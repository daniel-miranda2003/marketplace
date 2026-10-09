import { z } from "zod";

const credentials = {
  email: z.string().email("Correo electrónico no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
};

export const loginSchema = z.object(credentials);

export const registerSchema = z.object({
  ...credentials,
  firstName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
  lastName: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(80, "Máximo 80 caracteres"),
});

export type AuthInput = z.infer<typeof registerSchema>;
