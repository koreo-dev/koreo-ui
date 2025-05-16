import { createEdge, createNode, Graph } from "@/lib/diagrams";
import { parseCrdForStatus } from "@/lib/k8s/utils";
import {
  getInflatedWorkflowGraph,
  getInflatedWorkflowInstanceGraph,
} from "@koreo/koreo-ts";
import { NodeStatus } from "@/lib/diagrams";

export const getKoreoWorkflowGraph = async (
  namespace: string,
  workflowId: string,
  expanded?: boolean,
): Promise<Graph> => {
  const inflatedGraph = await getInflatedWorkflowGraph(
    namespace,
    workflowId,
    expanded,
  );
  return {
    nodes: inflatedGraph.nodes
      .map((node) => {
        let status = NodeStatus.none;
        if (!node.type.isKoreoType) {
          status = node.krm ? parseCrdForStatus(node.krm) : NodeStatus.interim;
        }
        return createNode(node.id, node.label, status, node.krm, {
          overrideDisplayText: node.type.name,
          noBackground: node.metadata
            ? (node.metadata.managedResource as boolean) &&
              (node.metadata.readonly as boolean)
            : false,
        });
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
    edges: inflatedGraph.edges
      .map((edge) => {
        return createEdge(edge.source, edge.target);
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
};

export const getKoreoWorkflowInstanceGraph = async (
  namespace: string,
  workflowId: string,
  instanceId: string,
  expanded?: boolean,
): Promise<Graph> => {
  const inflatedGraph = await getInflatedWorkflowInstanceGraph(
    namespace,
    workflowId,
    instanceId,
    expanded,
  );
  return {
    nodes: inflatedGraph.nodes
      .map((node) => {
        let status = NodeStatus.none;
        if (!node.type.isKoreoType) {
          status = node.krm ? parseCrdForStatus(node.krm) : NodeStatus.interim;
        }
        return createNode(node.id, node.label, status, node.krm, {
          overrideDisplayText: node.type.name,
          noBackground: node.metadata
            ? (node.metadata.managedResource as boolean) &&
              (node.metadata.readonly as boolean)
            : false,
        });
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
    edges: inflatedGraph.edges
      .map((edge) => {
        return createEdge(
          edge.source,
          edge.target,
          edge.type === "StepToResource" || edge.type === "ParentToWorkflow",
        );
      })
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
};
