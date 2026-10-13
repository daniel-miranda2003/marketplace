"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { updateStore } from "@/app/actions/stores";
import {
  BOLIVIA_DEPARTMENTS,
  updateStoreSchema,
  type UpdateStoreInput,
} from "@/lib/validations/store";

interface EditStoreDialogProps {
  storeId: string;
  name: string;
  description: string | null;
  city: string | null;
  phone: string | null;
}

export default function EditStoreDialog({
  storeId,
  name,
  description,
  city,
  phone,
}: EditStoreDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateStoreInput>({
    resolver: zodResolver(updateStoreSchema),
    defaultValues: {
      name,
      description: description ?? "",
      city: city ?? "",
      phone: phone ?? "",
    },
  });

  const onSubmit = async (values: UpdateStoreInput) => {
    setFeedback(null);
    const formData = new FormData();
    formData.append("storeId", storeId);
    formData.append("storeName", values.name);
    formData.append("storeDescription", values.description ?? "");
    formData.append("storeCity", values.city);
    formData.append("storePhone", values.phone);
    const result = await updateStore(formData);
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button
        variant="outlined"
        size="large"
        onClick={() => setOpen(true)}
        sx={{ minHeight: 48 }}
      >
        Editar tienda
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar tienda</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Nombre"
                fullWidth
                {...register("name")}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                placeholder="Cuenta qué vende tu tienda…"
                {...register("description")}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
              <TextField
                label="Ciudad / Departamento"
                select
                fullWidth
                defaultValue={city ?? ""}
                {...register("city")}
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
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
                label="Celular"
                fullWidth
                placeholder="Ej. 71234567"
                inputMode="numeric"
                slotProps={{ htmlInput: { maxLength: 8 } }}
                {...register("phone")}
                error={Boolean(errors.phone)}
                helperText={
                  errors.phone?.message ??
                  "8 dígitos, empieza con 5, 6 o 7. Único por tienda."
                }
              />
              {feedback && <Alert severity="error">{feedback}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Guardar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
