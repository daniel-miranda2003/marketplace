import Link from "@/components/ui/Link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { getCategories } from "@/lib/catalog/queries";
import { createClient } from "@/lib/supabase/server";

export function FooterFallback() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        mt: 8,
        py: 6,
        minHeight: 220,
      }}
    />
  );
}

export default async function Footer() {
  const supabase = await createClient();
  const [{ data: userResult }, categories] = await Promise.all([
    supabase.auth.getUser(),
    getCategories(),
  ]);
  const accountHref = userResult.user ? "/home" : "/auth";
  const accountLabel = userResult.user ? "Mi cuenta" : "Entrar";
  return (
    <Box
      component="footer"
      sx={{ borderTop: 1, borderColor: "divider", mt: 8, py: 6 }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Kroma
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Marketplace de moda independiente con análisis de color por IA.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Categorías
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                component={Link}
                href="/marketplace"
                color="text.secondary"
                sx={{ textDecoration: "none" }}
              >
                Ver todo
              </Typography>
              {categories.map((category) => (
                <Typography
                  key={category.id}
                  variant="body2"
                  component={Link}
                  href={`/marketplace?category=${category.slug}`}
                  color="text.secondary"
                  sx={{ textDecoration: "none" }}
                >
                  {category.label}
                </Typography>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Cuenta
            </Typography>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                component={Link}
                href={accountHref}
                color="text.secondary"
                sx={{ textDecoration: "none" }}
              >
                {accountLabel}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © Kroma
        </Typography>
      </Container>
    </Box>
  );
}
