import React, { useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import { Divider, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  KubernetesObjectWithSpecAndStatus,
  WorkflowParent,
  Workflow,
} from "@koreo/koreo-ts";
import theme from "@/app/theme";
import { useState } from "react";
import { timeAgoReadyCondition } from "@/lib/k8s/utils";
import YamlAccordion from "@/components/sidebar/YamlAccordion";
import ManagedResourcesAccordion from "@/components/sidebar/ManagedResourcesAccordion";
import ConditionsAccordion from "@/components/sidebar/ConditionsAccordion";
import ContextMenu, {
  ContextMenuItem,
  getWorkflowMenuItem,
} from "@/components/sidebar/ContextMenu";

export type SidebarContent = {
  menuItems: ContextMenuItem[];
  content: React.ReactNode;
};

type Props = {
  krm?: KubernetesObjectWithSpecAndStatus;
  workflow?: { namespace: string; name: string };
  name: string | null;
  open: boolean;
  onClose: () => void;
  workloadId?: string;
  environmentId?: string;
};

export default function NodeSidebar(props: Props) {
  // Drawer Resizing variables and handlers
  const [isResizing, setIsResizing] = useState(false);
  const [newWidth, setNewWidth] = useState("500px");
  const [expanded, setExpanded] = React.useState<string | false>("conditions");
  const [workflowMenuItem, setWorkflowMenuItem] =
    useState<ContextMenuItem | null>();
  const menuItems: ContextMenuItem[] = [];

  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleMouseDown = (_: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    document.body.classList.add("no-select");
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.classList.remove("no-select");
  };

  // Sidebar resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let offsetRight =
        document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
      let mindWidth = 500; //pixels
      let maxWidth = 1000; //pixels

      if (offsetRight > mindWidth && offsetRight < maxWidth) {
        setNewWidth(`${offsetRight}px`);
      }
    };

    document.addEventListener("mousemove", handleMouseMove as EventListener);
    document.addEventListener("mouseup", handleMouseUp as EventListener);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // If the node is a workflow CRD, fetch a link to the corresponding workflow
  useEffect(() => {
    const fetchWorkflow = async (workflowCRD: WorkflowParent) => {
      if (!workflowCRD.apiVersion) {
        return;
      }
      const [apiGroup, apiVersion] = workflowCRD.apiVersion.split("/");
      const response = await fetch(
        `/api/koreo/${workflowCRD.metadata.namespace}/workflows?crdRefApiGroup=${apiGroup}&crdRefApiVersion=${apiVersion}&crdRefKind=${workflowCRD.kind}`,
      );

      if (!response.ok) {
        console.error(`Error fetching workflows: ${response.statusText}`);
        return;
      }

      const workflows = (await response.json()) as {
        workflow: Workflow;
        instances: number;
      }[];
      if (workflows) {
        setWorkflowMenuItem(
          getWorkflowMenuItem(
            {
              namespace: workflows[0].workflow.metadata?.namespace!,
              name: workflows[0].workflow.metadata?.name!,
            },
            workflowCRD.metadata.name,
          ),
        );
      }
    };

    if (
      props.krm?.metadata?.annotations &&
      "koreo.realkinetic.com/managed-resources" in
        props.krm?.metadata?.annotations
    ) {
      fetchWorkflow(props.krm as WorkflowParent);
    } else {
      setWorkflowMenuItem(undefined);
    }
  }, [props.krm]);

  const lastTransitionTime = props.krm?.status ? (
    <Box
      bottom={0}
      paddingRight={theme.spacing(2)}
      paddingTop={theme.spacing(2)}
      paddingBottom={theme.spacing(2)}
      textAlign={"right"}
      position={"relative"}
      justifyContent={"flex-right"}
    >
      <Typography fontSize={12} fontWeight={"bold"} color={"#404F71"}>
        {timeAgoReadyCondition(props.krm?.status)}
      </Typography>
    </Box>
  ) : (
    <></>
  );

  if (props.workflow) {
    menuItems.push(
      getWorkflowMenuItem(props.workflow!, props.krm?.metadata?.name),
    );
  }

  if (workflowMenuItem) {
    menuItems.push(workflowMenuItem);
  }

  return (
    <Drawer
      open={props.open}
      anchor={"right"}
      PaperProps={{
        sx: { width: newWidth, backgroundColor: "#FFFFFF" },
      }}
      ModalProps={{ onClose: props.onClose }}
    >
      <Box sx={{ flexGrow: 1 }} role="presentation">
        <Grid container spacing={1}>
          <Grid item md={10} sm={10}>
            <Grid item>
              <Typography
                sx={{
                  paddingTop: theme.spacing(2),
                  paddingLeft: theme.spacing(3),
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "#2A3B62",
                }}
              >
                {props.name}
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                sx={{
                  paddingLeft: theme.spacing(3),
                  paddingBottom: theme.spacing(2),
                  fontSize: "16px",
                  color: "#2A3B62",
                }}
              >
                {props.krm?.kind}
              </Typography>
            </Grid>
          </Grid>
          <Grid item md={2} sm={2}>
            <Box
              display={"flex"}
              alignItems={"left"}
              justifyContent={"flex-end"}
              paddingTop={theme.spacing(3)}
              paddingRight={theme.spacing(2)}
            >
              <IconButton onClick={props.onClose} size="medium">
                <CloseIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        <Divider />
        <>
          <ContextMenu items={menuItems} />
          {props.krm && (
            <>
              <ConditionsAccordion
                resource={props.krm}
                expanded={expanded}
                onChange={handleChange}
              />
            </>
          )}
          {props.krm && (
            <>
              <ManagedResourcesAccordion
                resource={props.krm}
                expanded={expanded}
                onChange={handleChange}
              />
              <YamlAccordion
                resource={props.krm}
                expanded={expanded}
                onChange={handleChange}
              />
            </>
          )}
        </>
        {lastTransitionTime}
      </Box>
      <div
        id="dragger"
        onMouseDown={handleMouseDown}
        style={{
          width: "5px",
          cursor: "ew-resize",
          padding: "4px 0 0",
          borderTop: "1px solid #ddd",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: "#f4f7f9",
        }}
      />
    </Drawer>
  );
}
