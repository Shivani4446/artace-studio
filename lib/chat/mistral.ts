// lib/chat/mistral.ts
// Fallback provider used when Gemini hits a rate limit (429). Verified live
// against the real Mistral API: chat completions with tool-calling (OpenAI-
// compatible shape, "arguments" arrives as a JSON string), vision via a
// bare data-URI string in "image_url", and audio transcription via the
// separate multipart /v1/audio/transcriptions endpoint (Voxtral). Note
// "mistral-small-latest" silently ignored image content in testing —
// the versioned "mistral-small-2506" correctly handles both tools and
// vision, so that's pinned as the default rather than a "-latest" alias.

export type MistralRole = "system" | "user" | "assistant" | "tool";

export type MistralContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string };

export type MistralToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type MistralMessage = {
  role: MistralRole;
  content: string | MistralContentPart[] | null;
  tool_calls?: MistralToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type MistralToolDef = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

type MistralChatResponse = {
  choices?: Array<{ message?: MistralMessage; finish_reason?: string }>;
};

type MistralTranscriptionResponse = {
  text?: string;
};

const DEFAULT_MODEL = "mistral-small-2506";
const DEFAULT_TRANSCRIBE_MODEL = "voxtral-mini-latest";

export class MistralApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

const getMistralApiKey = () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Mistral API key is missing. Set MISTRAL_API_KEY.");
  }
  return apiKey;
};

export async function runMistralChat(
  messages: MistralMessage[],
  tools: MistralToolDef[]
): Promise<MistralMessage> {
  const apiKey = getMistralApiKey();
  const model = process.env.MISTRAL_MODEL || DEFAULT_MODEL;

  let response: Response;
  try {
    response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
      }),
    });
  } catch {
    throw new MistralApiError("Unable to reach Mistral right now.");
  }

  if (!response.ok) {
    throw new MistralApiError(`Mistral request failed (${response.status}).`, response.status);
  }

  const payload = (await response.json()) as MistralChatResponse;
  const message = payload.choices?.[0]?.message;
  if (!message) {
    throw new MistralApiError("Mistral returned an empty response.");
  }
  return message;
}

export async function runMistralTranscription(
  mimeType: string,
  base64Data: string
): Promise<string> {
  const apiKey = getMistralApiKey();

  let bytes: Uint8Array;
  try {
    const binary = atob(base64Data);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
  } catch {
    throw new MistralApiError("Invalid audio data.");
  }

  const form = new FormData();
  form.append("model", DEFAULT_TRANSCRIBE_MODEL);
  form.append("file", new Blob([bytes.buffer as ArrayBuffer], { type: mimeType }), "audio");

  let response: Response;
  try {
    response = await fetch("https://api.mistral.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } catch {
    throw new MistralApiError("Unable to reach Mistral right now.");
  }

  if (!response.ok) {
    throw new MistralApiError(`Mistral request failed (${response.status}).`, response.status);
  }

  const payload = (await response.json()) as MistralTranscriptionResponse;
  return payload.text ?? "";
}
