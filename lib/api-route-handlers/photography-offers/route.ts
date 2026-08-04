import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email/resend";

export const runtime = "edge";

type PhotographyOfferPayload = {
  productId: string;
  productName: string;
  productSlug: string;
  offerAmount: string;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
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

const PHOTOGRAPHY_OFFER_TO_EMAIL =
  process.env.PHOTOGRAPHY_OFFER_TO_EMAIL || "info@artacestudio.com";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const generateOfferId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `AASOFFER${random}`;
};

const buildEmailText = (payload: PhotographyOfferPayload, offerId: string) => {
  return [
    `New Photography Offer (Offer ID: ${offerId})`,
    "",
    "Product:",
    `${payload.productName} (${payload.productSlug})`,
    "",
    "Offer:",
    `Amount: Rs. ${payload.offerAmount}`,
    "",
    "Customer Information:",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    "",
    "Shipping Address:",
    payload.address1,
    payload.address2,
    `${payload.city}, ${payload.state} ${payload.postcode}`,
    payload.country,
  ]
    .filter(Boolean)
    .join("\n");
};

export async function POST(request: Request) {
  let payload: PhotographyOfferPayload;

  try {
    payload = (await request.json()) as PhotographyOfferPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const sanitized: PhotographyOfferPayload = {
    productId: String(payload.productId || "").trim(),
    productName: String(payload.productName || "").trim(),
    productSlug: String(payload.productSlug || "").trim(),
    offerAmount: String(payload.offerAmount || "").trim(),
    name: String(payload.name || "").trim(),
    email: String(payload.email || "").trim(),
    phone: String(payload.phone || "").trim(),
    address1: String(payload.address1 || "").trim(),
    address2: String(payload.address2 || "").trim(),
    city: String(payload.city || "").trim(),
    state: String(payload.state || "").trim(),
    postcode: String(payload.postcode || "").trim(),
    country: String(payload.country || "IN").trim(),
  };

  if (
    !sanitized.productId ||
    !sanitized.productName ||
    !sanitized.offerAmount ||
    !sanitized.name ||
    !sanitized.email ||
    !sanitized.phone ||
    !sanitized.address1 ||
    !sanitized.city ||
    !sanitized.state ||
    !sanitized.postcode
  ) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 }
    );
  }

  if (!isValidEmail(sanitized.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const offerAmountNumber = Number(sanitized.offerAmount);
  if (!Number.isFinite(offerAmountNumber) || offerAmountNumber <= 0) {
    return NextResponse.json({ error: "Please enter a valid offer amount." }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const offerId = generateOfferId();

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/photography_offers`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      offer_id: offerId,
      product_id: sanitized.productId,
      product_name: sanitized.productName,
      product_slug: sanitized.productSlug,
      offer_amount: offerAmountNumber,
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      address1: sanitized.address1,
      address2: sanitized.address2 || null,
      city: sanitized.city,
      state: sanitized.state,
      postcode: sanitized.postcode,
      country: sanitized.country,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for"),
    }),
  });

  if (!insertResponse.ok) {
    const errorText = await insertResponse.text();
    return NextResponse.json(
      { error: "Could not save your offer. Please try again.", details: errorText },
      { status: 500 }
    );
  }

  try {
    const emailText = buildEmailText(sanitized, offerId);
    await sendTransactionalEmail({
      to: PHOTOGRAPHY_OFFER_TO_EMAIL,
      subject: `New Photography Offer from ${sanitized.name} (${offerId})`,
      text: emailText,
      html: `<pre>${emailText}</pre>`,
    });
  } catch {
    return NextResponse.json(
      { error: "Offer saved, but email delivery failed. Please check email settings." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, offerId });
}
