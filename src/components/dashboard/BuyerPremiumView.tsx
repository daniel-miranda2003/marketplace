import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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

interface BuyerPremiumViewProps {
  season: ChromaticSeason | null;
  palette: string[];
  products: Tables<"products">[];
}

export default function BuyerPremiumView({
  season,
  palette,
  products,
}: BuyerPremiumViewProps) {
  if (!season) {
    return (
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Tu análisis aún no está listo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Completa tu análisis cromático para desbloquear prendas compatibles.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ p: 4, mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Tu estación cromática
          </Typography>
          <Chip label={seasonLabels[season]} color="secondary" sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1}>
            {palette.map((color) => (
              <Box
                key={color}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: color,
                  border: 1,
                  borderColor: "divider",
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
      <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
        Prendas compatibles ({products.length})
      </Typography>
      {products.length === 0 ? (
        <EmptyState
          title="Sin coincidencias todavía"
          description="Las prendas de tu paleta aparecerán aquí."
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
