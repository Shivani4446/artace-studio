"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Mic, Send, Smile, Square, X } from "lucide-react";
import ChatEmojiPicker from "./ChatEmojiPicker";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

type PendingImage = { mimeType: string; data: string; previewUrl: string };

type Props = {
  disabled: boolean;
  onSend: (text: string, image?: { mimeType: string; data: string }) => void;
};

const readBlobAsBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const ChatInputBar = ({ disabled, onSend }: Props) => {
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [imageError, setImageError] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioError, setAudioError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      activeStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageError("");

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("That image is too large (max 4MB).");
      return;
    }

    try {
      const data = await readBlobAsBase64(file);
      setPendingImage({
        mimeType: file.type || "image/jpeg",
        data,
        previewUrl: URL.createObjectURL(file),
      });
    } catch {
      setImageError("Could not read that image — try another.");
    }
  };

  const clearPendingImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    if (!input.trim() && !pendingImage) return;

    onSend(
      input,
      pendingImage ? { mimeType: pendingImage.mimeType, data: pendingImage.data } : undefined
    );
    setInput("");
    clearPendingImage();
  };

  const startRecording = async () => {
    setAudioError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        setIsTranscribing(true);
        try {
          const data = await readBlobAsBase64(blob);
          const response = await fetch("/api/chat/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mimeType: recorder.mimeType, data }),
          });
          const payload = (await response.json()) as { text?: string; error?: string };
          if (payload.text?.trim()) {
            if (!disabledRef.current) {
              onSend(payload.text.trim());
            }
          } else if (payload.error) {
            setAudioError(payload.error);
          } else {
            setAudioError("Didn't catch that — please try again.");
          }
        } catch {
          setAudioError("Could not transcribe that right now.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setAudioError("Microphone access was denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="border-t border-[#1f1f1f]/10 bg-white">
      {imageError && <p className="px-3 pt-2 text-[11px] text-red-600">{imageError}</p>}
      {audioError && <p className="px-3 pt-2 text-[11px] text-red-600">{audioError}</p>}

      {pendingImage && (
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="relative h-12 w-12 overflow-hidden rounded-[8px] border border-[#1f1f1f]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pendingImage.previewUrl} alt="Attached preview" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={clearPendingImage}
            aria-label="Remove attached image"
            className="text-[#96948f] hover:text-[#1f1f1f]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5 px-3 py-2">
        {isEmojiOpen && (
          <ChatEmojiPicker
            onSelect={(emoji) => {
              setInput((current) => `${current}${emoji}`);
              setIsEmojiOpen(false);
            }}
            onClose={() => setIsEmojiOpen(false)}
          />
        )}

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setIsEmojiOpen((current) => !current)}
          aria-label="Add emoji"
          className="text-[#65635d] hover:text-[#1f1f1f]"
        >
          <Smile className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
          className="text-[#65635d] hover:text-[#1f1f1f]"
        >
          <ImagePlus className="h-[18px] w-[18px]" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing || disabled}
          aria-label={isRecording ? "Stop recording" : "Record a voice message"}
          className={`${isRecording ? "text-red-600" : "text-[#65635d] hover:text-[#1f1f1f]"} disabled:opacity-40`}
        >
          {isRecording ? <Square className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={isTranscribing ? "Transcribing..." : "Ask something..."}
          disabled={disabled || isTranscribing}
          className="flex-1 bg-transparent text-[13px] text-[#1f1f1f] outline-none placeholder:text-[#96948f]"
        />
        <button
          type="submit"
          disabled={disabled || isTranscribing || (!input.trim() && !pendingImage)}
          aria-label="Send message"
          className="text-[#1f1f1f] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="px-3 pb-2 text-[11px] text-[#96948f]">
        By chatting with us, you agree to our{" "}
        <Link href="/privacy-policy" className="underline hover:text-[#1f1f1f]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

export default ChatInputBar;
