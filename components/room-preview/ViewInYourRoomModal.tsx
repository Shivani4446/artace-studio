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

type CameraState = "requesting" | "granted" | "denied" | "unsupported";

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

    // navigator.mediaDevices only exists in a secure context (HTTPS, or
    // localhost itself) — on any other origin it's simply undefined, and
    // calling .getUserMedia on it throws synchronously, before any .catch()
    // can attach. Guard for that distinctly from a real permission denial.
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

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

      {cameraState === "unsupported" && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
          <p>This feature needs a secure connection.</p>
          <p className="text-sm text-white/70">
            Please make sure you&apos;re viewing this page over a secure (https://) connection, on a browser that
            supports camera access.
          </p>
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
