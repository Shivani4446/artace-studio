// Delhivery integration — pincode serviceability + real shipping rate
// calculation, used by Samora's checkout (Samora ships via Delhivery).
// Docs: Delhivery Pincode API + Invoice/Charges (rate calculator) API.

const DELHIVERY_BASE_URL = "https://track.delhivery.com";
const REVALIDATE_SECONDS = 3600;

const getApiToken = () => process.env.DELHIVERY_API_TOKEN;
const getPickupPincode = () => process.env.DELHIVERY_PICKUP_PINCODE;

type DelhiveryPostalCode = {
  pin: number;
  cod: "Y" | "N";
  pre_paid: "Y" | "N";
  pickup: "Y" | "N";
  district: string;
  city: string;
  state_code: string;
  is_oda: "Y" | "N";
};

type DelhiveryPincodeResponse = {
  delivery_codes?: Array<{ postal_code: DelhiveryPostalCode }>;
};

export type DelhiveryServiceability = {
  serviceable: boolean;
  codAvailable: boolean;
  prepaidAvailable: boolean;
  isRemoteArea: boolean;
  district: string;
  city: string;
};

export const checkDelhiveryServiceability = async (
  pincode: string
): Promise<DelhiveryServiceability | null> => {
  const token = getApiToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${DELHIVERY_BASE_URL}/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`,
      {
        headers: { Authorization: `Token ${token}` },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as DelhiveryPincodeResponse;
    const entry = payload.delivery_codes?.[0]?.postal_code;
    if (!entry) return { serviceable: false, codAvailable: false, prepaidAvailable: false, isRemoteArea: false, district: "", city: "" };

    return {
      serviceable: entry.pickup === "Y" || entry.pre_paid === "Y",
      codAvailable: entry.cod === "Y",
      prepaidAvailable: entry.pre_paid === "Y",
      isRemoteArea: entry.is_oda === "Y",
      district: entry.district || "",
      city: entry.city || "",
    };
  } catch {
    return null;
  }
};

type DelhiveryInvoiceCharge = {
  status?: string;
  zone?: string;
  total_amount?: number;
};

export type DelhiveryShippingRate = {
  amountInr: number;
  zone: string;
};

/**
 * Real, live shipping cost from Delhivery's rate calculator (not a flat
 * estimate) — origin is Samora's registered pickup pincode, destination is
 * the customer's pincode, weight is the actual cart weight.
 */
export const calculateDelhiveryShippingRate = async ({
  destPincode,
  weightGrams,
  paymentType = "Pre-paid",
  mode = "S",
}: {
  destPincode: string;
  weightGrams: number;
  paymentType?: "Pre-paid" | "COD";
  mode?: "S" | "E"; // Surface | Express
}): Promise<DelhiveryShippingRate | null> => {
  const token = getApiToken();
  const originPincode = getPickupPincode();
  if (!token || !originPincode) return null;

  try {
    const params = new URLSearchParams({
      md: mode,
      ss: "Delivered",
      d_pin: destPincode,
      o_pin: originPincode,
      cgm: String(Math.max(1, Math.round(weightGrams))),
      pt: paymentType,
    });

    const response = await fetch(
      `${DELHIVERY_BASE_URL}/api/kinko/v1/invoice/charges/.json?${params.toString()}`,
      {
        headers: { Authorization: `Token ${token}` },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as DelhiveryInvoiceCharge[];
    const entry = Array.isArray(payload) ? payload[0] : null;
    if (!entry || typeof entry.total_amount !== "number") return null;

    return { amountInr: entry.total_amount, zone: entry.zone || "" };
  } catch {
    return null;
  }
};
