import { NextRequest, NextResponse } from "next/server";
import { getFunction } from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(
  request: NextRequest,
  { params }: { params: { namespace: string; functionId: string } },
) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") || "ResourceFunction";
  const func = await getFunction(params.functionId, kind, params.namespace);
  if (!func) {
    return NextResponse.json(
      { code: "404", message: "Function not found" },
      { status: 404 },
    );
  }

  return Response.json(func);
}
