"use client";

import { useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useCreateProduct } from "@/hooks/useCreateProduct";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_BODY_BYTES,
  MAX_BODY_LABEL,
  MAX_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  productSchema,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/validations/product";
import FormSidebar, { type SubmissionFeedback } from "./FormSidebar";
import LivePreview from "./LivePreview";
import { SidebarCollapsedContext } from "./DashboardShell";
import type { CategoryRow } from "@/lib/catalog/queries";

interface AddProductFormProps {
  categories: CategoryRow[];
  sellerName: string;
  sellerCity: string | null;
}

export default function AddProductForm({
  categories,
  sellerName,
  sellerCity,
}: AddProductFormProps) {
  const methods = useForm<
    ProductFormInput,
    unknown,
    ProductFormOutput
  >({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: undefined,
      season: "",
      gender: "",
      isPublished: true,
    },
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);
  const wide = useContext(SidebarCollapsedContext);
  const { mutateAsync: publishProduct } = useCreateProduct();

  const handleImagesAdd = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setImageError("Máximo 3 fotos.");
      return;
    }
    const accepted: File[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setImageError("Formato no válido. Usa JPG, PNG o WebP.");
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setImageError(`La imagen supera ${MAX_IMAGE_SIZE_LABEL}.`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length === 0) {
      return;
    }
    setImageError(null);
    setImages([...images, ...accepted]);
    setPreviewUrls([
      ...previewUrls,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleImageRemove = (index: number) => {
    const url = previewUrls[index];
    if (url) {
      URL.revokeObjectURL(url);
    }
    setImages(images.filter((_, position) => position !== index));
    setPreviewUrls(previewUrls.filter((_, position) => position !== index));
  };

  const onSubmit = async (values: ProductFormOutput) => {
    setFeedback(null);
    if (images.length === 0) {
      setImageError("Selecciona una imagen para la prenda.");
      return;
    }
    const totalBytes = images.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_BODY_BYTES) {
      setImageError(`Las imágenes superan el límite de ${MAX_BODY_LABEL}.`);
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
    for (const image of images) {
      formData.append("images", image);
    }
    try {
      const result = await publishProduct(formData);
      if (result.fieldErrors) {
        const entries = Object.entries(result.fieldErrors) as [
          keyof ProductFormOutput,
          string | undefined,
        ][];
        for (const [field, message] of entries) {
          if (message) {
            methods.setError(field, { type: "server", message });
          }
        }
      }
      setFeedback({
        ok: result.ok,
        message: result.message,
        published: values.isPublished !== false,
      });
      if (result.ok) {
        methods.reset();
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setImages([]);
        setPreviewUrls([]);
        setResetKey((key) => key + 1);
      }
    } catch {
      setImageError("No se pudo enviar. Reduce el peso de las imágenes.");
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        noValidate
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "flex-start" },
          height: { md: "100dvh" },
          overflow: { xs: "visible", md: "hidden" },
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            width: { md: wide ? 520 : 400 },
            flexShrink: 0,
            height: { md: "100%" },
            borderRight: { md: 1 },
            borderColor: "divider",
            overflowY: { md: "auto" },
            transition: "width 0.2s ease",
          }}
        >
          <FormSidebar
            categories={categories}
            images={images}
            previewUrls={previewUrls}
            imageError={imageError}
            resetKey={resetKey}
            feedback={feedback}
            onImagesAdd={handleImagesAdd}
            onImageRemove={handleImageRemove}
            onStay={() => setFeedback(null)}
          />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            height: { md: "100dvh" },
            position: { md: "sticky" },
            top: { md: 0 },
            bgcolor: "grey.100",
            overflow: "hidden",
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2 },
            pb: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 2, mb: 1.5 }}
          >
            Vista previa
          </Typography>
          <LivePreview
            categories={categories}
            previewUrls={previewUrls}
            sellerName={sellerName}
            sellerCity={sellerCity}
          />
        </Box>
      </Box>
    </FormProvider>
  );
}
