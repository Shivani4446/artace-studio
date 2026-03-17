"use client";

import { useEffect } from "react";

/**
 * This component adds watermarks to product images without modifying the component structure.
 * It adds event listeners to prevent right-click and adds watermark overlays.
 * 
 * NOTE: This skips watermarks on blog pages (/blogs, /blog-test)
 */
export default function ProductImageProtection() {
  useEffect(() => {
    // Check if we're on a blog page - skip watermarks there
    const path = window.location.pathname;
    const isBlogPage = path.startsWith('/blogs') || path.startsWith('/blog');
    
    if (isBlogPage) {
      return; // Skip entirely on blog pages
    }

    // Function to add watermarks to image containers
    const addWatermarks = () => {
      // Find all image containers in product-related sections
      const imageContainers = document.querySelectorAll(
        '.relative.overflow-hidden.rounded-\\[12px\\], ' +
        '.relative.overflow-hidden.rounded-t-\\[128px\\], ' +
        '.relative.aspect-\\[4\\/5\\].overflow-hidden, ' +
        '.relative.aspect-square.overflow-hidden, ' +
        '.relative.aspect-\\[4\\/4\\.85\\].overflow-hidden'
      );

      imageContainers.forEach((container) => {
        // Skip if already has watermark
        if (container.querySelector('.artace-watermark')) return;

        const watermarkDiv = document.createElement("div");
        watermarkDiv.className = "artace-watermark";
        watermarkDiv.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        `;

        // Center watermark
        const centerWatermark = document.createElement("img");
        centerWatermark.src = "/Artace-logo.svg";
        centerWatermark.alt = "Artace";
        centerWatermark.style.cssText = `
          width: 30%;
          height: auto;
          max-width: 150px;
          opacity: 0.15;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        `;

        // Bottom right watermark
        const bottomRightWatermark = document.createElement("img");
        bottomRightWatermark.src = "/Artace-logo.svg";
        bottomRightWatermark.alt = "Artace";
        bottomRightWatermark.style.cssText = `
          width: 20%;
          height: auto;
          max-width: 80px;
          opacity: 0.15;
          position: absolute;
          bottom: 12px;
          right: 12px;
        `;

        watermarkDiv.appendChild(centerWatermark);
        watermarkDiv.appendChild(bottomRightWatermark);
        container.appendChild(watermarkDiv);
      });
    };

    // Prevent right-click on images
    const preventRightClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.closest(".relative.overflow-hidden")) {
        e.preventDefault();
      }
    };

    // Prevent drag on images
    const preventDrag = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("dragstart", preventDrag);

    // Initial run
    addWatermarks();

    // Run after DOM changes (for dynamic content)
    const observer = new MutationObserver(addWatermarks);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("dragstart", preventDrag);
      observer.disconnect();
    };
  }, []);

  return null;
}
