type WooBillingPayload = {
  email?: unknown;
  phone?: unknown;
};

type WooMetaDataPayload = {
  id?: unknown;
  key?: unknown;
  value?: unknown;
};

type WooOrderPayload = {
  id?: unknown;
  number?: unknown;
  status?: unknown;
  total?: unknown;
  currency?: unknown;
  order_key?: unknown;
  checkout_payment_url?: unknown;
  payment_method_title?: unknown;
  transaction_id?: unknown;
  billing?: WooBillingPayload;
  meta_data?: WooMetaDataPayload[];
};

export type WooMetaDataItem = {
  id?: number;
  key: string;
  value: string;
};

export type WooOrderSummary = {
  orderId: number | null;
  orderNumber: string;
  orderKey: string;
  status: string;
  total: string;
  currency: string;
  paymentUrl: string | null;
  paymentMethodTitle: string;
  transactionId: string;
  billingEmail: string;
  billingPhone: string;
  metaData: WooMetaDataItem[];
};

export type CheckoutPaymentState = "success" | "pending" | "failed";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";
const DEFAULT_WP_JSON_PREFIX = "/wp-json";

export const sanitizeText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export const ensurePositiveInt = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const integer = Math.floor(parsed);
  return integer > 0 ? integer : null;
};

const toBasicAuthToken = (username: string, password: string) =>
  Buffer.from(`${username}:${password}`).toString("base64");

const parseMetaData = (value: unknown): WooMetaDataItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): WooMetaDataItem | null => {
      const record = item as WooMetaDataPayload;
      const key = sanitizeText(record?.key);
      if (!key) return null;

      const rawValue = record?.value;
      const normalizedValue =
        typeof rawValue === "string"
          ? rawValue
          : rawValue === null || rawValue === undefined
            ? ""
            : JSON.stringify(rawValue);

      const id = ensurePositiveInt(record?.id);
      return id
        ? { id, key, value: normalizedValue }
        : { key, value: normalizedValue };
    })
    .filter((item): item is WooMetaDataItem => item !== null);
};

const buildOrderPayUrl = (siteUrl: string, orderId: number | null, orderKey: string) => {
  if (!orderId || !orderKey) return null;
  return `${siteUrl}/checkout/order-pay/${orderId}/?pay_for_order=true&key=${orderKey}`;
};

const parseWooOrderSummary = (payload: WooOrderPayload, siteUrl: string): WooOrderSummary => {
  const orderId = ensurePositiveInt(payload.id);
  const orderKey = sanitizeText(payload.order_key);
  const checkoutPaymentUrl = sanitizeText(payload.checkout_payment_url);

  return {
    orderId,
    orderNumber: sanitizeText(payload.number) || `${orderId || ""}`,
    orderKey,
    status: sanitizeText(payload.status),
    total: sanitizeText(payload.total),
    currency: sanitizeText(payload.currency) || "INR",
    paymentUrl: checkoutPaymentUrl || buildOrderPayUrl(siteUrl, orderId, orderKey),
    paymentMethodTitle: sanitizeText(payload.payment_method_title),
    transactionId: sanitizeText(payload.transaction_id),
    billingEmail: sanitizeText(payload.billing?.email),
    billingPhone: sanitizeText(payload.billing?.phone),
    metaData: parseMetaData(payload.meta_data),
  };
};

const buildWooErrorMessage = ({
  payload,
  status,
  url,
  rawText,
}: {
  payload: unknown;
  status: number;
  url: string;
  rawText: string;
}) => {
  if (payload && typeof payload === "object") {
    const message = sanitizeText((payload as { message?: unknown }).message);
    if (message) {
      return `${message} [${status}] ${url}`;
    }
  }

  const responsePreview = sanitizeText(rawText).slice(0, 180);
  return responsePreview
    ? `WooCommerce request failed (${status}) at ${url}. Response: ${responsePreview}`
    : `WooCommerce request failed (${status}) at ${url}.`;
};

const getWooCommerceConfig = () => {
  const siteUrlRaw =
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL;
  const siteUrl = siteUrlRaw.replace(/\/+$/, "");

  // Optional override: allow a different origin for the Woo REST API.
  // Example: storefront at artacestudio.com, WordPress/Woo API at api.artacestudio.com.
  const restUrlRaw = sanitizeText(process.env.WOOCOMMERCE_REST_URL) || siteUrl;
  const restUrl = restUrlRaw.replace(/\/+$/, "");

  // Optional override: allow different WP JSON prefix if WordPress is installed in a subdirectory.
  // Example: /wp, /wordpress, etc.
  const wpJsonPrefixRaw =
    sanitizeText(process.env.WOOCOMMERCE_WP_JSON_PREFIX) || DEFAULT_WP_JSON_PREFIX;
  const wpJsonPrefix = (wpJsonPrefixRaw.startsWith("/") ? wpJsonPrefixRaw : `/${wpJsonPrefixRaw}`)
    .replace(/\/+$/, "");

  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const paymentMethod = process.env.WOOCOMMERCE_PAYMENT_METHOD || "razorpay";
  const paymentMethodTitle = process.env.WOOCOMMERCE_PAYMENT_METHOD_TITLE || "Razorpay";

  return {
    siteUrl,
    restUrl,
    wpJsonPrefix,
    consumerKey,
    consumerSecret,
    paymentMethod,
    paymentMethodTitle,
  };
};

const getWooCommerceAuthHeaders = () => {
  const { consumerKey, consumerSecret } = getWooCommerceConfig();

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      "WooCommerce API credentials are missing. Set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET."
    );
  }

  return {
    Authorization: `Basic ${toBasicAuthToken(consumerKey, consumerSecret)}`,
    "Content-Type": "application/json",
  };
};

const requestWooCommerce = async (
  route: string,
  init?: RequestInit
): Promise<WooOrderSummary> => {
  const { siteUrl, restUrl, wpJsonPrefix } = getWooCommerceConfig();
  const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
  const wpJsonPath = `${wpJsonPrefix}${normalizedRoute}`;

  const doFetch = async (url: string) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...getWooCommerceAuthHeaders(),
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

    const rawText = await response.text();
    let parsed: WooOrderPayload | { message?: string } = {};

    try {
      parsed = rawText ? (JSON.parse(rawText) as WooOrderPayload | { message?: string }) : {};
    } catch {
      parsed = {};
    }

    return { response, rawText, parsed };
  };

  const primaryUrl = `${restUrl}${wpJsonPath}`;
  const primary = await doFetch(primaryUrl);

  // Fallback for servers without /wp-json rewrite routing:
  // retry with ?rest_route=/wc/v3/... when /wp-json/* returns 404.
  if (primary.response.status === 404) {
    const fallbackUrl = `${restUrl}/?rest_route=${encodeURIComponent(normalizedRoute)}`;
    const fallback = await doFetch(fallbackUrl);

    if (!fallback.response.ok) {
      throw new Error(
        buildWooErrorMessage({
          payload: fallback.parsed,
          status: fallback.response.status,
          url: fallbackUrl,
          rawText: fallback.rawText,
        })
      );
    }

    return parseWooOrderSummary(fallback.parsed as WooOrderPayload, siteUrl);
  }

  if (!primary.response.ok) {
    throw new Error(
      buildWooErrorMessage({
        payload: primary.parsed,
        status: primary.response.status,
        url: primaryUrl,
        rawText: primary.rawText,
      })
    );
  }

  return parseWooOrderSummary(primary.parsed as WooOrderPayload, siteUrl);
};

export const createWooCommerceOrder = async (payload: Record<string, unknown>) =>
  requestWooCommerce("/wc/v3/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getWooCommerceOrder = async (orderId: number) =>
  requestWooCommerce(`/wc/v3/orders/${orderId}`, {
    method: "GET",
  });

export const updateWooCommerceOrder = async (
  orderId: number,
  payload: Record<string, unknown>
) =>
  requestWooCommerce(`/wc/v3/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const mergeWooMetaData = (
  existing: WooMetaDataItem[],
  updates: Record<string, string>
) => {
  const byKey = new Map(existing.map((item) => [item.key, item]));

  for (const [key, value] of Object.entries(updates)) {
    const current = byKey.get(key);
    byKey.set(key, {
      id: current?.id,
      key,
      value,
    });
  }

  return Array.from(byKey.values()).map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    key: item.key,
    value: item.value,
  }));
};

export const mapWooOrderStatusToPaymentState = (status: string): CheckoutPaymentState => {
  const normalized = sanitizeText(status).toLowerCase();

  if (normalized === "processing" || normalized === "completed") {
    return "success";
  }

  if (normalized === "failed" || normalized === "cancelled" || normalized === "refunded") {
    return "failed";
  }

  return "pending";
};

export const parseAmountToMinorUnits = (amount: string) => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
};

export const getWooCommercePaymentConfig = () => {
  const { paymentMethod, paymentMethodTitle } = getWooCommerceConfig();
  return { paymentMethod, paymentMethodTitle };
};
