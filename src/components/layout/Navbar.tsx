import Link from "@/components/ui/Link";
import { connection } from "next/server";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog/queries";

export function NavbarFallback() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}
        >
          Kroma
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default async function Navbar() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const accountHref = data.user ? "/home" : "/auth";
  const categories = await getCategories();

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          Kroma
        </Typography>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 3,
            mx: "auto",
          }}
        >
          {categories.map((option) => (
            <Typography
              key={option.id}
              variant="body2"
              component={Link}
              href={`/marketplace?category=${option.slug}`}
              sx={{
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontSize: 13,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {option.label}
            </Typography>
          ))}
        </Box>
        <Box sx={{ display: "flex", ml: { xs: "auto", md: 0 } }}>
          <IconButton
            component={Link}
            href={accountHref}
            aria-label="Mi cuenta"
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          gap: 2.5,
          px: 2,
          py: 1,
          overflowX: "auto",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {categories.map((option) => (
          <Typography
            key={option.id}
            variant="body2"
            component={Link}
            href={`/marketplace?category=${option.slug}`}
            sx={{
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: 12,
              textDecoration: "none",
              color: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {option.label}
          </Typography>
        ))}
      </Box>
    </AppBar>
  );
}
