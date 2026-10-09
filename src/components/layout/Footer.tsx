import Link from "@/components/ui/Link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface FooterGroup {
  title: string;
  links: { label: string; href: string }[];
}

const groups: FooterGroup[] = [
  {
    title: "Tienda",
    links: [
      { label: "Catálogo", href: "/marketplace" },
      { label: "Análisis IA", href: "/auth" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { label: "Entrar", href: "/auth" },
      { label: "Panel", href: "/dashboard" },
    ],
  },
];

export default function Footer() {
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
          {groups.map((group) => (
            <Grid key={group.title} size={{ xs: 6, md: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {group.title}
              </Typography>
              <Stack spacing={1}>
                {group.links.map((link) => (
                  <Typography
                    key={link.href + link.label}
                    variant="body2"
                    component={Link}
                    href={link.href}
                    color="text.secondary"
                    sx={{ textDecoration: "none" }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © Kroma
        </Typography>
      </Container>
    </Box>
  );
}
