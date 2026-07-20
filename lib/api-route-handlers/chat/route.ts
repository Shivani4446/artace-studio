// lib/api-route-handlers/chat/route.ts
import { NextRequest } from "next/server";
import { runWorkersAiChat, type ChatMessage } from "@/lib/chat/workers-ai";
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

const sanitizeHistory = (messages: unknown): ChatMessage[] => {
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

const runToolCall = async (
  name: string,
  rawArgs: string,
  request: NextRequest,
  pendingActions: CartSuggestion[]
): Promise<string> => {
  let args: Record<string, unknown> = {};
  try {
    args = rawArgs ? (JSON.parse(rawArgs) as Record<string, unknown>) : {};
  } catch {
    return JSON.stringify({ error: "Invalid tool arguments." });
  }

  switch (name) {
    case "search_products":
      return JSON.stringify(await executeSearchProducts(args));
    case "get_product_details":
      return JSON.stringify(await executeGetProductDetails(args));
    case "get_policy":
      return JSON.stringify(await executeGetPolicy(args));
    case "search_blog":
      return JSON.stringify(await executeSearchBlog(args));
    case "suggest_add_to_cart": {
      // Tool arguments are model-generated JSON — some models emit numeric
      // fields as strings (e.g. "6" instead of 6), so coerce via Number()
      // rather than requiring typeof === "number".
      const toOptionalNumber = (value: unknown) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
      };

      const productId = toOptionalNumber(args.productId);
      const title = typeof args.title === "string" ? args.title : "";
      const image = typeof args.image === "string" ? args.image : "";
      if (!productId || !title || !image) {
        return JSON.stringify({ error: "Missing required fields for suggest_add_to_cart." });
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
      return JSON.stringify({ shown: true });
    }
    case "place_cod_order":
      return JSON.stringify(await executePlaceCodOrder(args, request));
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
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
  const messages: ChatMessage[] = [{ role: "system", content: buildSystemPrompt() }, ...history];
  const pendingActions: CartSuggestion[] = [];

  try {
    let finalMessage: ChatMessage | null = null;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
      const { message } = await runWorkersAiChat(messages, CHAT_TOOLS);

      if (!message.tool_calls || message.tool_calls.length === 0) {
        finalMessage = message;
        break;
      }

      messages.push(message);

      for (const toolCall of message.tool_calls) {
        const result = await runToolCall(
          toolCall.function.name,
          toolCall.function.arguments,
          request,
          pendingActions
        );
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: result,
        });
      }
    }

    const responseText =
      finalMessage?.content?.trim() ||
      "I wasn't able to finish that — could you try rephrasing your question?";

    return sseResponse(streamText(responseText, pendingActions));
  } catch {
    // Every failure (Workers AI quota, network, or an unexpected bug in the
    // tool loop) shows the same fallback message — see Global Constraints.
    return sseResponse(streamText(FALLBACK_MESSAGE, []));
  }
}
