"use client";

import Link from "@/components/ui/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EmptyState from "../ui/EmptyState";
import ProductCardView from "../catalog/ProductCardView";
import type { ColorimetryAnalysis } from "@/lib/actions/colorimetry";
import type { Product } from "@/lib/api/products";

const seasonLabels: Record<ColorimetryAnalysis["season"], string> = {
  spring: "Primavera",
  summer: "Verano",
  autumn: "Otoño",
  winter: "Invierno",
};

const undertoneLabels: Record<string, string> = {
  warm: "Cálido",
  cool: "Frío",
  neutral: "Neutro",
};

const contrastLabels: Record<string, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};

const genderLabels: Record<"men" | "women", string> = {
  men: "Hombre",
  women: "Mujer",
};

interface AnalysisResultViewProps {
  result: ColorimetryAnalysis;
  gender: "men" | "women";
  products: Product[];
  onRepeat: () => void;
}

export default function AnalysisResultView({
  result,
  gender,
  products,
  onRepeat,
}: AnalysisResultViewProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 4,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "center",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, alignItems: "center", justifyContent: "center" }}
      >
        <CheckCircleIcon color="secondary" sx={{ fontSize: 28 }} />
        <Typography
          variant="overline"
          color="secondary.dark"
          sx={{ letterSpacing: 2, fontWeight: 700 }}
        >
          Diagnóstico completado
        </Typography>
      </Stack>

      <Typography
        variant="h3"
        component="h2"
        sx={{
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontSize: { xs: "1.75rem", md: "2.5rem" },
        }}
      >
        {result.subtype || seasonLabels[result.season]}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 2, justifyContent: "center", flexWrap: "wrap", gap: 1 }}
      >
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
          label={`Estación ${seasonLabels[result.season]}`}
          color="secondary"
          sx={{ fontWeight: 700 }}
        />
        <Chip
          label={`Subtono ${undertoneLabels[result.undertone] ?? result.undertone}`}
          variant="outlined"
        />
        <Chip
          label={`Contraste ${contrastLabels[result.contrast] ?? result.contrast}`}
          variant="outlined"
        />
        <Chip label={`Para: ${genderLabels[gender]}`} variant="outlined" />
      </Stack>

      {result.explanation && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 3, mx: "auto", maxWidth: 620, lineHeight: 1.7 }}
        >
          {result.explanation}
        </Typography>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mt: 4,
          mb: 1.5,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: 700,
        }}
      >
        Tu paleta recomendada
      </Typography>
      <Stack
        direction="row"
        sx={{ justifyContent: "center", flexWrap: "wrap", gap: 2 }}
      >
        {result.recommended_palette.map((color) => (
          <Box key={color} sx={{ width: 72, textAlign: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                mx: "auto",
                borderRadius: "50%",
                bgcolor: color,
                border: 1,
                borderColor: "divider",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5, fontWeight: 600 }}
            >
              {color}
            </Typography>
          </Box>
        ))}
      </Stack>

      {result.avoid_palette.length > 0 && (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 3,
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >
            Colores a evitar
          </Typography>
          <Stack
            direction="row"
            sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}
          >
            {result.avoid_palette.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: color,
                  border: 1,
                  borderColor: "divider",
                  opacity: 0.75,
                }}
              />
            ))}
          </Stack>
        </>
      )}

      <Box sx={{ mt: 4, textAlign: "left" }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Prendas compatibles ({products.length})
        </Typography>

        {products.length === 0 ? (
          <EmptyState
            title="Sin coincidencias todavía"
            description={`Aún no hay prendas de ${genderLabels[gender].toLowerCase()} (ni unisex) en tu estación. Vuelve pronto.`}
          />
        ) : (
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <ProductCardView product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mt: 4, justifyContent: "center", alignItems: "center" }}
      >
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href={`/marketplace?gender=${gender}&season=${result.season}`}
          startIcon={<StorefrontIcon />}
          sx={{ minHeight: 52, px: 4 }}
        >
          Ver todas las de {seasonLabels[result.season]}
        </Button>
        <Button
          variant="contained"
          size="large"
          component={Link}
          href="/marketplace"
          startIcon={<StorefrontIcon />}
          sx={{ minHeight: 52, px: 4 }}
        >
          Explorar marketplace
        </Button>
        <Button
          variant="text"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={onRepeat}
          sx={{ minHeight: 52 }}
        >
          Repetir análisis
        </Button>
      </Stack>
    </Paper>
  );
}
