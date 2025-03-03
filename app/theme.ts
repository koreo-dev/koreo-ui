"use client";
import { Inter } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const roboto = Inter({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#0A6DDC",
    },
    secondary: {
      main: "#17065A",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    fontWeightMedium: 500,
  },
  components: {
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontWeight: 500, // Apply medium font weight to primary text
        },
      },
    },
  },
});

export default theme;
