import { NextResponse } from "next/server";

export const runtime = "edge";

type ArtistRegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  portfolioUrl?: string;
  medium: string;
  sampleUrls?: string[];
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

const buildEmailText = (payload: ArtistRegisterPayload) => {
  return [
    "New artist application:",
    "",
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `City & State: ${payload.city}`,
    payload.portfolioUrl ? `Portfolio / Instagram: ${payload.portfolioUrl}` : "",
    `Primary Medium & Style: ${payload.medium}`,
    payload.sampleUrls && payload.sampleUrls.length > 0
      ? `Artwork Samples: ${payload.sampleUrls.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const sendEmail = async (payload: ArtistRegisterPayload) => {
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
      subject: `New artist application from ${payload.fullName}`,
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
  let payload: ArtistRegisterPayload;

  try {
    payload = (await request.json()) as ArtistRegisterPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: ArtistRegisterPayload = {
    fullName: String(payload.fullName || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    city: String(payload.city || "").trim(),
    portfolioUrl: String(payload.portfolioUrl || "").trim(),
    medium: String(payload.medium || "").trim(),
    sampleUrls: Array.isArray(payload.sampleUrls)
      ? payload.sampleUrls.map((url) => String(url).trim()).filter(Boolean).slice(0, 3)
      : [],
  };

  if (!sanitized.fullName || !sanitized.email || !sanitized.phone || !sanitized.city) {
    return NextResponse.json(
      { error: "Please fill in your name, email, phone number, and city." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!sanitized.medium) {
    return NextResponse.json({ error: "Please select your primary medium and style." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/artist_applications`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      full_name: sanitized.fullName,
      email: sanitized.email,
      phone: sanitized.phone,
      city: sanitized.city,
      portfolio_url: sanitized.portfolioUrl || null,
      medium: sanitized.medium,
      sample_urls:
        Array.isArray(sanitized.sampleUrls) && sanitized.sampleUrls.length > 0
          ? sanitized.sampleUrls
          : null,
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