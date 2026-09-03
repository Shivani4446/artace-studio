import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildAffiliateApprovedEmail } from "@/lib/email/templates";

export const runtime = "edge";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env["Project URL"] ||
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env["Anon Key"] ||
  "";

const supabaseHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
});

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Affiliate program is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliates?select=*&order=created_at.desc`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) {
      return NextResponse.json({ error: "Could not load affiliates." }, { status: 502 });
    }
    const affiliates = await response.json();
    return NextResponse.json({ affiliates });
  } catch {
    return NextResponse.json({ error: "Could not load affiliates." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Affiliate program is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { id?: number; status?: string; commissionRate?: number };
  try {
    body = (await request.json()) as { id?: number; status?: string; commissionRate?: number };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Missing or invalid affiliate id." }, { status: 400 });
  }

  const allowedStatuses = ["pending", "approved", "rejected", "suspended"];
  const update: Record<string, unknown> = {};
  if (body.status) {
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.commissionRate === "number" && Number.isFinite(body.commissionRate)) {
    update.commission_rate = body.commissionRate;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }
  update.updated_at = new Date().toISOString();

  // Only a genuine pending -> approved transition should send the "you're
  // approved" email — not e.g. reinstating a suspended affiliate back to
  // approved, which is a different action. Check the current status before
  // applying the update; only bother fetching it when this request could
  // possibly be that transition.
  let wasPending = false;
  if (update.status === "approved") {
    try {
      const currentResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/affiliates?id=eq.${id}&select=status`,
        { headers: supabaseHeaders() }
      );
      if (currentResponse.ok) {
        const currentRows = (await currentResponse.json()) as { status?: string }[];
        wasPending = currentRows[0]?.status === "pending";
      }
    } catch {
      // If this lookup fails, we simply skip sending the email below rather
      // than block the approval itself on it.
    }
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/affiliates?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...supabaseHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(update),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Could not update affiliate." }, { status: 502 });
    }
    const rows = await response.json();
    const updatedAffiliate = Array.isArray(rows) ? rows[0] : null;

    if (wasPending && updatedAffiliate?.email) {
      try {
        const emailContent = buildAffiliateApprovedEmail({
          fullName: updatedAffiliate.full_name || "",
          referralCode: updatedAffiliate.referral_code || "",
          commissionRate:
            typeof updatedAffiliate.commission_rate === "number"
              ? updatedAffiliate.commission_rate
              : 0.1,
        });
        await sendTransactionalEmail({ to: updatedAffiliate.email, ...emailContent });
      } catch (error) {
        // Approval already succeeded — a notification-email failure must
        // never undo or fail the approval itself.
        console.error("[admin/affiliates] approval email failed:", error);
      }
    }

    return NextResponse.json({ ok: true, affiliate: updatedAffiliate });
  } catch {
    return NextResponse.json({ error: "Could not update affiliate." }, { status: 502 });
  }
}
