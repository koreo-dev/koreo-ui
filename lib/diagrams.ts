import { Node, Edge, MarkerType, DefaultEdgeOptions } from "@xyflow/react";
import CustomNode from "@/components/CustomNode";
import "@xyflow/react/dist/style.css";
import { KubernetesObjectWithSpecAndStatus, Workflow } from "@koreo/koreo-ts";

export enum NodeStatus {
  healthy = "healthy",
  interim = "interim",
  inProgress = "inProgress",
  error = "error",
  skeleton = "skeleton",
  none = "none",
}

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

export const NodeTypes = {
  custom: CustomNode,
};

export const DefaultEdgeArrowOptions: DefaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.Arrow,
    width: 20,
    height: 20,
  },
};

export type NodeOptions = {
  overrideDisplayText?: string;
  forwardPath?: string;
  externalLink?: string;
  defaultCollapsed?: boolean;
  noBackground?: boolean;
  workflow?: Workflow;
};

export const createNode = (
  id: string,
  name: string,
  status: NodeStatus,
  krm?: KubernetesObjectWithSpecAndStatus,
  options?: NodeOptions
): Node => {
  return {
    id: id,
    position: { x: 0, y: 0 },
    type: "custom",
    data: {
      id: id,
      name: name,
      krm: krm,
      displayText: options?.overrideDisplayText || krm?.kind || "",
      status: status.toString(),
      forwardPath: options?.forwardPath || null,
      externalLink: options?.externalLink || null,
      defaultCollapsed: options?.defaultCollapsed || false,
      noBackground: options?.noBackground || false,
      workflow: options?.workflow,
    },
  };
};

export const createEdge = (
  sourceId: string,
  targetId: string,
  dashed?: boolean
): Edge => {
  return {
    id: `${sourceId}:${targetId}`,
    source: sourceId,
    target: targetId,
    ...(dashed && {
      style: {
        strokeDasharray: "5 5",
      },
    }),
  };
};
