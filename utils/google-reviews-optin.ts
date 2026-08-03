"use client";

export const GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID = 689111711;

const PLATFORM_SCRIPT_URL = "https://apis.google.com/js/platform.js?onload=renderOptIn";
const DEFAULT_DELIVERY_DAYS = 15;

const DELIVERY_DAYS_BY_COUNTRY: Record<string, number> = {
  IN: 7,
  AE: 10,
  AU: 12,
  US: 12,
  CA: 14,
  GB: 14,
  IE: 14,
  NZ: 14,
  SG: 10,
};

declare global {
  interface Window {
    renderOptIn?: () => void;
    gapi?: {
      load: (library: string, callback: () => void) => void;
      surveyoptin?: {
        render: (config: Record<string, unknown>) => void;
      };
    };
  }
}

type GoogleCustomerReviewsOptInOptions = {
  orderId: number;
  email: string;
  deliveryCountry?: string;
  orderDate?: string;
};

let optInPayload: Record<string, unknown> | null = null;
let platformScriptLoaded = false;

const getEstimatedDeliveryDate = (orderDate?: string, deliveryCountry?: string) => {
  const base = orderDate ? new Date(orderDate) : new Date();
  if (Number.isNaN(base.getTime())) return null;

  const countryCode = (deliveryCountry || "").toUpperCase();
  const days = DELIVERY_DAYS_BY_COUNTRY[countryCode] ?? DEFAULT_DELIVERY_DAYS;
  const estimate = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  return estimate.toISOString().slice(0, 10);
};

const defineRenderOptIn = () => {
  if (window.renderOptIn) return;

  window.renderOptIn = () => {
    window.gapi?.load("surveyoptin", () => {
      if (optInPayload) {
        window.gapi?.surveyoptin?.render(optInPayload);
      }
    });
  };
};

const loadPlatformScript = () => {
  if (platformScriptLoaded) return;
  platformScriptLoaded = true;

  const script = document.createElement("script");
  script.src = PLATFORM_SCRIPT_URL;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

export const renderGoogleCustomerReviewsOptIn = ({
  orderId,
  email,
  deliveryCountry,
  orderDate,
}: GoogleCustomerReviewsOptInOptions) => {
  if (typeof window === "undefined" || !email) return;

  const estimatedDeliveryDate = getEstimatedDeliveryDate(orderDate, deliveryCountry);
  if (!estimatedDeliveryDate) return;

  optInPayload = {
    merchant_id: GOOGLE_CUSTOMER_REVIEWS_MERCHANT_ID,
    order_id: String(orderId),
    email,
    delivery_country: (deliveryCountry || "IN").toUpperCase(),
    estimated_delivery_date: estimatedDeliveryDate,
  };

  defineRenderOptIn();
  loadPlatformScript();
};
