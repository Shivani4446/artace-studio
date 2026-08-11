import { NextRequest, NextResponse } from "next/server";
import * as accountProfileRoute from "@/lib/api-route-handlers/account/profile/route";
import * as adminAffiliatesRoute from "@/lib/api-route-handlers/admin/affiliates/route";
import * as adminConversionsRoute from "@/lib/api-route-handlers/admin/conversions/route";
import * as adminLoginRoute from "@/lib/api-route-handlers/admin/login/route";
import * as adminLogoutRoute from "@/lib/api-route-handlers/admin/logout/route";
import * as affiliateRoute from "@/lib/api-route-handlers/affiliate/route";
import * as affiliateClickRoute from "@/lib/api-route-handlers/affiliate-click/route";
import * as authForgotPasswordRoute from "@/lib/api-route-handlers/auth/forgot-password/route";
import * as authLoginRoute from "@/lib/api-route-handlers/auth/login/route";
import * as authLogoutRoute from "@/lib/api-route-handlers/auth/logout/route";
import * as authRegisterRoute from "@/lib/api-route-handlers/auth/register/route";
import * as authResetPasswordRoute from "@/lib/api-route-handlers/auth/reset-password/route";
import * as authSessionRoute from "@/lib/api-route-handlers/auth/session/route";
import * as blogsRoute from "@/lib/api-route-handlers/blogs/route";
import * as chatRoute from "@/lib/api-route-handlers/chat/route";
import * as chatTranscribeRoute from "@/lib/api-route-handlers/chat/transcribe/route";
import * as checkoutCouponRoute from "@/lib/api-route-handlers/checkout/coupon/route";
import * as checkoutPincodeRoute from "@/lib/api-route-handlers/checkout/pincode/route";
import * as checkoutStatusRoute from "@/lib/api-route-handlers/checkout/status/route";
import * as checkoutVerifyRoute from "@/lib/api-route-handlers/checkout/verify/route";
import * as checkoutRoute from "@/lib/api-route-handlers/checkout/route";
import * as contactRoute from "@/lib/api-route-handlers/contact/route";
import * as corporateLeadsRoute from "@/lib/api-route-handlers/corporate-leads/route";
import * as currencyRatesRoute from "@/lib/api-route-handlers/currency/rates/route";
import * as customOrderRoute from "@/lib/api-route-handlers/custom-order/route";
import * as customPortraitsRoute from "@/lib/api-route-handlers/custom-portraits/route";
import * as homepageHighlightsRoute from "@/lib/api-route-handlers/homepage/highlights/route";
import * as ordersRoute from "@/lib/api-route-handlers/orders/route";
import * as photographyOffersRoute from "@/lib/api-route-handlers/photography-offers/route";
import * as razorpayWebhookRoute from "@/lib/api-route-handlers/razorpay/webhook/route";
import * as rentalsRoute from "@/lib/api-route-handlers/rentals/route";
import * as revalidateRoute from "@/lib/api-route-handlers/revalidate/route";
import * as reviewsRoute from "@/lib/api-route-handlers/reviews/route";
import * as searchRoute from "@/lib/api-route-handlers/search/route";
import * as storeProductsRoute from "@/lib/api-route-handlers/store/products/route";
import * as tradeLeadsRoute from "@/lib/api-route-handlers/trade-leads/route";
import * as uploadImageRoute from "@/lib/api-route-handlers/upload-image/route";

export const runtime = "edge";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
type MethodHandler = (request: NextRequest) => Promise<Response> | Response;
type RouteContext = { params: Promise<{ path?: string[] }> | { path?: string[] } };
type RouteHandlers = Partial<Record<Method, MethodHandler>>;

const ROUTES: Record<string, RouteHandlers> = {
  "account/profile": {
    GET: (request) => accountProfileRoute.GET(request),
    PATCH: (request) => accountProfileRoute.PATCH(request),
  },
  affiliate: {
    GET: (request) => affiliateRoute.GET(request),
    POST: (request) => affiliateRoute.POST(request),
    PATCH: (request) => affiliateRoute.PATCH(request),
  },
  "affiliate-click": {
    POST: (request) => affiliateClickRoute.POST(request),
  },
  "admin/affiliates": {
    GET: (request) => adminAffiliatesRoute.GET(request),
    PATCH: (request) => adminAffiliatesRoute.PATCH(request),
  },
  "admin/conversions": {
    GET: (request) => adminConversionsRoute.GET(request),
    PATCH: (request) => adminConversionsRoute.PATCH(request),
  },
  "admin/login": {
    POST: (request) => adminLoginRoute.POST(request),
  },
  "admin/logout": {
    POST: () => adminLogoutRoute.POST(),
  },
  "auth/forgot-password": {
    POST: (request) => authForgotPasswordRoute.POST(request),
  },
  "auth/login": {
    POST: (request) => authLoginRoute.POST(request),
  },
  "auth/logout": {
    POST: () => authLogoutRoute.POST(),
  },
  "auth/register": {
    POST: (request) => authRegisterRoute.POST(request),
  },
  "auth/reset-password": {
    POST: (request) => authResetPasswordRoute.POST(request),
  },
  "auth/session": {
    GET: (request) => authSessionRoute.GET(request),
  },
  blogs: {
    GET: () => blogsRoute.GET(),
  },
  checkout: {
    POST: (request) => checkoutRoute.POST(request),
  },
  "checkout/coupon": {
    GET: (request) => checkoutCouponRoute.GET(request),
  },
  "checkout/pincode": {
    GET: (request) => checkoutPincodeRoute.GET(request),
  },
  "checkout/status": {
    GET: (request) => checkoutStatusRoute.GET(request),
  },
  "checkout/verify": {
    POST: (request) => checkoutVerifyRoute.POST(request),
  },
  chat: {
    POST: (request) => chatRoute.POST(request),
  },
  "chat/transcribe": {
    POST: (request) => chatTranscribeRoute.POST(request),
  },
  contact: {
    POST: (request) => contactRoute.POST(request),
  },
  "corporate-leads": {
    POST: (request) => corporateLeadsRoute.POST(request),
  },
  "currency/rates": {
    GET: () => currencyRatesRoute.GET(),
  },
  "custom-order": {
    POST: (request) => customOrderRoute.POST(request),
  },
  "custom-portraits": {
    POST: (request) => customPortraitsRoute.POST(request),
  },
  "homepage/highlights": {
    GET: () => homepageHighlightsRoute.GET(),
  },
  orders: {
    GET: (request) => ordersRoute.GET(request),
  },
  "photography-offers": {
    POST: (request) => photographyOffersRoute.POST(request),
  },
  "razorpay/webhook": {
    POST: (request) => razorpayWebhookRoute.POST(request),
  },
  rentals: {
    POST: (request) => rentalsRoute.POST(request),
  },
  revalidate: {
    POST: (request) => revalidateRoute.POST(request),
  },
  reviews: {
    GET: (request) => reviewsRoute.GET(request),
    POST: (request) => reviewsRoute.POST(request),
  },
  search: {
    GET: (request) => searchRoute.GET(request),
  },
  "store/products": {
    GET: () => storeProductsRoute.GET(),
  },
  "trade-leads": {
    POST: (request) => tradeLeadsRoute.POST(request),
  },
  "upload-image": {
    POST: (request) => uploadImageRoute.POST(request),
  },
};

const getPath = async ({ params }: RouteContext) => {
  const resolvedParams = await Promise.resolve(params);
  const segments = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
  return segments.join("/");
};

const getAllowedMethods = (handlers: RouteHandlers) =>
  (Object.keys(handlers) as Method[]).sort();

const dispatch = async (request: NextRequest, context: RouteContext) => {
  const path = await getPath(context);
  const handlers = ROUTES[path];

  if (!handlers) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const method = request.method.toUpperCase() as Method;
  const selectedHandler =
    handlers[method] || (method === "HEAD" ? handlers.GET : undefined);

  if (!selectedHandler) {
    const allowedMethods = getAllowedMethods(handlers);
    return NextResponse.json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: { Allow: allowedMethods.join(", ") },
      }
    );
  }

  return selectedHandler(request);
};

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
export const OPTIONS = dispatch;
export const HEAD = dispatch;
