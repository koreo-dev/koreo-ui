"use client";
import { MutableRefObject } from "react";
import {
  ReactFlow,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  ReactFlowInstance,
} from "@xyflow/react";

import { DefaultEdgeArrowOptions, NodeTypes } from "@/lib/diagrams";
import { getLayoutedElements } from "@/lib/dagre";
import "@xyflow/react/dist/style.css";
import "@xyflow/react/dist/base.css";

const skeletonData: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: "1",
      position: {
        x: 0,
        y: 0,
      },
      type: "custom",
      data: {
        status: "skeleton",
      },
    },
    {
      id: "2",
      position: {
        x: 0,
        y: 0,
      },
      type: "custom",
      data: {
        status: "skeleton",
      },
    },
    {
      id: "3",
      position: {
        x: 0,
        y: 0,
      },
      type: "custom",
      data: {
        status: "skeleton",
      },
    },
    {
      id: "4",
      position: {
        x: 0,
        y: 0,
      },
      type: "custom",
      data: {
        status: "skeleton",
      },
    },
  ],
  edges: [
    {
      id: "12",
      source: "1",
      target: "2",
      type: "default",
      selectable: false,
    },
    {
      id: "23",
      source: "2",
      target: "3",
      type: "default",
      selectable: false,
    },
    {
      id: "24",
      source: "2",
      target: "4",
      type: "default",
      selectable: false,
    },
  ],
};

type SkeletonFlowProps = {
  reactFlowInstanceRef: MutableRefObject<ReactFlowInstance | null>;
};

const SkeletonFlow: React.FC<React.PropsWithChildren<SkeletonFlowProps>> = ({
  reactFlowInstanceRef,
}) => {
  const { nodes: skeletonNodes, edges: skeletonEdges } =
    getLayoutedElements(skeletonData);
  const [nodes, setNodes, onNodesChange] = useNodesState([...skeletonNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([...skeletonEdges]);

  return (
    <ReactFlow
      onInit={(instance) => {
        reactFlowInstanceRef.current = instance;
        instance.fitView();
      }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodesDraggable={false}
      nodesConnectable={false}
      nodeTypes={NodeTypes}
      nodesFocusable={false}
      defaultEdgeOptions={DefaultEdgeArrowOptions}
      fitView
    />
  );
};

export default SkeletonFlow;
