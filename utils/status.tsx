"use client";

import { ReactNode } from "react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LoopRoundedIcon from "@mui/icons-material/LoopRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import InfoIcon from "@mui/icons-material/Info";
import { ReactElement } from "react";
import { SvgIconProps } from "@mui/material";
import { WorkflowParent, WorkflowResource } from "@koreo/koreo-ts";
import { parseCrdForStatus, timeAgo } from "@/lib/k8s/utils";
import Tooltip from "@mui/material/Tooltip";
import { NodeStatus } from "@/lib/diagrams";
import IconButton from "@mui/material/IconButton";

export const getStatusIconAndColor = (
  status: string | undefined,
): { icon: ReactElement<SvgIconProps>; color: string } => {
  let color = "#555555";
  let icon = <InfoIcon sx={{ fontSize: "inherit" }} />;

  if (status == "healthy") {
    color = "#5A4D8A";
    icon = (
      <CheckCircleOutlineRoundedIcon
        color={"success"}
        sx={{ fontSize: "inherit" }}
      />
    );
  } else if (status == "interim") {
    color = "#7A7885";
    icon = (
      <HourglassEmptyRoundedIcon
        color={"action"}
        sx={{ fontSize: "inherit" }}
      />
    );
  } else if (status == "inProgress") {
    color = "#397564";
    icon = <LoopRoundedIcon color={"success"} sx={{ fontSize: "inherit" }} />;
  } else if (status == "error") {
    color = "#987444";
    icon = (
      <WarningAmberRoundedIcon color={"warning"} sx={{ fontSize: "inherit" }} />
    );
  }

  return { icon, color };
};

export const getResourceStatus = (
  resource: WorkflowParent,
  fontSize?: number | string,
): JSX.Element => {
  const status = parseCrdForStatus([resource]);
  let message = "";
  (resource?.status?.conditions || []).forEach((condition) => {
    if (condition.type === "Ready") {
      message = condition.message
        ? `${condition.message} (${timeAgo(condition, true, true)})`
        : timeAgo(condition, true, true);
    }
  });

  const renderIconWithTooltip = (icon: JSX.Element): JSX.Element => (
    <Tooltip title={message}>{icon}</Tooltip>
  );

  switch (status) {
    case NodeStatus.healthy:
      return renderIconWithTooltip(
        <CheckCircleOutlineRoundedIcon
          sx={{ fontSize: fontSize }}
          color={"success"}
        />,
      );
    case NodeStatus.inProgress:
      return renderIconWithTooltip(
        <LoopRoundedIcon sx={{ fontSize: fontSize }} color={"action"} />,
      );
    case NodeStatus.error:
      return renderIconWithTooltip(
        <WarningAmberRoundedIcon sx={{ fontSize: fontSize }} color={"error"} />,
      );
    default:
      return renderIconWithTooltip(
        <HourglassEmptyRoundedIcon
          sx={{ fontSize: fontSize }}
          color={"warning"}
        />,
      );
  }
};

export const getResourceStatusIcon = (
  object: WorkflowResource<WorkflowParent>,
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedObject: React.Dispatch<
    React.SetStateAction<WorkflowResource<WorkflowParent> | null>
  >,
): ReactNode => {
  const handleStatusIconClick = (object: WorkflowResource<WorkflowParent>) => {
    setSelectedObject(object);
    setOpenSidebar(true);
  };
  return (
    <IconButton
      onClick={() => handleStatusIconClick(object)}
      style={{
        display: "flex",
        cursor: "pointer",
        fontSize: "inherit",
      }}
    >
      {getResourceStatus(object.resource, "inherit")}
    </IconButton>
  );
};
