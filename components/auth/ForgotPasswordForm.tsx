"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      message?: string;
    };

    if (!response.ok || !result.ok) {
      setError(result.message || "Unable to send a reset email right now.");
      setIsSubmitting(false);
      return;
    }

    setMessage(
      result.message || "Check your inbox for a password reset email from WordPress."
    );
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-8">
      <div>
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Password Recovery
        </p>
        <h1 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[42px]">
          Reset your password
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-[#5b5b5b]">
          Enter the email address or username tied to your Artace WordPress account.
          We&apos;ll ask WordPress to send a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Email or Username
          </span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="Enter your account email"
          />
        </label>

        {error ? (
          <p className="rounded-[10px] bg-[#f7ebe8] px-4 py-3 text-[14px] text-[#9a3d2f]">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-[10px] bg-[#edf4ea] px-4 py-3 text-[14px] text-[#36613f]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3.5 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 border-t border-black/8 pt-6 text-[14px] text-[#6d665d]">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-[#1f1f1f] underline">
          Return to login
        </Link>
      </div>
    </div>
  );
}
