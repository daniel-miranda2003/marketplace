"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { updateProduct } from "@/app/actions/products";
import {
  ALLOWED_IMAGE_TYPES,
  CHROMATIC_SEASONS,
  GARMENT_GENDERS,
  MAX_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  productSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/validations/product";
import type { CategoryRow } from "@/lib/catalog/queries";
import type { Tables } from "@/lib/supabase/database.types";

interface EditProductDialogProps {
  product: Tables<"products">;
  categories: CategoryRow[];
  open: boolean;
  onClose: () => void;
}

export default function EditProductDialog({
  product,
  categories,
  open,
  onClose,
}: EditProductDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [keptUrls, setKeptUrls] = useState<string[]>(product.image_urls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product.name,
      description: product.description ?? "",
      price: product.price,
      category: product.category,
      season: product.colorimetry_tag ?? "",
      gender: product.gender ?? "",
      isPublished: product.is_published,
      isSold: product.is_sold,
    },
  });

  const { mutateAsync: saveProduct, isPending } = useMutation({
    mutationFn: (formData: FormData) => updateProduct(product.id, formData),
  });

  const photoCount = keptUrls.length + newFiles.length;

  const handleNewAdd = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    const room = MAX_IMAGES - photoCount;
    if (room <= 0) {
      setPhotoError("Máximo 3 fotos.");
      return;
    }
    const accepted: File[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setPhotoError("Formato no válido. Usa JPG, PNG o WebP.");
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setPhotoError(`La imagen supera ${MAX_IMAGE_SIZE_LABEL}.`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length === 0) {
      return;
    }
    setPhotoError(null);
    setNewFiles([...newFiles, ...accepted]);
    setNewPreviewUrls([
      ...newPreviewUrls,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleKeptRemove = (url: string) => {
    setKeptUrls(keptUrls.filter((kept) => kept !== url));
  };

  const handleNewRemove = (index: number) => {
    const url = newPreviewUrls[index];
    if (url) {
      URL.revokeObjectURL(url);
    }
    setNewFiles(newFiles.filter((_, position) => position !== index));
    setNewPreviewUrls(newPreviewUrls.filter((_, position) => position !== index));
  };

  const onSubmit = async (values: ProductFormOutput) => {
    setError(null);
    if (photoCount === 0) {
      setPhotoError("Selecciona una imagen para la prenda.");
      return;
    }
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description ?? "");
    formData.append("price", String(values.price));
    formData.append("category", values.category);
    formData.append("season", values.season);
    formData.append("gender", values.gender);
    formData.append(
      "isPublished",
      values.isPublished === false ? "false" : "true",
    );
    formData.append(
      "isSold",
      values.isSold === true ? "true" : "false",
    );
    formData.append("keepImages", JSON.stringify(keptUrls));
    for (const image of newFiles) {
      formData.append("images", image);
    }
    try {
      const result = await saveProduct(formData);
      if (!result.ok) {
        if (result.fieldErrors) {
          const entries = Object.entries(result.fieldErrors) as [
            keyof ProductFormOutput,
            string | undefined,
          ][];
          for (const [field, message] of entries) {
            if (message) {
              setFieldError(field, { type: "server", message });
            }
          }
        }
        setError(result.message);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("No se pudo guardar los cambios.");
    }
  };

  if (saved) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1.5,
              py: 2,
            }}
          >
            <CheckCircleIcon color="success" sx={{ width: 96, height: 96 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Publicación actualizada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los cambios ya están visibles.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={onClose}
              sx={{ minHeight: 48, mt: 1 }}
            >
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar publicación</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Fotos · {photoCount}/{MAX_IMAGES}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {keptUrls.map((url) => (
                <Box
                  key={url}
                  sx={{
                    position: "relative",
                    width: 88,
                    height: 88,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: 1,
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt="Foto de la prenda"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Quitar foto"
                    onClick={() => handleKeptRemove(url)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {newPreviewUrls.map((url, index) => (
                <Box
                  key={url}
                  sx={{
                    position: "relative",
                    width: 88,
                    height: 88,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: 1,
                    borderColor: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`Foto nueva ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Quitar foto nueva"
                    onClick={() => handleNewRemove(index)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {photoCount < MAX_IMAGES && (
                <Box
                  component="label"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    width: 88,
                    height: 88,
                    border: 1,
                    borderStyle: "dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <AddPhotoAlternateIcon color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Agregar foto
                  </Typography>
                  <input
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    multiple
                    hidden
                    onChange={(event) => handleNewAdd(event.target.files)}
                  />
                </Box>
              )}
            </Box>
            {photoError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {photoError}
              </Alert>
            )}
          </Box>
          <TextField
            label="Título"
            size="small"
            fullWidth
            {...register("title")}
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
          />
          <TextField
            label="Precio (Bs.)"
            type="number"
            size="small"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            {...register("price", { valueAsNumber: true })}
            error={Boolean(errors.price)}
            helperText={errors.price?.message}
          />
          <TextField
            label="Descripción"
            multiline
            rows={3}
            size="small"
            fullWidth
            {...register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={Boolean(errors.category)}
              >
                <InputLabel id="edit-category-label">Categoría</InputLabel>
                <Select
                  labelId="edit-category-label"
                  label="Categoría"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                >
                  {categories.map((option) => (
                    <MenuItem key={option.id} value={option.slug}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.category?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="season"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={Boolean(errors.season)}
              >
                <InputLabel id="edit-season-label">
                  Estación cromática
                </InputLabel>
                <Select
                  labelId="edit-season-label"
                  label="Estación cromática"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                >
                  <MenuItem value="">Sin etiqueta</MenuItem>
                  {CHROMATIC_SEASONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.season?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={Boolean(errors.gender)}
              >
                <InputLabel id="edit-gender-label">Para</InputLabel>
                <Select
                  labelId="edit-gender-label"
                  label="Para"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                >
                  <MenuItem value="">Sin especificar</MenuItem>
                  {GARMENT_GENDERS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.gender?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Visible al público
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Apágalo para guardar como borrador.
                  </Typography>
                </Box>
                <Switch
                  checked={field.value ?? true}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  aria-label="Visible al público"
                />
              </Box>
            )}
          />
          <Controller
            name="isSold"
            control={control}
            render={({ field }) => (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Marcar como vendido
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Se mostrará con insignia de vendido.
                  </Typography>
                </Box>
                <Switch
                  checked={field.value ?? false}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  aria-label="Marcar como vendido"
                />
              </Box>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
