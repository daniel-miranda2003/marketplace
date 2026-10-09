"use client";

import { Lottie } from "lottie-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
  title: string;
  description?: string;
  animationSrc?: string;
}

export default function EmptyState({
  title,
  description,
  animationSrc = "/animations/empty-box.json",
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box sx={{ width: 200, height: 200 }}>
        <Lottie src={animationSrc} loop autoplay />
      </Box>
      <Typography variant="h6" component="p" sx={{ mt: 2 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
