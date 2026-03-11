import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  getWordPressProfile,
  updateWordPressProfile,
} from "@/utils/wordpress-auth";

export const runtime = "edge";

const unauthorizedResponse = () =>
  NextResponse.json({ message: "Unauthorized" }, { status: 401 });

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (typeof token?.accessToken !== "string" || !token.accessToken) {
    return unauthorizedResponse();
  }

  const profile = await getWordPressProfile(token.accessToken);

  if (!profile) {
    return NextResponse.json(
      { message: "Unable to load your account details." },
      { status: 502 }
    );
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (typeof token?.accessToken !== "string" || !token.accessToken) {
    return unauthorizedResponse();
  }

  const body = (await request.json()) as {
    firstName?: unknown;
    lastName?: unknown;
    displayName?: unknown;
    email?: unknown;
    description?: unknown;
  };

  const profile = await updateWordPressProfile(token.accessToken, {
    firstName: typeof body.firstName === "string" ? body.firstName : "",
    lastName: typeof body.lastName === "string" ? body.lastName : "",
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    email: typeof body.email === "string" ? body.email : "",
    description: typeof body.description === "string" ? body.description : "",
  });

  if (!profile) {
    return NextResponse.json(
      { message: "WordPress could not save those changes." },
      { status: 502 }
    );
  }

  return NextResponse.json({ profile });
}
