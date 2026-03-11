"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type ResetPasswordFormProps = {
  login: string;
  resetKey: string;
};

export default function ResetPasswordForm({
  login,
  resetKey,
}: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login,
        key: resetKey,
        password,
        confirmPassword,
      }),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      message?: string;
    };

    if (!response.ok || !result.ok) {
      setError(result.message || "Unable to reset your password right now.");
      setIsSubmitting(false);
      return;
    }

    setMessage(result.message || "Your password has been reset.");
    setIsSubmitting(false);
    event.currentTarget.reset();
  };

  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-8">
      <div>
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Create New Password
        </p>
        <h1 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[42px]">
          Set a secure password
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-[#5b5b5b]">
          Choose a new password for <span className="font-medium">{login}</span>.
          Once saved, you can sign back into your Artace account immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            New password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="Use at least 8 characters"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Confirm password
          </span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="Re-enter your password"
          />
        </label>

        {error ? (
          <p className="rounded-[10px] bg-[#f7ebe8] px-4 py-3 text-[14px] text-[#9a3d2f]">
            {error}
          </p>
        ) : null}

        {message ? (
          <div className="rounded-[10px] bg-[#edf4ea] px-4 py-3 text-[14px] text-[#36613f]">
            <p>{message}</p>
            <Link href="/login" className="mt-2 inline-flex font-medium underline">
              Return to login
            </Link>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3.5 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving password..." : "Save New Password"}
        </button>
      </form>

      <div className="mt-6 border-t border-black/8 pt-6 text-[14px] text-[#6d665d]">
        Need a fresh link?{" "}
        <Link href="/forgot-password" className="font-medium text-[#1f1f1f] underline">
          Request another reset email
        </Link>
      </div>
    </div>
  );
}
