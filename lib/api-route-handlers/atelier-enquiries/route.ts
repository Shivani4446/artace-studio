import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/resend";

export const runtime = "edge";

type AtelierEnquiryPayload = {
  productId: string;
  productName: string;
  productSlug: string;
  intent: string;
  name: string;
  email: string;
  phone: string;
  message: string;
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

const ATELIER_ENQUIRY_TO_EMAIL =
  process.env.ATELIER_ENQUIRY_TO_EMAIL || "info@artacestudio.com";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const generateEnquiryId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AASENQ${random}`;
};

/**
 * Cap the free-text fields. These are emailed and stored, and the values are
 * only ever rendered as text elsewhere, but an unbounded message is still an
 * easy way to post a megabyte into the studio inbox.
 */
const MAX_MESSAGE_LENGTH = 2000;
const MAX_PHONE_LENGTH = 40;
const MAX_NAME_LENGTH = 120;

const clampText = (value: string, max: number): string => {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
};

const buildEmailText = (payload: AtelierEnquiryPayload, enquiryId: string) => {
  return [
    `New Atelier Enquiry (Enquiry ID: ${enquiryId})`,
    "",
    `Intent: ${payload.intent}`,
    "",
    "Product:",
    `${payload.productName} (${payload.productSlug})`,
    "",
    "Customer Information:",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    ...(payload.phone ? [`Phone: ${payload.phone}`] : []),
    "",
    ...(payload.message ? ["Message:", payload.message] : []),
  ]
    .filter(Boolean)
    .join("\n");
};

export async function POST(request: Request) {
  let payload: AtelierEnquiryPayload;

  try {
    payload = (await request.json()) as AtelierEnquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: AtelierEnquiryPayload = {
    productId: String(payload.productId || "").trim(),
    productName: String(payload.productName || "").trim(),
    productSlug: String(payload.productSlug || "").trim(),
    // Constrain to a known set: this string is stored and emailed, and an
    // unexpected value should not be able to smuggle arbitrary text through.
    intent: payload.intent === "commission" ? "commission" : "acquire",
    name: clampText(String(payload.name || ""), MAX_NAME_LENGTH),
    email: String(payload.email || "").trim(),
    phone: clampText(String(payload.phone || ""), MAX_PHONE_LENGTH),
    message: clampText(String(payload.message || ""), MAX_MESSAGE_LENGTH),
  };

  if (!sanitized.productId || !sanitized.productName || !sanitized.name || !sanitized.email) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const enquiryId = generateEnquiryId();

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/atelier_enquiries`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      enquiry_id: enquiryId,
      product_id: sanitized.productId,
      product_name: sanitized.productName,
      product_slug: sanitized.productSlug || null,
      intent: sanitized.intent,
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone || null,
      message: sanitized.message || null,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your enquiry. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  try {
    const emailText = buildEmailText(sanitized, enquiryId);
    await sendTransactionalEmail({
      to: ATELIER_ENQUIRY_TO_EMAIL,
      subject: `New Atelier Enquiry from ${sanitized.name} (${enquiryId})`,
      text: emailText,
      html: `<pre>${emailText}</pre>`,
    });
  } catch {
    return NextResponse.json(
      { error: "Enquiry saved, but email delivery failed. Please check email settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, enquiryId });
}
