import { NextRequest, NextResponse } from "next/server";
import * as accountProfileRoute from "@/lib/api-route-handlers/account/profile/route";
import * as authForgotPasswordRoute from "@/lib/api-route-handlers/auth/forgot-password/route";
import * as authLoginRoute from "@/lib/api-route-handlers/auth/login/route";
import * as authLogoutRoute from "@/lib/api-route-handlers/auth/logout/route";
import * as authRegisterRoute from "@/lib/api-route-handlers/auth/register/route";
import * as authResetPasswordRoute from "@/lib/api-route-handlers/auth/reset-password/route";
import * as authSessionRoute from "@/lib/api-route-handlers/auth/session/route";
import * as blogsRoute from "@/lib/api-route-handlers/blogs/route";
import * as checkoutCouponRoute from "@/lib/api-route-handlers/checkout/coupon/route";
import * as checkoutStatusRoute from "@/lib/api-route-handlers/checkout/status/route";
import * as checkoutVerifyRoute from "@/lib/api-route-handlers/checkout/verify/route";
import * as checkoutRoute from "@/lib/api-route-handlers/checkout/route";
import * as contactRoute from "@/lib/api-route-handlers/contact/route";
import * as corporateLeadsRoute from "@/lib/api-route-handlers/corporate-leads/route";
import * as customOrderRoute from "@/lib/api-route-handlers/custom-order/route";
import * as ordersRoute from "@/lib/api-route-handlers/orders/route";
import * as razorpayWebhookRoute from "@/lib/api-route-handlers/razorpay/webhook/route";
import * as rentalsRoute from "@/lib/api-route-handlers/rentals/route";
import * as searchRoute from "@/lib/api-route-handlers/search/route";
import * as storeProductsRoute from "@/lib/api-route-handlers/store/products/route";
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
  "checkout/status": {
    GET: (request) => checkoutStatusRoute.GET(request),
  },
  "checkout/verify": {
    POST: (request) => checkoutVerifyRoute.POST(request),
  },
  contact: {
    POST: (request) => contactRoute.POST(request),
  },
  "corporate-leads": {
    POST: (request) => corporateLeadsRoute.POST(request),
  },
  "custom-order": {
    POST: (request) => customOrderRoute.POST(request),
  },
  orders: {
    GET: (request) => ordersRoute.GET(request),
  },
  "razorpay/webhook": {
    POST: (request) => razorpayWebhookRoute.POST(request),
  },
  rentals: {
    POST: (request) => rentalsRoute.POST(request),
  },
  search: {
    GET: (request) => searchRoute.GET(request),
  },
  "store/products": {
    GET: () => storeProductsRoute.GET(),
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
