// lib/api-route-handlers/chat/route.ts
import { NextRequest } from "next/server";
import {
  runGeminiChat,
  extractText,
  extractFunctionCalls,
  type Content,
  type Part,
} from "@/lib/chat/gemini";
import {
  CHAT_TOOLS,
  executeSearchProducts,
  executeGetProductDetails,
  executeGetPolicy,
  executeSearchBlog,
} from "@/lib/chat/tools";
import { executePlaceCodOrder } from "@/lib/chat/order";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";

export const runtime = "edge";

const MAX_TOOL_ITERATIONS = 4;
const MAX_HISTORY_MESSAGES = 10;

type IncomingMessage = { role?: unknown; content?: unknown };

type CartSuggestion = {
  productId: number;
  variationId?: number;
  title: string;
  image: string;
  subtitle?: string;
  price?: number;
  quantity?: number;
};

const FALLBACK_MESSAGE =
  "Thanks for your patience — I'm handling a lot of chats right now. Meanwhile, you can message us on WhatsApp or browse the shop directly.";

const encoder = new TextEncoder();

const sanitizeHistory = (
  messages: unknown
): { role: "user" | "assistant"; content: string }[] => {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => item as IncomingMessage)
    .filter(
      (item): item is { role: "user" | "assistant"; content: string } =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
    )
    .map((item) => ({ role: item.role, content: item.content.trim() }));
};

// Tool-call arguments arrive as model-generated JSON — some models emit
// numeric fields as strings (e.g. "6" instead of 6), so coerce via Number()
// rather than requiring typeof === "number".
const toOptionalNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const runToolCall = async (
  name: string,
  args: Record<string, unknown>,
  request: NextRequest,
  pendingActions: CartSuggestion[]
): Promise<Record<string, unknown>> => {
  switch (name) {
    case "search_products":
      return executeSearchProducts(args);
    case "get_product_details":
      return executeGetProductDetails(args);
    case "get_policy":
      return executeGetPolicy(args);
    case "search_blog":
      return executeSearchBlog(args);
    case "suggest_add_to_cart": {
      const productId = toOptionalNumber(args.productId);
      const title = typeof args.title === "string" ? args.title : "";
      const image = typeof args.image === "string" ? args.image : "";
      if (!productId || !title || !image) {
        return { error: "Missing required fields for suggest_add_to_cart." };
      }
      pendingActions.push({
        productId,
        variationId: toOptionalNumber(args.variationId),
        title,
        image,
        subtitle: typeof args.subtitle === "string" ? args.subtitle : undefined,
        price: toOptionalNumber(args.price),
        quantity: toOptionalNumber(args.quantity) ?? 1,
      });
      return { shown: true };
    }
    case "place_cod_order":
      return executePlaceCodOrder(args, request);
    default:
      return { error: `Unknown tool: ${name}` };
  }
};

const streamText = (text: string, actions: CartSuggestion[]) =>
  new ReadableStream({
    start(controller) {
      const words = text.split(/(\s+)/);
      for (const word of words) {
        if (!word) continue;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "delta", text: word })}\n\n`)
        );
      }
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "done", actions })}\n\n`)
      );
      controller.close();
    },
  });

const sseResponse = (stream: ReadableStream) =>
  new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

export async function POST(request: NextRequest) {
  let body: { messages?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown };
  } catch {
    body = {};
  }

  const history = sanitizeHistory(body.messages);
  const contents: Content[] = history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));
  const systemInstruction = buildSystemPrompt();
  const pendingActions: CartSuggestion[] = [];

  try {
    let finalText: string | null = null;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
      const { content } = await runGeminiChat(contents, systemInstruction, CHAT_TOOLS);
      const functionCalls = extractFunctionCalls(content);

      if (functionCalls.length === 0) {
        finalText = extractText(content);
        break;
      }

      contents.push(content);

      const responseParts: Part[] = [];
      for (const call of functionCalls) {
        const result = await runToolCall(call.name, call.args, request, pendingActions);
        responseParts.push({
          functionResponse: { name: call.name, response: result },
        });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    const responseText =
      finalText?.trim() ||
      "I wasn't able to finish that — could you try rephrasing your question?";

    return sseResponse(streamText(responseText, pendingActions));
  } catch {
    // Every failure (Gemini API error, network, or an unexpected bug in the
    // tool loop) shows the same fallback message — see Global Constraints.
    return sseResponse(streamText(FALLBACK_MESSAGE, []));
  }
}
