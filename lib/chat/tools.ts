// lib/chat/tools.ts
import { fetchSearchResults } from "@/lib/search";
import { getPolicyContent } from "@/lib/chat/policy-content";
import type { FunctionDeclaration } from "@/lib/chat/gemini";
import type { MistralToolDef } from "@/lib/chat/mistral";
import type { ChatProductCardData } from "@/lib/chat/types";

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

export const CHAT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_products",
    description:
      "Search the store's product catalog by keyword. Use this whenever the user asks about paintings, art styles, subjects, or wants recommendations.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "Search keywords, e.g. 'blue abstract painting'",
        },
        limit: {
          type: "NUMBER",
          description: "Max results to return (default 6, max 12)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description:
      "Get full details (price, description, stock status) for one specific product by its URL slug. Call this after search_products has identified the exact product the user is asking about.",
    parameters: {
      type: "OBJECT",
      properties: {
        slug: {
          type: "STRING",
          description: "The product's URL slug, from search_products results.",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "get_policy",
    description:
      "Get the store's official policy text for returns, order cancellation, privacy, or terms of use. Use this instead of guessing policy details.",
    parameters: {
      type: "OBJECT",
      properties: {
        policy: {
          type: "STRING",
          enum: ["returns", "cancellation", "privacy", "terms"],
          description: "Which policy to retrieve.",
        },
      },
      required: ["policy"],
    },
  },
  {
    name: "search_blog",
    description:
      "Search the store's blog/journal posts (care instructions, artist stories, etc.) by keyword.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search keywords." },
        limit: {
          type: "NUMBER",
          description: "Max results to return (default 4, max 8)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "suggest_add_to_cart",
    description:
      "Suggest adding a specific product to the user's cart so they can complete checkout with card/UPI payment. Only call this after get_product_details has confirmed the product is in stock. Does not place an order by itself — it shows the user a button to click.",
    parameters: {
      type: "OBJECT",
      properties: {
        productId: {
          type: "NUMBER",
          description: "WooCommerce product id, from get_product_details.",
        },
        variationId: {
          type: "NUMBER",
          description:
            "WooCommerce variation id, if the user picked a specific size/variant.",
        },
        title: { type: "STRING", description: "Product title to display on the button." },
        image: { type: "STRING", description: "Product image URL to display." },
        subtitle: {
          type: "STRING",
          description: "Short subtitle, e.g. size/material.",
        },
        price: {
          type: "NUMBER",
          description: "Price in INR (major units, e.g. 4999.00).",
        },
        quantity: { type: "NUMBER", description: "Quantity to add (default 1)." },
      },
      required: ["productId", "title", "image"],
    },
  },
  {
    name: "place_cod_order",
    description:
      "Place a real Cash on Delivery order for the logged-in user. Only call this once you have confirmed all of: the user's first name, last name, phone number, full address (address1, city, state, postcode), and the exact product(s)/quantities they want, with the user's explicit confirmation to place the order. Never call this with guessed or incomplete details — ask the user for anything missing first.",
    parameters: {
      type: "OBJECT",
      properties: {
        firstName: { type: "STRING" },
        lastName: { type: "STRING" },
        phone: { type: "STRING" },
        address1: { type: "STRING" },
        address2: { type: "STRING" },
        city: { type: "STRING" },
        state: { type: "STRING" },
        postcode: { type: "STRING" },
        customerNote: { type: "STRING", description: "Optional note for the order." },
        lineItems: {
          type: "ARRAY",
          description: "Products to order.",
          items: {
            type: "OBJECT",
            properties: {
              productId: { type: "NUMBER" },
              variationId: { type: "NUMBER" },
              quantity: { type: "NUMBER" },
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
];

// Mistral (and OpenAI-compatible APIs generally) use standard lowercase
// JSON-schema type keywords, while Gemini's function-declaration schema
// uses uppercase ("OBJECT", "STRING", ...). Deriving Mistral's tool list
// from CHAT_TOOLS instead of hand-duplicating it keeps one source of truth
// for both providers' tool definitions.
const lowerSchemaTypes = (schema: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...schema };

  if (typeof result.type === "string") {
    result.type = result.type.toLowerCase();
  }
  if (result.properties && typeof result.properties === "object") {
    result.properties = Object.fromEntries(
      Object.entries(result.properties as Record<string, Record<string, unknown>>).map(
        ([key, value]) => [key, lowerSchemaTypes(value)]
      )
    );
  }
  if (result.items && typeof result.items === "object") {
    result.items = lowerSchemaTypes(result.items as Record<string, unknown>);
  }

  return result;
};

export const MISTRAL_CHAT_TOOLS: MistralToolDef[] = CHAT_TOOLS.map((tool) => ({
  type: "function",
  function: {
    name: tool.name,
    description: tool.description,
    parameters: lowerSchemaTypes(tool.parameters),
  },
}));

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
        price: product.price ?? null,
        currencySymbol: product.currencySymbol,
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
  images?: Array<{ src?: string }>;
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
      image: product.images?.[0]?.src || "",
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

export const CARD_DISPLAY_LIMIT = 4;

type SearchProductsResult = {
  products?: Array<{
    id?: number;
    name?: string;
    slug?: string;
    image?: string;
    price?: number | null;
    currencySymbol?: string;
  }>;
};

export function toProductCards(result: Record<string, unknown>): ChatProductCardData[] {
  const { products } = result as SearchProductsResult;
  if (!Array.isArray(products)) return [];

  const cards: ChatProductCardData[] = [];
  for (const item of products.slice(0, CARD_DISPLAY_LIMIT)) {
    if (typeof item.id !== "number" || typeof item.name !== "string" || typeof item.slug !== "string") {
      continue;
    }
    cards.push({
      id: item.id,
      slug: item.slug,
      name: item.name,
      image: item.image || "",
      price: typeof item.price === "number" ? item.price : null,
      currencySymbol: item.currencySymbol,
    });
  }
  return cards;
}

type ProductDetailResult = {
  id?: number;
  slug?: string;
  name?: string;
  image?: string;
  price?: number | null;
  currencySymbol?: string;
  inStock?: boolean;
};

export function toProductCardFromDetail(result: Record<string, unknown>): ChatProductCardData | null {
  const detail = result as ProductDetailResult;
  if (typeof detail.id !== "number" || typeof detail.slug !== "string" || typeof detail.name !== "string") {
    return null;
  }

  return {
    id: detail.id,
    slug: detail.slug,
    name: detail.name,
    image: detail.image || "",
    price: typeof detail.price === "number" ? detail.price : null,
    currencySymbol: detail.currencySymbol,
    inStock: detail.inStock,
  };
}
