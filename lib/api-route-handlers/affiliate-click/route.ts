import { NextResponse } from "next/server";

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

type AffiliateClickPayload = {
  referralCode?: string;
  landingPath?: string;
};

export async function POST(request: Request) {
  // Best-effort only — a tracking beacon must never surface an error to the
  // page that called it, and a missing/invalid code is silently ignored.
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true });
  }

  let payload: AffiliateClickPayload;
  try {
    payload = (await request.json()) as AffiliateClickPayload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const referralCode = String(payload.referralCode || "").trim();
  const landingPath = String(payload.landingPath || "/").trim() || "/";
  if (!referralCode) {
    return NextResponse.json({ ok: true });
  }

  try {
    const lookupResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliates?referral_code=eq.${encodeURIComponent(
        referralCode
      )}&status=eq.approved&select=id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!lookupResponse.ok) return NextResponse.json({ ok: true });

    const rows = (await lookupResponse.json()) as Array<{ id: number }>;
    const affiliateId = Array.isArray(rows) && rows.length > 0 ? rows[0].id : null;
    if (!affiliateId) return NextResponse.json({ ok: true });

    await fetch(`${SUPABASE_URL}/rest/v1/affiliate_clicks`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        affiliate_id: affiliateId,
        landing_path: landingPath,
        user_agent: request.headers.get("user-agent"),
        ip_address: request.headers.get("x-forwarded-for"),
      }),
    });
  } catch {
    // Swallow — this is a best-effort tracking beacon.
  }

  return NextResponse.json({ ok: true });
}
