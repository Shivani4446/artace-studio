"use client";

import { useEffect, useState } from "react";

type Affiliate = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  referral_code: string;
  status: string;
  commission_rate: number;
  payout_method?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
  created_at: string;
};

type Conversion = {
  id: number;
  affiliate_id: number;
  wc_order_id: number;
  order_total: number;
  commission_rate_applied: number;
  commission_amount: number;
  status: string;
  created_at: string;
  affiliates?: {
    full_name: string;
    email: string;
    referral_code: string;
    payout_method?: string | null;
    bank_account_name?: string | null;
    bank_account_number?: string | null;
    bank_ifsc?: string | null;
    upi_id?: string | null;
  };
};

const formatCurrency = (value: number) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${Math.round(value).toLocaleString("en-IN")}`;
  }
};

const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    voided: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

const PayoutDetails = ({
  affiliate,
}: {
  affiliate: {
    payout_method?: string | null;
    bank_account_name?: string | null;
    bank_account_number?: string | null;
    bank_ifsc?: string | null;
    upi_id?: string | null;
  };
}) => {
  if (!affiliate.payout_method) {
    return <span className="text-[13px] text-[#a39c8e]">Not provided</span>;
  }
  if (affiliate.payout_method === "upi") {
    return <span className="text-[13px] text-[#4f4b45]">UPI: {affiliate.upi_id || "—"}</span>;
  }
  return (
    <span className="text-[13px] text-[#4f4b45]">
      {affiliate.bank_account_name || "—"} · {affiliate.bank_account_number || "—"} ·{" "}
      {affiliate.bank_ifsc || "—"}
    </span>
  );
};

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"applications" | "affiliates" | "conversions">("applications");
  const [selectedConversionIds, setSelectedConversionIds] = useState<Set<number>>(new Set());
  const [isPayingOut, setIsPayingOut] = useState(false);
  const [payoutError, setPayoutError] = useState("");

  const loadAll = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [affiliatesRes, conversionsRes] = await Promise.all([
        fetch("/api/admin/affiliates", { cache: "no-store" }),
        fetch("/api/admin/conversions", { cache: "no-store" }),
      ]);
      if (!affiliatesRes.ok || !conversionsRes.ok) {
        setError("Could not load data — you may need to sign in again.");
        setIsLoading(false);
        return;
      }
      const affiliatesPayload = (await affiliatesRes.json()) as { affiliates: Affiliate[] };
      const conversionsPayload = (await conversionsRes.json()) as { conversions: Conversion[] };
      setAffiliates(affiliatesPayload.affiliates || []);
      setConversions(conversionsPayload.conversions || []);
      setIsLoading(false);
    } catch {
      setError("Could not load data.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const updateAffiliateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void loadAll();
  };

  const updateConversionStatus = async (id: number, status: string) => {
    await fetch("/api/admin/conversions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    void loadAll();
  };

  // Which affiliate the current selection belongs to — once a checkbox is
  // checked, only other "approved" conversions for that same affiliate stay
  // selectable, since one payout batch (and its one summary email) can only
  // ever cover a single affiliate.
  const selectedAffiliateId =
    selectedConversionIds.size > 0
      ? conversions.find((c) => selectedConversionIds.has(c.id))?.affiliate_id ?? null
      : null;
  const selectedTotal = conversions
    .filter((c) => selectedConversionIds.has(c.id))
    .reduce((sum, c) => sum + Number(c.commission_amount), 0);

  const toggleConversionSelection = (conversion: Conversion) => {
    setSelectedConversionIds((prev) => {
      const next = new Set(prev);
      if (next.has(conversion.id)) {
        next.delete(conversion.id);
      } else {
        next.add(conversion.id);
      }
      return next;
    });
  };

  const markSelectedAsPaid = async () => {
    if (selectedConversionIds.size === 0) return;
    setIsPayingOut(true);
    setPayoutError("");
    try {
      const response = await fetch("/api/admin/conversions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedConversionIds), status: "paid" }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPayoutError(payload.error || "Could not mark the selected conversions as paid.");
        setIsPayingOut(false);
        return;
      }
      setSelectedConversionIds(new Set());
      setIsPayingOut(false);
      void loadAll();
    } catch {
      setPayoutError("Could not mark the selected conversions as paid.");
      setIsPayingOut(false);
    }
  };

  const pendingApplications = affiliates.filter((a) => a.status === "pending");

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f4f2ee] px-6 py-10">
        <p className="text-[15px] text-[#5b5b5b]">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f4f2ee] px-6 py-10">
        <p className="text-[15px] text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f2ee] px-4 py-8 sm:px-6 md:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[28px] text-[#1f1f1f]">Affiliate Program Admin</h1>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="text-[14px] font-medium text-[#7a7368] underline underline-offset-2"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          {[
            { key: "applications" as const, label: `Applications (${pendingApplications.length})` },
            { key: "affiliates" as const, label: `All Affiliates (${affiliates.length})` },
            { key: "conversions" as const, label: `Conversions (${conversions.length})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                tab === t.key ? "bg-[#1f1f1f] text-white" : "bg-white text-[#4f4b45] border border-black/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "applications" && (
          <div className="mt-6 space-y-3">
            {pendingApplications.length === 0 ? (
              <p className="text-[15px] text-[#7a7368]">No pending applications.</p>
            ) : (
              pendingApplications.map((affiliate) => (
                <div
                  key={affiliate.id}
                  className="flex flex-col gap-3 rounded-[14px] border border-black/8 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[#1f1f1f]">{affiliate.full_name}</p>
                    <p className="text-[13px] text-[#7a7368]">{affiliate.email}</p>
                    <p className="text-[13px] text-[#7a7368]">
                      {affiliate.phone || "No phone"} · {affiliate.city || "No city"}
                    </p>
                    <p className="text-[13px] text-[#7a7368]">Code: {affiliate.referral_code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateAffiliateStatus(affiliate.id, "approved")}
                      className="rounded-[8px] bg-green-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAffiliateStatus(affiliate.id, "rejected")}
                      className="rounded-[8px] border border-black/10 px-4 py-2 text-[13px] font-medium text-[#4f4b45] hover:bg-black/5"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "affiliates" && (
          <div className="mt-6 overflow-x-auto rounded-[14px] border border-black/8 bg-white">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-black/8 text-[13px] uppercase tracking-wide text-[#7a7368]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Payout Details</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1f1f1f]">{affiliate.full_name}</p>
                      <p className="text-[12px] text-[#7a7368]">{affiliate.email}</p>
                      <p className="text-[12px] text-[#7a7368]">
                        {affiliate.phone || "No phone"} · {affiliate.city || "No city"}
                      </p>
                    </td>
                    <td className="px-4 py-3">{affiliate.referral_code}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={affiliate.status} />
                    </td>
                    <td className="px-4 py-3">{Math.round(affiliate.commission_rate * 100)}%</td>
                    <td className="px-4 py-3">
                      <PayoutDetails affiliate={affiliate} />
                    </td>
                    <td className="px-4 py-3">
                      {affiliate.status === "approved" ? (
                        <button
                          type="button"
                          onClick={() => updateAffiliateStatus(affiliate.id, "suspended")}
                          className="text-[13px] font-medium text-red-600 underline underline-offset-2"
                        >
                          Suspend
                        </button>
                      ) : affiliate.status === "suspended" ? (
                        <button
                          type="button"
                          onClick={() => updateAffiliateStatus(affiliate.id, "approved")}
                          className="text-[13px] font-medium text-green-700 underline underline-offset-2"
                        >
                          Reinstate
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "conversions" && (
          <div className="mt-6">
            {selectedConversionIds.size > 0 && (
              <div className="mb-3 flex flex-col gap-3 rounded-[14px] border border-black/8 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[14px] font-medium text-[#1f1f1f]">
                    {selectedConversionIds.size} order{selectedConversionIds.size > 1 ? "s" : ""}{" "}
                    selected · {formatCurrency(selectedTotal)}
                  </p>
                  <p className="text-[12px] text-[#7a7368]">
                    One payout email will be sent covering all selected orders.
                  </p>
                  {payoutError && <p className="mt-1 text-[12px] text-red-600">{payoutError}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedConversionIds(new Set())}
                    className="rounded-[8px] border border-black/10 px-4 py-2 text-[13px] font-medium text-[#4f4b45] hover:bg-black/5"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={markSelectedAsPaid}
                    disabled={isPayingOut}
                    className="rounded-[8px] bg-green-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPayingOut ? "Marking Paid..." : `Mark Selected as Paid (${formatCurrency(selectedTotal)})`}
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto rounded-[14px] border border-black/8 bg-white">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b border-black/8 text-[13px] uppercase tracking-wide text-[#7a7368]">
                <tr>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Affiliate</th>
                  <th className="px-4 py-3">WC Order</th>
                  <th className="px-4 py-3">Order Total</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Payout Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conversion) => {
                  const canSelect =
                    conversion.status === "approved" &&
                    (selectedAffiliateId === null || conversion.affiliate_id === selectedAffiliateId);
                  return (
                  <tr key={conversion.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3">
                      {conversion.status === "approved" && (
                        <input
                          type="checkbox"
                          checked={selectedConversionIds.has(conversion.id)}
                          disabled={!canSelect}
                          onChange={() => toggleConversionSelection(conversion)}
                          className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Select order #${conversion.wc_order_id} for payout`}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1f1f1f]">
                        {conversion.affiliates?.full_name || `#${conversion.affiliate_id}`}
                      </p>
                      <p className="text-[12px] text-[#7a7368]">
                        {conversion.affiliates?.referral_code}
                      </p>
                    </td>
                    <td className="px-4 py-3">#{conversion.wc_order_id}</td>
                    <td className="px-4 py-3">{formatCurrency(conversion.order_total)}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(conversion.commission_amount)}
                    </td>
                    <td className="px-4 py-3">
                      {conversion.affiliates ? (
                        <PayoutDetails affiliate={conversion.affiliates} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={conversion.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {conversion.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => updateConversionStatus(conversion.id, "approved")}
                            className="text-[13px] font-medium text-blue-700 underline underline-offset-2"
                          >
                            Approve
                          </button>
                        )}
                        {conversion.status !== "voided" && conversion.status !== "paid" && (
                          <button
                            type="button"
                            onClick={() => updateConversionStatus(conversion.id, "voided")}
                            className="text-[13px] font-medium text-red-600 underline underline-offset-2"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
