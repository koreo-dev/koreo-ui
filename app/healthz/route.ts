import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
export const GET = async () => {
  return NextResponse.json({ health: "ok" });
};
