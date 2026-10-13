"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { createStore } from "@/app/actions/stores";
import {
  BOLIVIA_DEPARTMENTS,
  storeSchema,
  type StoreInput,
} from "@/lib/validations/store";

interface FormFeedback {
  ok: boolean;
  message: string;
}

export default function CreateStoreForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreInput>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: "", description: "", city: "", phone: "" },
  });

  const onSubmit = async (values: StoreInput) => {
    setFeedback(null);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description ?? "");
    formData.append("city", values.city);
    formData.append("phone", values.phone);
    const result = await createStore(formData);
    setFeedback(result);
    if (result.ok) {
      reset();
      router.refresh();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <TextField
          label="Nombre de tu tienda o marca"
          placeholder="Ej. Kroma Studios, Vintage La Paz…"
          fullWidth
          {...register("name")}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
        />
        <TextField
          label="Ciudad / Departamento"
          select
          defaultValue=""
          fullWidth
          {...register("city")}
          error={Boolean(errors.city)}
          helperText={errors.city?.message ?? "Selecciona tu departamento en Bolivia"}
        >
          <MenuItem value="" disabled>
            Selecciona un departamento
          </MenuItem>
          {BOLIVIA_DEPARTMENTS.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Celular / WhatsApp"
          placeholder="Ej. 71234567"
          fullWidth
          inputMode="numeric"
          slotProps={{ htmlInput: { maxLength: 8 } }}
          {...register("phone")}
          error={Boolean(errors.phone)}
          helperText={
            errors.phone?.message ??
            "8 dígitos, empieza con 5, 6 o 7. Para coordinar compras."
          }
        />
        <TextField
          label="Descripción (opcional)"
          multiline
          rows={3}
          placeholder="Describe brevemente qué prendas vendes…"
          fullWidth
          {...register("description")}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />
        {feedback && (
          <Alert severity={feedback.ok ? "success" : "error"}>
            {feedback.message}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ minHeight: 48 }}
        >
          Comenzar a vender
        </Button>
      </Stack>
    </Box>
  );
}
