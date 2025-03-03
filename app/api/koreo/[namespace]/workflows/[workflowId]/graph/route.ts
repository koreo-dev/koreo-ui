import { NextRequest } from "next/server";
import {
  getKoreoWorkflowGraph,
  getKoreoWorkflowInstanceGraph,
} from "@/lib/graphs";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(
  request: NextRequest,
  { params }: { params: { namespace: string; workflowId: string } },
) {
  const url = new URL(request.url);
  const instanceId = url.searchParams.get("instance");
  const expandedParam = url.searchParams.get("expanded");
  const expanded =
    expandedParam !== null ? expandedParam.toLowerCase() === "true" : undefined;

  if (instanceId) {
    return Response.json(
      await getKoreoWorkflowInstanceGraph(
        params.namespace,
        params.workflowId,
        instanceId,
        expanded,
      ),
    );
  }

  return Response.json(
    await getKoreoWorkflowGraph(params.namespace, params.workflowId, expanded),
  );
}
