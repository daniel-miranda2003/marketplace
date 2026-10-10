"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GridViewIcon from "@mui/icons-material/GridView";
import PublishIcon from "@mui/icons-material/Publish";
import RestoreIcon from "@mui/icons-material/Restore";
import SellIcon from "@mui/icons-material/Sell";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import ViewListIcon from "@mui/icons-material/ViewList";
import Link from "../ui/Link";
import EmptyState from "../ui/EmptyState";
import EditProductDialog from "./EditProductDialog";
import EditStoreDialog from "./EditStoreDialog";
import {
  deleteProduct,
  restoreProduct,
  setProductPublished,
  setProductSold,
} from "@/app/actions/products";
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
  deletedProducts: ProductRow[];
  categories: CategoryRow[];
}

type CatalogView = "list" | "cards";

const VENDOR_PAGE_SIZE = 8;

function StatusChip({ published }: { published: boolean }) {
  return published ? (
    <Chip label="Publicado" size="small" color="success" variant="outlined" />
  ) : (
    <Chip label="Borrador" size="small" variant="outlined" />
  );
}

function SoldChip({ sold }: { sold: boolean }) {
  if (!sold) {
    return null;
  }
  return <Chip label="Vendido" size="small" variant="outlined" />;
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

interface ProductActionsProps {
  product: ProductRow;
  isToggling: boolean;
  isSoldToggling: boolean;
  onEdit: () => void;
  onTogglePublished: () => void;
  onToggleSold: () => void;
  onDelete: () => void;
}

function ProductActions({
  product,
  isToggling,
  isSoldToggling,
  onEdit,
  onTogglePublished,
  onToggleSold,
  onDelete,
}: ProductActionsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={onEdit}
      >
        Editar
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={
          product.is_published ? <UnpublishedIcon /> : <PublishIcon />
        }
        disabled={isToggling}
        onClick={onTogglePublished}
      >
        {product.is_published ? "Pausar" : "Publicar"}
      </Button>
      <Button
        size="small"
        variant="outlined"
        startIcon={<SellIcon />}
        disabled={isSoldToggling}
        onClick={onToggleSold}
      >
        {product.is_sold ? "Disponible" : "Vendido"}
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
      >
        Eliminar
      </Button>
    </Stack>
  );
}

export default function VendorDashboard({
  store,
  products,
  deletedProducts,
  categories,
}: VendorDashboardProps) {
  const router = useRouter();
  const [view, setView] = useState<CatalogView>("list");
  const [section, setSection] = useState<"active" | "trash">("active");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);
  const [deletedName, setDeletedName] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const sectionItems = section === "trash" ? deletedProducts : products;
  const totalPages = Math.max(
    Math.ceil(sectionItems.length / VENDOR_PAGE_SIZE),
    1,
  );
  const safePage = Math.min(page, totalPages);
  const visibleItems = sectionItems.slice(
    (safePage - 1) * VENDOR_PAGE_SIZE,
    safePage * VENDOR_PAGE_SIZE,
  );

  const pagination =
    totalPages > 1 ? (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={safePage}
          onChange={(_, value) => setPage(value)}
        />
      </Box>
    ) : null;

  const { mutate: togglePublished, isPending: isToggling } = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      setProductPublished(id, published),
    onSuccess: () => router.refresh(),
  });

  const { mutate: removeProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (result, id) => {
      if (!result.ok) {
        setDeleteError(result.message);
        return;
      }
      setDeleting(null);
      setDeleteError(null);
      setDeletedName(
        products.find((product) => product.id === id)?.name ?? "Publicación",
      );
      router.refresh();
    },
  });

  const { mutate: restoreDeleted, isPending: isRestoring } = useMutation({
    mutationFn: (id: string) => restoreProduct(id),
    onSuccess: () => router.refresh(),
  });

  const { mutate: toggleSold, isPending: isSoldToggling } = useMutation({
    mutationFn: ({ id, sold }: { id: string; sold: boolean }) =>
      setProductSold(id, sold),
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
          href="/home/sell"
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
        <Tabs
          value={section}
          onChange={(_, next: "active" | "trash") => {
            setSection(next);
            setPage(1);
          }}
          aria-label="Secciones de publicaciones"
          sx={{ flexGrow: 1 }}
        >
          <Tab value="active" label="Mis publicaciones" />
          <Tab value="trash" label={`Papelera (${deletedProducts.length})`} />
        </Tabs>
        {section === "active" && (
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
        )}
      </Stack>
      {section === "trash" ? (
        deletedProducts.length === 0 ? (
          <EmptyState
            title="Papelera vacía"
            description="Las publicaciones eliminadas aparecerán aquí y podrás restaurarlas."
          />
        ) : (
          <>
            <Stack spacing={1.5}>
              {visibleItems.map((product) => (
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
                    <Stack direction="row" spacing={1}>
                      <Chip label="Eliminada" size="small" variant="outlined" />
                      <SoldChip sold={product.is_sold} />
                    </Stack>
                  </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RestoreIcon />}
                    disabled={isRestoring}
                    onClick={() => restoreDeleted(product.id)}
                  >
                    Restaurar
                  </Button>
                </Box>
              ))}
            </Stack>
            {pagination}
          </>
        )
      ) : products.length === 0 ? (
        <EmptyState
          title="Aún no tienes publicaciones"
          description="Publica tu primera prenda para verla aquí."
        />
      ) : view === "list" ? (
        <>
          <Stack spacing={1.5}>
            {visibleItems.map((product) => (
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
                  <Stack direction="row" spacing={1}>
                    <StatusChip published={product.is_published} />
                    <SoldChip sold={product.is_sold} />
                  </Stack>
                </Box>
              </Box>
              <ProductActions
                product={product}
                isToggling={isToggling}
                isSoldToggling={isSoldToggling}
                onEdit={() => setEditing(product)}
                onTogglePublished={() =>
                  togglePublished({
                    id: product.id,
                    published: !product.is_published,
                  })
                }
                onToggleSold={() =>
                  toggleSold({
                    id: product.id,
                    sold: !product.is_sold,
                  })
                }
                onDelete={() => {
                  setDeleting(product);
                  setDeleteError(null);
                }}
              />
            </Box>
          ))}
        </Stack>
          {pagination}
        </>
      ) : (
        <>
          <Grid container spacing={3}>
            {visibleItems.map((product) => (
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
                    <Stack direction="row" spacing={1}>
                      <StatusChip published={product.is_published} />
                      <SoldChip sold={product.is_sold} />
                    </Stack>
                  </Box>
                  <Box sx={{ mt: 1.5 }}>
                    <ProductActions
                      product={product}
                      isToggling={isToggling}
                      isSoldToggling={isSoldToggling}
                      onEdit={() => setEditing(product)}
                      onTogglePublished={() =>
                        togglePublished({
                          id: product.id,
                          published: !product.is_published,
                        })
                      }
                      onToggleSold={() =>
                        toggleSold({
                          id: product.id,
                          sold: !product.is_sold,
                        })
                      }
                      onDelete={() => {
                        setDeleting(product);
                        setDeleteError(null);
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
          </Grid>
          {pagination}
        </>
      )}
      {editing && (
        <EditProductDialog
          product={editing}
          categories={categories}
          open={editing !== null}
          onClose={() => setEditing(null)}
        />
      )}
      <Dialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar publicación</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <Alert severity="info" sx={{ mb: 2 }}>
            Se moverá a la papelera. Podrás restaurarla cuando quieras.
          </Alert>
          <Typography variant="body2">
            ¿Eliminar &ldquo;{deleting?.name}&rdquo;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={isDeleting}
            onClick={() => deleting && removeProduct(deleting.id)}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deletedName !== null}
        onClose={() => setDeletedName(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 1.5,
              py: 2,
            }}
          >
            <CheckCircleIcon color="success" sx={{ width: 96, height: 96 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Movida a la papelera
            </Typography>
            <Typography variant="body2" color="text.secondary">
              &ldquo;{deletedName}&rdquo; se puede restaurar cuando quieras.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setDeletedName(null)}
              sx={{ minHeight: 48, mt: 1 }}
            >
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
