import { useState } from "react";
import {
  Button,
  Divider,
  Grid,
  IconButton,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Link from "next/link";
import theme from "@/app/theme";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";

export type ContextMenuItem = {
  name: string;
  href: string;
  icon: React.ReactElement;
};

type Props = {
  items: ContextMenuItem[];
};

export default function ContextMenu(props: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = props.items;
  if (menuItems.length === 0) {
    return <></>;
  }
  const item1 = menuItems[0];
  const item2 = menuItems[1];
  const overflowMenuItems = menuItems.slice(2);
  const overflowMenu =
    overflowMenuItems.length > 0 ? (
      <Grid item>
        <IconButton
          id="overflow-button"
          aria-controls={open ? "overflow-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          color="secondary"
          sx={{ marginRight: "8px" }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="overflow-menu"
          aria-labelledby="overflow-button"
          anchorEl={anchorEl || null}
          open={open}
          onClose={handleClose}
        >
          {overflowMenuItems.map((item) => (
            <MenuItem
              key={item.name}
              onClick={handleClose}
              component="a"
              href={item.href}
              target="_blank"
            >
              {item.icon}
              <span style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                {item.name}
              </span>
            </MenuItem>
          ))}
        </Menu>
      </Grid>
    ) : (
      <></>
    );

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      paddingTop={theme.spacing(2)}
    >
      <Grid item>
        <Stack
          direction="row"
          spacing={1}
          divider={<Divider orientation="vertical" flexItem />}
          flexGrow={1}
          sx={{ marginLeft: "20px" }}
        >
          <Link href={item1.href} target={"_blank"}>
            <Button startIcon={item1.icon} variant={"text"} color={"secondary"}>
              {item1.name}
            </Button>
          </Link>
          {item2 && (
            <Link href={item2.href} target={"_blank"}>
              <Button
                startIcon={item2.icon}
                variant={"text"}
                color={"secondary"}
              >
                {item2.name}
              </Button>
            </Link>
          )}
        </Stack>
      </Grid>
      {overflowMenu}
    </Grid>
  );
}

export const getWorkflowMenuItem = (
  workflow: { namespace: string; name: string },
  instanceId?: string,
): ContextMenuItem => {
  let url = `/workflow/${workflow.namespace}/${workflow.name}`;
  if (instanceId) {
    url += `?instance=${instanceId}`;
  }
  return { name: "View Workflow", href: url, icon: <RouteOutlinedIcon /> };
};
