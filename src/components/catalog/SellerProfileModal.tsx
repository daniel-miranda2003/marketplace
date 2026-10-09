"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useStoreShowcase } from "@/hooks/useStoreShowcase";
import type { Product } from "@/lib/api/products";
import ProductCardView from "./ProductCardView";

interface SellerProfileModalProps {
  storeId: string;
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function SellerProfileModal({
  storeId,
  open,
  onClose,
  onSelectProduct,
}: SellerProfileModalProps) {
  const { data, isPending, isError } = useStoreShowcase(storeId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        {isPending ? (
          <>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Skeleton variant="circular" width={64} height={64} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton
                  variant="text"
                  width="50%"
                  sx={{ fontSize: "1.5rem" }}
                />
                <Skeleton variant="text" width="30%" />
              </Box>
            </Stack>
            <Divider sx={{ my: 2.5 }} />
            <SellerProfileSkeleton />
          </>
        ) : isError || !data ? (
          <Alert severity="error">No se pudo cargar la tienda.</Alert>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.75rem",
                  flexShrink: 0,
                }}
              >
                {data.store.name.charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                  {data.store.name}
                </Typography>
                {data.store.city && (
                  <Typography variant="body2" color="text.secondary">
                    {data.store.city}
                  </Typography>
                )}
              </Box>
            </Stack>
            {data.store.description && (
              <Typography
                variant="body2"
                sx={{ mt: 1.5, whiteSpace: "pre-line" }}
              >
                {data.store.description}
              </Typography>
            )}
            <Divider sx={{ my: 2.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Publicaciones ({data.products.length})
            </Typography>
            {data.products.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Esta tienda aún no tiene publicaciones visibles.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {data.products.map((product) => (
                  <Grid key={product.id} size={{ xs: 6, sm: 4 }}>
                    <Box
                      onClick={() => onSelectProduct(product)}
                      sx={{ cursor: "pointer", height: "100%" }}
                    >
                      <ProductCardView product={product} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SellerProfileSkeleton() {
  return (
    <Grid container spacing={2}>
      {[0, 1, 2].map((index) => (
        <Grid key={index} size={{ xs: 6, sm: 4 }}>
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
  );
}
