// lib/chat/workers-ai.ts

export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ChatToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type ChatMessage = {
  role: ChatRole;
  content: string | null;
  tool_calls?: ChatToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type WorkersAiChatCompletion = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
      tool_calls?: ChatToolCall[];
    };
    finish_reason?: string;
  }>;
};

const DEFAULT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const getWorkersAiConfig = () => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI credentials are missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN."
    );
  }

  return {
    url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
    apiToken,
    model: process.env.CLOUDFLARE_WORKERS_AI_MODEL || DEFAULT_MODEL,
  };
};

export class WorkersAiQuotaError extends Error {}

// Pulled out as a standalone function so it can be unit-tested with a fixture
// payload, without making a real network call.
export const extractAssistantMessage = (
  payload: WorkersAiChatCompletion
): { message: ChatMessage; finishReason: string } => {
  const choice = payload.choices?.[0];

  if (!choice?.message) {
    throw new WorkersAiQuotaError("Cloudflare Workers AI returned an empty response.");
  }

  return {
    message: {
      role: "assistant",
      content: choice.message.content ?? null,
      tool_calls: choice.message.tool_calls,
    },
    finishReason: choice.finish_reason || "stop",
  };
};

// Calls Workers AI's OpenAI-compatible chat completions endpoint (non-streaming).
// Used for every turn of the tool-calling loop (see lib/chat/tools.ts and
// lib/api-route-handlers/chat/route.ts). Never streamed internally — the
// final answer is chunked for the client separately, to keep tool-call
// handling simple and avoid assembling streamed tool-call deltas.
export async function runWorkersAiChat(
  messages: ChatMessage[],
  tools: ToolDefinition[]
): Promise<{ message: ChatMessage; finishReason: string }> {
  const { url, apiToken, model } = getWorkersAiConfig();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
        stream: false,
      }),
    });
  } catch {
    throw new WorkersAiQuotaError("Unable to reach Cloudflare Workers AI right now.");
  }

  if (!response.ok) {
    throw new WorkersAiQuotaError(
      `Cloudflare Workers AI request failed (${response.status}).`
    );
  }

  const payload = (await response.json()) as WorkersAiChatCompletion;
  return extractAssistantMessage(payload);
}
