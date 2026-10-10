import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import Footer, { FooterFallback } from "@/components/layout/Footer";
import Navbar, { NavbarFallback } from "@/components/layout/Navbar";

export default function AuthPage() {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Kroma
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Inicia sesión o crea tu cuenta.
            </Typography>
            <Box>
              <AuthForm />
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
    </>
  );
}
