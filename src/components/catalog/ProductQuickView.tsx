"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import type { Product } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";

const DEFAULT_MESSAGE = "Hola. ¿Sigue estando disponible?";

interface ProductQuickViewProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onSellerOpen: () => void;
}

export default function ProductQuickView({
  product,
  open,
  onClose,
  onSellerOpen,
}: ProductQuickViewProps) {
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const images = product.image_urls;
  const total = images.length;
  const phone = product.stores?.phone?.replace(/\D/g, "") ?? "";

  const goTo = (next: number) => {
    if (total === 0) {
      return;
    }
    setIndex((next + total) % total);
  };

  const sendWhatsApp = () => {
    if (!phone) {
      return;
    }
    const store = product.stores;
    const lines = [
      message.trim() || DEFAULT_MESSAGE,
      `Prenda: ${product.name}`,
      `Precio: ${formatPrice(product.price)}`,
    ];
    if (store) {
      lines.push(
        `Tienda: ${store.name}${store.city ? ` · ${store.city}` : ""}`,
      );
    }
    lines.push(
      `Ver: ${window.location.origin}/marketplace?product=${product.id}`,
    );
    const url = `https://wa.me/591${phone}?text=${encodeURIComponent(lines.join("\n\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <IconButton
        aria-label="Cerrar"
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 4 },
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: 380 },
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "3 / 4",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "grey.100",
              }}
            >
              {images[index] && (
                <Box
                  component="img"
                  src={images[index]}
                  alt={product.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
              {total > 1 && (
                <>
                  <IconButton
                    aria-label="Foto anterior"
                    onClick={() => goTo(index - 1)}
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "background.paper",
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton
                    aria-label="Foto siguiente"
                    onClick={() => goTo(index + 1)}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "background.paper",
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
            </Box>
            {total > 1 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 1.5, justifyContent: "center" }}
              >
                {images.map((url, position) => (
                  <Box
                    key={url}
                    onClick={() => setIndex(position)}
                    sx={{
                      width: position === index ? 20 : 8,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: position === index ? "primary.main" : "grey.300",
                      cursor: "pointer",
                      transition: "width 0.2s ease",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              maxHeight: { md: "80vh" },
              overflow: "hidden",
            }}
          >
            <Box sx={{ overflowY: "auto", flexGrow: 1, pr: 1, pb: 1.5 }}>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                {product.name}
              </Typography>
              <Typography
                variant="h5"
                color="primary.main"
                sx={{ fontWeight: 700, mt: 1 }}
              >
                {formatPrice(product.price)}
              </Typography>
              {product.is_sold && (
                <Chip
                  label="Vendido"
                  size="small"
                  color="error"
                  sx={{
                    mt: 1,
                    width: "fit-content",
                    fontWeight: 700,
                  }}
                />
              )}
              {product.stores && (
                <Box
                  component="button"
                  type="button"
                  onClick={onSellerOpen}
                  aria-label={`Ver tienda ${product.stores.name}`}
                  sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    p: 0,
                    border: 0,
                    bgcolor: "transparent",
                    cursor: "pointer",
                    font: "inherit",
                    color: "text.secondary",
                    textAlign: "left",
                    "&:hover .seller-name": { textDecoration: "underline" },
                  }}
                >
                  <StorefrontIcon fontSize="small" />
                  <Typography
                    variant="body2"
                    component="span"
                    className="seller-name"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {product.stores.name}
                  </Typography>
                  {product.stores.city && (
                    <Typography variant="body2" component="span">
                      {`· ${product.stores.city}`}
                    </Typography>
                  )}
                </Box>
              )}
              <Divider sx={{ my: 2.5 }} />
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 1.5 }}
              >
                Descripción
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 1, whiteSpace: "pre-line" }}
              >
                {product.description || "Sin descripción."}
              </Typography>
            </Box>
            {product.stores && (
              <Box
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  pt: 1.5,
                  mt: "auto",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={onSellerOpen}
                  aria-label={`Ver tienda ${product.stores.name}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 0,
                    border: 0,
                    bgcolor: "transparent",
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                    textAlign: "left",
                    borderRadius: 2,
                    "&:hover .seller-name": { textDecoration: "underline" },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    {product.stores.name.charAt(0).toUpperCase()}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      className="seller-name"
                      sx={{ fontWeight: 600, lineHeight: 1.2 }}
                      noWrap
                    >
                      {product.stores.name}
                    </Typography>
                    {product.stores.city && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: 1.2 }}
                      >
                        {product.stores.city}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendWhatsApp();
                      }
                    }}
                    placeholder={DEFAULT_MESSAGE}
                    aria-label="Mensaje al vendedor"
                    disabled={!phone}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    onClick={sendWhatsApp}
                    disabled={!phone}
                    sx={{ flexShrink: 0 }}
                  >
                    Enviar
                  </Button>
                </Stack>
                {!phone && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    Esta tienda aún no tiene WhatsApp registrado.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
