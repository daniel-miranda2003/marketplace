import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111111",
      light: "#4d4d4d",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#c8a97e",
      light: "#e6d5b8",
      dark: "#9a7b4f",
      contrastText: "#111111",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#111111",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: "var(--font-jakarta-sans), Arial, Helvetica, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
