import Image from "next/image";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";

interface ProductCardViewProps {
  product: Product;
}

export default function ProductCardView({ product }: ProductCardViewProps) {
  const image = product.image_urls[0];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        maxWidth: 280,
        display: "flex",
        flexDirection: "column",
        border: 1,
        borderColor: "divider",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 4",
          bgcolor: "grey.100",
          overflow: "hidden",
          ...(product.is_sold && {
            "& img": { opacity: 0.6, filter: "grayscale(50%)" },
          }),
        }}
      >
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        )}
        {product.is_sold && (
          <Chip
            label="Vendido"
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "grey.900",
              color: "common.white",
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
          {product.name}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
          {formatPrice(product.price)}
        </Typography>
        {product.stores && (
          <Typography variant="caption" color="text.secondary">
            {product.stores.name}
            {product.stores.city ? ` · ${product.stores.city}` : ""}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
