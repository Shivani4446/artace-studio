"use client";

import { useState } from "react";

const GiftCardBalanceChecker = () => {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ found: boolean; remainingBalance: number } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/gift-cards/balance?code=${encodeURIComponent(normalized)}`);
      setResult(await res.json());
    } catch {
      setResult({ found: false, remainingBalance: 0 });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="rounded-[18px] bg-white p-6">
      <p className="font-display text-[20px] text-[#1f1f1f]">Check Your Balance</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ARTACE-XXXX-XXXX-XXXX"
          className="min-h-11 w-full flex-1 rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[15px] outline-none focus:border-[#1f1f1f]/35"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking || !code.trim()}
          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#1f1f1f] hover:bg-[#f5f0e8] disabled:opacity-60"
        >
          Check
        </button>
      </div>
      {result ? (
        <p className="mt-3 text-sm text-[#444]">
          {result.found
            ? `Remaining balance: ₹${result.remainingBalance.toLocaleString("en-IN")}`
            : "That code wasn't found or has no remaining balance."}
        </p>
      ) : null}
    </div>
  );
};

export default GiftCardBalanceChecker;
