"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PROGRAM_NAME, MIN_REDEMPTION_POINTS, POINT_VALUE_INR } from "@/lib/rewards/constants";

type LedgerEntry = { id: number; date: string; description: string; points: number; type: string };

const DashboardRewards = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetch("/api/rewards/balance")
      .then((res) => (res.ok ? res.json() : { balance: 0 }))
      .then((data: { balance?: number }) => setBalance(data.balance ?? 0));

    fetch("/api/rewards/history")
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data: { entries?: LedgerEntry[] }) => setEntries(data.entries ?? []));
  }, []);

  let runningBalance = balance ?? 0;
  const rows = entries.map((entry) => {
    const row = { ...entry, runningBalance };
    runningBalance -= entry.points;
    return row;
  });

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 md:px-12">
      <h1 className="font-display text-[28px] text-[#1f1f1f] md:text-[36px]">{PROGRAM_NAME}</h1>

      <div className="mt-6 rounded-[18px] border border-[#1f1f1f]/8 bg-[#faf8f4] p-6">
        <p className="text-sm text-[#666]">Your balance</p>
        <p className="mt-1 font-display text-[32px] text-[#1f1f1f]">
          {balance === null ? "…" : balance} points
        </p>
        <p className="mt-1 text-sm text-[#666]">
          Worth ₹{balance === null ? "…" : (balance * POINT_VALUE_INR).toLocaleString("en-IN")} —
          redeemable once you have {MIN_REDEMPTION_POINTS}+.
        </p>
        <Link href="/rewards" className="mt-3 inline-block text-sm font-medium text-[#1f1f1f] underline underline-offset-4">
          How {PROGRAM_NAME} works →
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-[20px] text-[#1f1f1f]">History</h2>
        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-[#666]">No activity yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[#666]">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 font-medium">Points</th>
                <th className="py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-black/5">
                  <td className="py-2 text-[#444]">{new Date(row.date).toLocaleDateString("en-IN")}</td>
                  <td className="py-2 text-[#444]">{row.description}</td>
                  <td className={`py-2 font-medium ${row.points >= 0 ? "text-[#116329]" : "text-[#b42318]"}`}>
                    {row.points >= 0 ? `+${row.points}` : row.points}
                  </td>
                  <td className="py-2 text-[#444]">{row.runningBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardRewards;
