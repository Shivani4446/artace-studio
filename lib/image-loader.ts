// next/image loader backed by Cloudflare Image Transformations.
//
// Why: on Cloudflare Pages (next-on-pages) the built-in /_next/image
// optimizer does nothing — it returns the full original file for every
// width, uncached, through a server function. Cloudflare's /cdn-cgi/image/
// endpoint (enabled on the artacestudio.com zone) resizes, converts to
// AVIF/WebP for browsers that accept them, and caches at the edge.
//
// Measured on production: a 640px living-room thumbnail went from a 370 KB
// JPEG to a 34 KB AVIF; a WordPress product photo from 241 KB to 57 KB.
//
// Works for local /public files and for remote images on our own hosts
// (WordPress media on api.artacestudio.com). Anything else is returned as-is.

type LoaderProps = { src: string; width: number; quality?: number };

const DEFAULT_QUALITY = 75;

// Remote hosts Cloudflare may fetch and transform. Keep in step with
// images.remotePatterns in next.config.ts.
const TRANSFORMABLE_HOSTS = new Set([
  "api.artacestudio.com",
  "artacestudio.com",
  "www.artacestudio.com",
]);

const isTransformable = (src: string) => {
  if (src.startsWith("/")) return !src.startsWith("//");
  try {
    const url = new URL(src);
    return url.protocol === "https:" && TRANSFORMABLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export default function cloudflareImageLoader({ src, width, quality }: LoaderProps): string {
  // SVG and GIF gain nothing from resizing (and GIFs would lose animation).
  const path = src.split("?")[0].toLowerCase();
  const passThrough = path.endsWith(".svg") || path.endsWith(".gif") || src.startsWith("data:");

  // Local dev has no Cloudflare in front of it: serve originals. The width
  // param is only there so next/image doesn't warn that the loader ignores it.
  if (process.env.NODE_ENV !== "production" || passThrough || !isTransformable(src)) {
    if (passThrough || !src.startsWith("/")) return src;
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }

  const options = `width=${width},quality=${quality || DEFAULT_QUALITY},format=auto,fit=scale-down`;
  // Local files: /cdn-cgi/image/<options>/path ; remote: /cdn-cgi/image/<options>/https://host/path
  return src.startsWith("/") ? `/cdn-cgi/image/${options}${src}` : `/cdn-cgi/image/${options}/${src}`;
}
