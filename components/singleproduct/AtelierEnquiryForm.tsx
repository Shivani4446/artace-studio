"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type AtelierEnquiryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  productSlug: string;
  productImage?: string;
  /** "acquire" while the piece is available, "commission" once it is sold. */
  intent: "acquire" | "commission";
};

type FormStatus = "idle" | "submitting" | "success" | "error";

/**
 * Secondary conversion path for Atelier originals. Direct purchase is the
 * primary CTA on the PDP; this exists for buyers who want to talk it through
 * and for pieces that have already been acquired.
 */
export default function AtelierEnquiryForm({
  isOpen,
  onClose,
  productId,
  productName,
  productSlug,
  productImage,
  intent,
}: AtelierEnquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset on each open so a previous failed attempt doesn't leak into a new one.
  useEffect(() => {
    if (!isOpen) return;
    setStatus("idle");
    setErrorMessage("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    // Prevent the page behind the overlay from scrolling on touch devices.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/atelier-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: String(productId),
          productName,
          productSlug,
          intent,
          name,
          email,
          phone,
          message,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(
          payload.error || "Could not send your enquiry. Please try again."
        );
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("Could not send your enquiry. Please try again.");
      setStatus("error");
    }
  };

  const fieldClass =
    "mt-1 w-full rounded-[8px] border border-[#d7d2c9] bg-white px-3 py-2 text-[15px] text-[#313131] outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-[#1f1f1f]";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:p-4 md:items-center md:p-6">
      <button
        type="button"
        aria-label="Close enquiry form"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="atelier-enquiry-heading"
        className="relative z-[71] w-full max-w-[640px] overflow-hidden rounded-t-[16px] bg-white shadow-[0_22px_48px_rgba(0,0,0,0.28)] sm:rounded-[14px]"
      >
        <div className="relative max-h-[92dvh] overflow-y-auto p-4 sm:p-6 md:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3f3] text-[#313131] hover:bg-[#e7e7e7] sm:right-4 sm:top-4"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {status === "success" ? (
            <div className="py-6 text-center">
              <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
                Enquiry received
              </p>
              <h3
                id="atelier-enquiry-heading"
                className="mt-2 font-display text-[26px] leading-[1.2] text-[#24211d] md:text-[30px]"
              >
                Thank you for reaching out
              </h3>
              <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-7 text-[#595959] md:text-[16px]">
                Our studio will be in touch about{" "}
                <span className="text-[#313131]">{productName}</span> shortly.
                We read every enquiry personally.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center justify-center rounded-[6px] bg-[#1f1f1f] px-6 py-3 text-[16px] text-white transition-colors hover:bg-black"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <p className="font-inter text-[13px] uppercase tracking-[0.08em] text-[#6a655d]">
                {intent === "commission" ? "Commission an original" : "Enquire"}
              </p>
              <h3
                id="atelier-enquiry-heading"
                className="mt-2 max-w-[80%] font-display text-[26px] leading-[1.2] text-[#24211d] md:text-[30px]"
              >
                {intent === "commission"
                  ? "Commission a Similar Piece"
                  : "Enquire About This Piece"}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-[#595959] md:text-[16px]">
                {intent === "commission"
                  ? "This piece has been acquired, but each original is made to order. Tell us what you have in mind and the studio will come back with options."
                  : "Share a few details and our studio will follow up with availability, framing and delivery."}
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-[10px] border border-[#e4ded4] bg-[#faf8f4] p-3">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-[6px] object-cover"
                  />
                ) : null}
                <p className="text-[15px] leading-6 text-[#313131] md:text-[16px]">
                  {productName}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-[14px] font-medium text-[#313131]">
                    Name <span className="text-[#c0392b]">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-[14px] font-medium text-[#313131]">
                    Email <span className="text-[#c0392b]">*</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-[14px] font-medium text-[#313131]">
                    Phone <span className="text-[#595959]">(optional)</span>
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91"
                    className={fieldClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block text-[14px] font-medium text-[#313131]">
                    Message <span className="text-[#595959]">(optional)</span>
                  </span>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the space, or what you would like commissioned."
                    className={`${fieldClass} resize-y`}
                  />
                </label>

                {status === "error" && errorMessage ? (
                  <p className="text-[14px] text-[#c0392b] sm:col-span-2" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex w-full items-center justify-center rounded-[6px] bg-[#1f1f1f] px-6 py-3 text-[16px] text-white transition-colors hover:bg-black disabled:opacity-60 sm:w-auto"
                  >
                    {status === "submitting" ? "Sending..." : "Send Enquiry"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
