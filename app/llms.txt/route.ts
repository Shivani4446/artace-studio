import { renderLlmInfoText } from "@/lib/llm-info/content";

// Served at /llms.txt (llmstxt.org convention) so AI crawlers can read the
// business facts as plain Markdown. Same source as the /llm-info page.
// Edge runtime to match the Cloudflare Pages adapter (see app/sitemap.ts).
export const runtime = "edge";
export const revalidate = 86400;

export function GET() {
  return new Response(renderLlmInfoText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
