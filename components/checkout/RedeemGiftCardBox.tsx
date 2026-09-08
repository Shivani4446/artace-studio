"use client";

import { useState } from "react";

type RedeemGiftCardBoxProps = {
  subtotal: number;
  onAmountChange: (amount: number, code: string) => void;
};

const RedeemGiftCardBox = ({ subtotal, onAmountChange }: RedeemGiftCardBoxProps) => {
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleApply = async () => {
    setError("");
    const normalized = codeInput.trim().toUpperCase();
    if (!normalized) return;

    setIsChecking(true);
    try {
      const res = await fetch(`/api/gift-cards/balance?code=${encodeURIComponent(normalized)}`);
      const data = (await res.json()) as { found?: boolean; remainingBalance?: number };

      if (!data.found || !data.remainingBalance) {
        setError("That gift card code isn't valid or has no remaining balance.");
        return;
      }

      const amountToApply = Math.min(data.remainingBalance, Math.floor(subtotal));
      setApplied({ code: normalized, amount: amountToApply });
      onAmountChange(amountToApply, normalized);
    } catch {
      setError("Couldn't check that code right now — please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
      <p className="text-sm font-semibold text-[#1f1f1f]">Redeem a Gift Card</p>

      {applied ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#116329]">
            − ₹{applied.amount.toLocaleString("en-IN")} applied ({applied.code})
          </span>
          <button
            type="button"
            onClick={() => {
              setApplied(null);
              setCodeInput("");
              onAmountChange(0, "");
            }}
            className="text-xs font-semibold text-[#1f1f1f] underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="ARTACE-XXXX-XXXX-XXXX"
            className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={isChecking || !codeInput.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? "Checking..." : "Apply"}
          </button>
        </div>
      )}

      {error ? <p className="mt-3 text-sm leading-6 text-[#b42318]">{error}</p> : null}
    </div>
  );
};

export default RedeemGiftCardBox;
