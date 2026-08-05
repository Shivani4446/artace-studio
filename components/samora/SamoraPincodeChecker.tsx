"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";

type PincodeResult = {
  serviceable: boolean;
  message?: string;
  locality?: string;
  district?: string;
  state?: string;
  estimatedDays?: { min: number; max: number };
  freeShippingThreshold?: number | null;
  freeShippingEligible?: boolean | null;
  shippingFee?: number | null;
};

const SamoraPincodeChecker = ({
  amount,
  weightGrams,
}: {
  amount?: number | null;
  weightGrams?: number | null;
}) => {
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (isLoading) return;
    setError("");
    setResult(null);

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ pincode });
      if (amount) params.set("amount", String(amount));
      if (weightGrams) params.set("weight", String(Math.round(weightGrams)));

      const response = await fetch(`/api/checkout/pincode?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as PincodeResult;
      setResult(data);
    } catch {
      setError("Could not check delivery right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#8a7c68]">
        <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
        Check Delivery
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleCheck();
          }}
          placeholder="Enter PIN code"
          className="w-full max-w-[180px] rounded-full border border-[#2b2420]/20 bg-white px-4 py-2.5 text-[14px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d]"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full border border-[#2b2420]/20 px-5 py-2.5 text-[13.5px] font-medium text-[#2b2420] transition-colors hover:border-[#2b2420]/40 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : "Check"}
        </button>
      </div>

      {error ? <p className="mt-2 text-[13px] text-[#a63b2d]">{error}</p> : null}

      {result ? (
        result.serviceable ? (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-[#eef7f0] px-4 py-3 text-[13.5px] leading-[1.6] text-[#116329]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <div>
              <p>
                Delivers to {result.locality || result.district}
                {result.state ? `, ${result.state}` : ""}.
              </p>
              {result.estimatedDays ? (
                <p className="mt-0.5">
                  Estimated delivery in {result.estimatedDays.min}-{result.estimatedDays.max} days.
                </p>
              ) : null}
              {result.freeShippingEligible ? (
                <p className="mt-0.5">Eligible for free shipping.</p>
              ) : result.shippingFee !== null && result.shippingFee !== undefined ? (
                <p className="mt-0.5">
                  Shipping: Rs. {result.shippingFee.toFixed(0)} (via Delhivery). Free above Rs.{" "}
                  {(result.freeShippingThreshold ?? 2000).toLocaleString("en-IN")}.
                </p>
              ) : result.freeShippingThreshold ? (
                <p className="mt-0.5">
                  Free shipping on orders above Rs.{" "}
                  {result.freeShippingThreshold.toLocaleString("en-IN")}.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-[#f8ece8] px-4 py-3 text-[13.5px] text-[#a63b2d]">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <p>{result.message || "We couldn't verify delivery for this PIN code."}</p>
          </div>
        )
      ) : null}
    </div>
  );
};

export default SamoraPincodeChecker;
