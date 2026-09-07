import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { buildPromotionLeadNotificationEmail } from "@/lib/email/templates";

export const runtime = "edge";

type PromotionLeadPayload = {
  email: string;
  phone: string;
  couponCode: string;
};

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

const NOTIFY_EMAIL =
  process.env.PROMOTION_LEADS_EMAIL || process.env.CONTACT_TO_EMAIL || "info@artacestudio.com";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export async function POST(request: Request) {
  let payload: PromotionLeadPayload;

  try {
    payload = (await request.json()) as PromotionLeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: PromotionLeadPayload = {
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    couponCode: String(payload.couponCode || "").trim(),
  };

  if (!sanitized.email || !sanitized.phone) {
    return NextResponse.json(
      { error: "Please share your email and phone number." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!sanitized.couponCode) {
    return NextResponse.json({ error: "Missing coupon code." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/promotion_leads`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      email: sanitized.email,
      phone: sanitized.phone,
      coupon_code: sanitized.couponCode,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your details. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  // Notification email is best-effort — the lead is already saved, so a
  // failed/unconfigured Resend setup should never block the coupon reveal.
  try {
    const { subject, html, text } = buildPromotionLeadNotificationEmail(sanitized);
    await sendTransactionalEmail({ to: NOTIFY_EMAIL, subject, html, text });
  } catch (error) {
    console.error("promotion-leads: notification email failed", error);
  }

  return NextResponse.json({ ok: true });
}
