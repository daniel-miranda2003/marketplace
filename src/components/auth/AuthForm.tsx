"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import {
  loginSchema,
  registerSchema,
  type AuthInput,
} from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthInput>({
    resolver: zodResolver(
      (mode === "register" ? registerSchema : loginSchema) as typeof registerSchema,
    ),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (values: AuthInput) => {
    setFormError(null);
    const supabase = createClient();
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            full_name: `${values.firstName} ${values.lastName}`,
          },
        },
      });
      if (error) {
        setFormError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
    }
    router.push("/home");
    router.refresh();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          variant={mode === "login" ? "contained" : "text"}
          onClick={() => setMode("login")}
        >
          Iniciar sesión
        </Button>
        <Button
          variant={mode === "register" ? "contained" : "text"}
          onClick={() => setMode("register")}
        >
          Registrarse
        </Button>
      </Stack>
      <Stack spacing={2}>
        {mode === "register" && (
          <>
            <TextField
              label="Nombre"
              autoComplete="given-name"
              fullWidth
              {...register("firstName")}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Apellido"
              autoComplete="family-name"
              fullWidth
              {...register("lastName")}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
            />
          </>
        )}
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          fullWidth
          {...register("email")}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          fullWidth
          {...register("password")}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        {formError && <Alert severity="error">{formError}</Alert>}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined
          }
          sx={{ minHeight: 48 }}
        >
          {isSubmitting
            ? mode === "register"
              ? "Creando cuenta..."
              : "Iniciando sesión..."
            : mode === "register"
              ? "Crear cuenta"
              : "Iniciar sesión"}
        </Button>
      </Stack>
    </Box>
  );
}
