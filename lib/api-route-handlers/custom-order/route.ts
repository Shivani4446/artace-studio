import { NextResponse } from "next/server";

export const runtime = "edge";

type CustomOrderPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  concept: string;
  size: string;
  colors: string;
  referenceImages: string;
  rooms: string;
  numberOfPaintings: string;
  budgetRange: string;
  categories: string;
  additionalNotes: string;
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

const CUSTOM_ORDER_TO_EMAIL = process.env.CUSTOM_ORDER_TO_EMAIL || "info@artacestudio.com";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const generateOrderId = (): string => {
  // Generate a random 6-digit number
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AASCSTM${random}`;
};

const buildEmailText = (payload: CustomOrderPayload, orderId: string) => {
  return [
    `New Custom Order Request (Order ID: ${orderId})`,
    "",
    "Customer Information:",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    payload.address ? `Address: ${payload.address}` : "",
    "",
    "Painting Requirements:",
    `Concept: ${payload.concept}`,
    payload.size ? `Size: ${payload.size}` : "",
    payload.colors ? `Colors: ${payload.colors}` : "",
    payload.referenceImages ? `Reference Images: ${payload.referenceImages}` : "",
    payload.rooms ? `Rooms: ${payload.rooms}` : "",
    `Number of Paintings: ${payload.numberOfPaintings}`,
    payload.budgetRange ? `Budget Range: ${payload.budgetRange}` : "",
    payload.categories ? `Category: ${payload.categories}` : "",
    payload.additionalNotes ? `Additional Notes: ${payload.additionalNotes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const sendEmail = async (payload: CustomOrderPayload, orderId: string) => {
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
      to: [CUSTOM_ORDER_TO_EMAIL],
      subject: `Custom Order Request from ${payload.name} (Order ID: ${orderId})`,
      text: buildEmailText(payload, orderId),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Email delivery failed.");
  }

  return { skipped: false };
};

export async function POST(request: Request) {
  let payload: CustomOrderPayload;

  try {
    payload = (await request.json()) as CustomOrderPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: CustomOrderPayload = {
    name: String(payload.name || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    address: String(payload.address || "").trim(),
    concept: String(payload.concept || "").trim(),
    size: String(payload.size || "").trim(),
    colors: String(payload.colors || "").trim(),
    referenceImages: String(payload.referenceImages || "").trim(),
    rooms: String(payload.rooms || "").trim(),
    numberOfPaintings: String(payload.numberOfPaintings || "1").trim(),
    budgetRange: String(payload.budgetRange || "").trim(),
    categories: String(payload.categories || "").trim(),
    additionalNotes: String(payload.additionalNotes || "").trim(),
  };

  if (!sanitized.name || !sanitized.email || !sanitized.phone || !sanitized.concept) {
    return NextResponse.json(
      { error: "Please fill in all required fields (name, email, phone, concept)." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const orderId = generateOrderId();

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/custom_orders`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      order_id: orderId,
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      address: sanitized.address || null,
      concept: sanitized.concept,
      size: sanitized.size || null,
      colors: sanitized.colors || null,
      reference_images: sanitized.referenceImages || null,
      rooms: sanitized.rooms || null,
      number_of_paintings: parseInt(sanitized.numberOfPaintings, 10) || 1,
      budget_range: sanitized.budgetRange || null,
      categories: sanitized.categories || null,
      additional_notes: sanitized.additionalNotes || null,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your custom order request. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  try {
    const emailResult = await sendEmail(sanitized, orderId);
    if (emailResult.skipped) {
      return NextResponse.json(
        { error: "Order saved, but email is not configured." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Order saved, but email delivery failed. Please check email settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, orderId });
}
