// lib/chat/gemini.ts

export type ContentRole = "user" | "model";

export type FunctionCall = {
  name: string;
  args: Record<string, unknown>;
};

export type Part =
  | { text: string }
  | { functionCall: FunctionCall }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

export type Content = {
  role: ContentRole;
  parts: Part[];
};

export type FunctionDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      role?: string;
      parts?: Part[];
    };
    finishReason?: string;
  }>;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

const getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY.");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    apiKey,
  };
};

export class GeminiApiError extends Error {}

// Pulled out as a standalone function so it can be unit-tested with a
// fixture payload, without making a real network call.
export const extractModelContent = (
  payload: GeminiGenerateContentResponse
): { content: Content; finishReason: string } => {
  const candidate = payload.candidates?.[0];

  if (!candidate?.content) {
    throw new GeminiApiError("Gemini returned an empty response.");
  }

  return {
    content: {
      role: "model",
      parts: candidate.content.parts || [],
    },
    finishReason: candidate.finishReason || "STOP",
  };
};

// Extracts the plain-text portion of a model Content (ignores functionCall
// parts, which are handled separately by the tool loop).
export const extractText = (content: Content): string =>
  content.parts
    .map((part) => ("text" in part ? part.text : ""))
    .join("");

// Extracts every functionCall in a model Content (Gemini can return more
// than one in parallel, similar to OpenAI-style parallel tool calls).
export const extractFunctionCalls = (content: Content): FunctionCall[] =>
  content.parts
    .filter((part): part is { functionCall: FunctionCall } => "functionCall" in part)
    .map((part) => part.functionCall);

// Calls Gemini's generateContent endpoint (non-streaming). Used for every
// turn of the tool-calling loop (see lib/chat/tools.ts and
// lib/api-route-handlers/chat/route.ts). Never streamed internally — the
// final answer is chunked for the client separately, to keep tool-call
// handling simple.
export async function runGeminiChat(
  contents: Content[],
  systemInstruction: string,
  functionDeclarations: FunctionDeclaration[]
): Promise<{ content: Content; finishReason: string }> {
  const { url, apiKey } = getGeminiConfig();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        tools:
          functionDeclarations.length > 0
            ? [{ functionDeclarations }]
            : undefined,
        // Disable "thinking" — verified live that it otherwise burns 10-100x
        // the visible output in thinking tokens (e.g. 484 thinking tokens
        // for a 4-token reply) with no answer-quality benefit for this
        // FAQ/tool-lookup use case. Faster and cheaper without it.
        generationConfig: { thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
  } catch {
    throw new GeminiApiError("Unable to reach Gemini right now.");
  }

  if (!response.ok) {
    throw new GeminiApiError(`Gemini request failed (${response.status}).`);
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse;
  return extractModelContent(payload);
}
