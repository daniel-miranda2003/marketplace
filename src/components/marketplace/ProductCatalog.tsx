"use client";

import { useDeferredValue, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MuiLink from "@mui/material/Link";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import TuneIcon from "@mui/icons-material/Tune";
import EmptyState from "../ui/EmptyState";
import Link from "../ui/Link";
import ProductCardView from "../catalog/ProductCardView";
import ProductQuickView from "../catalog/ProductQuickView";
import SellerProfileModal from "../catalog/SellerProfileModal";
import FiltersPanel from "./FiltersPanel";
import { useProducts } from "@/hooks/useProducts";
import { useProduct } from "@/hooks/useProduct";
import type { GarmentCategory } from "@/lib/catalog/categories";
import type { CategoryRow } from "@/lib/catalog/queries";
import type {
  ChromaticSeason,
  GenderFilter,
  Product,
  ProductSort,
} from "@/lib/api/products";

interface ProductCatalogProps {
  categories: CategoryRow[];
  counts: Record<string, number>;
  seasonCounts: Record<string, number>;
  genderCounts: Record<GenderFilter, number>;
  initialCategory: GarmentCategory | null;
  initialGender: GenderFilter | null;
  initialSeason: ChromaticSeason | null;
  initialProductId: string | null;
}

const toPrice = (value: string): number | null => {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

const PAGE_SIZE = 12;

function syncProductParam(
  category: GarmentCategory | null,
  gender: GenderFilter | null,
  season: ChromaticSeason | null,
  productId: string | null,
) {
  if (typeof window === "undefined") {
    return;
  }
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (gender) {
    params.set("gender", gender);
  }
  if (season) {
    params.set("season", season);
  }
  if (productId) {
    params.set("product", productId);
  }
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${query ? `?${query}` : ""}`,
  );
}

function CatalogSkeletons({ zoomed }: { zoomed: boolean }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: zoomed ? 4 : 3 }}>
          <Card
            elevation={0}
            sx={{
              height: "100%",
              maxWidth: 280,
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
              <Skeleton
                variant="text"
                width="45%"
                sx={{ fontSize: "0.75rem" }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function ProductCatalog({
  categories,
  counts,
  seasonCounts,
  genderCounts,
  initialCategory,
  initialGender,
  initialSeason,
  initialProductId,
}: ProductCatalogProps) {
  const [category, setCategory] = useState<GarmentCategory | null>(
    initialCategory,
  );
  const [gender, setGender] = useState<GenderFilter | null>(initialGender);
  const [season, setSeason] = useState<ChromaticSeason | null>(initialSeason);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<ProductSort>("recent");
  const [page, setPage] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [deepLinkDismissed, setDeepLinkDismissed] = useState(false);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deepLink = useProduct(initialProductId);

  const modalProduct =
    selected ??
    (initialProductId && !deepLinkDismissed ? (deepLink.data ?? null) : null);

  const openProduct = (product: Product) => {
    setSelected(product);
    syncProductParam(category, gender, season, product.id);
  };

  const closeProduct = () => {
    setSelected(null);
    setDeepLinkDismissed(true);
    syncProductParam(category, gender, season, null);
  };
  const isMobile = useMediaQuery("(max-width:899px)");
  const deferredSearch = useDeferredValue(search);
  const hasFilters =
    category !== null ||
    gender !== null ||
    season !== null ||
    search.trim() !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "";
  const activeLabel =
    categories.find((option) => option.slug === category)?.label ??
    "Marketplace";

  const clearFilters = () => {
    setCategory(null);
    setGender(null);
    setSeason(null);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const { data, isPending, isError } = useProducts(
    {
      category,
      gender,
      season,
      search: deferredSearch.trim() === "" ? undefined : deferredSearch.trim(),
      minPrice: toPrice(minPrice),
      maxPrice: toPrice(maxPrice),
      sort,
    },
    page,
  );

  const totalPages = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 0;

  const panel = (
    <FiltersPanel
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      category={category}
      onCategoryChange={(value) => {
        setCategory(value);
        setPage(1);
      }}
      categories={categories}
      counts={counts}
      gender={gender}
      onGenderChange={(value) => {
        setGender(value);
        setPage(1);
      }}
      genderCounts={genderCounts}
      minPrice={minPrice}
      maxPrice={maxPrice}
      onMinPriceChange={(value) => {
        setMinPrice(value);
        setPage(1);
      }}
      onMaxPriceChange={(value) => {
        setMaxPrice(value);
        setPage(1);
      }}
      season={season}
      onSeasonChange={(value) => {
        setSeason(value);
        setPage(1);
      }}
      seasonCounts={seasonCounts}
      showClear={hasFilters}
      onClear={clearFilters}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, pt: 3, pb: 6 }}>
      <Breadcrumbs sx={{ mb: 1 }}>
        <MuiLink component={Link} href="/" underline="hover" color="inherit">
          Inicio
        </MuiLink>
        <Typography variant="body2" color="text.primary">
          {activeLabel}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1" gutterBottom>
        {activeLabel}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Moda independiente en un solo lugar.
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <IconButton
          onClick={() => setZoomed((value) => !value)}
          aria-label={zoomed ? "Reducir" : "Ampliar"}
          sx={{
            border: 1,
            borderColor: "grey.300",
            width: 52,
            height: 52,
            bgcolor: "background.paper",
          }}
        >
          {zoomed ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
        {!isPending && !isError && (
          <Typography variant="body2" color="text.secondary">
            {data.total}{" "}
            {data.total === 1 ? "producto encontrado" : "productos encontrados"}
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Ordenar por
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as ProductSort);
                setPage(1);
              }}
              aria-label="Ordenar por"
              sx={{
                borderRadius: 999,
                height: 52,
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "grey.300",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "grey.500",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {isMobile ? (
          <Drawer
            anchor="left"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          >
            <Box sx={{ width: 300, p: 3 }}>
              {panel}
              <Button
                variant="contained"
                fullWidth
                onClick={() => setFiltersOpen(false)}
                sx={{ mt: 3 }}
              >
                Ver resultados
              </Button>
            </Box>
          </Drawer>
        ) : (
          <Box sx={{ width: 260, flexShrink: 0 }}>{panel}</Box>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<TuneIcon />}
              onClick={() => setFiltersOpen(true)}
              sx={{ mb: 2 }}
            >
              Filtros
            </Button>
          )}
          {isPending ? (
            <CatalogSkeletons zoomed={zoomed} />
          ) : isError ? (
            <Alert severity="error">No se pudo cargar el catálogo.</Alert>
          ) : data.items.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              description="Prueba con otros filtros."
            />
          ) : (
            <>
              <Grid container spacing={3}>
                {data.items.map((product) => (
                  <Grid
                    key={product.id}
                    size={{ xs: 12, sm: 6, md: 4, lg: zoomed ? 4 : 3 }}
                  >
                    <Box
                      onClick={() => openProduct(product)}
                      sx={{ cursor: "pointer", height: "100%" }}
                    >
                      <ProductCardView product={product} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                  />
                </Box>
              )}
              {modalProduct && (
                <ProductQuickView
                  key={modalProduct.id}
                  product={modalProduct}
                  open={modalProduct !== null}
                  onClose={closeProduct}
                  onSellerOpen={() => {
                    const storeId = modalProduct.stores?.id;
                    if (storeId) {
                      setSellerId(storeId);
                    }
                  }}
                />
              )}
              {sellerId && (
                <SellerProfileModal
                  storeId={sellerId}
                  open={sellerId !== null}
                  onClose={() => setSellerId(null)}
                  onSelectProduct={(product) => {
                    setSellerId(null);
                    setSelected(product);
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
}
