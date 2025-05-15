import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { DefaultEdgeArrowOptions, NodeTypes } from "@/lib/diagrams";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  NodeProps,
  Node,
  Edge,
  MiniMap,
  getOutgoers,
  ReactFlowInstance,
} from "@xyflow/react";
import { getLayoutedElements } from "@/lib/dagre";
import "@xyflow/react/dist/style.css";
import "@xyflow/react/dist/base.css";
import useSWR from "swr";
import SkeletonFlow from "@/components/SkeletonFlow";
import { KoreoNode } from "@/components/CustomNode";
import { useSidebar } from "@/context/sidebar-context";

const MINI_MAP_NODE_THRESHOLD = 10;

type GraphDiagramProps = {
  graphEndpoint: string;
  stateKey: string;
  onNodeSidebar: (open: boolean) => void;
  onSetSelectedNode: (node: NodeProps<KoreoNode> | null) => void;
  documentTitle: string;
};

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

const GraphDiagram: React.FC<React.PropsWithChildren<GraphDiagramProps>> = ({
  graphEndpoint,
  stateKey,
  onNodeSidebar,
  onSetSelectedNode,
  documentTitle,
  children,
}) => {
  const { isCollapsed } = useSidebar();
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [initialized, setInitialized] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  const { data, isLoading } = useSWR(graphEndpoint, fetcher, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  // Initialize state from localStorage or API data
  useEffect(() => {
    if (!initialized && data?.nodes) {
      const savedNodes = localStorage.getItem(`${stateKey}:collapsedNodes`);
      if (savedNodes) {
        setCollapsedNodes(new Set(JSON.parse(savedNodes)));
      } else {
        const defaultCollapsed: Set<string> = new Set(
          data.nodes
            .filter((node: Node) => node.data.defaultCollapsed)
            .map((node: Node) => node.id),
        );
        setCollapsedNodes(defaultCollapsed);
      }
      setInitialized(true);
    }
  }, [data, initialized, stateKey]);

  // Only save to localStorage after initialization and when collapsedNodes
  // changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(
        `${stateKey}:collapsedNodes`,
        JSON.stringify(Array.from(collapsedNodes)),
      );
    }
  }, [collapsedNodes, initialized, stateKey]);

  const toggleNodeCollapse = useCallback(
    (nodeId: string) => {
      setCollapsedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    },
    [setCollapsedNodes],
  );

  // Decorate nodes with collapsed state.
  const transformNodes = useCallback(
    (serverNodes: Node[]) => {
      return serverNodes.map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
          isCollapsed: collapsedNodes.has(node.id),
        },
      }));
    },
    [collapsedNodes],
  );

  useEffect(() => {
    if (!data) return;

    const transformedNodes = transformNodes(data.nodes);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements({
      nodes: transformedNodes,
      edges: data.edges,
      onHealthClick: (id: string) => {
        onNodeSidebar(true);
        data.nodes.forEach((node: any) => {
          if (node.id === id) {
            onSetSelectedNode(node);
          }
        });
      },
      onToggleCollapse: (id: string) => {
        data.nodes.forEach((node: Node) => {
          if (node.id === id) {
            toggleNodeCollapse(id);
          }
        });
      },
    });

    // @ts-ignore
    setNodes([...layoutedNodes]);
    // @ts-ignore
    setEdges([...layoutedEdges]);
  }, [
    data,
    setNodes,
    setEdges,
    toggleNodeCollapse,
    transformNodes,
    onNodeSidebar,
    onSetSelectedNode,
  ]);

  // Calculate visible nodes and edges based on collapsed state.
  const { uncollapsedNodes, uncollapsedEdges } = useMemo(() => {
    if (!nodes.length || !edges.length) {
      return { uncollapsedNodes: nodes, uncollapsedEdges: edges };
    }

    const hiddenNodes = new Set<string>();
    Array.from(collapsedNodes).forEach((collapsedId) => {
      const children = getOutgoers({ id: collapsedId }, nodes, edges).map(
        (n: Node) => n.id,
      );
      if (!children) return;

      const stack = Array.from(children);
      while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (!hiddenNodes.has(currentId)) {
          hiddenNodes.add(currentId);
          const currentChildren = getOutgoers(
            { id: currentId },
            nodes,
            edges,
          ).map((n: Node) => n.id);
          if (currentChildren) {
            stack.push(...Array.from(currentChildren));
          }
        }
      }
    });

    return {
      uncollapsedNodes: nodes.filter((node: Node) => !hiddenNodes.has(node.id)),
      uncollapsedEdges: edges.filter(
        (edge: Edge) =>
          !hiddenNodes.has(edge.source) && !hiddenNodes.has(edge.target),
      ),
    };
  }, [nodes, edges, collapsedNodes]);

  // If an edge is selected only show nodes/edges in the selected path.
  const { visibleNodes, visibleEdges } = useMemo(() => {
    if (!selectedEdge) {
      return { visibleNodes: uncollapsedNodes, visibleEdges: uncollapsedEdges };
    }

    const upstreamNodeIds = new Set<string>();
    const downstreamNodeIds = new Set<string>();
    const upstreamEdgeIds = new Set<string>();
    const downstreamEdgeIds = new Set<string>();

    const findUpstream = (nodeId: string) => {
      edges.forEach((edge: Edge) => {
        if (edge.target === nodeId) {
          upstreamNodeIds.add(edge.source);
          upstreamEdgeIds.add(edge.id);
          findUpstream(edge.source);
        }
      });
    };

    const findDownstream = (nodeId: string) => {
      edges.forEach((edge: Edge) => {
        if (edge.source === nodeId) {
          downstreamNodeIds.add(edge.target);
          downstreamEdgeIds.add(edge.id);
          findDownstream(edge.target);
        }
      });
    };

    findUpstream(selectedEdge.source);
    findDownstream(selectedEdge.target);

    const pathNodeIds = new Set([
      selectedEdge.source,
      selectedEdge.target,
      ...Array.from(upstreamNodeIds),
      ...Array.from(downstreamNodeIds),
    ]);

    const pathEdgeIds = new Set([
      selectedEdge.id,
      ...Array.from(upstreamEdgeIds),
      ...Array.from(downstreamEdgeIds),
    ]);

    return {
      visibleNodes: uncollapsedNodes.filter((node: Node) =>
        pathNodeIds.has(node.id),
      ),
      visibleEdges: uncollapsedEdges
        .filter((edge: Edge) => pathEdgeIds.has(edge.id))
        .map((edge: Edge) => {
          return {
            ...edge,
            selected: true, // Highlight all path edges
          };
        }),
    };
  }, [uncollapsedNodes, uncollapsedEdges, selectedEdge, edges]);

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge],
  );

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
  }, [setSelectedEdge]);

  // Re-fit the view after sidebar expands/collapses or graphEndpoint changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.fitView();
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [isCollapsed, graphEndpoint]);

  return isLoading ? (
    <SkeletonFlow reactFlowInstanceRef={reactFlowInstanceRef} />
  ) : (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        onInit={(instance) => {
          reactFlowInstanceRef.current = instance;
          instance.fitView();
        }}
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        nodesConnectable={false}
        nodeTypes={NodeTypes}
        nodesFocusable={false}
        defaultEdgeOptions={DefaultEdgeArrowOptions}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
      >
        {children}
        <Controls showInteractive={false} />
        {visibleNodes.length > MINI_MAP_NODE_THRESHOLD && (
          <MiniMap
            position="top-right"
            nodeStrokeWidth={3}
            pannable
            zoomable
            ariaLabel=""
          />
        )}
      </ReactFlow>
    </div>
  );
};

export default GraphDiagram;
