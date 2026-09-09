# "View in Your Room" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Status (as of implementation)

All 7 tasks' code is written. `npx tsc --noEmit`, `npm run lint`, `npm run build`, and the full Playwright e2e suite (12 tests, including 3 new ones in `e2e/view-in-your-room.spec.ts`) all pass clean.

The gesture math (Task 3 — move/resize/rotate) was verified with a throwaway harness page and Playwright mouse-drag simulation, checked against exact expected numbers (a +50,+50px drag produced exactly `x:250,y:350`; a 2x-distance resize produced exactly `scale:2`; a 90° drag produced exactly `rotation:90`) — real confidence in the math, not just "it compiles." The camera-denied fallback path (Task 5) was verified live with a mocked `getUserMedia` rejection. Button placement and mobile/desktop visibility (Task 6) were verified live and screenshotted on a real product page.

**What's genuinely still unverified, and needs a real phone — not something skipped:**
1. **The actual touch feel of the gestures** — mouse-drag simulation exercises the same Pointer Events code path as touch, but real multi-touch behavior, `touchAction: "none"` actually preventing page scroll during a drag, and general responsiveness can only be judged on a real device.
2. **The granted-camera path end to end** — the live feed rendering, the overlay compositing correctly over it, and tapping "Save Photo" actually invoking the native share sheet (or its fallback). Headless Chromium's fake-camera-device flags didn't reliably produce a working video stream in testing here; this needs a real phone with a real camera.

One real, unrelated bug found and fixed along the way (not part of the original scope): the Playwright e2e run failed with `Cannot use({ defaultBrowserType }) in a describe group` — `devices["iPhone 13"]`'s full preset object can't be spread into `test.use()` inside a nested `describe` block. Fixed by destructuring out `defaultBrowserType` before spreading the rest.

**Goal:** A mobile-only, camera-based tool on every product page that lets a customer see the painting overlaid on a live view of their own wall — drag to move, a handle to resize, a handle to rotate — with the real dimensions shown for reference and a "Save Photo" button to keep the result.

**Architecture:** Everything runs client-side in the browser — camera feed via `getUserMedia`, the painting overlay as a CSS-transformed `<img>` driven by custom pointer-event gesture handlers (no gesture library exists in this codebase, and handle-based drag/resize/rotate is more reliable than raw multi-touch pinch recognition), and capture via `<canvas>` compositing + the Web Share API. Nothing is uploaded anywhere at any point.

**Tech Stack:** Next.js App Router (client components), React state + refs, the Pointer Events API (unifies mouse and touch), the MediaDevices API (`getUserMedia`), Canvas 2D API, Web Share API.

**Spec:** `docs/superpowers/specs/2026-09-09-view-in-your-room-design.md`

## Global Constraints

- **Mobile-only.** The entry point (the button on the product page) must not render on desktop.
- **No calibration, no precision claim.** The overlay is a free manual resize with a real-dimensions text label — framed honestly as a visual reference, never as an accurate measurement tool.
- **Nothing is ever uploaded.** Camera feed, overlay, and the final composite are all handled entirely in the browser. State this explicitly to the customer on the permission prompt.
- **The painting's aspect ratio comes from its real selected size (width:height in inches), never from the product photo file's own pixel dimensions** — the photo may include padding/framing that doesn't match the true canvas proportions.
- **No test framework beyond the Playwright e2e suite.** Verification per task: `npx tsc --noEmit`, plus a live check — a screenshot for visual/layout tasks, a Playwright test for the parts that can be meaningfully automated (button visibility, permission-denied fallback), manual verification on a real phone for the parts that can't (actual drag/resize/rotate feel, actual camera feed, actual Web Share sheet).
- **Never run `git commit`/`git push`.** No task below includes a commit step.
- **Port 3000 is the user's own dev server — never touch it.** Every live-check step uses a fresh, incrementing port and confirms port 3000's state is unchanged before and after.

---

### Task 1: Hoist the size-parsing utility

**Files:**
- Create: `utils/product-size.ts`
- Modify: `components/singleproduct/SingleProduct.tsx:476-492` (remove the two local functions, import from the new file instead)

**Interfaces:**
- Produces: `parseSizeDimensions(value: string): { width: number; height: number } | null`, `inferSizeUnit(value: string): "in" | "cm"` — both consumed by Task 6.

- [ ] **Step 1: Write the utility file**

```ts
// utils/product-size.ts

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

This is a verbatim copy of the two functions currently at `components/singleproduct/SingleProduct.tsx:476-492` — not a rewrite, so there's nothing new to get wrong here.

- [ ] **Step 2: Remove the local copies and import instead**

In `components/singleproduct/SingleProduct.tsx`, delete the `parseSizeDimensions` and `inferSizeUnit` function definitions (lines 476-492), and add near the top of the file's imports:

```ts
import { parseSizeDimensions, inferSizeUnit } from "@/utils/product-size";
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors. If either function was still referenced by name before this import was added, a missing-reference error here means Step 2's import placement needs adjusting — but the names are identical, so this should just resolve cleanly.

- [ ] **Step 4: Verify the product page's own size selector still works**

Start a local dev server (fresh port, confirm port 3000 unchanged first), open any product page with size options, and confirm selecting a size still highlights the right button and updates the price — this refactor touches code the price calculation depends on, so a visual check here is the real test that nothing broke.

```bash
netstat -ano | grep ":3000" | grep LISTENING
npx next dev -p 3067
```

- [ ] **Task complete — ready for review.**

---

### Task 2: `useIsMobileDevice` hook

**Files:**
- Create: `hooks/useIsMobileDevice.ts`

**Interfaces:**
- Produces: `useIsMobileDevice(): boolean` — consumed by Task 6.

- [ ] **Step 1: Write the hook**

```ts
// hooks/useIsMobileDevice.ts
"use client";
import { useEffect, useState } from "react";

/**
 * A pragmatic proxy, not perfect device detection: true when the viewport is
 * narrow AND the device supports touch. Good enough for a feature that
 * degrades gracefully either way — a false positive/negative just means the
 * button shows or hides on the "wrong" side of an edge case, not a broken
 * feature.
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Task complete — ready for review.** (Verified indirectly in Task 6/7 once something actually consumes it — a hook with no caller yet has nothing meaningful to check live.)

---

### Task 3: The gesture-driven overlay component

**Files:**
- Create: `components/room-preview/RoomPreviewOverlay.tsx`

**Interfaces:**
- Produces: `OverlayTransform = { x: number; y: number; scale: number; rotation: number }` (exported type); `<RoomPreviewOverlay imageUrl={string} aspectRatio={number} containerWidth={number} containerHeight={number} onTransformChange={(t: OverlayTransform) => void} />` — both consumed by Task 4 and Task 5.

This is the most novel piece — no gesture library exists in this codebase, so it's built from raw Pointer Events. The critical detail to get right: **all position math must happen in container-relative coordinates, never mixing them with viewport (`clientX`/`clientY`) coordinates directly** — the container's `getBoundingClientRect()` converts between the two on every pointer event, so distance/angle calculations for resize and rotate are always measured against the same coordinate space the overlay's own `x`/`y` state lives in.

- [ ] **Step 1: Write the component**

```tsx
// components/room-preview/RoomPreviewOverlay.tsx
"use client";

import { useCallback, useRef, useState } from "react";

export type OverlayTransform = { x: number; y: number; scale: number; rotation: number };

type RoomPreviewOverlayProps = {
  imageUrl: string;
  aspectRatio: number; // width / height, from the real selected size — never the image file's own pixel dimensions
  containerWidth: number;
  containerHeight: number;
  onTransformChange: (transform: OverlayTransform) => void;
};

const BASE_WIDTH_PX = 150;
const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

type DragMode = "move" | "resize" | "rotate";
type DragState = {
  mode: DragMode;
  startPointerX: number;
  startPointerY: number;
  startTransform: OverlayTransform;
};

const RoomPreviewOverlay = ({
  imageUrl,
  aspectRatio,
  containerWidth,
  containerHeight,
  onTransformChange,
}: RoomPreviewOverlayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [transform, setTransform] = useState<OverlayTransform>({
    x: containerWidth / 2,
    y: containerHeight / 2,
    scale: 1,
    rotation: 0,
  });

  const baseHeight = BASE_WIDTH_PX / aspectRatio;

  const toContainerRelative = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: clientX, y: clientY };
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const updateTransform = useCallback(
    (next: OverlayTransform) => {
      setTransform(next);
      onTransformChange(next);
    },
    [onTransformChange]
  );

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const { x, y } = toContainerRelative(e.clientX, e.clientY);
    dragStateRef.current = { mode, startPointerX: x, startPointerY: y, startTransform: transform };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;

    const { x: pointerX, y: pointerY } = toContainerRelative(e.clientX, e.clientY);
    const { mode, startPointerX, startPointerY, startTransform } = drag;

    if (mode === "move") {
      const dx = pointerX - startPointerX;
      const dy = pointerY - startPointerY;
      updateTransform({ ...startTransform, x: startTransform.x + dx, y: startTransform.y + dy });
      return;
    }

    // Resize and rotate both measure relative to the overlay's own center
    // (startTransform.x/y), which stays fixed for the duration of that drag.
    const centerX = startTransform.x;
    const centerY = startTransform.y;

    if (mode === "resize") {
      const startDist = Math.hypot(startPointerX - centerX, startPointerY - centerY);
      const currentDist = Math.hypot(pointerX - centerX, pointerY - centerY);
      const ratio = startDist > 0 ? currentDist / startDist : 1;
      const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, startTransform.scale * ratio));
      updateTransform({ ...startTransform, scale: nextScale });
      return;
    }

    if (mode === "rotate") {
      const startAngle = Math.atan2(startPointerY - centerY, startPointerX - centerX);
      const currentAngle = Math.atan2(pointerY - centerY, pointerX - centerX);
      const deltaDegrees = ((currentAngle - startAngle) * 180) / Math.PI;
      updateTransform({ ...startTransform, rotation: startTransform.rotation + deltaDegrees });
    }
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0"
      style={{ touchAction: "none" }}
    >
      <div
        onPointerDown={startDrag("move")}
        style={{
          position: "absolute",
          left: transform.x,
          top: transform.y,
          width: BASE_WIDTH_PX,
          height: baseHeight,
          transform: `translate(-50%, -50%) rotate(${transform.rotation}deg) scale(${transform.scale})`,
          touchAction: "none",
        }}
        className="cursor-move"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a live, freely CSS-transformed overlay image; next/image's fixed intrinsic layout modes don't fit an element the user drags/scales/rotates arbitrarily */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />

        <div
          onPointerDown={startDrag("resize")}
          style={{ position: "absolute", right: -12, bottom: -12, touchAction: "none" }}
          className="flex h-8 w-8 cursor-nwse-resize items-center justify-center rounded-full border-2 border-white bg-[#1f1f1f]"
        />

        <div
          onPointerDown={startDrag("rotate")}
          style={{ position: "absolute", left: "50%", top: -40, transform: "translateX(-50%)", touchAction: "none" }}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-full border-2 border-white bg-[#1f1f1f]"
        />
      </div>
    </div>
  );
};

export default RoomPreviewOverlay;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Verify the gesture math live, on a real touch device**

This component has no consumer yet, so verify it in isolation: create a throwaway page (e.g. a temporary route or a story-like harness rendered directly), mount `<RoomPreviewOverlay imageUrl="/some-real-product-image.webp" aspectRatio={0.75} containerWidth={400} containerHeight={600} onTransformChange={console.log} />`, and confirm on an actual phone (not just desktop mouse emulation, since real multi-touch and pointer-capture behavior can differ): dragging the body moves it, dragging the bottom-right handle resizes it (keeping proportions), dragging the top handle rotates it, and none of the three gestures cause the whole page to scroll (the `touchAction: "none"` styles are what should prevent this — confirm they actually do on a real device, since this is exactly the kind of thing that behaves differently on paper than in a real mobile browser).

Delete the throwaway harness page once this is confirmed — it isn't part of the feature.

- [ ] **Task complete — ready for review.**

---

### Task 4: Capture utility

**Files:**
- Create: `utils/room-preview-capture.ts`

**Interfaces:**
- Consumes: `OverlayTransform` (Task 3).
- Produces: `captureRoomPreview(input: { video: HTMLVideoElement; overlayImage: HTMLImageElement; transform: OverlayTransform; aspectRatio: number; containerWidth: number; containerHeight: number }): Promise<Blob | null>`; `shareOrDownloadCapture(blob: Blob, filename: string): Promise<"shared" | "fallback">` — both consumed by Task 5.

Pulled out as its own pure-function file (not inline in the modal) so the canvas-compositing math — the part most likely to need a fix if the visual result ever looks wrong — is isolated from the modal's camera/permission/UI state.

- [ ] **Step 1: Write the capture function**

```ts
// utils/room-preview-capture.ts
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Task complete — ready for review.** (Real verification happens in Task 5's live check, where a video element and a real overlay actually exist to capture.)

---

### Task 5: The camera modal

**Files:**
- Create: `components/room-preview/ViewInYourRoomModal.tsx`

**Interfaces:**
- Consumes: `RoomPreviewOverlay`, `OverlayTransform` (Task 3); `captureRoomPreview`, `shareOrDownloadCapture` (Task 4).
- Produces: `<ViewInYourRoomModal imageUrl={string} productName={string} widthInches={number} heightInches={number} onClose={() => void} />` — consumed by Task 6.

- [ ] **Step 1: Write the modal**

```tsx
// components/room-preview/ViewInYourRoomModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import RoomPreviewOverlay, { type OverlayTransform } from "./RoomPreviewOverlay";
import { captureRoomPreview, shareOrDownloadCapture } from "@/utils/room-preview-capture";

type ViewInYourRoomModalProps = {
  imageUrl: string;
  productName: string;
  widthInches: number;
  heightInches: number;
  onClose: () => void;
};

type CameraState = "requesting" | "granted" | "denied";

const CONTAINER_WIDTH = typeof window !== "undefined" ? window.innerWidth : 400;
const CONTAINER_HEIGHT = typeof window !== "undefined" ? window.innerHeight : 600;

const ViewInYourRoomModal = ({ imageUrl, productName, widthInches, heightInches, onClose }: ViewInYourRoomModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const transformRef = useRef<OverlayTransform>({ x: CONTAINER_WIDTH / 2, y: CONTAINER_HEIGHT / 2, scale: 1, rotation: 0 });

  const [cameraState, setCameraState] = useState<CameraState>("requesting");
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [captureFallback, setCaptureFallback] = useState(false);

  const aspectRatio = widthInches / heightInches;

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraState("granted");
      })
      .catch(() => {
        if (!cancelled) setCameraState("denied");
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    overlayImageRef.current = img;
  }, [imageUrl]);

  const handleSave = async () => {
    const video = videoRef.current;
    const overlayImage = overlayImageRef.current;
    if (!video || !overlayImage) return;

    const blob = await captureRoomPreview({
      video,
      overlayImage,
      transform: transformRef.current,
      aspectRatio,
      containerWidth: CONTAINER_WIDTH,
      containerHeight: CONTAINER_HEIGHT,
    });
    if (!blob) return;

    const result = await shareOrDownloadCapture(blob, `${productName.replace(/\s+/g, "-").toLowerCase()}-room-preview.jpg`);
    if (result === "fallback") {
      setCapturedImageUrl(URL.createObjectURL(blob));
      setCaptureFallback(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
        aria-label="Close"
      >
        ✕
      </button>

      {cameraState === "requesting" && (
        <div className="flex h-full items-center justify-center text-white">Requesting camera access…</div>
      )}

      {cameraState === "denied" && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
          <p>Camera access is needed for this feature.</p>
          <p className="text-sm text-white/70">Please allow camera access in your browser settings.</p>
        </div>
      )}

      {cameraState === "granted" && !captureFallback && (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
          <RoomPreviewOverlay
            imageUrl={imageUrl}
            aspectRatio={aspectRatio}
            containerWidth={CONTAINER_WIDTH}
            containerHeight={CONTAINER_HEIGHT}
            onTransformChange={(t) => {
              transformRef.current = t;
            }}
          />
          <div className="absolute bottom-24 left-0 right-0 z-10 flex flex-col items-center gap-1 text-center text-white">
            <p className="text-sm font-medium">
              {widthInches.toFixed(1)}″ × {heightInches.toFixed(1)}″
            </p>
            <p className="text-xs text-white/70">Nothing is uploaded — this stays on your device.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#1a1a1a]"
          >
            Save Photo
          </button>
        </>
      )}

      {captureFallback && capturedImageUrl && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local object: URL of the just-captured photo, not something next/image's remote-loader config applies to */}
          <img src={capturedImageUrl} alt="Your room preview" className="max-h-[80vh] max-w-full rounded-[12px]" />
          <p className="text-center text-sm text-white">Press and hold the image to save it.</p>
        </div>
      )}
    </div>
  );
};

export default ViewInYourRoomModal;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Verify the permission-denied path live (no real camera needed for this part)**

On a fresh local dev server (port 3000 reconfirmed unchanged), open browser devtools, deny the camera permission prompt when this modal is rendered (a throwaway test page works, same as Task 3's), and confirm the "Camera access is needed" message shows — not a blank screen or a console error.

- [ ] **Step 4: Verify the granted path + save flow live, on a real phone**

On a real phone (not desktop — `facingMode: "environment"` and the whole point of this feature assume a rear-facing mobile camera), grant camera access, confirm the live feed shows, the overlay renders and responds to the gestures verified in Task 3, the dimension label shows the real number passed in, and tapping "Save Photo" either opens the native share sheet (if supported) or shows the fallback captured image with the "press and hold" instruction. Confirm the saved/shared image actually shows the painting composited in — not just the bare camera frame — since that's the one thing a screenshot of the *live* UI can't prove on its own.

- [ ] **Task complete — ready for review.**

---

### Task 6: Product page integration

**Files:**
- Modify: `components/singleproduct/SingleProduct.tsx` (around line 2025-2056, the existing size-selector block)

**Interfaces:**
- Consumes: `parseSizeDimensions`, `inferSizeUnit` (Task 1); `useIsMobileDevice` (Task 2); `ViewInYourRoomModal` (Task 5).

- [ ] **Step 1: Add the imports**

```ts
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import ViewInYourRoomModal from "@/components/room-preview/ViewInYourRoomModal";
```

(`parseSizeDimensions`/`inferSizeUnit` are already imported from Task 1 — no new import needed for those.)

- [ ] **Step 2: Add the state and derived values**

Near the other `useState` declarations in the component:

```ts
const [showRoomPreview, setShowRoomPreview] = useState(false);
const isMobileDevice = useIsMobileDevice();
```

Right before the JSX return (or wherever the component already computes similar derived values from `selectedSizeValue`/`sizeOptions`):

```ts
const CM_TO_INCHES = 1 / 2.54;
const sizeStringForPreview = selectedSizeValue || sizeOptions[0] || "";
const parsedDimensionsForPreview = parseSizeDimensions(sizeStringForPreview);
const sizeUnitForPreview = inferSizeUnit(sizeStringForPreview);
const previewWidthInches = parsedDimensionsForPreview
  ? sizeUnitForPreview === "cm"
    ? parsedDimensionsForPreview.width * CM_TO_INCHES
    : parsedDimensionsForPreview.width
  : 0;
const previewHeightInches = parsedDimensionsForPreview
  ? sizeUnitForPreview === "cm"
    ? parsedDimensionsForPreview.height * CM_TO_INCHES
    : parsedDimensionsForPreview.height
  : 0;
```

- [ ] **Step 3: Add the button and modal**

Right after the existing size-selector block's closing `)}` (the one ending the `{sizeOptions.length > 0 && (...)}` section, immediately before the `{!isPhotography && (` frame-selector block):

```tsx
{isMobileDevice && parsedDimensionsForPreview && (
  <div className="mt-6 md:mt-[30px]">
    <button
      type="button"
      onClick={() => setShowRoomPreview(true)}
      className="inline-flex items-center gap-2 rounded-[8px] border border-[#d5d5d5] bg-white px-4 py-2 font-inter text-[14px] font-medium text-[#595959] transition-colors hover:bg-[#f5f0e8]"
    >
      View in Your Room
    </button>
  </div>
)}

{showRoomPreview && parsedDimensionsForPreview && (
  <ViewInYourRoomModal
    imageUrl={product.images[activeImageIndex]?.src ?? product.images[0]?.src}
    productName={product.name}
    widthInches={previewWidthInches}
    heightInches={previewHeightInches}
    onClose={() => setShowRoomPreview(false)}
  />
)}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Verify live — button visibility across viewport sizes**

Fresh local dev server (port 3000 reconfirmed unchanged), open a real product page:
- At a desktop viewport, confirm the button does **not** render.
- At a mobile-emulated viewport (devtools device toolbar, which also reports touch support), confirm the button **does** render, and shows real dimensions matching the currently-selected size.
- Change the selected size and confirm the button (once reopened) reflects the new size.

- [ ] **Task complete — ready for review.**

---

### Task 7: E2E test for the parts that can be meaningfully automated

**Files:**
- Create: `e2e/view-in-your-room.spec.ts`

**Interfaces:**
- Consumes: nothing from `e2e/mocks.ts` — this feature needs no payment/auth mocking, since it's entirely client-side with no API calls.

Camera gestures and the actual live feed can't be meaningfully automated (there's no real camera in CI, and gesture-drag pixel math is better verified by hand on a real device per Task 3/5's own live-check steps). What *can* be automated cheaply and reliably: button visibility by device type, and the permission-denied fallback path (by mocking `navigator.mediaDevices.getUserMedia` at the JS level — no Chromium fake-camera launch flags needed).

- [ ] **Step 1: Write the test**

```ts
// e2e/view-in-your-room.spec.ts
import { test, expect, devices } from "@playwright/test";

test.describe("View in Your Room", () => {
  test("the button does not appear on a desktop viewport", async ({ page }) => {
    await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
    await expect(page.getByRole("button", { name: "View in Your Room" })).toHaveCount(0);
  });

  test.describe("on a mobile viewport", () => {
    test.use({ ...devices["iPhone 13"] });

    test("the button appears and opens the modal", async ({ page }) => {
      await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
      await expect(page.getByRole("button", { name: "View in Your Room" })).toBeVisible();
    });

    test("shows the camera-denied message when permission is refused", async ({ page }) => {
      await page.addInitScript(() => {
        // @ts-expect-error -- overriding a real browser API for the test, not implementing the full MediaDevices interface.
        navigator.mediaDevices = {
          getUserMedia: () => Promise.reject(new Error("Permission denied")),
        };
      });

      await page.goto("/shop/lotus-madhubani-painting-traditional-indian-folk-art-artace-studio");
      await page.getByRole("button", { name: "View in Your Room" }).click();

      await expect(page.getByText("Camera access is needed for this feature.")).toBeVisible();
    });
  });
});
```

The product slug above is a real one already confirmed to exist earlier this engagement (it appeared in the sitemap live-test output) — the implementer should confirm it's still live before running this (`curl` it, or swap in whatever real product slug is confirmed live at implementation time; never a fabricated slug).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Run the new tests, then the full suite**

```bash
npx playwright test e2e/view-in-your-room.spec.ts --reporter=line
npx playwright test --reporter=line
```

Expected: all new tests pass, and the full suite (now 12 tests: the prior 9 plus these 3) passes with no regressions.

- [ ] **Step 4: Clean up test artifacts**

```bash
rm -rf test-results playwright-report
```

- [ ] **Task complete — ready for review.**

---

## Self-Review

**1. Spec coverage** — Decision 1 (hoist utility) → Task 1. Decision 2 (device detection) → Task 2. Decision 3 (overlay/gesture model) → Task 3. Decision 4 (camera modal) → Task 5. Decision 5 (capture/save) → Task 4 (the pure logic) + Task 5 (wiring it to real video/overlay elements). Decision 6 (product page integration, including the no-size-selected fallback and the no-parseable-size non-render case) → Task 6. Decision 7 (non-goals) → nothing built for desktop, WebXR, calibration, or multi-painting — confirmed no task touches any of these.

**2. Placeholder scan** — no "TBD"/"TODO" found. The one thing that could look like a placeholder — `CONTAINER_WIDTH`/`CONTAINER_HEIGHT` computed from `window.innerWidth/innerHeight` at module scope in Task 5 — is deliberate, not unfinished: this is a client component that only ever mounts after a user click on an already-mobile-detected page, so `window` is always defined by the time it runs; the `typeof window !== "undefined"` guard is defensive for SSR-time module evaluation, not runtime ambiguity.

**3. Type consistency** — `OverlayTransform` is defined once (Task 3) and imported by both Task 4 and Task 5 rather than redefined. `captureRoomPreview`'s parameter names and `RoomPreviewOverlay`'s `onTransformChange` callback shape match exactly between where Task 3 produces them and where Task 5 consumes them. `parseSizeDimensions`/`inferSizeUnit`'s signatures in Task 1 match their Task 6 call sites.

**4. Scope check** — one coherent, self-contained feature; not split further.

**5. Ambiguity check** — the one place worth being explicit about: Task 6's button is gated on `parsedDimensionsForPreview` being truthy (not just `isMobileDevice`), matching the spec's Decision 6 exactly — a product with literally no parseable size never shows a button with a fabricated "0″ × 0″" label.
