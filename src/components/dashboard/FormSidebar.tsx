"use client";

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
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
import Link from "../ui/Link";
import {
  ALLOWED_IMAGE_TYPES,
  CHROMATIC_SEASONS,
  GARMENT_GENDERS,
  MAX_IMAGES,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/validations/product";
import type { CategoryRow } from "@/lib/catalog/queries";

export interface SubmissionFeedback {
  ok: boolean;
  message: string;
  published: boolean;
}

interface FormSidebarProps {
  categories: CategoryRow[];
  images: File[];
  previewUrls: string[];
  imageError: string | null;
  resetKey: number;
  feedback: SubmissionFeedback | null;
  onImagesAdd: (files: FileList | null) => void;
  onImageRemove: (index: number) => void;
  onStay: () => void;
}

export default function FormSidebar({
  categories,
  images,
  previewUrls,
  imageError,
  resetKey,
  feedback,
  onImagesAdd,
  onImageRemove,
  onStay,
}: FormSidebarProps) {
  const {
    control,
    register,
    formState: { errors, isSubmitting },
  } = useFormContext<ProductFormInput, unknown, ProductFormOutput>();
  const [dragging, setDragging] = useState(false);

  return (
    <Box>
      <Box sx={{ px: 3, py: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Nueva publicación
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            Fotos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fotos · {images.length}/{MAX_IMAGES}
          </Typography>
          <Box
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              onImagesAdd(event.dataTransfer.files);
            }}
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              p: dragging ? 1.5 : 0,
              border: dragging ? 1 : 0,
              borderStyle: "dashed",
              borderColor: "primary.main",
              borderRadius: 2,
              bgcolor: dragging ? "action.hover" : "transparent",
            }}
          >
            {images.map((file, index) => (
              <Box
                key={`${file.name}-${file.lastModified}`}
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
                  src={previewUrls[index] ?? ""}
                  alt={`Foto ${index + 1}`}
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
                  onClick={() => onImageRemove(index)}
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
            {images.length < MAX_IMAGES && (
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
                  key={resetKey}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  multiple
                  hidden
                  onChange={(event) => onImagesAdd(event.target.files)}
                />
              </Box>
            )}
          </Box>
          {imageError && <Alert severity="error">{imageError}</Alert>}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            Detalles
          </Typography>
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
            onKeyDown={(event) => {
              if (["e", "E", "+", "-"].includes(event.key)) {
                event.preventDefault();
              }
            }}
            onPaste={(event) => {
              if (/[eE+-]/.test(event.clipboardData.getData("text"))) {
                event.preventDefault();
              }
            }}
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
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            Clasificación
          </Typography>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl
                fullWidth
                size="small"
                error={Boolean(errors.category)}
              >
                <InputLabel id="category-label">Categoría</InputLabel>
                <Select
                  labelId="category-label"
                  label="Categoría"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                >
                  {categories.length === 0 ? (
                    <MenuItem value="" disabled>
                      Sin resultados
                    </MenuItem>
                  ) : (
                    categories.map((option) => (
                      <MenuItem key={option.id} value={option.slug}>
                        {option.label}
                      </MenuItem>
                    ))
                  )}
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
                <InputLabel id="season-label">Estación cromática</InputLabel>
                <Select
                  labelId="season-label"
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
                <InputLabel id="gender-label">Para</InputLabel>
                <Select
                  labelId="gender-label"
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
                    Publicar ahora
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Apágalo para guardar como borrador.
                  </Typography>
                </Box>
                <Switch
                  checked={field.value ?? true}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  aria-label="Publicar ahora"
                />
              </Box>
            )}
          />
        </Box>
      </Box>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          p: 2,
        }}
      >
        {feedback && !feedback.ok && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {feedback.message}
          </Alert>
        )}
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
          {isSubmitting ? "Publicando..." : "Publicar"}
        </Button>
      </Box>
      <Dialog
        open={feedback?.ok ?? false}
        onClose={onStay}
        fullWidth
        maxWidth="xs"
      >
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
              {feedback?.published
                ? "¡Ya está en tu tienda!"
                : "Borrador guardado"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feedback?.message}
            </Typography>
            <Button
              variant="contained"
              size="large"
              fullWidth
              component={Link}
              href={feedback?.published ? "/marketplace" : "/home"}
              sx={{ minHeight: 48, mt: 1 }}
            >
              {feedback?.published
                ? "Ver en tienda"
                : "Ver mis publicaciones"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={onStay}
              sx={{ minHeight: 48 }}
            >
              Publicar otra prenda
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
