import dagre from "dagre";
import { Node, Edge, Position, getOutgoers } from "@xyflow/react";

const nodeWidth = 175;
const nodeHeight = 36;

type Props = {
  nodes: Node[];
  edges: Edge[];
  onHealthClick?: CallableFunction;
  isCollapsible?: (nodeId: string) => boolean;
  onToggleCollapse?: (nodeId: string) => void;
};

export const getLayoutedElements = (props: Props) => {
  const { nodes, edges } = props;
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "LR",
    ranksep: 60,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;

    if (props.onHealthClick) {
      node.data.onHealthClick = props.onHealthClick;
    }
    if (props.onToggleCollapse && getOutgoers(node, nodes, edges).length > 0) {
      node.data.onToggleCollapse = props.onToggleCollapse;
    }

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: positionedNodes, edges };
};
