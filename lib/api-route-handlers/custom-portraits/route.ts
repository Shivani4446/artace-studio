import { NextRequest, NextResponse } from "next/server";
import {
  createWooCommerceOrder,
  getWooCommercePaymentConfig,
  mergeWooMetaData,
  parseAmountToMinorUnits,
  sanitizeText,
  updateWooCommerceOrder,
} from "@/utils/woocommerce-checkout";
import { createRazorpayOrder, getRazorpayPublicConfig } from "@/utils/razorpay";
import { calculatePortraitEstimate, isPortraitType } from "@/lib/custom-portraits/pricing";

export const runtime = "edge";

// Created once via the WooCommerce Admin API — see
// docs/superpowers/plans/2026-08-11-custom-portraits.md, Task 2. A draft, hidden, virtual,
// tax-free product whose catalog price ("1") is never actually charged: every order overrides it
// with the calculated deposit via the subtotal/total line-item override below (the same mechanism
// already proven for Prints). Draft status (not "publish") because this store's Store API does not
// honor catalog_visibility: "hidden" — draft was verified live to be the setting that actually
// excludes it from the public catalog, search, and direct-by-id fetch, while still working fine for
// server-side order creation via the Admin API (the only way this product is ever used).
const CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID = 4317;

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

type CustomPortraitRequestBody = {
  portraitType?: unknown;
  widthInches?: unknown;
  heightInches?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  referenceImages?: unknown;
  notes?: unknown;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || fullName.trim();
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
};

type PortraitDetails = {
  name: string;
  email: string;
  phone: string;
  portraitType: string;
  widthInches: number;
  heightInches: number;
  estimatedPrice: number;
  depositAmount: number;
  referenceImages: string[];
  notes: string;
};

const notifyTeam = async (details: PortraitDetails & { orderNumber: string }) => {
  if (!RESEND_API_KEY || !RESEND_FROM) return;

  const text = [
    "New custom portrait request:",
    "",
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    `Type: ${details.portraitType}`,
    `Size: ${details.widthInches}" x ${details.heightInches}"`,
    `Estimated price: Rs ${details.estimatedPrice}`,
    `Deposit paid: Rs ${details.depositAmount}`,
    `WooCommerce order: #${details.orderNumber}`,
    "",
    "Reference photos:",
    ...(details.referenceImages.length ? details.referenceImages : ["(none)"]),
    "",
    "Notes:",
    details.notes || "-",
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [CONTACT_TO_EMAIL],
        subject: `New custom portrait request from ${details.name}`,
        text,
      }),
    });
  } catch {
    // Never let a notification-email failure affect the payment flow that already succeeded.
  }
};

const logRequest = async (
  details: PortraitDetails & { wcOrderId: number | null; wcOrderNumber: string }
) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/custom_portrait_requests`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        wc_order_id: details.wcOrderId,
        wc_order_number: details.wcOrderNumber,
        portrait_type: details.portraitType,
        width_inches: details.widthInches,
        height_inches: details.heightInches,
        estimated_price: details.estimatedPrice,
        deposit_amount: details.depositAmount,
        name: details.name,
        email: details.email,
        phone: details.phone,
        reference_images: details.referenceImages.join(","),
        notes: details.notes || null,
      }),
    });
  } catch {
    // Best-effort logging only — never blocks a payment flow that already succeeded.
  }
};

export async function POST(request: NextRequest) {
  let body: CustomPortraitRequestBody;

  try {
    body = (await request.json()) as CustomPortraitRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const estimate = calculatePortraitEstimate({
    portraitType: body.portraitType,
    widthInches: body.widthInches,
    heightInches: body.heightInches,
  });

  if (!estimate || !isPortraitType(body.portraitType)) {
    return NextResponse.json(
      { error: "Please select a portrait type and a valid size between 4 and 72 inches on each side." },
      { status: 400 }
    );
  }

  const portraitType = body.portraitType;
  const width = Number(body.widthInches);
  const height = Number(body.heightInches);

  const name = sanitizeText(body.name);
  const email = sanitizeText(body.email);
  const phone = sanitizeText(body.phone);
  const notes = sanitizeText(body.notes);
  const referenceImages = Array.isArray(body.referenceImages)
    ? body.referenceImages.filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Please provide your name, email, and phone number." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (referenceImages.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one reference photo." },
      { status: 400 }
    );
  }

  const { firstName, lastName } = splitName(name);
  const { paymentMethod, paymentMethodTitle } = getWooCommercePaymentConfig();

  try {
    const wooOrder = await createWooCommerceOrder({
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: false,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      },
      line_items: [
        {
          product_id: CUSTOM_PORTRAIT_DEPOSIT_PRODUCT_ID,
          quantity: 1,
          subtotal: estimate.depositAmount.toFixed(2),
          total: estimate.depositAmount.toFixed(2),
        },
      ],
      customer_note: [
        `Custom Portrait Deposit — ${portraitType}`,
        `Size: ${width}" x ${height}"`,
        `Estimated total price: Rs ${estimate.estimatedPrice}`,
        notes ? `Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      meta_data: [
        { key: "Portrait Type", value: portraitType },
        { key: "Size", value: `${width}" x ${height}"` },
        { key: "Estimated Price", value: String(estimate.estimatedPrice) },
        { key: "Reference Photos", value: referenceImages.join(", ") },
      ],
    });

    if (!wooOrder.orderId || !wooOrder.orderKey) {
      throw new Error("WooCommerce did not return a valid order identifier.");
    }

    const amount = parseAmountToMinorUnits(wooOrder.total);
    if (!amount) {
      throw new Error("WooCommerce returned an invalid order total for payment.");
    }

    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: wooOrder.currency || "INR",
      receipt: `portrait_${wooOrder.orderId}`,
      notes: {
        woo_order_id: String(wooOrder.orderId),
        woo_order_key: wooOrder.orderKey,
        woo_order_number: wooOrder.orderNumber,
      },
    });

    const updatedWooOrder = await updateWooCommerceOrder(wooOrder.orderId, {
      meta_data: mergeWooMetaData(wooOrder.metaData, {
        _artace_razorpay_order_id: razorpayOrder.id,
        _artace_checkout_origin: request.nextUrl.origin,
      }),
    });

    const { keyId } = getRazorpayPublicConfig();

    const details: PortraitDetails = {
      name,
      email,
      phone,
      portraitType,
      widthInches: width,
      heightInches: height,
      estimatedPrice: estimate.estimatedPrice,
      depositAmount: estimate.depositAmount,
      referenceImages,
      notes,
    };

    await logRequest({
      ...details,
      wcOrderId: updatedWooOrder.orderId,
      wcOrderNumber: updatedWooOrder.orderNumber,
    });

    await notifyTeam({ ...details, orderNumber: updatedWooOrder.orderNumber });

    return NextResponse.json({
      success: true,
      orderId: updatedWooOrder.orderId,
      orderKey: updatedWooOrder.orderKey,
      orderNumber: updatedWooOrder.orderNumber,
      estimatedPrice: estimate.estimatedPrice,
      depositAmount: estimate.depositAmount,
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Artace Studio",
        description: `Custom Portrait Deposit — Order #${updatedWooOrder.orderNumber}`,
        prefill: { name, email, contact: phone },
        notes: razorpayOrder.notes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start your portrait request right now.",
      },
      {
        status:
          error instanceof Error
            ? (() => {
                const match = error.message.match(/\[(\d{3})\]\s/);
                const parsed = match ? Number(match[1]) : 502;
                return Number.isFinite(parsed) && parsed >= 400 && parsed <= 599 ? parsed : 502;
              })()
            : 502,
      }
    );
  }
}
