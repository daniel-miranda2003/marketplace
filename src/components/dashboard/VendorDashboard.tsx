"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import ViewListIcon from "@mui/icons-material/ViewList";
import Link from "../ui/Link";
import EmptyState from "../ui/EmptyState";
import EditProductDialog from "./EditProductDialog";
import EditStoreDialog from "./EditStoreDialog";
import { setProductPublished } from "@/app/actions/products";
import { formatPrice } from "@/lib/format";
import type { CategoryRow } from "@/lib/catalog/queries";
import type { Tables } from "@/lib/supabase/database.types";

interface StoreSummary {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
}

type ProductRow = Tables<"products">;

interface VendorDashboardProps {
  store: StoreSummary;
  products: ProductRow[];
  categories: CategoryRow[];
}

type CatalogView = "list" | "cards";

function StatusChip({ published }: { published: boolean }) {
  return published ? (
    <Chip label="Publicado" size="small" color="success" variant="outlined" />
  ) : (
    <Chip label="Borrador" size="small" variant="outlined" />
  );
}

function ProductThumbnail({ product }: { product: ProductRow }) {
  return (
    <Box
      component="img"
      src={product.image_urls[0] ?? ""}
      alt={product.name}
      sx={{
        width: 72,
        height: 88,
        objectFit: "cover",
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        flexShrink: 0,
        display: "block",
      }}
    />
  );
}

export default function VendorDashboard({
  store,
  products,
  categories,
}: VendorDashboardProps) {
  const router = useRouter();
  const [view, setView] = useState<CatalogView>("list");
  const [editing, setEditing] = useState<ProductRow | null>(null);

  const { mutate: togglePublished, isPending: isToggling } = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      setProductPublished(id, published),
    onSuccess: () => router.refresh(),
  });

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, alignItems: "center", flexWrap: "wrap", rowGap: 2 }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {store.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {store.city && <Chip label={store.city} size="small" />}
            <Chip
              label={`${products.length} publicaciones`}
              size="small"
              variant="outlined"
            />
          </Stack>
          {store.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {store.description}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/inventory"
          sx={{ minHeight: 48 }}
        >
          Publicar
        </Button>
        <EditStoreDialog
          storeId={store.id}
          name={store.name}
          city={store.city}
        />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2, alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
      >
        <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
          Mis publicaciones
        </Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_, next: CatalogView | null) => {
            if (next) {
              setView(next);
            }
          }}
          aria-label="Vista de publicaciones"
        >
          <ToggleButton value="list" aria-label="Vista de lista">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="cards" aria-label="Vista de tarjetas">
            <GridViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {products.length === 0 ? (
        <EmptyState
          title="Aún no tienes publicaciones"
          description="Publica tu primera prenda para verla aquí."
        />
      ) : view === "list" ? (
        <Stack spacing={1.5}>
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                flexWrap: "wrap",
              }}
            >
              <ProductThumbnail product={product} />
              <Box sx={{ flexGrow: 1, minWidth: 160 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(product.price)}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip published={product.is_published} />
                </Box>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(product)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    product.is_published ? (
                      <UnpublishedIcon />
                    ) : (
                      <PublishIcon />
                    )
                  }
                  disabled={isToggling}
                  onClick={() =>
                    togglePublished({
                      id: product.id,
                      published: !product.is_published,
                    })
                  }
                >
                  {product.is_published ? "Pausar" : "Publicar"}
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  component="img"
                  src={product.image_urls[0] ?? ""}
                  alt={product.name}
                  sx={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(product.price)}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <StatusChip published={product.is_published} />
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditing(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        product.is_published ? (
                          <UnpublishedIcon />
                        ) : (
                          <PublishIcon />
                        )
                      }
                      disabled={isToggling}
                      onClick={() =>
                        togglePublished({
                          id: product.id,
                          published: !product.is_published,
                        })
                      }
                    >
                      {product.is_published ? "Pausar" : "Publicar"}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      {editing && (
        <EditProductDialog
          product={editing}
          categories={categories}
          open={editing !== null}
          onClose={() => setEditing(null)}
        />
      )}
    </Box>
  );
}
