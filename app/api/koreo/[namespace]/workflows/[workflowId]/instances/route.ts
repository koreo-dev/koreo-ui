import { NextRequest, NextResponse } from "next/server";
import {
  getWorkflow,
  getWorkflowInstances,
  parseManagedResources,
  countManagedResources,
} from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(
  _: NextRequest,
  { params }: { params: { namespace: string; workflowId: string } }
) {
  const workflow = await getWorkflow(params.workflowId, params.namespace);
  if (!workflow) {
    return NextResponse.json(
      { code: "404", message: "Workflow not found" },
      { status: 404 }
    );
  }

  const instances = await getWorkflowInstances(workflow);
  const instancesWithManagedResources = await Promise.all(
    instances.map(async (instance) => {
      const managedResources = parseManagedResources(instance);
      return {
        instance,
        managedResources: countManagedResources(managedResources),
      };
    })
  );

  return Response.json(instancesWithManagedResources);
}
