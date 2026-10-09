"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { formatPrice } from "@/lib/format";
import type { CategoryRow } from "@/lib/catalog/queries";
import {
  CHROMATIC_SEASONS,
  type ProductFormInput,
  type ProductFormOutput,
} from "@/lib/validations/product";

interface LivePreviewProps {
  categories: CategoryRow[];
  previewUrls: string[];
  sellerName: string;
  sellerCity: string | null;
}

export default function LivePreview({
  categories,
  previewUrls,
  sellerName,
  sellerCity,
}: LivePreviewProps) {
  const { watch } = useFormContext<
    ProductFormInput,
    unknown,
    ProductFormOutput
  >();
  const [activeIndex, setActiveIndex] = useState(0);
  const title = watch("title");
  const price = watch("price");
  const category = watch("category");
  const season = watch("season");
  const categoryLabel =
    categories.find((option) => option.slug === category)?.label ?? "";
  const seasonLabel =
    CHROMATIC_SEASONS.find((option) => option.value === season)?.label ?? "";
  const location = [sellerCity, categoryLabel].filter(Boolean).join(" · ");
  const safeIndex =
    previewUrls.length === 0
      ? 0
      : Math.min(activeIndex, previewUrls.length - 1);
  const currentUrl = previewUrls[safeIndex];

  const goToPrevious = () => {
    if (previewUrls.length > 0) {
      setActiveIndex(
        (safeIndex - 1 + previewUrls.length) % previewUrls.length,
      );
    }
  };

  const goToNext = () => {
    if (previewUrls.length > 0) {
      setActiveIndex((safeIndex + 1) % previewUrls.length);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 580,
        width: "100%",
        m: 0,
        mx: "auto",
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          maxHeight: 400,
          overflow: "hidden",
          bgcolor: "grey.100",
        }}
      >
        {currentUrl ? (
          <Box
            component="img"
            src={currentUrl}
            alt={title || "Vista previa"}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Sin imagen
            </Typography>
          </Box>
        )}
        {previewUrls.length > 1 && (
          <>
            <IconButton
              aria-label="Foto anterior"
              onClick={goToPrevious}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="Foto siguiente"
              onClick={goToNext}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "background.paper",
              }}
            >
              <ChevronRightIcon />
            </IconButton>
            <Chip
              label={`${safeIndex + 1} / ${previewUrls.length}`}
              size="small"
              sx={{
                position: "absolute",
                right: 8,
                bottom: 8,
                bgcolor: "background.paper",
              }}
            />
          </>
        )}
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title || "Título"}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
          {typeof price === "number" && !Number.isNaN(price) && price > 0
            ? formatPrice(price)
            : formatPrice(0)}
        </Typography>
        {(location || seasonLabel) && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1, alignItems: "center" }}
          >
            {location && (
              <Typography variant="caption" color="text.secondary">
                {location}
              </Typography>
            )}
            {seasonLabel && <Chip label={seasonLabel} size="small" />}
          </Stack>
        )}
        <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {(sellerName.charAt(0) || "?").toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {sellerName}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
