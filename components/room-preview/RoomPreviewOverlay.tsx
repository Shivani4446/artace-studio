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
