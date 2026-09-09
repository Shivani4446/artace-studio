# "View in Your Room" — Design

## Context

Third and last of the three Section 3 features from `suggestion.md`, in the agreed order: Loyalty → Gift Cards → "View in Your Room" (this one).

Confirmed with the user before writing this spec:

- **Core mechanic**: live camera feed with a manually positioned/resized/rotated overlay of the painting — not generic stock-room mockups, and explicitly not true plane-detection WebXR AR (which is Android-Chrome-only and would leave iOS Safari customers with nothing).
- **Scale accuracy**: no calibration step. The overlay is a free manual resize the customer eyeballs into place, with the painting's real dimensions shown as a text label for reference — an honest "visual feel for scale" tool, not a precision measurement claim.
- **Placement**: on each product page, near the size selector, using that product's own image and whichever size the customer currently has selected.
- **Capture**: a "Save Photo" button composites the live frame with the overlay and lets the customer save/share it via the device's native share sheet.
- **Device scope**: mobile-only to start. The button doesn't appear on desktop.
- **Privacy**: nothing is uploaded anywhere — camera feed, overlay, and the final composite are all handled entirely client-side in the browser. This is both a trust point worth stating on the permission prompt and simply the truthful architecture (no server involvement needed for this feature beyond the product image, which is already public).

One thing found while researching this spec, not an assumption: `SingleProduct.tsx` already has real, working size-parsing logic (`parseSizeDimensions`, `inferSizeUnit`) it uses for its own size selector — but both are private, unexported functions local to that file. This feature needs the exact same parsing (to know the selected size's real width/height/unit), so Decision 1 below hoists them to a shared location rather than duplicating the logic in a second file.

## Decisions

### 1. Hoist the existing size-parsing utility

Create `utils/product-size.ts`, moving `parseSizeDimensions` and `inferSizeUnit` out of `SingleProduct.tsx` verbatim (same implementation, just relocated and exported):

```ts
export const parseSizeDimensions = (value: string): { width: number; height: number } | null => {
  const numericValues = value.match(/\d+(?:\.\d+)?/g);
  if (!numericValues || numericValues.length < 2) return null;

  const width = Number(numericValues[0]);
  const height = Number(numericValues[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) {
    return null;
  }

  return { width, height };
};

export const inferSizeUnit = (value: string): "in" | "cm" => {
  if (/cm|centimeter|centimetre/i.test(value)) return "cm";
  return "in";
};
```

`SingleProduct.tsx` imports both from here instead of defining them locally — a pure relocation, not a behavior change, so its own size selector is unaffected. This is what lets the new feature (Decision 4) get the exact same real width/height/unit the product page itself already trusts, instead of a second, potentially-diverging parser.

### 2. Device detection

A small hook, `hooks/useIsMobileDevice.ts`:

```ts
"use client";
import { useEffect, useState } from "react";

/**
 * A pragmatic proxy, not perfect device detection: true when the viewport is
 * narrow AND the device supports touch. Good enough for a feature that
 * degrades gracefully either way (the button simply doesn't render on a
 * false positive/negative's wrong side, no functional break either way).
 */
export const useIsMobileDevice = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isNarrow = window.matchMedia("(max-width: 768px)").matches;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(isNarrow && hasTouch);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};
```

### 3. The overlay's manipulation model — handles, not raw pinch-gesture math

Rather than recognizing raw two-finger pinch/rotate gestures (real multi-touch state tracking, easy to get subtly wrong), the overlay uses **explicit drag handles**, the same interaction model as Figma/Canva's object selection: dragging the body moves it, a corner handle resizes it (preserving the painting's real aspect ratio, taken from the selected size's width:height ratio — not the source image file's own aspect ratio, which may include padding/framing that doesn't match the true canvas dimensions), and a separate handle rotates it. This is more code than a bare `<img>`, but each gesture is a single, independently-testable pointer-drag computation rather than one fragile combined multi-touch gesture recognizer — and it works identically with mouse or touch input via the Pointer Events API (`onPointerDown`/`onPointerMove`/`onPointerUp`), so it isn't even mobile-specific code, even though Decision 2 gates the entry point to mobile.

### 4. The camera modal component

New file: `components/room-preview/ViewInYourRoomModal.tsx`:

- Props: `{ imageUrl: string; productName: string; widthInches: number; heightInches: number; onClose: () => void }` — dimensions always normalized to inches before this component sees them (converted from `cm` via Decision 1's `inferSizeUnit` at the call site in `SingleProduct.tsx`, so this component itself never needs to know about units).
- On mount, requests `navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })`.
  - **Success**: streams into a full-bleed `<video>` (`autoPlay`, `playsInline`, `muted` — `playsInline` is required or iOS Safari forces fullscreen video playback, which would break the overlay entirely).
  - **Denied/unavailable**: shows a clear message — "Camera access is needed for this feature. Please allow camera access in your browser settings." — never a silent blank screen.
- The painting overlay (Decision 3) renders on top, initialized centered at a reasonable default size.
- A dismissible one-line caption near the dimensions label: "Nothing is uploaded — this stays on your device."
- Close button returns to the product page.

### 5. Capture and save

A "Save Photo" button:

1. Draws the current `<video>` frame onto an offscreen `<canvas>` sized to the video's real resolution.
2. Draws the painting overlay on top of that same canvas, applying its current translate/scale/rotate transform (the same values driving its on-screen CSS transform, applied via `ctx.translate`/`ctx.rotate`/`ctx.drawImage` instead) — so the exported image matches exactly what the customer was seeing, not a separately-recomputed approximation.
3. `canvas.toBlob()` produces the final image.
4. If `navigator.share` supports files (`navigator.canShare?.({ files: [...] })`), invoke it — hands off to the device's native share sheet (save to photos, send to someone, etc.).
5. **Fallback, not a dead end**: if the Web Share API or file-sharing isn't supported, display the captured image directly in the modal with the instruction "Press and hold the image to save it" — a real, working path on every browser, just a less seamless one than the native share sheet.

### 6. Product page integration

In `SingleProduct.tsx`, near the existing size selector. `CM_TO_INCHES = 1 / 2.54` and the conversion happen right at this call site, using Decision 1's hoisted `parseSizeDimensions`/`inferSizeUnit` on whatever size string the page's own selector already resolved to (`selectedSizeValue`, or its first available size option as a fallback when nothing is selected yet — per Decision 6's "if no size is selected" note below):

```tsx
const CM_TO_INCHES = 1 / 2.54;

const sizeStringForPreview = selectedSizeValue || sizeOptions[0] || "";
const parsedDimensions = parseSizeDimensions(sizeStringForPreview);
const sizeUnit = inferSizeUnit(sizeStringForPreview);
const widthInches = parsedDimensions ? (sizeUnit === "cm" ? parsedDimensions.width * CM_TO_INCHES : parsedDimensions.width) : 0;
const heightInches = parsedDimensions ? (sizeUnit === "cm" ? parsedDimensions.height * CM_TO_INCHES : parsedDimensions.height) : 0;

{useIsMobileDevice() && parsedDimensions && (
  <button type="button" onClick={() => setShowRoomPreview(true)}>
    View in Your Room
  </button>
)}

{showRoomPreview && (
  <ViewInYourRoomModal
    imageUrl={product.images[activeImageIndex]?.src ?? product.images[0]?.src}
    productName={product.name}
    widthInches={widthInches}
    heightInches={heightInches}
    onClose={() => setShowRoomPreview(false)}
  />
)}
```

The button is gated on `parsedDimensions` being real (not just on mobile) — if a product genuinely has no parseable size at all, the feature has nothing honest to show as a dimension label, so it doesn't render rather than showing a fabricated "0″ × 0″."

Uses the currently-displayed product image (`activeImageIndex`, already tracked by the page) and the currently-selected size — if the customer changes size on the page after closing the tool, the next time they open it reflects the new selection.

**If no size is selected yet**, the code above already falls back to `sizeOptions[0]` (the product's first available size) so the button still works — reflected in the code itself, not a separate case to handle. **If a product has no parseable size options at all**, `parsedDimensions` stays `null` and the button simply doesn't render — no fabricated dimension label, no broken button.

### 7. Explicitly out of scope for this build

- Desktop/webcam support — mobile-only, per the Context decision.
- True WebXR plane-detection AR — rejected explicitly in the brainstorm dialogue.
- Calibration against a real-world reference object — rejected in favor of the honest "visual reference only" framing.
- Multiple paintings composited at once (mood-board style) — not asked for; one painting per session keeps this a fraction of the engineering cost, matching the original `suggestion.md` framing.
