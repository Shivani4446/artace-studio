import { NextResponse } from "next/server";

export const runtime = "edge";

type NewsletterSignupPayload = {
  email: string;
  sourcePage?: string;
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

const CONTACT_TO_EMAIL =
  process.env.CORPORATE_CONTACT_EMAIL || process.env.CONTACT_TO_EMAIL || "info@artacestudio.com";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const sendNotificationEmail = async (email: string) => {
  if (!RESEND_API_KEY || !RESEND_FROM) return { skipped: true };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [CONTACT_TO_EMAIL],
      subject: "New Samora newsletter signup",
      text: `New Samora early-access signup: ${email}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Email delivery failed.");
  }

  return { skipped: false };
};

export async function POST(request: Request) {
  let payload: NewsletterSignupPayload;

  try {
    payload = (await request.json()) as NewsletterSignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const sourcePage = String(payload.sourcePage || "").trim().slice(0, 200);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/samora_newsletter_signups`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify({
      email,
      source_page: sourcePage || null,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  // A 409 here just means this email already signed up (the table's UNIQUE
  // constraint + ignore-duplicates resolution) — treat that as success too,
  // not an error, since the customer's intent (be on the list) is already met.
  if (!insertResponse.ok && insertResponse.status !== 409) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your signup. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  try {
    await sendNotificationEmail(email);
  } catch {
    // Never fail the signup over a notification-email hiccup — the row is
    // already saved, which is what actually matters to the customer.
  }

  return NextResponse.json({ ok: true });
}
