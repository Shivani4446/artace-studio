import { NextRequest, NextResponse } from "next/server";
import { getGiftCardBalance } from "@/lib/gift-cards/ledger";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase() || "";
  if (!code) {
    return NextResponse.json({ found: false, remainingBalance: 0 });
  }

  const result = await getGiftCardBalance(code);
  return NextResponse.json({ found: result.found && result.status === "active", remainingBalance: result.remainingBalance });
}
