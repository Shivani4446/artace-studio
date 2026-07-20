import { NextRequest, NextResponse } from "next/server";
import { runGeminiChat, extractText } from "@/lib/chat/gemini";

export const runtime = "edge";

const TRANSCRIBE_INSTRUCTION =
  "Transcribe the following audio exactly as spoken. Output only the transcription text, with no extra commentary, quotes, or labels. If the audio is silent or unintelligible, output an empty string.";

export async function POST(request: NextRequest) {
  let body: { mimeType?: unknown; data?: unknown };
  try {
    body = (await request.json()) as { mimeType?: unknown; data?: unknown };
  } catch {
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
  } catch {
    return NextResponse.json(
      { error: "Could not transcribe that right now." },
      { status: 502 }
    );
  }
}
