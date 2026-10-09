import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ProductCard from "../catalog/ProductCard";
import EmptyState from "../ui/EmptyState";
import Link from "../ui/Link";
import type { Tables } from "@/lib/supabase/database.types";

interface BuyerFreeViewProps {
  products: Tables<"products">[];
}

export default function BuyerFreeView({ products }: BuyerFreeViewProps) {
  return (
    <Box>
      <Card
        sx={{
          p: 4,
          mb: 4,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            Desbloquea tu estilo
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.85 }}>
            Obtén tu análisis cromático con IA y outfits creados para tu
            paleta.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            href="/dashboard/upgrade"
            sx={{ minHeight: 48 }}
          >
            Desbloquear mi estilo (Premium)
          </Button>
        </CardContent>
      </Card>
      <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
        Productos destacados
      </Typography>
      {products.length === 0 ? (
        <EmptyState
          title="Aún no hay productos"
          description="Las prendas nuevas de tiendas independientes aparecerán aquí."
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
