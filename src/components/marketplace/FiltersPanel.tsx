"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import type { GarmentCategory } from "@/lib/catalog/categories";
import type { CategoryRow } from "@/lib/catalog/queries";
import type { ChromaticSeason, GenderFilter } from "@/lib/api/products";
import { CHROMATIC_SEASONS, GARMENT_GENDERS } from "@/lib/validations/product";

interface FiltersPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: GarmentCategory | null;
  onCategoryChange: (value: GarmentCategory | null) => void;
  categories: CategoryRow[];
  counts: Record<string, number>;
  gender: GenderFilter | null;
  onGenderChange: (value: GenderFilter | null) => void;
  genderCounts: Record<GenderFilter, number>;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  season: ChromaticSeason | null;
  onSeasonChange: (value: ChromaticSeason | null) => void;
  seasonCounts: Record<string, number>;
  showClear: boolean;
  onClear: () => void;
}

const seasonColors: Record<ChromaticSeason, string> = {
  spring: "#81b29a",
  summer: "#f2cc8f",
  autumn: "#e07a5f",
  winter: "#669bbc",
};

const softOutlineSx = {
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
};

export default function FiltersPanel({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  counts,
  gender,
  onGenderChange,
  genderCounts,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  season,
  onSeasonChange,
  seasonCounts,
  showClear,
  onClear,
}: FiltersPanelProps) {
  const genderOptions = GARMENT_GENDERS.filter(
    (option): option is { value: GenderFilter; label: string } =>
      option.value !== "unisex",
  );
  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2 }}
        >
          Buscar
        </Typography>
        <TextField
          placeholder="Buscar prendas..."
          fullWidth
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 999, height: 56, ...softOutlineSx },
            },
          }}
          sx={{ mt: 1.5 }}
        />
      </Box>
      <Divider />
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2 }}
        >
          Categoría
        </Typography>
        <Stack sx={{ mt: 0.5 }}>
          {categories.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  size="small"
                  checked={category === option.slug}
                  onChange={() =>
                    onCategoryChange(
                      category === option.slug ? null : option.slug,
                    )
                  }
                />
              }
              label={`${option.label} (${counts[option.slug] ?? 0})`}
            />
          ))}
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2 }}
        >
          Género
        </Typography>
        <Stack sx={{ mt: 0.5 }}>
          {genderOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  size="small"
                  checked={gender === option.value}
                  onChange={() =>
                    onGenderChange(
                      gender === option.value ? null : option.value,
                    )
                  }
                />
              }
              label={`${option.label} (${genderCounts[option.value] ?? 0})`}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Incluye prendas unisex.
        </Typography>
      </Box>
      <Divider />
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2 }}
        >
          Precio
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center" }}>
          <TextField
            placeholder="Mín."
            type="number"
            size="small"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            slotProps={{
              htmlInput: { min: 0 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">Bs</InputAdornment>
                ),
                sx: { borderRadius: 999, height: 48, ...softOutlineSx },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            –
          </Typography>
          <TextField
            placeholder="Máx."
            type="number"
            size="small"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            slotProps={{
              htmlInput: { min: 0 },
              input: {
                startAdornment: (
                  <InputAdornment position="start">Bs</InputAdornment>
                ),
                sx: { borderRadius: 999, height: 48, ...softOutlineSx },
              },
            }}
          />
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 2 }}
        >
          Estación
        </Typography>
        <Stack sx={{ mt: 0.5 }}>
          {CHROMATIC_SEASONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  size="small"
                  checked={season === option.value}
                  onChange={() =>
                    onSeasonChange(
                      season === option.value ? null : option.value,
                    )
                  }
                />
              }
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Typography variant="body2">
                    {option.label} ({seasonCounts[option.value] ?? 0})
                  </Typography>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: seasonColors[option.value],
                      ml: 2,
                    }}
                  />
                </Box>
              }
              sx={{ mr: 0 }}
            />
          ))}
        </Stack>
      </Box>
      {showClear && (
        <Button variant="text" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </Stack>
  );
}
