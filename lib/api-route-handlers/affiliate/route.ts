import { NextRequest, NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import { generateReferralCode } from "@/lib/affiliates/codes";

export const runtime = "edge";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env["Project URL"] ||
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env["Anon Key"] ||
  "";

const CONTACT_TO_EMAIL =
  process.env.CORPORATE_CONTACT_EMAIL || process.env.CONTACT_TO_EMAIL || "info@artacestudio.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "";

type AffiliateRow = {
  id: number;
  referral_code: string;
  full_name: string;
  email: string;
  status: string;
  commission_rate: number;
  created_at: string;
  payout_method?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  upi_id?: string | null;
};

const supabaseHeaders = () => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
});

const findAffiliateByCustomerId = async (
  wpCustomerId: string
): Promise<AffiliateRow | null> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/affiliates?wp_customer_id=eq.${encodeURIComponent(
      wpCustomerId
    )}&select=id,referral_code,full_name,email,status,commission_rate,created_at,payout_method,bank_account_name,bank_account_number,bank_ifsc,upi_id&limit=1`,
    { headers: supabaseHeaders() }
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as AffiliateRow[];
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

const countRows = async (
  table: string,
  affiliateId: number
): Promise<number> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?affiliate_id=eq.${affiliateId}&select=id`,
    {
      headers: {
        ...supabaseHeaders(),
        Prefer: "count=exact",
      },
    }
  );
  if (!response.ok) return 0;
  const range = response.headers.get("content-range"); // "0-4/5"
  if (!range) return 0;
  const total = Number(range.split("/")[1]);
  return Number.isFinite(total) ? total : 0;
};

type ConversionRow = {
  commission_amount: number;
  status: string;
};

const getConversionTotals = async (affiliateId: number) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/affiliate_conversions?affiliate_id=eq.${affiliateId}&select=commission_amount,status`,
    { headers: supabaseHeaders() }
  );
  if (!response.ok) {
    return { totalCount: 0, totalEarned: 0, pendingEarned: 0, paidEarned: 0 };
  }
  const rows = (await response.json()) as ConversionRow[];
  const totals = rows.reduce(
    (acc, row) => {
      const amount = Number(row.commission_amount) || 0;
      acc.totalEarned += amount;
      if (row.status === "paid") acc.paidEarned += amount;
      else if (row.status === "pending" || row.status === "approved") acc.pendingEarned += amount;
      return acc;
    },
    { totalCount: rows.length, totalEarned: 0, pendingEarned: 0, paidEarned: 0 }
  );
  return totals;
};

export async function GET(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  const userId = session?.user?.id || "";

  if (!userId) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Affiliate program is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const affiliate = await findAffiliateByCustomerId(userId);

    if (!affiliate) {
      return NextResponse.json({ status: "none" });
    }

    if (affiliate.status !== "approved") {
      return NextResponse.json({
        status: affiliate.status,
        affiliate: {
          referralCode: affiliate.referral_code,
          fullName: affiliate.full_name,
        },
      });
    }

    const [clickCount, conversionTotals] = await Promise.all([
      countRows("affiliate_clicks", affiliate.id),
      getConversionTotals(affiliate.id),
    ]);

    return NextResponse.json({
      status: "approved",
      affiliate: {
        referralCode: affiliate.referral_code,
        fullName: affiliate.full_name,
        commissionRate: affiliate.commission_rate,
        payoutMethod: affiliate.payout_method || "",
        bankAccountName: affiliate.bank_account_name || "",
        bankAccountNumber: affiliate.bank_account_number || "",
        bankIfsc: affiliate.bank_ifsc || "",
        upiId: affiliate.upi_id || "",
      },
      stats: {
        clickCount,
        conversionCount: conversionTotals.totalCount,
        totalEarned: conversionTotals.totalEarned,
        pendingEarned: conversionTotals.pendingEarned,
        paidEarned: conversionTotals.paidEarned,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load your affiliate status right now." },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  const userId = session?.user?.id || "";
  const userName = session?.user?.name || session?.user?.username || "";
  const userEmail = session?.user?.email || "";

  if (!userId) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  if (!userName || !userEmail) {
    return NextResponse.json(
      { error: "Your account is missing a name or email — please update your profile first." },
      { status: 400 }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Affiliate program is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const existing = await findAffiliateByCustomerId(userId);
    if (existing) {
      return NextResponse.json(
        { error: "You've already applied to the affiliate program." },
        { status: 409 }
      );
    }

    const referralCode = generateReferralCode(userName);

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/affiliates`, {
      method: "POST",
      headers: {
        ...supabaseHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        wp_customer_id: userId,
        referral_code: referralCode,
        full_name: userName,
        email: userEmail,
        status: "pending",
        commission_rate: 0.1,
      }),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      return NextResponse.json(
        { error: "Could not submit your application. Please try again.", details: errorText },
        { status: 500 }
      );
    }

    if (RESEND_API_KEY && RESEND_FROM) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [CONTACT_TO_EMAIL],
            subject: `New affiliate application from ${userName}`,
            text: `New affiliate program application:\n\nName: ${userName}\nEmail: ${userEmail}\nReferral code generated: ${referralCode}\n\nApprove by setting status = 'approved' on this affiliate's row in Supabase.`,
          }),
        });
      } catch {
        // Application already saved — a notification-email failure must not
        // fail the request.
      }
    }

    return NextResponse.json({ ok: true, referralCode });
  } catch {
    return NextResponse.json(
      { error: "Could not submit your application. Please try again." },
      { status: 502 }
    );
  }
}

type PayoutDetailsPayload = {
  payoutMethod?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  upiId?: string;
};

export async function PATCH(request: NextRequest) {
  const session = await getAuthSessionFromRequest(request);
  const userId = session?.user?.id || "";

  if (!userId) {
    return NextResponse.json({ error: "Please login first." }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Affiliate program is not configured on the server." },
      { status: 500 }
    );
  }

  let body: PayoutDetailsPayload;
  try {
    body = (await request.json()) as PayoutDetailsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payoutMethod = String(body.payoutMethod || "").trim();
  if (payoutMethod !== "bank" && payoutMethod !== "upi") {
    return NextResponse.json(
      { error: "Please choose a payout method." },
      { status: 400 }
    );
  }

  if (payoutMethod === "upi" && !String(body.upiId || "").trim()) {
    return NextResponse.json({ error: "Please enter a UPI ID." }, { status: 400 });
  }
  if (
    payoutMethod === "bank" &&
    (!String(body.bankAccountName || "").trim() ||
      !String(body.bankAccountNumber || "").trim() ||
      !String(body.bankIfsc || "").trim())
  ) {
    return NextResponse.json(
      { error: "Please fill in all bank details." },
      { status: 400 }
    );
  }

  try {
    const existing = await findAffiliateByCustomerId(userId);
    if (!existing) {
      return NextResponse.json({ error: "No affiliate account found." }, { status: 404 });
    }

    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliates?id=eq.${existing.id}`,
      {
        method: "PATCH",
        headers: {
          ...supabaseHeaders(),
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          payout_method: payoutMethod,
          bank_account_name: payoutMethod === "bank" ? String(body.bankAccountName).trim() : null,
          bank_account_number:
            payoutMethod === "bank" ? String(body.bankAccountNumber).trim() : null,
          bank_ifsc: payoutMethod === "bank" ? String(body.bankIfsc).trim() : null,
          upi_id: payoutMethod === "upi" ? String(body.upiId).trim() : null,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: "Could not save your payout details. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not save your payout details. Please try again." },
      { status: 502 }
    );
  }
}
