"use client";

import { useEffect, useState } from "react";
import { MIN_REDEMPTION_POINTS, POINT_VALUE_INR, PROGRAM_NAME } from "@/lib/rewards/constants";

type ApplyPointsBoxProps = {
  subtotal: number;
  onPointsChange: (points: number) => void;
};

const ApplyPointsBox = ({ subtotal, onPointsChange }: ApplyPointsBoxProps) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const [pointsInput, setPointsInput] = useState(0);

  useEffect(() => {
    let isActive = true;
    fetch("/api/rewards/balance")
      .then((res) => (res.ok ? res.json() : { balance: 0 }))
      .then((data: { balance?: number }) => {
        if (isActive) setBalance(typeof data.balance === "number" ? data.balance : 0);
      })
      .catch(() => {
        if (isActive) setBalance(0);
      });
    return () => {
      isActive = false;
    };
  }, []);

  if (balance === null) return null;

  const maxRedeemable = Math.min(balance, Math.floor(subtotal));

  if (balance < MIN_REDEMPTION_POINTS) {
    return (
      <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
        <p className="text-sm font-semibold text-[#1f1f1f]">{PROGRAM_NAME}</p>
        <p className="mt-2 text-sm text-[#666]">
          You have {balance} points — earn {MIN_REDEMPTION_POINTS - balance} more to redeem your first reward.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[18px] border border-[#1f1f1f]/8 bg-white px-5 py-5">
      <p className="text-sm font-semibold text-[#1f1f1f]">{PROGRAM_NAME}</p>
      <p className="mt-2 text-sm text-[#666]">You have {balance} points available.</p>

      {applied ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#eef7f0] px-3 py-1 text-xs font-semibold text-[#116329]">
            − ₹{(pointsInput * POINT_VALUE_INR).toLocaleString("en-IN")} applied
          </span>
          <button
            type="button"
            onClick={() => {
              setApplied(false);
              setPointsInput(0);
              onPointsChange(0);
            }}
            className="text-xs font-semibold text-[#1f1f1f] underline underline-offset-4"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            min={MIN_REDEMPTION_POINTS}
            max={maxRedeemable}
            value={pointsInput || ""}
            onChange={(e) => setPointsInput(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            placeholder={`${MIN_REDEMPTION_POINTS}-${maxRedeemable}`}
            className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
          <button
            type="button"
            disabled={pointsInput < MIN_REDEMPTION_POINTS || pointsInput > maxRedeemable}
            onClick={() => {
              setApplied(true);
              onPointsChange(pointsInput);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] transition-colors hover:bg-[#f5f0e8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplyPointsBox;
