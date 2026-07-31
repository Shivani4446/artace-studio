import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const REVALIDATE_SECONDS = 3600;

// India Post's public pincode API — free, no key required, authoritative for
// whether a PIN code actually exists and which district/state it belongs to.
const INDIA_POST_API = "https://api.postalpincode.in/pincode";

type IndiaPostOffice = {
  Name: string;
  District: string;
  State: string;
  DeliveryStatus: string;
};

type IndiaPostResponse = {
  Status: string;
  PostOffice: IndiaPostOffice[] | null;
};

// City-level (not state-level) metro classification — a rural pincode in
// Maharashtra shouldn't get a metro estimate just because Mumbai is also in
// Maharashtra.
const METRO_DISTRICTS = new Set([
  "mumbai",
  "mumbai suburban",
  "pune",
  "new delhi",
  "delhi",
  "bangalore",
  "bengaluru",
  "bengaluru urban",
  "hyderabad",
  "chennai",
  "kolkata",
  "ahmedabad",
  "gurugram",
  "gurgaon",
  "noida",
  "gautam buddha nagar",
]);

const getWooConfig = () => {
  // WOOCOMMERCE_SITE_URL is commonly the storefront domain (artacestudio.com),
  // which has no /wp-json route — the actual REST API lives at
  // WOOCOMMERCE_REST_URL (api.artacestudio.com) when that's set separately.
  const fallbackUrl =
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    "https://api.artacestudio.com/";
  const siteUrl = (process.env.WOOCOMMERCE_REST_URL || fallbackUrl).replace(/\/+$/, "");
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  return { siteUrl, consumerKey, consumerSecret };
};

const toBasicAuthToken = (username: string, password: string) => {
  const raw = `${username}:${password}`;
  if (typeof btoa === "function") return btoa(raw);
  const maybeBuffer = globalThis as {
    Buffer?: { from: (v: string) => { toString: (enc: string) => string } };
  };
  if (maybeBuffer.Buffer) return maybeBuffer.Buffer.from(raw).toString("base64");
  throw new Error("No base64 encoder available.");
};

type WooShippingMethod = {
  method_id: string;
  enabled: boolean;
  settings?: Record<string, { value?: string }>;
};

type WooShippingZone = { id: number };
type WooShippingLocation = { code?: string; type?: string };

// Reads the actual WooCommerce "India" shipping zone rather than hardcoding a
// threshold, so this stays correct if the store's free-shipping rule changes.
const getFreeShippingThreshold = async (): Promise<number | null> => {
  const { siteUrl, consumerKey, consumerSecret } = getWooConfig();
  if (!consumerKey || !consumerSecret) return null;

  const authHeader = `Basic ${toBasicAuthToken(consumerKey, consumerSecret)}`;
  const fetchOptions = {
    headers: { Authorization: authHeader },
    next: { revalidate: REVALIDATE_SECONDS },
  };

  try {
    const zonesResponse = await fetch(`${siteUrl}/wp-json/wc/v3/shipping/zones`, fetchOptions);
    if (!zonesResponse.ok) return null;
    const zones = (await zonesResponse.json()) as WooShippingZone[];
    if (!Array.isArray(zones)) return null;

    for (const zone of zones) {
      if (zone.id === 0) continue;

      const locationsResponse = await fetch(
        `${siteUrl}/wp-json/wc/v3/shipping/zones/${zone.id}/locations`,
        fetchOptions
      );
      if (!locationsResponse.ok) continue;
      const locations = (await locationsResponse.json()) as WooShippingLocation[];
      const coversIndia =
        Array.isArray(locations) &&
        (locations.length === 0 || locations.some((location) => location.code === "IN"));
      if (!coversIndia) continue;

      const methodsResponse = await fetch(
        `${siteUrl}/wp-json/wc/v3/shipping/zones/${zone.id}/methods`,
        fetchOptions
      );
      if (!methodsResponse.ok) continue;
      const methods = (await methodsResponse.json()) as WooShippingMethod[];
      const freeShippingMethod = methods.find(
        (method) => method.method_id === "free_shipping" && method.enabled
      );
      const minAmountRaw = freeShippingMethod?.settings?.min_amount?.value;
      const minAmount = Number((minAmountRaw || "").replace(/,/g, ""));
      if (Number.isFinite(minAmount)) return minAmount;
    }

    return null;
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const pincode = (request.nextUrl.searchParams.get("pincode") || "").trim();
  const amountRaw = request.nextUrl.searchParams.get("amount");
  const amount = amountRaw ? Number(amountRaw) : null;

  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json(
      { serviceable: false, message: "Enter a valid 6-digit PIN code." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${INDIA_POST_API}/${pincode}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return NextResponse.json(
        { serviceable: false, message: "Could not verify this PIN code right now." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as IndiaPostResponse[];
    const result = payload?.[0];
    const postOffices = result?.PostOffice ?? [];

    if (result?.Status !== "Success" || postOffices.length === 0) {
      return NextResponse.json({
        serviceable: false,
        message: "We couldn't find that PIN code. Please double-check and try again.",
      });
    }

    const deliveryOffice =
      postOffices.find((office) => office.DeliveryStatus === "Delivery") ?? postOffices[0];

    const district = deliveryOffice.District;
    const state = deliveryOffice.State;
    const isMetro = METRO_DISTRICTS.has(district.trim().toLowerCase());

    const freeShippingThreshold = await getFreeShippingThreshold();
    const freeShippingEligible =
      freeShippingThreshold !== null && amount !== null ? amount >= freeShippingThreshold : null;

    return NextResponse.json({
      serviceable: true,
      pincode,
      district,
      state,
      isMetro,
      estimatedDays: isMetro ? { min: 4, max: 6 } : { min: 6, max: 9 },
      freeShippingThreshold,
      freeShippingEligible,
    });
  } catch {
    return NextResponse.json(
      { serviceable: false, message: "Could not verify this PIN code right now." },
      { status: 502 }
    );
  }
}
