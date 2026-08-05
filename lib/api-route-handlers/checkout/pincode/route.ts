import { NextRequest, NextResponse } from "next/server";
import { checkDelhiveryServiceability, calculateDelhiveryShippingRate } from "@/lib/delhivery";
import {
  SAMORA_FREE_SHIPPING_THRESHOLD_INR,
  isEligibleForFreeShipping,
} from "@/lib/samora/pricing";

export const runtime = "edge";

const REVALIDATE_SECONDS = 3600;

// India Post's public pincode API — free, no key required, authoritative for
// whether a PIN code exists and its real locality names (e.g. "Bibvewadi"
// for 411037, not just the city "Pune").
const INDIA_POST_API = "https://api.postalpincode.in/pincode";

type IndiaPostOffice = {
  Name: string;
  District: string;
  State: string;
};

type IndiaPostResponse = {
  Status: string;
  PostOffice: IndiaPostOffice[] | null;
};

const ZONE_ESTIMATED_DAYS: Record<string, { min: number; max: number }> = {
  A: { min: 1, max: 2 },
  B: { min: 2, max: 4 },
  C: { min: 3, max: 5 },
  D: { min: 4, max: 7 },
  E: { min: 6, max: 9 },
};

export async function GET(request: NextRequest) {
  const pincode = (request.nextUrl.searchParams.get("pincode") || "").trim();
  const amountRaw = request.nextUrl.searchParams.get("amount");
  const weightRaw = request.nextUrl.searchParams.get("weight"); // grams
  const amount = amountRaw ? Number(amountRaw) : null;
  const weightGrams = weightRaw ? Number(weightRaw) : null;

  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json(
      { serviceable: false, message: "Enter a valid 6-digit PIN code." },
      { status: 400 }
    );
  }

  try {
    const [indiaPostResult, delhiveryResult] = await Promise.all([
      fetch(`${INDIA_POST_API}/${pincode}`, { next: { revalidate: REVALIDATE_SECONDS } })
        .then((res) => (res.ok ? (res.json() as Promise<IndiaPostResponse[]>) : null))
        .catch(() => null),
      checkDelhiveryServiceability(pincode),
    ]);

    // `null` means the Delhivery call itself failed (missing/invalid token,
    // network issue, etc.) — that's a config/outage problem, not proof the
    // pincode is unserviceable, so it must not be reported the same way.
    if (!delhiveryResult) {
      console.error(
        "[checkout/pincode] Delhivery serviceability check returned null — check DELHIVERY_API_TOKEN and that the dev/deploy server was restarted after it was set."
      );
      return NextResponse.json(
        {
          serviceable: false,
          message: "Could not verify delivery for this PIN code right now. Please try again shortly.",
        },
        { status: 502 }
      );
    }

    if (!delhiveryResult.serviceable) {
      return NextResponse.json({
        serviceable: false,
        message: "Sorry, this PIN code isn't serviceable by our courier partner right now.",
      });
    }

    const postOffices = indiaPostResult?.[0]?.PostOffice ?? [];
    const localityNames = Array.from(new Set(postOffices.map((office) => office.Name))).filter(
      Boolean
    );
    const locality = localityNames.length > 0 ? localityNames.join(", ") : delhiveryResult.city;
    const state = postOffices[0]?.State || "";

    const freeShippingEligible = amount !== null ? isEligibleForFreeShipping(amount) : null;

    let shippingFee: number | null = null;
    let zone: string | null = null;

    if (freeShippingEligible) {
      shippingFee = 0;
    } else if (weightGrams && weightGrams > 0) {
      const rate = await calculateDelhiveryShippingRate({ destPincode: pincode, weightGrams });
      if (rate) {
        shippingFee = rate.amountInr;
        zone = rate.zone;
      }
    }

    const estimatedDays = zone ? ZONE_ESTIMATED_DAYS[zone] : undefined;

    return NextResponse.json({
      serviceable: true,
      pincode,
      locality,
      district: delhiveryResult.district,
      state,
      isRemoteArea: delhiveryResult.isRemoteArea,
      codAvailable: delhiveryResult.codAvailable,
      estimatedDays: estimatedDays ?? { min: 3, max: 7 },
      freeShippingThreshold: SAMORA_FREE_SHIPPING_THRESHOLD_INR,
      freeShippingEligible,
      shippingFee,
    });
  } catch {
    return NextResponse.json(
      { serviceable: false, message: "Could not verify this PIN code right now." },
      { status: 502 }
    );
  }
}
