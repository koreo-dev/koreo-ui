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
  flexDirection: "row-reverse",
  alignItems: "center",
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(1),
  paddingRight: theme.spacing(1.5),
  color: "#4B426C",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.mode === "light" ? theme.palette.secondary.main : "white",
  },
  "&.selected": {
    backgroundColor: theme.palette.mode === "light" 
      ? theme.palette.primary.main 
      : theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
  "&.disabled": {
    opacity: 0.5,
    pointerEvents: "none",
  }
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

export default function MenuTree() {
  const router = useRouter();
  const pathName = usePathname();

  const handleClick = (itemId: string, disabled: boolean) => {
    if (!disabled) {
      router.push(itemId);
    }
  };

  const isSelected = (itemId: string): boolean => {
    if (itemId === "/" && (pathName === "/" || pathName.startsWith("/workflow/"))) {
      return true;
    }
    if (itemId === "/resource-template" && pathName.startsWith("/resource-template/")) {
      return true;
    }
    return pathName === itemId;
  };

  return (
    <List sx={{ width: '100%', height: 'fit-content', flexGrow: 1, overflowY: 'auto' }}>
      {menuItems.map((item) => {
        const Icon = getIconForItemType(item.type);
        const selected = isSelected(item.id);
        
        return (
          <ListItem key={item.id} disablePadding>
            <StyledMenuItem 
              onClick={() => handleClick(item.id, item.disabled)}
              className={`${selected ? 'selected' : ''} ${item.disabled ? 'disabled' : ''}`}
              sx={{ width: '100%' }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.label}
              </Typography>
              {Icon && (
                <Box
                  component={Icon}
                  className="labelIcon"
                  color="inherit"
                  sx={{ mr: 1, fontSize: "1.2rem" }}
                />
              )}
            </StyledMenuItem>
          </ListItem>
        );
      })}
    </List>
  );
}
