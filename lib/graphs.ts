import { createEdge, createNode, Graph } from "@/lib/diagrams";
import { parseCrdForStatus } from "@/lib/k8s/utils";
import {
  getWorkflowGraph,
  Graph as KoreoGraph,
  KubernetesObjectWithSpecAndStatus,
  WorkflowNode,
  ManagedKubernetesResource,
} from "@koreo/koreo-ts";
import { NodeStatus } from "@/lib/diagrams";
import { v4 as uuidv4 } from "uuid";
import { Node, Edge } from "@xyflow/react";

export const getKoreoWorkflowGraph = async (
  namespace: string,
  workflowId: string,
  expanded?: boolean
): Promise<Graph> => {
  return koreoGraphToUIGraph(
    await getWorkflowGraph(namespace, workflowId),
    false,
    expanded
  );
};

export const getKoreoWorkflowInstanceGraph = async (
  namespace: string,
  workflowId: string,
  instanceId: string,
  expanded?: boolean
): Promise<Graph> => {
  return koreoGraphToUIGraph(
    await getWorkflowGraph(namespace, workflowId, instanceId),
    true,
    expanded
  );
};

const koreoGraphToUIGraph = (
  koreoGraph: KoreoGraph,
  includeResources: boolean,
  expanded?: boolean
): Graph => {
  const dedupedGraph = expanded
    ? convertGraphExpanded(koreoGraph, includeResources)
    : convertGraph(koreoGraph, includeResources);
  return {
    nodes: Object.values(dedupedGraph.nodes),
    edges: Object.values(dedupedGraph.edges),
  };
};

const convertGraph = (
  koreoGraph: KoreoGraph,
  includeResources: boolean
): { nodes: Record<string, Node>; edges: Record<string, Edge> } => {
  const graph: { nodes: Record<string, Node>; edges: Record<string, Edge> } = {
    nodes: {},
    edges: {},
  };
  koreoGraph.nodes.forEach((knode) => {
    if (knode.type === "SubWorkflow") {
      if (!knode.workflowGraph.nodes) {
        return;
      }
      const workflowNode = knode.workflowGraph.nodes[0] as WorkflowNode;
      const node = createNode(
        knode.id,
        workflowNode.metadata?.label
          ? (workflowNode.metadata.label as string)
          : workflowNode.krm.metadata?.name!,
        parseCrdForStatus([workflowNode.krm]),
        workflowNode.krm,
        {
          overrideDisplayText: "Sub-Workflow",
        }
      );
      graph.nodes[node.id] = node;
      if (includeResources) {
        addResourceNodes(graph, node.id, knode.workflowGraph.managedResources);
      }
    } else if (knode.type === "RefSwitch") {
      const caseKRMs: KubernetesObjectWithSpecAndStatus[] = [];
      Object.values(knode.caseNodes).forEach((node) => {
        if (node.type === "SubWorkflow") {
          if (!node.workflowGraph.nodes) {
            return;
          }
          const subWorkflowNode = node.workflowGraph.nodes[0] as WorkflowNode;
          caseKRMs.push(subWorkflowNode.krm);
        } else {
          caseKRMs.push(node.krm);
        }
      });
      const node = createNode(
        knode.id,
        knode.metadata?.label ? (knode.metadata.label as string) : "RefSwitch",
        parseCrdForStatus(caseKRMs),
        undefined,
        { overrideDisplayText: "RefSwitch" }
      );
      graph.nodes[node.id] = node;
      if (includeResources) {
        addResourceNodes(graph, node.id, knode.managedResources);
      }
    } else if (knode.type === "ResourceFunction") {
      const node = createNode(
        knode.id,
        knode.metadata?.label
          ? (knode.metadata.label as string)
          : knode.krm.metadata?.name!,
        parseCrdForStatus([knode.krm]),
        knode.krm
      );
      graph.nodes[node.id] = node;
      if (includeResources) {
        addResourceNodes(graph, node.id, knode.managedResources);
      }
    } else {
      const node = createNode(
        knode.id,
        knode.metadata?.label
          ? (knode.metadata.label as string)
          : knode.krm.metadata?.name!,
        parseCrdForStatus([knode.krm]),
        knode.krm
      );
      graph.nodes[node.id] = node;
    }
  });
  koreoGraph.edges.forEach((kedge) => {
    const edge = createEdge(
      kedge.source,
      kedge.target,
      kedge.type === "ParentToWorkflow"
    );
    graph.edges[edge.id] = edge;
  });

  return graph;
};

const convertGraphExpanded = (
  koreoGraph: KoreoGraph,
  includeResources: boolean
): { nodes: Record<string, Node>; edges: Record<string, Edge> } => {
  const graph: { nodes: Record<string, Node>; edges: Record<string, Edge> } = {
    nodes: {},
    edges: {},
  };
  const workflowLeafNodes: Record<string, string[]> = {};
  koreoGraph.nodes.forEach((knode) => {
    if (knode.type === "SubWorkflow") {
      if (!knode.workflowGraph.nodes) {
        return;
      }
      const workflowNode = knode.workflowGraph.nodes[0] as WorkflowNode;
      const prevWorkflowNodeId = workflowNode.id;
      workflowNode.id = knode.id;
      workflowLeafNodes[knode.id] = knode.workflowLeafNodeIds;
      const subGraph = convertGraphExpanded(knode.workflowGraph, true);
      Object.values(subGraph.edges).forEach((edge) => {
        if (edge.source === prevWorkflowNodeId) {
          edge.source = workflowNode.id;
        }
      });
      Object.values(subGraph.nodes).forEach(
        (node) => (graph.nodes[node.id] = node)
      );
      Object.values(subGraph.edges).forEach(
        (edge) => (graph.edges[edge.id] = edge)
      );
    } else if (knode.type === "RefSwitch") {
      const switchInName = knode.metadata?.label
        ? `${knode.metadata.label}`
        : "RefSwitch";
      const switchInNodeId = `switchIn-${knode.id}`;
      const switchInNode = createNode(
        switchInNodeId,
        switchInName,
        NodeStatus.none,
        undefined,
        {
          overrideDisplayText: "RefSwitch",
        }
      );
      graph.nodes[switchInNode.id] = switchInNode;
      const functionCaseNodes: string[] = [];
      const workflowCaseNodes: { workflowNode: string; leafNodes: string[] }[] =
        [];
      Object.entries(knode.caseNodes).forEach(([caseStr, caseNode]) => {
        if (caseNode.type === "SubWorkflow") {
          if (!caseNode.workflowGraph.nodes) {
            return;
          }
          if (!caseNode.workflowGraph.nodes[0].metadata) {
            caseNode.workflowGraph.nodes[0].metadata = {};
          }
          caseNode.workflowGraph.nodes[0].metadata.label = `case: ${caseStr}`;
          const subGraph = convertGraphExpanded(caseNode.workflowGraph, false);
          Object.values(subGraph.nodes).forEach(
            (node) => (graph.nodes[node.id] = node)
          );
          Object.values(subGraph.edges).forEach(
            (edge) => (graph.edges[edge.id] = edge)
          );
          workflowCaseNodes.push({
            workflowNode: caseNode.workflowGraph.nodes[0].id,
            leafNodes: caseNode.workflowLeafNodeIds,
          });
        } else {
          const node = createNode(
            caseNode.id,
            `case: ${caseStr}`,
            parseCrdForStatus([caseNode.krm]),
            caseNode.krm
          );
          graph.nodes[node.id] = node;
          functionCaseNodes.push(node.id);
        }
      });

      const switchOutName = knode.metadata?.label
        ? `${knode.metadata.label}`
        : "RefSwitch Result";
      const switchOutNodeId = `switchOut-${knode.id}`;
      const switchOutNode = createNode(
        switchOutNodeId,
        switchOutName,
        NodeStatus.none,
        undefined,
        {
          overrideDisplayText: "RefSwitch Result",
        }
      );
      graph.nodes[switchOutNode.id] = switchOutNode;
      if (includeResources) {
        addResourceNodes(graph, switchOutNode.id, knode.managedResources);
      }

      // Change edges sourced from knode.id to switchOutNodeId and edges
      // targeting knode.id to switchInNodeId.
      koreoGraph.edges.forEach((edge) => {
        if (edge.source === knode.id) {
          edge.source = switchOutNodeId;
        }
        if (edge.target === knode.id) {
          edge.target = switchInNodeId;
        }
      });

      functionCaseNodes.forEach((functionCaseNodeId) => {
        const switchInEdge = createEdge(switchInNode.id, functionCaseNodeId);
        graph.edges[switchInEdge.id] = switchInEdge;
        const switchOutEdge = createEdge(functionCaseNodeId, switchOutNode.id);
        graph.edges[switchOutEdge.id] = switchOutEdge;
      });
      workflowCaseNodes.forEach(({ workflowNode, leafNodes }) => {
        const switchInEdge = createEdge(switchInNode.id, workflowNode);
        graph.edges[switchInEdge.id] = switchInEdge;
        leafNodes.forEach((leafNode) => {
          const switchOutEdge = createEdge(leafNode, switchOutNode.id);
          graph.edges[switchOutEdge.id] = switchOutEdge;
        });
      });
    } else if (knode.type === "ResourceFunction") {
      const node = createNode(
        knode.id,
        knode.metadata?.label
          ? (knode.metadata.label as string)
          : knode.krm.metadata?.name!,
        parseCrdForStatus([knode.krm]),
        knode.krm
      );
      graph.nodes[node.id] = node;
      if (includeResources) {
        addResourceNodes(graph, node.id, knode.managedResources);
      }
    } else {
      const node = createNode(
        knode.id,
        knode.metadata?.label
          ? (knode.metadata.label as string)
          : knode.krm.metadata?.name!,
        parseCrdForStatus([knode.krm]),
        knode.krm
      );
      graph.nodes[node.id] = node;
    }
  });

  koreoGraph.edges.forEach((kedge) => {
    if (kedge.source in workflowLeafNodes) {
      const leafNodes = workflowLeafNodes[kedge.source];
      leafNodes.forEach((leafNodeId) => {
        const edge = createEdge(leafNodeId, kedge.target);
        graph.edges[edge.id] = edge;
      });
    } else {
      const edge = createEdge(
        kedge.source,
        kedge.target,
        kedge.type === "ParentToWorkflow"
      );
      graph.edges[edge.id] = edge;
    }
  });

  return graph;
};

const addResourceNodes = (
  graph: { nodes: Record<string, Node>; edges: Record<string, Edge> },
  parentNodeId: string,
  managedResources: ManagedKubernetesResource[] | undefined
) => {
  (managedResources || []).forEach((managedResource) => {
    const resource = managedResource.resource;
    const resourceNode = createNode(
      resource.metadata!.uid || uuidv4(),
      resource.metadata!.name!,
      parseCrdForStatus([resource]),
      resource,
      {
        noBackground: managedResource.readonly,
      }
    );
    graph.nodes[resourceNode.id] = resourceNode;
    const edge = createEdge(parentNodeId, resourceNode.id, true);
    graph.edges[edge.id] = edge;
  });
};
