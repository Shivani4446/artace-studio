"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";

type AffiliateStatus = "none" | "pending" | "approved" | "rejected" | "suspended";

type AffiliateApiResponse = {
  status: AffiliateStatus;
  affiliate?: {
    referralCode: string;
    fullName: string;
    commissionRate?: number;
    payoutMethod?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    upiId?: string;
  };
  stats?: {
    clickCount: number;
    conversionCount: number;
    totalEarned: number;
    pendingEarned: number;
    paidEarned: number;
  };
  error?: string;
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

export default function DashboardAffiliate() {
  const { session } = useAuthSession();
  const [data, setData] = useState<AffiliateApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [applyStatus, setApplyStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [applyError, setApplyError] = useState("");
  const [copied, setCopied] = useState(false);
  const [applyPhone, setApplyPhone] = useState("");
  const [applyCity, setApplyCity] = useState("");

  const loadStatus = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/affiliate", { cache: "no-store" });
      const payload = (await response.json()) as AffiliateApiResponse;
      if (!response.ok) {
        setLoadError(payload.error || "Unable to load your affiliate status right now.");
        setIsLoading(false);
        return;
      }
      setData(payload);
      setIsLoading(false);
    } catch {
      setLoadError("Unable to load your affiliate status right now.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleApply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApplyStatus("submitting");
    setApplyError("");
    try {
      const response = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: applyPhone, city: applyCity }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setApplyError(payload.error || "Could not submit your application.");
        setApplyStatus("error");
        return;
      }
      setApplyStatus("idle");
      void loadStatus();
    } catch {
      setApplyError("Could not submit your application.");
      setApplyStatus("error");
    }
  };

  const [payoutMethod, setPayoutMethod] = useState<"bank" | "upi">("upi");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [payoutSaveStatus, setPayoutSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [payoutSaveError, setPayoutSaveError] = useState("");

  useEffect(() => {
    if (data?.status !== "approved" || !data.affiliate) return;
    if (data.affiliate.payoutMethod === "bank") setPayoutMethod("bank");
    else if (data.affiliate.payoutMethod === "upi") setPayoutMethod("upi");
    setBankAccountName(data.affiliate.bankAccountName || "");
    setBankAccountNumber(data.affiliate.bankAccountNumber || "");
    setBankIfsc(data.affiliate.bankIfsc || "");
    setUpiId(data.affiliate.upiId || "");
  }, [data]);

  const handleSavePayoutDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPayoutSaveStatus("saving");
    setPayoutSaveError("");
    try {
      const response = await fetch("/api/affiliate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutMethod,
          bankAccountName,
          bankAccountNumber,
          bankIfsc,
          upiId,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPayoutSaveError(payload.error || "Could not save your payout details.");
        setPayoutSaveStatus("error");
        return;
      }
      setPayoutSaveStatus("saved");
      setTimeout(() => setPayoutSaveStatus("idle"), 2000);
    } catch {
      setPayoutSaveError("Could not save your payout details.");
      setPayoutSaveStatus("error");
    }
  };

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can fail silently (permissions) — not worth surfacing.
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[16px] border border-black/8 bg-white p-6">
        <p className="text-[15px] text-[#5b5b5b]">Loading your affiliate status...</p>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="rounded-[16px] border border-black/8 bg-white p-6">
        <p className="text-[15px] text-red-600">{loadError || "Something went wrong."}</p>
      </div>
    );
  }

  if (data.status === "none") {
    return (
      <div className="rounded-[16px] border border-black/8 bg-white p-6 sm:p-8">
        <h2 className="font-display text-[26px] leading-[1.1] text-[#1f1f1f] sm:text-[30px]">
          Join the Artace Studio Affiliate Program
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5b5b5b]">
          Share your unique referral link and earn a commission on every order it
          brings in — 10% to start, with higher tiers as your referrals grow.
        </p>
        <p className="mt-4 text-[14px] text-[#7a7368]">
          Applying as{" "}
          <span className="font-medium text-[#1f1f1f]">
            {session?.user?.name || session?.user?.email}
          </span>
        </p>
        <form onSubmit={handleApply} className="mt-5 grid gap-4 sm:grid-cols-2 sm:max-w-lg">
          <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
            Mobile Number
            <input
              type="tel"
              value={applyPhone}
              onChange={(event) => setApplyPhone(event.target.value)}
              placeholder="+91 00000 00000"
              required
              className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
            />
          </label>
          <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
            City
            <input
              type="text"
              value={applyCity}
              onChange={(event) => setApplyCity(event.target.value)}
              placeholder="Pune"
              required
              className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
            />
          </label>
          <button
            type="submit"
            disabled={applyStatus === "submitting"}
            className="mt-1 inline-flex min-h-[48px] items-center justify-center rounded-[12px] bg-[#1a1a1a] px-6 text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:w-fit"
          >
            {applyStatus === "submitting" ? "Submitting..." : "Apply Now"}
          </button>
        </form>
        {applyStatus === "error" ? (
          <p className="mt-3 text-[14px] text-red-600">{applyError}</p>
        ) : null}
      </div>
    );
  }

  if (data.status === "pending") {
    return (
      <div className="rounded-[16px] border border-black/8 bg-white p-6 sm:p-8">
        <h2 className="font-display text-[26px] leading-[1.1] text-[#1f1f1f] sm:text-[30px]">
          Application Under Review
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5b5b5b]">
          Thanks for applying! We review every application personally — you&apos;ll
          hear from us once it&apos;s approved.
        </p>
      </div>
    );
  }

  if (data.status === "rejected" || data.status === "suspended") {
    return (
      <div className="rounded-[16px] border border-black/8 bg-white p-6 sm:p-8">
        <h2 className="font-display text-[26px] leading-[1.1] text-[#1f1f1f] sm:text-[30px]">
          Affiliate Account {data.status === "rejected" ? "Not Approved" : "Suspended"}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#5b5b5b]">
          If you have questions about your affiliate account, reach out via Contact
          Support.
        </p>
      </div>
    );
  }

  // approved
  const referralCode = data.affiliate?.referralCode || "";
  const referralLink = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${referralCode}`
    : "";
  const commissionRate = data.affiliate?.commissionRate ?? 0.1;
  const stats = data.stats;

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-black/8 bg-white p-6 sm:p-8">
        <h2 className="font-display text-[26px] leading-[1.1] text-[#1f1f1f] sm:text-[30px]">
          Your Referral Link
        </h2>
        <p className="mt-2 text-[14px] text-[#7a7368]">
          Share this link anywhere — or add{" "}
          <code className="rounded bg-[#f4efe7] px-1.5 py-0.5">?ref={referralCode}</code>{" "}
          to any Artace Studio page URL to track referrals to that specific page.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none"
          />
          <button
            type="button"
            onClick={() => handleCopy(referralLink)}
            className="min-h-[48px] shrink-0 rounded-[12px] bg-[#1a1a1a] px-6 text-[15px] font-medium text-white transition-colors hover:bg-black"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        <p className="mt-4 text-[14px] text-[#7a7368]">
          Current commission rate:{" "}
          <span className="font-medium text-[#1f1f1f]">
            {Math.round(commissionRate * 100)}%
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-[14px] border border-black/8 bg-white p-4 text-center">
          <p className="font-display text-[24px] text-[#1f1f1f]">{stats?.clickCount ?? 0}</p>
          <p className="mt-1 text-[13px] text-[#7a7368]">Clicks</p>
        </div>
        <div className="rounded-[14px] border border-black/8 bg-white p-4 text-center">
          <p className="font-display text-[24px] text-[#1f1f1f]">
            {stats?.conversionCount ?? 0}
          </p>
          <p className="mt-1 text-[13px] text-[#7a7368]">Orders Referred</p>
        </div>
        <div className="rounded-[14px] border border-black/8 bg-white p-4 text-center">
          <p className="font-display text-[24px] text-[#1f1f1f]">
            {formatCurrency(stats?.totalEarned ?? 0)}
          </p>
          <p className="mt-1 text-[13px] text-[#7a7368]">Total Earned</p>
        </div>
        <div className="rounded-[14px] border border-black/8 bg-white p-4 text-center">
          <p className="font-display text-[24px] text-[#1f1f1f]">
            {formatCurrency(stats?.paidEarned ?? 0)}
          </p>
          <p className="mt-1 text-[13px] text-[#7a7368]">Paid Out</p>
        </div>
      </div>

      <form
        onSubmit={handleSavePayoutDetails}
        className="rounded-[16px] border border-black/8 bg-white p-6 sm:p-8"
      >
        <h2 className="font-display text-[22px] leading-[1.1] text-[#1f1f1f]">
          Payout Details
        </h2>
        <p className="mt-2 text-[14px] text-[#7a7368]">
          Tell us how you&apos;d like to be paid — we&apos;ll use these details when
          your commission is paid out.
        </p>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setPayoutMethod("upi")}
            className={`rounded-[10px] border px-4 py-2 text-[14px] font-medium transition-colors ${
              payoutMethod === "upi"
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-black/10 text-[#4f4b45]"
            }`}
          >
            UPI
          </button>
          <button
            type="button"
            onClick={() => setPayoutMethod("bank")}
            className={`rounded-[10px] border px-4 py-2 text-[14px] font-medium transition-colors ${
              payoutMethod === "bank"
                ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                : "border-black/10 text-[#4f4b45]"
            }`}
          >
            Bank Transfer
          </button>
        </div>

        {payoutMethod === "upi" ? (
          <label className="mt-4 flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
            UPI ID
            <input
              type="text"
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="yourname@upi"
              className="min-h-[48px] w-full max-w-md rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
            />
          </label>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
              Account Holder Name
              <input
                type="text"
                value={bankAccountName}
                onChange={(event) => setBankAccountName(event.target.value)}
                className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
              />
            </label>
            <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
              Account Number
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(event) => setBankAccountNumber(event.target.value)}
                className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
              />
            </label>
            <label className="flex flex-col gap-2 text-[14px] font-medium text-[#313131]">
              IFSC Code
              <input
                type="text"
                value={bankIfsc}
                onChange={(event) => setBankIfsc(event.target.value)}
                className="min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
              />
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={payoutSaveStatus === "saving"}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#1a1a1a] px-6 text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {payoutSaveStatus === "saving"
            ? "Saving..."
            : payoutSaveStatus === "saved"
              ? "Saved!"
              : "Save Payout Details"}
        </button>
        {payoutSaveStatus === "error" ? (
          <p className="mt-3 text-[14px] text-red-600">{payoutSaveError}</p>
        ) : null}
      </form>
    </div>
  );
}
