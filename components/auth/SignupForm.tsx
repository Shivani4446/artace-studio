"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupForm({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const registerResult = (await registerResponse.json()) as {
      message?: string;
      ok?: boolean;
    };

    if (!registerResponse.ok || !registerResult.ok) {
      setError(registerResult.message || "Unable to create your account.");
      setIsSubmitting(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      redirect: false,
      username: email,
      password,
      callbackUrl,
    });

    if (signInResult?.error) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      return;
    }

    window.location.href = signInResult?.url || callbackUrl;
  };

  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6 md:p-8">
      <div>
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Create Account
        </p>
        <h1 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[42px]">
          Join Artace
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-[#5b5b5b]">
          New customers need an account before logging in. Create one here to track
          orders, manage your details, and access your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4 md:mt-8 md:space-y-5">
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <label className="block">
            <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
              First name
            </span>
            <input
              name="firstName"
              type="text"
              autoComplete="given-name"
              className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              placeholder="First name"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
              Last name
            </span>
            <input
              name="lastName"
              type="text"
              autoComplete="family-name"
              className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
              placeholder="Last name"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
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
            autoComplete="new-password"
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
            placeholder="At least 8 characters"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3.5 text-[16px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 border-t border-black/8 pt-6 text-[14px] text-[#6d665d]">
        Already signed up?{" "}
        <Link href="/login" className="font-medium text-[#1f1f1f] underline">
          Login here
        </Link>
      </div>
    </div>
  );
}
