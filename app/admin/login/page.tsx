"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Incorrect password.");
        setStatus("error");
        return;
      }
      router.push("/admin/affiliates");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f4f2ee] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] rounded-[16px] border border-black/10 bg-white p-8"
      >
        <h1 className="font-display text-[24px] text-[#1f1f1f]">Admin</h1>
        <p className="mt-2 text-[14px] text-[#7a7368]">Enter the admin password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
          autoFocus
          className="mt-5 min-h-[48px] w-full rounded-[12px] border border-black/10 bg-[#faf8f4] px-4 text-[15px] text-[#1a1a1a] outline-none focus:border-[#1a1a1a]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-4 min-h-[48px] w-full rounded-[12px] bg-[#1a1a1a] px-6 text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Signing in..." : "Sign In"}
        </button>
        {status === "error" ? <p className="mt-3 text-[14px] text-red-600">{error}</p> : null}
      </form>
    </main>
  );
}
