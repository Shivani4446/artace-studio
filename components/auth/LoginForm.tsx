"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginForm({
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
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (!username || !password) {
      setError("Enter both email and password.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    if (result?.error) {
      setError(
        "No account matched those credentials. Create an account first if you are new."
      );
      setIsSubmitting(false);
      return;
    }

    window.location.href = result?.url || callbackUrl;
  };

  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-6 md:p-8">
      <div>
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Account Login
        </p>
        <h1 className="mt-3 font-display text-[34px] leading-[1.05] text-[#1f1f1f] md:text-[42px]">
          Welcome back
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-[#5b5b5b]">
          Login only if you have already signed up. New customers should create an
          account first before trying to sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4 md:mt-8 md:space-y-5">
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
          {isSubmitting ? "Signing in..." : "Login to Dashboard"}
        </button>
      </form>

      <div className="mt-6 border-t border-black/8 pt-6 text-[14px] text-[#6d665d]">
        New here?{" "}
        <Link href="/signup" className="font-medium text-[#1f1f1f] underline">
          Create your account
        </Link>
        {" "}or{" "}
        <Link href="/contact-us" className="font-medium text-[#1f1f1f] underline">
          contact support
        </Link>
      </div>
    </div>
  );
}
