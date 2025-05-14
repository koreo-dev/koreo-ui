"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, List, ListItem, Typography, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";

const menuItems = [
  {
    id: "/",
    label: "Workflows",
    type: "workflows",
    disabled: false,
  },
  {
    id: "/resource-template",
    label: "Resource Templates",
    type: "resource-templates",
    disabled: false,
  },
];

const StyledMenuItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  borderRadius: theme.spacing(3),
  margin: `${theme.spacing(0.5)} 0`,
  padding: theme.spacing(1),
  color: "#4B426C",
  cursor: "pointer",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color:
      theme.palette.mode === "light" ? theme.palette.secondary.main : "white",
  },
  "&.selected": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.primary.main
        : theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  "&.disabled": {
    opacity: 0.5,
    pointerEvents: "none",
  },
}));

const getIconForItemType = (itemType: string) => {
  switch (itemType) {
    case "workflows":
      return RouteOutlinedIcon;
    case "resource-templates":
      return ConstructionOutlinedIcon;
    default:
      return null;
  }
};

interface MenuProps {
  collapsed: boolean;
}

export default function Menu({ collapsed }: MenuProps) {
  const router = useRouter();
  const pathName = usePathname();

  const handleClick = (itemId: string, disabled: boolean) => {
    if (!disabled) {
      router.push(itemId);
    }
  };

  const isSelected = (itemId: string): boolean => {
    if (
      itemId === "/" &&
      (pathName === "/" || pathName.startsWith("/workflow/"))
    ) {
      return true;
    }
    if (
      itemId === "/resource-template" &&
      pathName.startsWith("/resource-template/")
    ) {
      return true;
    }
    return pathName === itemId;
  };

  return (
    <List
      sx={{
        width: "100%",
        flexGrow: 1,
        overflowY: "auto",
      }}
    >
      {menuItems.map((item) => {
        const Icon = getIconForItemType(item.type);
        const selected = isSelected(item.id);

        return (
          <ListItem
            key={item.id}
            disablePadding
            sx={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <StyledMenuItem
              onClick={() => handleClick(item.id, item.disabled)}
              className={`${selected ? "selected" : ""} ${item.disabled ? "disabled" : ""}`}
              sx={{
                width: "100%",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              {Icon && (
                <Box
                  component={Icon}
                  color="inherit"
                  sx={{
                    fontSize: "1.4rem",
                    mr: collapsed ? 0 : 1.5,
                  }}
                />
              )}
              {!collapsed && (
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  {item.label}
                </Typography>
              )}
            </StyledMenuItem>
          </ListItem>
        );
      })}
    </List>
  );
}
