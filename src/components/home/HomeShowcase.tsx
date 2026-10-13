import Link from "@/components/ui/Link";
import Image from "next/image";
import { connection } from "next/server";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { createClient } from "@/lib/supabase/server";
import ProductCardView from "../catalog/ProductCardView";

export function HomeShowcaseFallback() {
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
      <Box sx={{ py: { xs: 5, md: 8 } }}>
        <Skeleton variant="text" width={220} />
        <Skeleton variant="text" width="60%" sx={{ fontSize: "3rem" }} />
        <Skeleton variant="text" width="40%" />
      </Box>
      <Grid container spacing={3}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Grid key={index} size={{ xs: 6, sm: 4, md: 2 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                border: 1,
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3 / 4",
                  overflow: "hidden",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                <Skeleton variant="text" sx={{ fontSize: "0.875rem" }} />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ fontSize: "1.25rem", mt: 0.5 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default async function HomeShowcase() {
  await connection();
  const supabase = await createClient();
  const [{ data: userResult }, { data: products }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("products")
      .select("*, stores ( id, name, city, phone )")
      .eq("is_active", true)
      .eq("is_published", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const sellHref = userResult.user ? "/home" : "/auth";
  const rows = products ?? [];
  const heroImages = rows
    .map((product) => product.image_urls[0])
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return (
    <>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
            py: { xs: 5, md: 8 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
              sx={{ fontSize: { xs: "2.25rem", md: "3.25rem" }, mt: 1.5 }}
            >
              Lo recién llegado.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1.5, mb: 4, maxWidth: 440 }}
            >
              Prendas únicas de tiendas independientes, publicadas todos los
              días.
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}
            >
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/marketplace"
                endIcon={<ArrowForwardIcon />}
                sx={{ minHeight: 52, borderRadius: 999, px: 4 }}
              >
                Explorar
              </Button>
              <Button
                variant="text"
                size="large"
                component={Link}
                href={sellHref}
                sx={{ minHeight: 52 }}
              >
                Vender
              </Button>
            </Stack>
          </Box>
          {heroImages.length > 0 && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                display: "flex",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  flex: 1.2,
                  aspectRatio: "3 / 4",
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "grey.100",
                }}
              >
                {heroImages[0] && (
                  <Image
                    src={heroImages[0]}
                    alt="Prenda destacada"
                    fill
                    sizes="(max-width: 900px) 60vw, 30vw"
                    style={{ objectFit: "cover" }}
                    priority
                  />
                )}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {[heroImages[1], heroImages[2]].map((url, position) =>
                  url ? (
                    <Box
                      key={url}
                      sx={{
                        position: "relative",
                        flex: 1,
                        borderRadius: 3,
                        overflow: "hidden",
                        bgcolor: "grey.100",
                        minHeight: 0,
                      }}
                    >
                      <Image
                        src={url}
                        alt={`Prenda destacada ${position + 2}`}
                        fill
                        sizes="(max-width: 900px) 40vw, 20vw"
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  ) : null,
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Container>
      {rows.length > 0 && (
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, pb: 8 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3, alignItems: "center" }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, flexGrow: 1 }}
            >
              Recién publicados
            </Typography>
            <Button
              variant="text"
              component={Link}
              href="/marketplace"
              endIcon={<ArrowForwardIcon />}
            >
              Ver todo
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {rows.map((product) => (
              <Grid key={product.id} size={{ xs: 6, sm: 4, md: 2 }}>
                <ProductCardView product={product} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
