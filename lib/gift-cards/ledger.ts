import { generateGiftCardCode } from "./code";

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

const supabaseHeaders = (extra?: Record<string, string>) => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  ...extra,
});

type GiftCardRow = {
  id: number;
  code: string;
  remaining_balance: number;
  status: string;
};

const MAX_CODE_ATTEMPTS = 5;

export const createGiftCard = async (input: {
  amount: number;
  purchaserEmail: string;
  wcOrderId: number;
}): Promise<{ code: string }> => {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateGiftCardCode();

    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?code=eq.${encodeURIComponent(code)}&select=id&limit=1`,
      { headers: supabaseHeaders() }
    );
    const existing = existingRes.ok ? ((await existingRes.json()) as { id: number }[]) : [];
    if (Array.isArray(existing) && existing.length > 0) continue; // Vanishingly rare collision — retry with a new code.

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/gift_cards`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        code,
        original_amount: input.amount,
        remaining_balance: input.amount,
        purchaser_email: input.purchaserEmail,
        wc_order_id: input.wcOrderId,
        status: "active",
      }),
    });
    if (!insertRes.ok) continue;

    return { code };
  }

  throw new Error("Could not generate a unique gift card code after several attempts.");
};

export const getGiftCardBalance = async (
  code: string
): Promise<{ found: boolean; remainingBalance: number; status: string }> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !code) {
    return { found: false, remainingBalance: 0, status: "" };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?code=eq.${encodeURIComponent(code)}&select=remaining_balance,status&limit=1`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return { found: false, remainingBalance: 0, status: "" };
    const rows = (await response.json()) as { remaining_balance: number; status: string }[];
    if (!Array.isArray(rows) || rows.length === 0) return { found: false, remainingBalance: 0, status: "" };
    return { found: true, remainingBalance: rows[0].remaining_balance, status: rows[0].status };
  } catch {
    return { found: false, remainingBalance: 0, status: "" };
  }
};

export const redeemGiftCard = async (input: {
  code: string;
  wcOrderId: number;
  amount: number;
}): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || input.amount <= 0) return;

  try {
    // Re-read the current balance immediately before writing — never trust
    // a balance read earlier in the request, same discipline as the Loyalty ledger.
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/gift_cards?code=eq.${encodeURIComponent(input.code)}&select=id,remaining_balance`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return;
    const rows = (await response.json()) as GiftCardRow[];
    if (!Array.isArray(rows) || rows.length === 0) return;

    const card = rows[0];
    const newBalance = Math.max(0, card.remaining_balance - input.amount);

    await fetch(`${SUPABASE_URL}/rest/v1/gift_cards?id=eq.${card.id}`, {
      method: "PATCH",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        remaining_balance: newBalance,
        status: newBalance === 0 ? "depleted" : "active",
      }),
    });

    await fetch(`${SUPABASE_URL}/rest/v1/gift_card_redemptions`, {
      method: "POST",
      headers: supabaseHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        gift_card_id: card.id,
        wc_order_id: input.wcOrderId,
        amount_redeemed: input.amount,
      }),
    });
  } catch {
    // Never let a redemption-logging failure affect the checkout response —
    // same defensive posture as every other ledger write this engagement.
  }
};
