import { NextRequest, NextResponse } from "next/server";
import { resetWordPressPassword } from "@/utils/wordpress-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    login?: unknown;
    key?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
  };

  const login = typeof body.login === "string" ? body.login : "";
  const key = typeof body.key === "string" ? body.key : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!password || password.length < 8) {
    return NextResponse.json(
      { ok: false, message: "Use at least 8 characters for the new password." },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { ok: false, message: "Passwords do not match." },
      { status: 400 }
    );
  }

  const result = await resetWordPressPassword({
    login,
    key,
    password,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400,
  });
}
