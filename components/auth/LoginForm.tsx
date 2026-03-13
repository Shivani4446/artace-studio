"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginForm({
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
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
      setError("Enter both email and password.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    let result: { ok?: boolean; message?: string } = {};
    try {
      result = (await response.json()) as { ok?: boolean; message?: string };
    } catch {
      result = {};
    }

    if (!response.ok || !result.ok) {
      setError(
        result.message ||
          "Unable to sign you in right now. Please try again."
      );
      setIsSubmitting(false);
      return;
    }

    window.location.href = callbackUrl;
  };

  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6">
      <div>
        <h1 className="font-display text-[32px] leading-[1.05] text-[#1f1f1f] sm:text-[38px]">
          {isCheckoutFlow ? "Continue to checkout" : "Sign in to your account"}
        </h1>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#5b5b5b]">
          Use your email (or username) and password. Once you sign in, you can complete your purchase and track your order from the dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Email or Username
          </span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="Enter your email"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="Enter your password"
          />
        </label>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[14px] font-medium text-[#1f1f1f] underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </div>

        {error ? (
          <p className="rounded-[10px] bg-[#f7ebe8] px-4 py-3 text-[14px] text-[#9a3d2f]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3.5 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Signing in..."
            : isCheckoutFlow
              ? "Sign in and return to cart"
              : "Sign in"}
        </button>
      </form>

      <div className="mt-6 border-t border-black/8 pt-6 text-[14px] text-[#6d665d]">
        New here?{" "}
        <Link
          href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-[#1f1f1f] underline"
        >
          Create an account
        </Link>
        {" "}to place your order.
      </div>
    </div>
  );
}
