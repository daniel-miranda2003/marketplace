"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { updateProfile } from "@/app/actions/profile";
import {
  profileSchema,
  type ProfileInput,
} from "@/lib/validations/profile";

interface ProfileFormProps {
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface FieldRowProps {
  label: string;
  children: ReactNode;
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          py: 2,
        }}
      >
        <Typography variant="body1" sx={{ flexShrink: 0 }}>
          {label}
        </Typography>
        <Box sx={{ width: "100%", maxWidth: 320 }}>{children}</Box>
      </Box>
      <Divider />
    </Box>
  );
}

export default function ProfileForm({
  firstName,
  lastName,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email,
    },
  });

  const onSubmit = async (values: ProfileInput) => {
    setFeedback(null);
    const formData = new FormData();
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("email", values.email);
    const result = await updateProfile(formData);
    setFeedback(result);
    if (result.ok) {
      router.refresh();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <FieldRow label="Nombre">
          <TextField
            autoComplete="given-name"
            fullWidth
            size="small"
            {...register("firstName")}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName?.message}
          />
        </FieldRow>
        <FieldRow label="Apellido">
          <TextField
            autoComplete="family-name"
            fullWidth
            size="small"
            {...register("lastName")}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName?.message}
          />
        </FieldRow>
        <FieldRow label="Correo electrónico">
          <TextField
            type="email"
            autoComplete="email"
            fullWidth
            size="small"
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
        </FieldRow>
      </Stack>
      {feedback && (
        <Alert
          severity={feedback.ok ? "success" : "error"}
          sx={{ mt: 3 }}
        >
          {feedback.message}
        </Alert>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ minHeight: 44, px: 4 }}
        >
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
}
