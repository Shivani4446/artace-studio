import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/auth";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildAffiliatePayoutEmail } from "@/lib/email/templates";

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

  let body: { id?: number; ids?: number[]; status?: string };
  try {
    body = (await request.json()) as { id?: number; ids?: number[]; status?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const allowedStatuses = ["pending", "approved", "paid", "voided"];
  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Batch payout: multiple conversions, all for the same affiliate, marked
  // "paid" together in one action — sends one consolidated email instead of
  // one per order. Single-row Approve/Void from the Conversions table keeps
  // using the single-`id` path below, unchanged.
  if (Array.isArray(body.ids)) {
    if (body.status !== "paid") {
      return NextResponse.json(
        { error: "Batch updates are only supported for marking conversions paid." },
        { status: 400 }
      );
    }

    const ids = Array.from(
      new Set(
        body.ids.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
      )
    );
    if (ids.length === 0) {
      return NextResponse.json({ error: "No valid conversion ids provided." }, { status: 400 });
    }

    try {
      // Fetch first so we can (a) verify every selected row genuinely
      // belongs to one affiliate and is still "approved" — the only state
      // the UI offers this action from — and (b) have everything the
      // payout email needs (affiliate contact info, each order's amount).
      const idFilter = ids.join(",");
      const fetchResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/affiliate_conversions?id=in.(${idFilter})&select=id,affiliate_id,wc_order_id,commission_amount,status,affiliates(full_name,email)`,
        { headers: supabaseHeaders() }
      );
      if (!fetchResponse.ok) {
        return NextResponse.json(
          { error: "Could not load the selected conversions." },
          { status: 502 }
        );
      }
      const rows = (await fetchResponse.json()) as {
        id: number;
        affiliate_id: number;
        wc_order_id: number;
        commission_amount: number;
        status: string;
        affiliates?: { full_name: string; email: string } | null;
      }[];

      if (rows.length !== ids.length) {
        return NextResponse.json(
          { error: "One or more selected conversions could not be found." },
          { status: 400 }
        );
      }
      if (rows.some((row) => row.status !== "approved")) {
        return NextResponse.json(
          { error: "Only approved conversions can be marked paid." },
          { status: 400 }
        );
      }
      const affiliateIds = new Set(rows.map((row) => row.affiliate_id));
      if (affiliateIds.size > 1) {
        return NextResponse.json(
          { error: "Select conversions for a single affiliate at a time." },
          { status: 400 }
        );
      }

      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/affiliate_conversions?id=in.(${idFilter})`,
        {
          method: "PATCH",
          headers: {
            ...supabaseHeaders(),
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ status: "paid", updated_at: new Date().toISOString() }),
        }
      );
      if (!updateResponse.ok) {
        return NextResponse.json({ error: "Could not update conversions." }, { status: 502 });
      }
      const updatedRows = await updateResponse.json();

      const affiliate = rows[0].affiliates;
      if (affiliate?.email) {
        try {
          const totalAmount = rows.reduce((sum, row) => sum + Number(row.commission_amount), 0);
          const emailContent = buildAffiliatePayoutEmail({
            fullName: affiliate.full_name || "",
            totalAmount,
            orders: rows.map((row) => ({
              wcOrderId: row.wc_order_id,
              amount: Number(row.commission_amount),
            })),
          });
          await sendTransactionalEmail({ to: affiliate.email, ...emailContent });
        } catch (error) {
          // The payout itself already succeeded — a notification-email
          // failure must never undo or fail it.
          console.error("[admin/conversions] payout email failed:", error);
        }
      }

      return NextResponse.json({ ok: true, conversions: updatedRows });
    } catch {
      return NextResponse.json({ error: "Could not update conversions." }, { status: 502 });
    }
  }

  const id = Number(body.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Missing or invalid conversion id." }, { status: 400 });
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
