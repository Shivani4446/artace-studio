// lib/chat/order.ts
import type { NextRequest } from "next/server";
import { getAuthSessionFromRequest } from "@/utils/auth";
import {
  createWooCommerceOrder,
  ensurePositiveInt,
  sanitizeText,
} from "@/utils/woocommerce-checkout";

type RawLineItem = {
  productId?: unknown;
  variationId?: unknown;
  quantity?: unknown;
};

export function validateCodOrderFields(
  args: Record<string, unknown>
):
  | { error: string }
  | {
      firstName: string;
      lastName: string;
      phone: string;
      address1: string;
      address2: string;
      city: string;
      state: string;
      postcode: string;
      customerNote: string;
      lineItems: { product_id: number; quantity: number; variation_id?: number }[];
    } {
  const firstName = sanitizeText(args.firstName);
  const lastName = sanitizeText(args.lastName);
  const phone = sanitizeText(args.phone);
  const address1 = sanitizeText(args.address1);
  const address2 = sanitizeText(args.address2);
  const city = sanitizeText(args.city);
  const state = sanitizeText(args.state);
  const postcode = sanitizeText(args.postcode);
  const customerNote = sanitizeText(args.customerNote);

  if (!firstName || !lastName || !phone || !address1 || !city || !state || !postcode) {
    return {
      error:
        "Missing required address/contact details. Ask the user for whichever of first name, last name, phone, address, city, state, or postcode is missing.",
    };
  }

  const rawLineItems = Array.isArray(args.lineItems) ? (args.lineItems as RawLineItem[]) : [];
  const lineItems = rawLineItems
    .map((item) => {
      const productId = ensurePositiveInt(item.productId);
      const quantity = ensurePositiveInt(item.quantity);
      const variationId = ensurePositiveInt(item.variationId);
      if (!productId || !quantity) return null;

      return {
        product_id: productId,
        quantity,
        ...(variationId ? { variation_id: variationId } : {}),
      };
    })
    .filter(
      (item): item is { product_id: number; quantity: number; variation_id?: number } =>
        Boolean(item)
    );

  if (lineItems.length === 0) {
    return {
      error:
        "No valid products were specified. Ask the user which product(s) and quantities they want to order.",
    };
  }

  return {
    firstName,
    lastName,
    phone,
    address1,
    address2,
    city,
    state,
    postcode,
    customerNote,
    lineItems,
  };
}

export async function executePlaceCodOrder(
  args: Record<string, unknown>,
  request: NextRequest
): Promise<{ error: string } | { success: true; orderNumber: string; total: string }> {
  const session = await getAuthSessionFromRequest(request);
  if (!session?.accessToken) {
    return {
      error:
        "The user is not signed in. Tell them they need to sign in before a Cash on Delivery order can be placed.",
    };
  }

  const customerId = ensurePositiveInt(session.user.id);
  if (!customerId) {
    return {
      error: "The user's account session is invalid. Ask them to sign in again.",
    };
  }

  const email = sanitizeText(session.user.email);
  if (!email) {
    return {
      error:
        "The user's account has no email on file. Ask them to add one before placing an order, or use regular checkout.",
    };
  }

  const fieldsResult = validateCodOrderFields(args);
  if ("error" in fieldsResult) {
    return fieldsResult;
  }

  const {
    firstName,
    lastName,
    phone,
    address1,
    address2,
    city,
    state,
    postcode,
    customerNote,
    lineItems,
  } = fieldsResult;

  try {
    const order = await createWooCommerceOrder({
      payment_method: "cod",
      payment_method_title: "Cash on Delivery",
      set_paid: false,
      billing: {
        first_name: firstName,
        last_name: lastName,
        address_1: address1,
        address_2: address2,
        city,
        state,
        postcode,
        country: "IN",
        email,
        phone,
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: address1,
        address_2: address2,
        city,
        state,
        postcode,
        country: "IN",
      },
      line_items: lineItems,
      customer_note: customerNote,
      customer_id: customerId,
    });

    if (!order.orderId) {
      return {
        error:
          "WooCommerce did not return a valid order. Tell the user the order could not be placed and suggest regular checkout instead.",
      };
    }

    return { success: true, orderNumber: order.orderNumber, total: order.total };
  } catch (error) {
    console.error("[chat/order] createWooCommerceOrder failed:", error);
    return {
      error:
        "The order could not be created right now. Tell the user to try again shortly or use regular checkout.",
    };
  }
}
