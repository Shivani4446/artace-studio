"use client";

import React, { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ onUpload, maxFiles = 5 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter((file) =>
        ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"].includes(file.type)
      );

      if (imageFiles.length === 0) {
        setError("Please select valid image files (PNG, JPG, WEBP, HEIC).");
        return;
      }

      if (imageFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed.`);
        return;
      }

      // Create previews
      const newPreviews = imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setPreviews(newPreviews);

      // Upload files
      setUploading(true);
      try {
        const formData = new FormData();
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });

        const response = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Upload failed.");
        }

        const data = await response.json();
        onUpload(data.urls);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [maxFiles, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        // Convert FileList-like array to FileList
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        handleFiles(dataTransfer.files);
      }
    },
    [handleFiles]
  );

  // Add paste event listener
  React.useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  // Clean up preview URLs
  React.useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, [previews]);

  return (
    <div className="space-y-4">
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-[#292929] bg-gray-50"
            : "border-gray-300 hover:border-[#292929]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="flex justify-center">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#1a1a1a]">
            Drop images here or click to upload
          </p>
          <p className="text-sm text-[#595959]">
            PNG, JPG, WEBP, HEIC up to 10MB each (max {maxFiles} images)
          </p>
          <p className="text-xs text-[#595959]">
            You can also paste images directly from clipboard
          </p>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-[#595959]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#292929]" />
          Uploading images...
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {previews.length > 0 && !uploading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={preview.preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
