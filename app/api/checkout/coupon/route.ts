import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";

export const runtime = "edge";

type WooCouponPayload = {
  id?: unknown;
  code?: unknown;
  amount?: unknown;
  discount_type?: unknown;
  description?: unknown;
  date_expires_gmt?: unknown;
  date_expires?: unknown;
  usage_limit?: unknown;
  usage_count?: unknown;
  minimum_amount?: unknown;
  maximum_amount?: unknown;
  free_shipping?: unknown;
};

const DEFAULT_WP_JSON_PREFIX = "/wp-json";

const sanitizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const toBase64 = (value: string) => {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string, enc?: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) {
    return maybeBuffer.Buffer.from(value, "utf8").toString("base64");
  }

  throw new Error("No base64 encoder available.");
};

const normalizeWpJsonPrefix = (value: string) => {
  const trimmed = sanitizeText(value) || DEFAULT_WP_JSON_PREFIX;
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.replace(/\/+$/, "");
};

const getWooBaseUrl = () => {
  const siteUrlRaw =
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    "https://api.artacestudio.com/";
  const siteUrl = sanitizeText(siteUrlRaw).replace(/\/+$/, "");
  const restUrlRaw = sanitizeText(process.env.WOOCOMMERCE_REST_URL) || siteUrl;
  return restUrlRaw.replace(/\/+$/, "");
};

const getWooAuthHeader = () => {
  const key = sanitizeText(process.env.WOOCOMMERCE_CONSUMER_KEY);
  const secret = sanitizeText(process.env.WOOCOMMERCE_CONSUMER_SECRET);

  if (!key || !secret) {
    throw new Error("WooCommerce API credentials are missing.");
  }

  const token = toBase64(`${key}:${secret}`);
  return `Basic ${token}`;
};

const parseJsonSafe = (rawText: string): unknown => {
  try {
    return rawText ? (JSON.parse(rawText) as unknown) : null;
  } catch {
    return null;
  }
};

const buildWooErrorMessage = (status: number, url: string, rawText: string) => {
  const preview = sanitizeText(rawText).slice(0, 180);
  return preview
    ? `WooCommerce request failed (${status}) at ${url}. Response: ${preview}`
    : `WooCommerce request failed (${status}) at ${url}.`;
};

const parseMaybeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseMaybeBool = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
};

const mapCoupon = (payload: WooCouponPayload) => {
  const code = sanitizeText(payload.code).toLowerCase();
  return {
    code,
    amount: sanitizeText(payload.amount),
    discountType: sanitizeText(payload.discount_type),
    description: sanitizeText(payload.description),
    freeShipping: parseMaybeBool(payload.free_shipping) ?? false,
    minimumAmount: sanitizeText(payload.minimum_amount),
    maximumAmount: sanitizeText(payload.maximum_amount),
    usageLimit: parseMaybeNumber(payload.usage_limit),
    usageCount: parseMaybeNumber(payload.usage_count),
    expiresAt:
      sanitizeText(payload.date_expires_gmt) ||
      sanitizeText(payload.date_expires) ||
      "",
  };
};

export async function GET(request: NextRequest) {
  // Coupons are part of checkout; require an authenticated session to reduce coupon enumeration.
  const session = await getAuthSessionFromRequest(request);
  if (!session?.accessToken) {
    return NextResponse.json(
      { ok: false, message: "Please sign in before applying coupons." },
      { status: 401 }
    );
  }

  const codeRaw = request.nextUrl.searchParams.get("code") || "";
  const code = sanitizeText(codeRaw).toLowerCase();

  if (!code) {
    return NextResponse.json({ ok: false, message: "Enter a coupon code." }, { status: 400 });
  }

  if (code.length > 64) {
    return NextResponse.json({ ok: false, message: "Coupon code is too long." }, { status: 400 });
  }

  const baseUrl = getWooBaseUrl();
  const wpJsonPrefix = normalizeWpJsonPrefix(process.env.WOOCOMMERCE_WP_JSON_PREFIX || "");
  const route = `/wc/v3/coupons?code=${encodeURIComponent(code)}&per_page=1`;
  const primaryUrl = `${baseUrl}${wpJsonPrefix}${route}`;
  const fallbackUrl = `${baseUrl}/?rest_route=${encodeURIComponent(route)}`;

  const doFetch = async (url: string) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: getWooAuthHeader(),
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const rawText = await response.text();
    const parsed = parseJsonSafe(rawText);
    return { response, rawText, parsed };
  };

  try {
    const primary = await doFetch(primaryUrl);
    const effective =
      primary.response.status === 404 ? await doFetch(fallbackUrl) : primary;

    if (!effective.response.ok) {
      return NextResponse.json(
        { ok: false, message: buildWooErrorMessage(effective.response.status, primaryUrl, effective.rawText) },
        { status: 502 }
      );
    }

    const list = Array.isArray(effective.parsed) ? (effective.parsed as WooCouponPayload[]) : [];
    if (list.length === 0) {
      return NextResponse.json(
        { ok: false, message: "That coupon code was not found." },
        { status: 404 }
      );
    }

    const coupon = mapCoupon(list[0] || {});
    if (!coupon.code) {
      return NextResponse.json(
        { ok: false, message: "That coupon code was not found." },
        { status: 404 }
      );
    }

    // Basic expiry check (Woo will enforce rules again when applying to an order).
    if (coupon.expiresAt) {
      const expires = Date.parse(coupon.expiresAt);
      if (Number.isFinite(expires) && Date.now() > expires) {
        return NextResponse.json(
          { ok: false, message: "That coupon has expired." },
          { status: 400 }
        );
      }
    }

    if (
      typeof coupon.usageLimit === "number" &&
      typeof coupon.usageCount === "number" &&
      coupon.usageLimit > 0 &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      return NextResponse.json(
        { ok: false, message: "That coupon is no longer available." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, coupon });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to validate the coupon right now.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
