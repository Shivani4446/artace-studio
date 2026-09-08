import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import { ensurePositiveInt } from "@/utils/woocommerce-checkout";
import { getLedgerHistory } from "@/lib/rewards/ledger";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Please sign in to see your rewards." }, { status: 401 });
  }

  const customerId = ensurePositiveInt(session.user.id);
  if (!customerId) {
    return NextResponse.json({ error: "Your account session is missing a customer id." }, { status: 401 });
  }

  const entries = await getLedgerHistory(String(customerId));
  return NextResponse.json({ entries });
}
