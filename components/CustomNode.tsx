"use client";
import { memo } from "react";
import { Position, Handle } from "@xyflow/react";
import type { Node, NodeProps } from "@xyflow/react";
import { Box, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { KubernetesObjectWithSpecAndStatus, Workflow } from "@koreo/koreo-ts";
import { getStatusIconAndColor } from "@/utils/status";

const StatuslessNode = styled.div.withConfig({
  shouldForwardProp: (prop) => !["hasOnClick", "noBackground"].includes(prop),
})<{ hasOnClick: boolean; noBackground?: boolean }>`
  padding: 10px;
  border-radius: 5px;
  width: 175px;
  background-color: ${({ noBackground }) =>
    noBackground ? "#ffffff" : "#f4f4f4"};
  color: #666666;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #cccccc;
  cursor: ${({ hasOnClick }) => (hasOnClick ? "pointer" : "auto")};

  &:hover:not(:has(.collapse-handle:hover)):not(:has(.node-status:hover)) {
    background-color: ${({ hasOnClick, noBackground }) => {
      if (!hasOnClick) {
        return;
      }
      if (noBackground) {
        return "#fafafa";
      }
      return "#e0e0e0";
    }}
`;

const HealthyNode = styled.div.withConfig({
  shouldForwardProp: (prop) => !["hasOnClick", "noBackground"].includes(prop),
})<{ hasOnClick: boolean; noBackground?: boolean }>`
  padding: 10px;
  border-radius: 5px;
  width: 175px;
  background-color: ${({ noBackground }) =>
    noBackground ? "#ffffff" : "#f5f3fb"};
  color: #4b426c;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #17065a;
  cursor: ${({ hasOnClick }) => (hasOnClick ? "pointer" : "auto")};

  &:hover:not(:has(.collapse-handle:hover)):not(:has(.node-status:hover)) {
    background-color: ${({ hasOnClick, noBackground }) => {
      if (!hasOnClick) {
        return;
      }
      if (noBackground) {
        return "#fafafa";
      }
      return "#e9e6f7";
    }}
`;

const InterimNode = styled.div.withConfig({
  shouldForwardProp: (prop) => !["hasOnClick", "noBackground"].includes(prop),
})<{ hasOnClick: boolean; noBackground?: boolean }>`
  padding: 10px;
  border-radius: 5px;
  width: 175px;
  background-color: ${({ noBackground }) =>
    noBackground ? "#ffffff" : "white"};
  color: #595667;
  text-align: center;
  border-style: dashed;
  border-width: 1px;
  border-color: #9592a3;
  cursor: ${({ hasOnClick }) => (hasOnClick ? "pointer" : "auto")};

  &:hover:not(:has(.collapse-handle:hover)):not(:has(.node-status:hover)) {
    background-color: ${({ hasOnClick, noBackground }) => {
      if (!hasOnClick) {
        return;
      }
      if (noBackground) {
        return "#fafafa";
      }
      return "#f9f9f9";
    }}
`;

const InProgressNode = styled.div.withConfig({
  shouldForwardProp: (prop) => !["hasOnClick", "noBackground"].includes(prop),
})<{ hasOnClick: boolean; noBackground?: boolean }>`
  padding: 10px;
  border-radius: 5px;
  width: 175px;
  background-color: ${({ noBackground }) =>
    noBackground ? "#ffffff" : "#ebf7f4"};
  color: #0c553f;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #1a936f;
  cursor: ${({ hasOnClick }) => (hasOnClick ? "pointer" : "auto")};

  &:hover:not(:has(.collapse-handle:hover)):not(:has(.node-status:hover)) {
    background-color: ${({ hasOnClick, noBackground }) => {
      if (!hasOnClick) {
        return;
      }
      if (noBackground) {
        return "#fafafa";
      }
      return "#d9f0eb";
    }}
`;

const ErrorNode = styled.div.withConfig({
  shouldForwardProp: (prop) => !["hasOnClick", "noBackground"].includes(prop),
})<{ hasOnClick: boolean; noBackground?: boolean }>`
  padding: 10px;
  border-radius: 5px;
  width: 175px;
  background-color: ${({ noBackground }) =>
    noBackground ? "#ffffff" : "#fff2e1"};
  color: #6c3e00;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #ff9f1c;
  cursor: ${({ hasOnClick }) => (hasOnClick ? "pointer" : "auto")};

  &:hover:not(:has(.collapse-handle:hover)):not(:has(.node-status:hover)) {
    background-color: ${({ hasOnClick, noBackground }) => {
      if (!hasOnClick) {
        return;
      }
      if (noBackground) {
        return "#fafafa";
      }
      return "#ffe6c8";
    }}
`;

const CollapseHandle = styled(Handle).withConfig({
  shouldForwardProp: (prop) => prop !== "isCollapsed",
})<{ isCollapsed: boolean }>`
  background: ${({ isCollapsed }) => (isCollapsed ? "#6351a9" : "#555")};
  width: 20px;
  height: 20px;
  border: none;
  cursor: pointer !important;

  &:hover {
    background: ${({ isCollapsed }) => (isCollapsed ? "#725ebc" : "#666")};
  }
`;

export type KoreoNode = Node<
  {
    id: string;
    name: string;
    krm?: KubernetesObjectWithSpecAndStatus;
    forwardPath?: string;
    status?: string;
    displayText?: string;
    url?: string;
    workflow?: Workflow;
    externalLink?: string;
    onHealthClick: Function;
    isCollapsed?: boolean;
    onToggleCollapse?: (nodeId: string) => void;
    noBackground?: boolean;
  },
  "konfig"
>;

const CustomNode = ({
  id,
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps<KoreoNode>) => {
  const router = useRouter();

  const { icon, color: subtitleColor } = getStatusIconAndColor(data.status);

  let type = (
    <Typography
      fontSize={8}
      variant="caption"
      component="span"
      display="block"
      color={subtitleColor}
    >
      {data?.displayText}
    </Typography>
  );

  if (data?.externalLink || data?.url)
    type = (
      <Link
        href={data?.externalLink || data?.url || ""}
        target={"_blank"}
        style={{ color: "inherit", width: "fit-content" }}
        onClick={(event) => event.stopPropagation()}
      >
        {type}
      </Link>
    );

  const handleNodeClick = () => {
    if (data.forwardPath) {
      router.push(`${data.forwardPath}`);
    }
  };

  const handleCollapseClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data.onToggleCollapse) {
      data.onToggleCollapse(id);
    }
  };

  const handleStatusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    data.onHealthClick(id);
  };

  const collapseHandle = data.onToggleCollapse ? (
    <CollapseHandle
      type="source"
      position={sourcePosition}
      className="collapse-handle"
      onClick={handleCollapseClick}
      isCollapsed={data.isCollapsed || false}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: "white",
        }}
      >
        <ExpandMoreIcon
          sx={{
            fontSize: 16,
            transform: data.isCollapsed ? "rotate(-90deg)" : "rotate(90deg)",
            transition: "transform 0.3s ease",
          }}
        />
      </div>
    </CollapseHandle>
  ) : (
    <></>
  );

  const children = (
    <>
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        style={{ visibility: "hidden" }}
      />
      <IconButton
        edge="end"
        aria-label="Status"
        className="node-status"
        onClick={handleStatusClick}
        sx={{
          fontSize: 11,
          position: "absolute",
          textAlign: "left",
          marginLeft: "-85px",
          marginTop: "-8px",
        }}
        size="small"
      >
        {icon}
      </IconButton>
      <Box>
        <Stack spacing={0} alignItems="center">
          <Typography fontSize={12}>{data?.name}</Typography>
          <div style={{ width: "fit-content" }}>{type}</div>
        </Stack>
      </Box>
      {collapseHandle}
    </>
  );

  switch (data.status) {
    case "none": {
      return (
        <StatuslessNode
          onClick={handleNodeClick}
          hasOnClick={!!data.forwardPath}
          noBackground={data.noBackground}
        >
          {children}
        </StatuslessNode>
      );
    }
    case "healthy": {
      return (
        <HealthyNode
          onClick={handleNodeClick}
          hasOnClick={!!data.forwardPath}
          noBackground={data.noBackground}
        >
          {children}
        </HealthyNode>
      );
    }
    case "inProgress": {
      return (
        <InProgressNode
          onClick={handleNodeClick}
          hasOnClick={!!data.forwardPath}
          noBackground={data.noBackground}
        >
          {children}
        </InProgressNode>
      );
    }
    case "error": {
      return (
        <ErrorNode
          onClick={handleNodeClick}
          hasOnClick={!!data.forwardPath}
          noBackground={data.noBackground}
        >
          {children}
        </ErrorNode>
      );
    }
    case "interim": {
      return (
        <InterimNode
          onClick={handleNodeClick}
          hasOnClick={!!data.forwardPath}
          noBackground={data.noBackground}
        >
          {children}
        </InterimNode>
      );
    }
    default: {
      return (
        <Box>
          <Handle
            type="target"
            position={targetPosition}
            isConnectable={isConnectable}
            style={{ visibility: "hidden" }}
          />
          <Skeleton
            animation={"wave"}
            variant="rounded"
            width={175}
            height={56}
          />
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
            style={{ visibility: "hidden" }}
          />
          {collapseHandle}
        </Box>
      );
    }
  }
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);
