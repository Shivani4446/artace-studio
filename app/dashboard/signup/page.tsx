"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignupPage = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        requiresLogin?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Signup failed.");
      }

      if (payload.requiresLogin) {
        router.push("/dashboard/login");
      } else {
        router.push("/dashboard/orders");
      }
      router.refresh();
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-14 md:px-12">
      <div className="border border-[#1f1f1f]/10 bg-white p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.08em] text-[#666]">Account</p>
        <h1 className="mt-2 font-display text-5xl text-[#222]">Sign Up</h1>
        <p className="mt-3 text-sm text-[#555]">
          Create your account to view your order history and checkout faster.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First Name"
              className="w-full border border-[#1f1f1f]/15 px-3 py-2.5 text-sm outline-none focus:border-[#1f1f1f]/40"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last Name"
              className="w-full border border-[#1f1f1f]/15 px-3 py-2.5 text-sm outline-none focus:border-[#1f1f1f]/40"
              required
            />
          </div>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full border border-[#1f1f1f]/15 px-3 py-2.5 text-sm outline-none focus:border-[#1f1f1f]/40"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (min 8 chars)"
            className="w-full border border-[#1f1f1f]/15 px-3 py-2.5 text-sm outline-none focus:border-[#1f1f1f]/40"
            minLength={8}
            required
          />

          {error && <p className="text-sm text-[#b42318]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#222] px-5 py-3 text-sm font-semibold uppercase tracking-[0.06em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-[#555]">
          Already have an account?{" "}
          <Link href="/dashboard/login" className="text-[#222] underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignupPage;
