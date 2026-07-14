import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/utils/auth";

export const runtime = "edge";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearAuthCookie(response);
}
