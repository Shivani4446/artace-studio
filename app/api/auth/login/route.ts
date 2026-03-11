import { NextRequest, NextResponse } from "next/server";
import {
  applyAuthCookie,
  authenticateWordPressCredentials,
} from "@/utils/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    username?: unknown;
    password?: unknown;
  };

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";
  const session = await authenticateWordPressCredentials(username, password);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "No account matched those credentials. Create an account first if you are new.",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    session,
  });

  return applyAuthCookie(response, session.accessToken);
}
