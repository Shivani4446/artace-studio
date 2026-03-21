import { NextResponse } from "next/server";

export const runtime = "edge";

type ContactPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  message: string;
  consent: boolean;
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

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "info@artacestudio.com";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const buildEmailText = (payload: ContactPayload) => {
  return [
    "New contact form submission:",
    "",
    `Name: ${payload.firstName} ${payload.lastName || ""}`.trim(),
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : "",
    payload.country ? `Country: ${payload.country}` : "",
    payload.company ? `Company: ${payload.company}` : "",
    "",
    "Message:",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");
};

const sendEmail = async (payload: ContactPayload) => {
  if (!RESEND_API_KEY || !RESEND_FROM) {
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [CONTACT_TO_EMAIL],
      subject: `New contact request from ${payload.firstName}`,
      text: buildEmailText(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Email delivery failed.");
  }

  return { skipped: false };
};

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: ContactPayload = {
    firstName: String(payload.firstName || "").trim(),
    lastName: String(payload.lastName || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    country: String(payload.country || "").trim(),
    company: String(payload.company || "").trim(),
    message: String(payload.message || "").trim(),
    consent: Boolean(payload.consent),
  };

  if (!sanitized.firstName || !sanitized.email || !sanitized.message) {
    return NextResponse.json(
      { error: "Please fill in the required fields." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!sanitized.consent) {
    return NextResponse.json({ error: "Please accept the privacy policy." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      first_name: sanitized.firstName,
      last_name: sanitized.lastName || null,
      email: sanitized.email,
      phone: sanitized.phone || null,
      country: sanitized.country || null,
      company: sanitized.company || null,
      message: sanitized.message,
      consent: sanitized.consent,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your message. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  try {
    const emailResult = await sendEmail(sanitized);
    if (emailResult.skipped) {
      return NextResponse.json(
        { error: "Message saved, but email is not configured." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Message saved, but email delivery failed. Please check email settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
