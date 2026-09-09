"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const SamoraNewsletterSignup = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/samora/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sourcePage: pathname }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[16px] border border-[#c1683d]/30 bg-[#c1683d]/10 px-5 py-4">
        <p className="text-[14.5px] font-medium text-[#2b2420]">
          You&apos;re on the list — we&apos;ll let you know about new drops and restocks.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email address"
        className="min-h-[46px] w-full flex-1 rounded-full border border-[#2b2420]/15 bg-[#fbf6ef] px-4 text-[14px] text-[#2b2420] outline-none transition-colors focus:border-[#c1683d] sm:max-w-[280px]"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-[46px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#2b2420] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1c1712] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Joining..." : "Get Early Access"}
        {status !== "submitting" ? <ArrowUpRight className="h-4 w-4" strokeWidth={2} /> : null}
      </button>
      {status === "error" ? (
        <p className="text-[13px] text-[#b3402c] sm:basis-full">{errorMessage}</p>
      ) : null}
    </form>
  );
};

export default SamoraNewsletterSignup;
