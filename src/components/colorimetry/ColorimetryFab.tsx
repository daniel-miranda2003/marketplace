"use client";

import Link from "@/components/ui/Link";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function ColorimetryFab() {
  return (
    <Fab
      variant="extended"
      color="secondary"
      component={Link}
      href="/analysis"
      aria-label="Analizar mi colorimetría"
      sx={{
        position: "fixed",
        bottom: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        zIndex: (theme) => theme.zIndex.speedDial,
        height: 56,
        minHeight: 56,
        minWidth: 56,
        maxWidth: 56,
        width: "auto",
        justifyContent: "flex-start",
        pl: "16px",
        pr: 0,
        overflow: "hidden",
        whiteSpace: "nowrap",
        fontWeight: 700,
        borderRadius: "50%",
        boxShadow: "0 8px 24px rgba(200, 169, 126, 0.45)",
        transition:
          "max-width 240ms cubic-bezier(0.4, 0, 0.2, 1), padding-right 240ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          maxWidth: 320,
          pr: "20px",
          borderRadius: "16px",
        },
        "& .fab-label": {
          opacity: 0,
          whiteSpace: "nowrap",
          transition: "opacity 120ms ease 100ms",
        },
        "&:hover .fab-label": {
          opacity: 1,
        },
      }}
    >
      <AutoAwesomeIcon sx={{ flexShrink: 0 }} />
      <Box component="span" className="fab-label" sx={{ ml: 1 }}>
        Analizar mi colorimetría
      </Box>
    </Fab>
  );
}