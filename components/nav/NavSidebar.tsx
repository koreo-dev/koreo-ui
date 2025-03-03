"use client";

import { Box, Drawer, Divider, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Menu from "@/components/nav/Menu";
import Link from "next/link";
import Image from "next/image";
import StyledLink from "@/components/StyledLink";

const SidebarHeader = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  backgroundColor: "#f5f3fb",
  color: theme.palette.common.white,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export default function NavSidebar() {
  const drawerWidth = 300;
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      PaperProps={{
        sx: { backgroundColor: "#F9F8FB", color: "#4B426C" },
      }}
      variant="permanent"
      anchor="left"
    >
      <SidebarHeader>
        <Link href={"/"}>
          <Image src="/koreo_logo.png" alt="Koreo" width={200} height={41} />
        </Link>
      </SidebarHeader>

      <Divider />

      <Box
        sx={{
          overflowY: "auto",
          height: "calc(100% - 120px)",
          padding: 2,
        }}
      >
        <Box sx={{ minHeight: 352, minWidth: 250 }}>
          <Menu />
        </Box>
      </Box>
      <Box
        sx={{
          padding: 2,
          textAlign: "center",
          fontSize: "0.9rem",
          color: "#999",
        }}
      >
        <Typography variant="caption">
          <StyledLink target="_blank" href="https://koreo.dev/docs/overview">Documentation</StyledLink>
        </Typography>
      </Box>
    </Drawer>
  );
}
