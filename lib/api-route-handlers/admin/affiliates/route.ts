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
    return NextResponse.json({ ok: true, affiliate: Array.isArray(rows) ? rows[0] : null });
  } catch {
    return NextResponse.json({ error: "Could not update affiliate." }, { status: 502 });
  }
}
