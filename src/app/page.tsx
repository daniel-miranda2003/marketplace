import { Suspense } from "react";
import Link from "@/components/ui/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Footer from "@/components/layout/Footer";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";
import Reveal from "@/components/ui/Reveal";

export default function Home() {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Reveal>
          <Box sx={{ mb: 6, maxWidth: 680 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 3 }}
            >
              Marketplace de moda independiente
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontSize: { xs: "2rem", md: "3rem" }, mt: 1 }}
            >
              Moda independiente, en un solo lugar.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Explora prendas de tiendas independientes, con recomendaciones
              de IA según tu colorimetría.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/marketplace"
                sx={{ minHeight: 48 }}
              >
                Explorar catálogo
              </Button>
              <Button variant="text" size="large" component={Link} href="/auth">
                Descubrir mi paleta
              </Button>
            </Stack>
          </Box>
        </Reveal>
      </Container>
      <Footer />
    </>
  );
}
