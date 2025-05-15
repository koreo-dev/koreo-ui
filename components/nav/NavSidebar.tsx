"use client";

import { Box, Drawer, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Menu from "@/components/nav/Menu";
import Link from "next/link";
import Image from "next/image";
import StyledLink from "@/components/StyledLink";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";

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

type NavSidebarProps = {
  isCollapsed: boolean | null;
  toggleSidebar: () => void;
};

const NavSidebar: React.FC<React.PropsWithChildren<NavSidebarProps>> = ({
  isCollapsed,
  toggleSidebar,
}) => {
  const expandedWidth = 300;
  const collapsedWidth = 64;

  // Avoid rendering anything until we know the collapsed state
  if (isCollapsed === null) return null;

  return (
    <Drawer
      sx={{
        width: isCollapsed ? collapsedWidth : expandedWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? collapsedWidth : expandedWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.3s ease",
        },
      }}
      PaperProps={{
        sx: { backgroundColor: "#F9F8FB", color: "#4B426C" },
      }}
      variant="permanent"
      anchor="left"
    >
      <SidebarHeader
        sx={{
          paddingY: isCollapsed ? 2 : 4,
          position: "relative", // needed for absolute positioning when expanded
          alignItems: "center",
        }}
      >
        <Link href="/">
          {isCollapsed ? (
            <Image src="/koreo_icon.png" alt="Koreo" width={41} height={41} />
          ) : (
            <Image src="/koreo_logo.png" alt="Koreo" width={200} height={41} />
          )}
        </Link>
      </SidebarHeader>

      <Box
        sx={{
          position: "relative",
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid #e0dfe5",
          borderBottom: "1px solid #e0dfe5",
          backgroundColor: "#F9F8FB",
        }}
      >
        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{
            padding: 0.5,
            color: "#6C6781",
            "&:hover": {
              backgroundColor: "transparent",
              color: "black",
            },
          }}
        >
          {isCollapsed ? (
            <ChevronRightIcon fontSize="small" />
          ) : (
            <ChevronLeftIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Box
        sx={{
          overflowY: "auto",
          height: "calc(100% - 120px)",
          padding: isCollapsed ? 1 : 2,
        }}
      >
        <Box sx={{ minHeight: 352, minWidth: isCollapsed ? "auto" : 250 }}>
          <Menu collapsed={isCollapsed} />
        </Box>
      </Box>

      {!isCollapsed && (
        <Box
          sx={{
            padding: 2,
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#999",
          }}
        >
          <Typography variant="caption">
            <StyledLink target="_blank" href="https://koreo.dev/docs/overview">
              Documentation
            </StyledLink>
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default NavSidebar;
