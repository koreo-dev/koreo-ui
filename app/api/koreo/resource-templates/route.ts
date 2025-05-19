import { NextRequest } from "next/server";
import { listResourceTemplates } from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const namespaces = searchParams.getAll("namespace");
  return Response.json(await listResourceTemplates(namespaces));
}
