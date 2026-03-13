"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignupForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCheckoutFlow = callbackUrl === "/cart" || callbackUrl.startsWith("/cart?");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!firstName || !lastName || !email || !password) {
      setError("Complete all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
      }),
    });

    let registerResult: {
      message?: string;
      ok?: boolean;
      signedIn?: boolean;
      detail?: string;
    } = {};

    try {
      registerResult = (await registerResponse.json()) as {
        message?: string;
        ok?: boolean;
        signedIn?: boolean;
        detail?: string;
      };
    } catch {
      registerResult = {};
    }

    if (!registerResponse.ok || !registerResult.ok) {
      setError(
        registerResult.message ||
          "Unable to create your account right now. Please try again."
      );
      setIsSubmitting(false);
      return;
    }

    window.location.href = registerResult.signedIn
      ? callbackUrl
      : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-5">
      <div>
        <h1 className="font-display text-[28px] leading-[1.08] text-[#1f1f1f] sm:text-[34px]">
          {isCheckoutFlow ? "Create your account to place the order" : "Create your account"}
        </h1>
        <p className="mt-2 text-[13px] leading-[1.6] text-[#6b635a]">
          One-time setup. Your orders will appear in your dashboard automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#2f2f2f]">
              First name
            </span>
            <input
              name="firstName"
              type="text"
              autoComplete="given-name"
              className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-3 py-2.5 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              placeholder="First name"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#2f2f2f]">
              Last name
            </span>
            <input
              name="lastName"
              type="text"
              autoComplete="family-name"
              className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-3 py-2.5 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              placeholder="Last name"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#2f2f2f]">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-3 py-2.5 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="Enter your email"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#2f2f2f]">
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-3 py-2.5 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#2f2f2f]">
              Confirm password
            </span>
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-3 py-2.5 text-[15px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              placeholder="Re-enter"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-[10px] bg-[#f7ebe8] px-3 py-2 text-[13px] leading-5 text-[#9a3d2f]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Creating account..."
            : isCheckoutFlow
              ? "Create account and return to cart"
              : "Create account"}
        </button>
      </form>

      <div className="mt-5 border-t border-black/8 pt-5 text-[13px] text-[#6d665d]">
        Already signed up?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-[#1f1f1f] underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
