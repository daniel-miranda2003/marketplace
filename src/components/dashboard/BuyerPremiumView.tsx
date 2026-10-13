import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NextLink from "next/link";
import ProductCard from "../catalog/ProductCard";
import EmptyState from "../ui/EmptyState";
import type { Database, Tables } from "@/lib/supabase/database.types";

type ChromaticSeason = Database["public"]["Enums"]["chromatic_season"];

const seasonLabels: Record<ChromaticSeason, string> = {
  spring: "Primavera",
  summer: "Verano",
  autumn: "Otoño",
  winter: "Invierno",
};

export interface ColorimetryAnalysisMeta {
  subtype?: string;
  undertone?: string;
  contrast?: string;
  avoid_palette?: string[];
  explanation?: string;
}

interface BuyerPremiumViewProps {
  season: ChromaticSeason | null;
  palette: string[];
  products: Tables<"products">[];
  analysis?: ColorimetryAnalysisMeta | null;
}

export default function BuyerPremiumView({
  season,
  palette,
  products,
  analysis,
}: BuyerPremiumViewProps) {
  if (!season) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <AutoAwesomeIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Tu análisis aún no está listo
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 460, mx: "auto", mb: 3 }}
          >
            Completa tu análisis cromático con IA para desbloquear tu estación,
            paleta personalizada y prendas compatibles.
          </Typography>
          <Button
            component={NextLink}
            href="/analysis"
            variant="contained"
            color="secondary"
            size="large"
          >
            Comenzar Análisis Facial
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mb: 2,
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Tu estación cromática
              </Typography>
              {analysis?.subtype && (
                <Typography variant="body2" color="text.secondary">
                  {analysis.subtype}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Chip
                label={seasonLabels[season]}
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
              <Button
                component={NextLink}
                href="/analysis"
                variant="outlined"
                size="small"
                color="inherit"
              >
                Repetir test
              </Button>
            </Stack>
          </Stack>

          {analysis?.explanation && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2.5, lineHeight: 1.6 }}
            >
              {analysis.explanation}
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Paleta recomendada
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: analysis?.avoid_palette?.length ? 2.5 : 0, flexWrap: "wrap", gap: 1 }}>
            {palette.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: color,
                  border: 1,
                  borderColor: "divider",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </Stack>

          {analysis?.avoid_palette && analysis.avoid_palette.length > 0 && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                Colores a evitar
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {analysis.avoid_palette.map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 32,
                      height: 32,
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
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Prendas compatibles ({products.length})
      </Typography>

      {products.length === 0 ? (
        <EmptyState
          title="Sin coincidencias todavía"
          description="Las prendas de los vendedores que hagan match con tu paleta aparecerán aquí."
        />
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
