import { NextRequest, NextResponse } from "next/server";
import { requestWordPressPasswordReset } from "@/utils/wordpress-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    username?: unknown;
  };
  const username = typeof body.username === "string" ? body.username : "";
  const result = await requestWordPressPasswordReset(username);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
