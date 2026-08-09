import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/auth";

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
    // Supabase PostgREST embed syntax pulls the referring affiliate's name
    // and payout details alongside each conversion in one request.
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliate_conversions?select=*,affiliates(full_name,email,referral_code,payout_method,bank_account_name,bank_account_number,bank_ifsc,upi_id)&order=created_at.desc`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) {
      return NextResponse.json({ error: "Could not load conversions." }, { status: 502 });
    }
    const conversions = await response.json();
    return NextResponse.json({ conversions });
  } catch {
    return NextResponse.json({ error: "Could not load conversions." }, { status: 502 });
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

  let body: { id?: number; status?: string };
  try {
    body = (await request.json()) as { id?: number; status?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = Number(body.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Missing or invalid conversion id." }, { status: 400 });
  }

  const allowedStatuses = ["pending", "approved", "paid", "voided"];
  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/affiliate_conversions?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        ...supabaseHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status: body.status, updated_at: new Date().toISOString() }),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Could not update conversion." }, { status: 502 });
    }
    const rows = await response.json();
    return NextResponse.json({ ok: true, conversion: Array.isArray(rows) ? rows[0] : null });
  } catch {
    return NextResponse.json({ error: "Could not update conversion." }, { status: 502 });
  }
}
