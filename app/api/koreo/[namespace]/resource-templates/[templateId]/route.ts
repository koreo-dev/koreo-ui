import { NextRequest, NextResponse } from "next/server";
import { getResourceTemplate } from "@koreo/koreo-ts";

export const dynamic = "force-dynamic"; // defaults to auto
export async function GET(
  _: NextRequest,
  { params }: { params: { namespace: string; templateId: string } },
) {
  const template = await getResourceTemplate(
    params.templateId,
    params.namespace,
  );
  if (!template) {
    return NextResponse.json(
      { code: "404", message: "Resource Template not found" },
      { status: 404 },
    );
  }

  return Response.json(template);
}
