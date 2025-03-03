import { NextRequest } from "next/server";
import {
  listWorkflows,
  getWorkflowInstances,
  getWorkflowsForCrdRef,
  Workflow,
} from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(
  request: NextRequest,
  { params }: { params: { namespace: string } },
) {
  let workflows: Workflow[];

  const { searchParams } = new URL(request.url);
  const apiGroup = searchParams.get("crdRefApiGroup");
  const kind = searchParams.get("crdRefKind");
  const version = searchParams.get("crdRefApiVersion");
  if (apiGroup && kind && version) {
    workflows = await getWorkflowsForCrdRef(params.namespace, {
      apiGroup,
      kind,
      version,
    });
  } else {
    workflows = await listWorkflows(params.namespace);
  }

  const workflowsWithInstances = await Promise.all(
    workflows.map(async (workflow) => {
      const instances = await getWorkflowInstances(workflow);
      return {
        workflow,
        instances: instances.length,
      };
    }),
  );

  return Response.json(workflowsWithInstances);
}
