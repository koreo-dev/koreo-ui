import { NextRequest } from "next/server";
import { listResourceTemplates } from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(
  _: NextRequest,
  { params }: { params: { namespace: string } },
) {
  return Response.json(await listResourceTemplates(params.namespace));
}
