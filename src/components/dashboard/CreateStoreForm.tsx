"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { createStore } from "@/app/actions/stores";
import { storeSchema, type StoreInput } from "@/lib/validations/store";

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
    defaultValues: { name: "", description: "", city: "" },
  });

  const onSubmit = async (values: StoreInput) => {
    setFeedback(null);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description ?? "");
    formData.append("city", values.city);
    const result = await createStore(formData);
    setFeedback(result);
    if (result.ok) {
      reset();
      router.refresh();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Nombre"
          fullWidth
          {...register("name")}
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
        />
        <TextField
          label="Descripción"
          multiline
          rows={3}
          fullWidth
          {...register("description")}
          error={Boolean(errors.description)}
          helperText={errors.description?.message}
        />
        <TextField
          label="Ciudad"
          fullWidth
          {...register("city")}
          error={Boolean(errors.city)}
          helperText={errors.city?.message}
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
          Crear tienda
        </Button>
      </Stack>
    </Box>
  );
}
