"use client";

import { Camera, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import RoomPreviewOverlay, { type OverlayTransform } from "./RoomPreviewOverlay";
import { captureRoomPreview, shareOrDownloadCapture } from "@/utils/room-preview-capture";

type ViewInYourRoomModalProps = {
  imageUrl: string;
  productName: string;
  widthInches: number;
  heightInches: number;
  onClose: () => void;
};

type CameraState = "ready" | "requesting" | "active" | "denied" | "unavailable" | "unsupported";

const DEFAULT_CONTAINER_SIZE = { width: 400, height: 600 };

const getCameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Camera access was blocked. Allow camera access in your browser settings, then try again.";
    }

    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "Your camera is busy in another app. Close the other app and try again.";
    }
  }

  return "We could not start your camera. Please try again.";
};

const ViewInYourRoomModal = ({
  imageUrl,
  productName,
  widthInches,
  heightInches,
  onClose,
}: ViewInYourRoomModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const transformRef = useRef<OverlayTransform>({
    x: DEFAULT_CONTAINER_SIZE.width / 2,
    y: DEFAULT_CONTAINER_SIZE.height / 2,
    scale: 1,
    rotation: 0,
  });

  const [cameraState, setCameraState] = useState<CameraState>("ready");
  const [cameraMessage, setCameraMessage] = useState("");
  const [containerSize, setContainerSize] = useState(DEFAULT_CONTAINER_SIZE);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [captureFallback, setCaptureFallback] = useState(false);

  const aspectRatio = widthInches > 0 && heightInches > 0 ? widthInches / heightInches : 1;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    const updateContainerSize = () => {
      setContainerSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  useEffect(() => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
    }
  }, []);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    overlayImageRef.current = image;
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (capturedImageUrl) URL.revokeObjectURL(capturedImageUrl);
    };
  }, [capturedImageUrl, stopCamera]);

  const startCamera = async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }

    stopCamera();
    setCameraMessage("");
    setCameraState("requesting");

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
      } catch (error) {
        if (!(error instanceof DOMException) || !["NotFoundError", "OverconstrainedError"].includes(error.name)) {
          throw error;
        }

        // Some Android browsers cannot satisfy rear-camera constraints even
        // when another usable camera exists. Retry without a preferred camera.
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Camera preview is unavailable.");
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setCameraState("active");
    } catch (error) {
      stopCamera();
      setCameraMessage(getCameraErrorMessage(error));
      setCameraState(error instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(error.name) ? "denied" : "unavailable");
    }
  };

  const handleSave = async () => {
    const video = videoRef.current;
    const overlayImage = overlayImageRef.current;
    if (!video || !overlayImage || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const blob = await captureRoomPreview({
      video,
      overlayImage,
      transform: transformRef.current,
      aspectRatio,
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
    });
    if (!blob) return;

    const result = await shareOrDownloadCapture(
      blob,
      `${productName.replace(/\s+/g, "-").toLowerCase()}-room-preview.jpg`
    );
    if (result === "fallback") {
      setCapturedImageUrl(URL.createObjectURL(blob));
      setCaptureFallback(true);
    }
  };

  const showCameraControls = !captureFallback && cameraState === "active";
  const canStartCamera = cameraState === "ready" || cameraState === "denied" || cameraState === "unavailable";

  return (
    <div className="fixed inset-0 z-50 bg-black" role="dialog" aria-modal="true" aria-label="View in your room">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={(event) => {
          void event.currentTarget.play().catch(() => {});
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ${showCameraControls ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
        aria-label="Close"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {cameraState === "ready" && (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
          <Camera size={36} aria-hidden="true" />
          <div>
            <p className="font-semibold">See this painting in your room</p>
            <p className="mt-2 text-sm text-white/70">Use your camera to position and size the artwork in your space.</p>
          </div>
          <button type="button" onClick={startCamera} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1a1a]">
            Start camera
          </button>
        </div>
      )}

      {cameraState === "requesting" && (
        <div className="flex h-full items-center justify-center text-white">Starting camera...</div>
      )}

      {(cameraState === "denied" || cameraState === "unavailable") && (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
          <p className="font-semibold">Camera could not start</p>
          <p className="max-w-sm text-sm text-white/70">{cameraMessage}</p>
          {canStartCamera && (
            <button type="button" onClick={startCamera} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1a1a]">
              <RefreshCw size={16} aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      )}

      {cameraState === "unsupported" && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
          <p className="font-semibold">This feature needs a secure connection.</p>
          <p className="max-w-sm text-sm text-white/70">
            Open this page over HTTPS in Safari or Chrome, then try again.
          </p>
        </div>
      )}

      {showCameraControls && (
        <>
          <RoomPreviewOverlay
            key={`${containerSize.width}-${containerSize.height}`}
            imageUrl={imageUrl}
            aspectRatio={aspectRatio}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            onTransformChange={(transform) => {
              transformRef.current = transform;
            }}
          />
          <div className="absolute bottom-24 left-0 right-0 z-10 flex flex-col items-center gap-1 text-center text-white">
            <p className="text-sm font-medium">
              {widthInches.toFixed(1)} in x {heightInches.toFixed(1)} in
            </p>
            <p className="text-xs text-white/70">Nothing is uploaded. This stays on your device.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#1a1a1a]"
          >
            Save photo
          </button>
        </>
      )}

      {captureFallback && capturedImageUrl && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL of the just-captured photo. */}
          <img src={capturedImageUrl} alt="Your room preview" className="max-h-[80vh] max-w-full rounded-lg" />
          <p className="text-center text-sm text-white">Press and hold the image to save it.</p>
        </div>
      )}
    </div>
  );
};

export default ViewInYourRoomModal;
