import type { OverlayTransform } from "@/components/room-preview/RoomPreviewOverlay";

const BASE_WIDTH_PX = 150;

/**
 * Draws the current video frame plus the overlay (at its exact current
 * transform) onto a canvas sized to the video's real resolution, so the
 * exported image matches what the customer was actually looking at rather
 * than a separately-recomputed approximation. The overlay's on-screen size
 * is expressed in container CSS pixels (see RoomPreviewOverlay's
 * BASE_WIDTH_PX) — scaled here into the canvas's own pixel space, which is
 * usually a different resolution than the on-screen container.
 */
export const captureRoomPreview = ({
  video,
  overlayImage,
  transform,
  aspectRatio,
  containerWidth,
  containerHeight,
}: {
  video: HTMLVideoElement;
  overlayImage: HTMLImageElement;
  transform: OverlayTransform;
  aspectRatio: number;
  containerWidth: number;
  containerHeight: number;
}): Promise<Blob | null> => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width === 0 || canvas.height === 0) return Promise.resolve(null);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / containerWidth;
  const scaleY = canvas.height / containerHeight;
  const overlayWidth = BASE_WIDTH_PX * scaleX;
  const overlayHeight = (BASE_WIDTH_PX / aspectRatio) * scaleY;

  ctx.save();
  ctx.translate(transform.x * scaleX, transform.y * scaleY);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.scale, transform.scale);
  ctx.drawImage(overlayImage, -overlayWidth / 2, -overlayHeight / 2, overlayWidth, overlayHeight);
  ctx.restore();

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92));
};

/**
 * Tries the native share sheet first (lets the customer save to photos or
 * send it directly); falls back to returning "fallback" when file-sharing
 * isn't supported, so the caller can show the captured image directly with
 * a "press and hold to save" instruction instead of a dead end.
 */
export const shareOrDownloadCapture = async (blob: Blob, filename: string): Promise<"shared" | "fallback"> => {
  const file = new File([blob], filename, { type: blob.type });

  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return "shared";
    } catch {
      // User cancelled the share sheet, or it failed for some other reason
      // — either way, fall through to the same fallback as unsupported.
      return "fallback";
    }
  }

  return "fallback";
};
