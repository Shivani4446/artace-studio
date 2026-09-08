import { POINTS_PER_RUPEE_SPENT } from "./constants";

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

// Same fetch-based REST pattern already used for Supabase in
// lib/api-route-handlers/checkout/route.ts (findApprovedAffiliateByCode /
// recordAffiliateConversion) — not the @supabase/supabase-js client, so
// this doesn't introduce a second way of talking to Supabase.
const supabaseHeaders = (extra?: Record<string, string>) => ({
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  ...extra,
});

export type LedgerEntry = {
  id: number;
  wp_customer_id: string;
  wc_order_id: number | null;
  points: number;
  type: "earn" | "redeem" | "clawback";
  description: string;
  created_at: string;
};

export const calculatePointsEarned = (orderTotal: number): number => {
  if (!Number.isFinite(orderTotal) || orderTotal <= 0) return 0;
  return Math.floor(orderTotal * POINTS_PER_RUPEE_SPENT);
};

export const getPointsBalance = async (wpCustomerId: string): Promise<number> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !wpCustomerId) return 0;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wp_customer_id=eq.${encodeURIComponent(
        wpCustomerId
      )}&select=points`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return 0;
    const rows = (await response.json()) as { points: number }[];
    return Array.isArray(rows) ? rows.reduce((sum, row) => sum + row.points, 0) : 0;
  } catch {
    return 0;
  }
};

export const getLedgerHistory = async (
  wpCustomerId: string
): Promise<{ id: number; date: string; description: string; points: number; type: string }[]> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !wpCustomerId) return [];

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wp_customer_id=eq.${encodeURIComponent(
        wpCustomerId
      )}&select=id,created_at,description,points,type&order=created_at.desc`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return [];
    const rows = (await response.json()) as LedgerEntry[];
    return rows.map((row) => ({
      id: row.id,
      date: row.created_at,
      description: row.description,
      points: row.points,
      type: row.type,
    }));
  } catch {
    return [];
  }
};

const insertLedgerRow = async (row: {
  wp_customer_id: string;
  wc_order_id: number | null;
  points: number;
  type: "earn" | "redeem" | "clawback";
  description: string;
}): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;

  await fetch(`${SUPABASE_URL}/rest/v1/rewards_ledger`, {
    method: "POST",
    headers: supabaseHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(row),
  });
};

export const creditPoints = async (input: {
  wpCustomerId: string;
  wcOrderId: number;
  points: number;
  description: string;
}): Promise<void> => {
  if (input.points <= 0) return;
  await insertLedgerRow({
    wp_customer_id: input.wpCustomerId,
    wc_order_id: input.wcOrderId,
    points: input.points,
    type: "earn",
    description: input.description,
  });
};

export const debitPoints = async (input: {
  wpCustomerId: string;
  wcOrderId: number;
  points: number;
  description: string;
}): Promise<void> => {
  if (input.points <= 0) return;
  await insertLedgerRow({
    wp_customer_id: input.wpCustomerId,
    wc_order_id: input.wcOrderId,
    points: -input.points,
    type: "redeem",
    description: input.description,
  });
};

const hasClawbackForOrder = async (wcOrderId: number): Promise<boolean> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return true; // fail closed — don't double-write if we can't check

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wc_order_id=eq.${wcOrderId}&type=eq.clawback&select=id&limit=1`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return true;
    const rows = (await response.json()) as { id: number }[];
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return true;
  }
};

export const clawbackPointsForOrder = async (wcOrderId: number): Promise<void> => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return;
  if (await hasClawbackForOrder(wcOrderId)) return;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rewards_ledger?wc_order_id=eq.${wcOrderId}&type=in.(earn,redeem)&select=points,wp_customer_id`,
      { headers: supabaseHeaders() }
    );
    if (!response.ok) return;
    const rows = (await response.json()) as { points: number; wp_customer_id: string }[];
    if (rows.length === 0) return;

    const netPoints = rows.reduce((sum, row) => sum + row.points, 0);
    if (netPoints === 0) return;

    // Every row for one order shares the same customer — safe to read it
    // off the first row now that the length check above guarantees one exists.
    const wpCustomerId = rows[0].wp_customer_id;

    await insertLedgerRow({
      wp_customer_id: wpCustomerId,
      wc_order_id: wcOrderId,
      points: -netPoints,
      type: "clawback",
      description: `Refund/cancellation adjustment for Order #${wcOrderId}`,
    });
  } catch {
    // Never let a clawback failure crash the webhook response.
  }
};
