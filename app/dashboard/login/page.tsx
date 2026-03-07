"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Login failed.");
      }

      router.push("/dashboard/orders");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-12">
      <div className="border border-[#1f1f1f]/10 bg-white p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Account</p>
        <h1 className="mt-2 font-display text-5xl text-[#222]">Login</h1>
        <p className="mt-3 text-sm text-[#555]">
          Use your existing WordPress / WooCommerce customer credentials.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Email or Username"
            className="w-full border border-[#1f1f1f]/15 px-3 py-2.5 text-sm outline-none focus:border-[#1f1f1f]/40"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full border border-[#1f1f1f]/15 px-3 py-2.5 text-sm outline-none focus:border-[#1f1f1f]/40"
            required
          />

          {error && <p className="text-sm text-[#b42318]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#222] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-5 text-sm">
          <Link
            href="/dashboard/signup"
            className="text-[#222] underline underline-offset-4"
          >
            Create New Account
          </Link>
          <Link href="/dashboard/orders" className="text-[#222] underline underline-offset-4">
            View Orders Dashboard
          </Link>
          <Link
            href={`${process.env.NEXT_PUBLIC_WOOCOMMERCE_SITE_URL || "https://artacestudio.com"}/wp-admin`}
            target="_blank"
            rel="noreferrer"
            className="text-[#222] underline underline-offset-4"
          >
            Open WordPress Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
