// lib/chat/tools.ts
import { fetchSearchResults } from "@/lib/search";
import { getPolicyContent } from "@/lib/chat/policy-content";
import type { ToolDefinition } from "@/lib/chat/workers-ai";

const DEFAULT_WOOCOMMERCE_SITE_URL = "https://api.artacestudio.com/";

const getStoreApiBaseUrl = () =>
  (
    process.env.WOOCOMMERCE_REST_URL ||
    process.env.WORDPRESS_API_URL ||
    process.env.WOOCOMMERCE_SITE_URL ||
    process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL ||
    DEFAULT_WOOCOMMERCE_SITE_URL
  ).replace(/\/+$/, "");

// Tool-call arguments arrive as model-generated JSON — some models emit
// numeric fields as strings (e.g. `"6"` instead of `6`), so coerce via
// Number() rather than requiring typeof === "number".
const parseLimit = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.floor(parsed), 1), max);
};

export const CHAT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the store's product catalog by keyword. Use this whenever the user asks about paintings, art styles, subjects, or wants recommendations.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keywords, e.g. 'blue abstract painting'",
          },
          limit: {
            type: "number",
            description: "Max results to return (default 6, max 12)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Get full details (price, description, stock status) for one specific product by its URL slug. Call this after search_products has identified the exact product the user is asking about.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The product's URL slug, from search_products results.",
          },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_policy",
      description:
        "Get the store's official policy text for returns, order cancellation, privacy, or terms of use. Use this instead of guessing policy details.",
      parameters: {
        type: "object",
        properties: {
          policy: {
            type: "string",
            enum: ["returns", "cancellation", "privacy", "terms"],
            description: "Which policy to retrieve.",
          },
        },
        required: ["policy"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_blog",
      description:
        "Search the store's blog/journal posts (care instructions, artist stories, etc.) by keyword.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords." },
          limit: {
            type: "number",
            description: "Max results to return (default 4, max 8)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_add_to_cart",
      description:
        "Suggest adding a specific product to the user's cart so they can complete checkout with card/UPI payment. Only call this after get_product_details has confirmed the product is in stock. Does not place an order by itself — it shows the user a button to click.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "number",
            description: "WooCommerce product id, from get_product_details.",
          },
          variationId: {
            type: "number",
            description:
              "WooCommerce variation id, if the user picked a specific size/variant.",
          },
          title: { type: "string", description: "Product title to display on the button." },
          image: { type: "string", description: "Product image URL to display." },
          subtitle: {
            type: "string",
            description: "Short subtitle, e.g. size/material.",
          },
          price: {
            type: "number",
            description: "Price in INR (major units, e.g. 4999.00).",
          },
          quantity: { type: "number", description: "Quantity to add (default 1)." },
        },
        required: ["productId", "title", "image"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "place_cod_order",
      description:
        "Place a real Cash on Delivery order for the logged-in user. Only call this once you have confirmed all of: the user's first name, last name, phone number, full address (address1, city, state, postcode), and the exact product(s)/quantities they want, with the user's explicit confirmation to place the order. Never call this with guessed or incomplete details — ask the user for anything missing first.",
      parameters: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          phone: { type: "string" },
          address1: { type: "string" },
          address2: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          postcode: { type: "string" },
          customerNote: { type: "string", description: "Optional note for the order." },
          lineItems: {
            type: "array",
            description: "Products to order.",
            items: {
              type: "object",
              properties: {
                productId: { type: "number" },
                variationId: { type: "number" },
                quantity: { type: "number" },
              },
              required: ["productId", "quantity"],
            },
          },
        },
        required: [
          "firstName",
          "lastName",
          "phone",
          "address1",
          "city",
          "state",
          "postcode",
          "lineItems",
        ],
      },
    },
  },
];

export async function executeSearchProducts(args: Record<string, unknown>) {
  const query = typeof args.query === "string" ? args.query.trim() : "";
  const limit = parseLimit(args.limit, 6, 12);

  if (!query) return { error: "A search query is required." };

  try {
    const results = await fetchSearchResults(query, { productLimit: limit, blogLimit: 1 });
    return {
      products: results.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
      })),
    };
  } catch {
    return { error: "Could not search products right now." };
  }
}

type WooStoreProductDetail = {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  stock_status: string;
  prices: { price: string; currency_minor_unit: number; currency_symbol: string };
};

export async function executeGetProductDetails(args: Record<string, unknown>) {
  const slug = typeof args.slug === "string" ? args.slug.trim() : "";
  if (!slug) return { error: "A product slug is required." };

  try {
    const baseUrl = getStoreApiBaseUrl();
    const response = await fetch(
      `${baseUrl}/wp-json/wc/store/v1/products?slug=${encodeURIComponent(slug)}&per_page=1`,
      { cache: "no-store" }
    );

    if (!response.ok) return { error: "Could not look up that product right now." };

    const payload = (await response.json()) as WooStoreProductDetail[];
    const product = Array.isArray(payload) ? payload[0] : undefined;
    if (!product) return { error: "No product found with that slug." };

    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const rawPrice = Number(product.prices?.price);
    const price =
      Number.isFinite(rawPrice) && minorUnit >= 0 ? rawPrice / 10 ** minorUnit : null;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: (product.short_description || "").replace(/<[^>]*>/g, " ").trim(),
      price,
      currencySymbol: product.prices?.currency_symbol || "₹",
      inStock: product.stock_status === "instock",
    };
  } catch {
    return { error: "Could not look up that product right now." };
  }
}

export async function executeGetPolicy(args: Record<string, unknown>) {
  const policy = typeof args.policy === "string" ? args.policy : "";
  const content = getPolicyContent(policy);
  if (!content) {
    return {
      error: "Unknown policy type. Valid values: returns, cancellation, privacy, terms.",
    };
  }
  return { policy, content };
}

export async function executeSearchBlog(args: Record<string, unknown>) {
  const query = typeof args.query === "string" ? args.query.trim() : "";
  const limit = parseLimit(args.limit, 4, 8);

  if (!query) return { error: "A search query is required." };

  try {
    const results = await fetchSearchResults(query, { productLimit: 1, blogLimit: limit });
    return {
      posts: results.blogs.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
      })),
    };
  } catch {
    return { error: "Could not search blog posts right now." };
  }
}
