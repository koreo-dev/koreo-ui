import { NextRequest } from "next/server";
import { listFunctions } from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const namespaces = searchParams.getAll("namespace");
  let functions = await listFunctions(namespaces);
  if (kind) {
    functions = functions.filter((func) => func.kind === kind);
  }

  return Response.json(functions);
}
