import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  return NextResponse.json({ session });
}
