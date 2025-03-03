import { NextRequest } from "next/server";
import { listAllNamespaces } from "@/lib/k8s/namespaces";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(_: NextRequest) {
  return Response.json(await listAllNamespaces());
}
