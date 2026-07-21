import { NextRequest, NextResponse } from "next/server";
import { runGeminiChat, extractText, GeminiApiError } from "@/lib/chat/gemini";
import { runMistralTranscription } from "@/lib/chat/mistral";

export const runtime = "edge";

const TRANSCRIBE_INSTRUCTION =
  "Transcribe the following audio exactly as spoken. Output only the transcription text, with no extra commentary, quotes, or labels. If the audio is silent or unintelligible, output an empty string.";

// Audio encodes less efficiently than a static image, so this ceiling is
// more generous than the /api/chat image guard, while still bounding
// worst-case cost against the metered Gemini API for requests that bypass
// the client's own recording-length limits (e.g. direct HTTP calls).
const MAX_AUDIO_DATA_CHARS = 15_000_000;

export async function POST(request: NextRequest) {
  let body: { mimeType?: unknown; data?: unknown };
  try {
    body = (await request.json()) as { mimeType?: unknown; data?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const data = typeof body.data === "string" ? body.data : "";

  if (!mimeType || !data) {
    return NextResponse.json(
      { error: "Missing audio mimeType or data." },
      { status: 400 }
    );
  }

  if (data.length > MAX_AUDIO_DATA_CHARS) {
    return NextResponse.json(
      { error: "That recording is too large." },
      { status: 413 }
    );
  }

  try {
    const { content } = await runGeminiChat(
      [
        {
          role: "user",
          parts: [
            { text: TRANSCRIBE_INSTRUCTION },
            { inlineData: { mimeType, data } },
          ],
        },
      ],
      "",
      []
    );

    return NextResponse.json({ text: extractText(content).trim() });
  } catch (error) {
    if (error instanceof GeminiApiError && error.status === 429) {
      try {
        const text = await runMistralTranscription(mimeType, data);
        return NextResponse.json({ text: text.trim() });
      } catch (mistralError) {
        console.error("Transcribe fallback failed:", mistralError);
      }
    } else {
      console.error("Transcribe request failed:", error);
    }

    return NextResponse.json(
      { error: "Could not transcribe that right now." },
      { status: 502 }
    );
  }
}
