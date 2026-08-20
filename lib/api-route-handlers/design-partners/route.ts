import { NextResponse } from "next/server";

export const runtime = "edge";

type DesignPartnerPayload = {
  fullName: string;
  studioName?: string;
  city: string;
  projectType: string;
  email: string;
  phone: string;
  moodBoardUrl?: string;
  message?: string;
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

const buildEmailText = (payload: DesignPartnerPayload) => {
  return [
    "New design partner application:",
    "",
    `Name: ${payload.fullName}`,
    payload.studioName ? `Studio/Firm: ${payload.studioName}` : "",
    `City: ${payload.city}`,
    `Project Type: ${payload.projectType}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    payload.moodBoardUrl ? `Mood Board: ${payload.moodBoardUrl}` : "",
    "",
    "Message:",
    payload.message || "-",
  ]
    .filter(Boolean)
    .join("\n");
};

const sendEmail = async (payload: DesignPartnerPayload) => {
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
      subject: `New design partner application from ${payload.fullName}`,
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
  let payload: DesignPartnerPayload;

  try {
    payload = (await request.json()) as DesignPartnerPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: DesignPartnerPayload = {
    fullName: String(payload.fullName || "").trim(),
    studioName: String(payload.studioName || "").trim(),
    city: String(payload.city || "").trim(),
    projectType: String(payload.projectType || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    moodBoardUrl: String(payload.moodBoardUrl || "").trim(),
    message: String(payload.message || "").trim(),
  };

  if (!sanitized.fullName || !sanitized.email || !sanitized.phone || !sanitized.city) {
    return NextResponse.json(
      { error: "Please fill in your name, city, email, and phone number." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!sanitized.projectType) {
    return NextResponse.json({ error: "Please select a project type." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/design_partner_applications`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      full_name: sanitized.fullName,
      studio_name: sanitized.studioName || null,
      city: sanitized.city,
      project_type: sanitized.projectType,
      email: sanitized.email,
      phone: sanitized.phone,
      mood_board_url: sanitized.moodBoardUrl || null,
      message: sanitized.message || null,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your application. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  try {
    const emailResult = await sendEmail(sanitized);
    if (emailResult.skipped) {
      return NextResponse.json(
        { error: "Application saved, but email is not configured." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Application saved, but email delivery failed. Please check email settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
