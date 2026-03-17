"use client";

import Image, { ImageProps } from "next/image";
import React from "react";

interface ProtectedImageProps extends Omit<ImageProps, "onLoad"> {
  showWatermark?: boolean;
}

/**
 * ProtectedImage component that prevents users from easily copying,
 * saving, or screenshotting product images.
 * 
 * Features:
 * - Prevents image dragging
 * - Adds watermarks (Artace logo at center and right bottom)
 * - Can disable watermarks with showWatermark={false}
 */
export const ProtectedImage: React.FC<ProtectedImageProps> = ({
  fill,
  className,
  style,
  showWatermark = true,
  ...props
}) => {
  return (
    <div 
      className="protected-image-wrapper" 
      style={{ 
        position: "relative", 
        width: "100%", 
        height: "100%"
      }}
    >
      <Image
        {...props}
        fill={fill}
        className={className}
        style={{ ...style, position: fill ? "absolute" : "relative" }}
        draggable={false}
      />
      
      {showWatermark && (
        <>
          {/* Center watermark */}
          <div
            className="watermark-center"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.2,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Image
              src="/Artace-logo.svg"
              alt="Artace"
              width={120}
              height={60}
              style={{ width: "auto", height: "auto", maxWidth: "120px" }}
            />
          </div>
          
          {/* Bottom right watermark */}
          <div
            className="watermark-bottom-right"
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              opacity: 0.2,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Image
              src="/Artace-logo.svg"
              alt="Artace"
              width={80}
              height={40}
              style={{ width: "auto", height: "auto", maxWidth: "80px" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProtectedImage;
