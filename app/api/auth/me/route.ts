import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWordPressUserFromToken } from "@/utils/wordpress-auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("wp_jwt")?.value || "";

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await getWordPressUserFromToken(token);
  if (!user || !user.id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
