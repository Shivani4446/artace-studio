"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import type { WordPressProfile } from "@/utils/wordpress-auth";

type AccountDetailsFormProps = {
  profile: WordPressProfile;
};

export default function AccountDetailsForm({
  profile,
}: AccountDetailsFormProps) {
  const { update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      displayName: String(formData.get("displayName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      description: String(formData.get("description") || "").trim(),
    };

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as {
      message?: string;
      profile?: WordPressProfile;
    };

    if (!response.ok || !result.profile) {
      setError(result.message || "Unable to save your profile right now.");
      setIsSubmitting(false);
      return;
    }

    await update({
      user: {
        name: result.profile.displayName || result.profile.name,
        email: result.profile.email,
        username: result.profile.username,
      },
    });

    setMessage("Your account details have been updated.");
    setIsSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-black/8 bg-white p-6 md:p-8"
    >
      <div className="flex flex-col gap-3 border-b border-black/8 pb-6">
        <p className="text-[14px] uppercase tracking-[0.08em] text-[#7a7368]">
          Profile Details
        </p>
        <h2 className="font-display text-[32px] leading-[1.05] text-[#1f1f1f]">
          Update your account information.
        </h2>
        <p className="max-w-[720px] text-[16px] leading-[1.75] text-[#5b5b5b]">
          Keep your display name, email, and profile details current so order
          updates and support replies reach the right place.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            First name
          </span>
          <input
            name="firstName"
            defaultValue={profile.firstName}
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Last name
          </span>
          <input
            name="lastName"
            defaultValue={profile.lastName}
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Display name
          </span>
          <input
            name="displayName"
            defaultValue={profile.displayName || profile.name}
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
            Email
          </span>
          <input
            name="email"
            type="email"
            defaultValue={profile.email}
            className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-[14px] font-medium text-[#2f2f2f]">
          Bio
        </span>
        <textarea
          name="description"
          defaultValue={profile.description}
          rows={5}
          className="w-full rounded-[10px] border border-black/10 bg-[#fcfaf7] px-4 py-3 text-[16px] leading-[1.7] text-[#222] outline-none transition-colors focus:border-[#1f1f1f]/35"
        />
      </label>

      <div className="mt-5 rounded-[12px] bg-[#fcfaf7] px-4 py-4">
        <p className="text-[14px] text-[#7a7368]">Username</p>
        <p className="mt-1 text-[16px] font-medium text-[#1f1f1f]">
          {profile.username || "Not available"}
        </p>
        <p className="mt-2 text-[14px] leading-[1.6] text-[#5b5b5b]">
          WordPress usernames are usually fixed once the account is created.
        </p>
      </div>

      {error ? (
        <p className="mt-5 rounded-[10px] bg-[#f7ebe8] px-4 py-3 text-[14px] text-[#9a3d2f]">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-[10px] bg-[#edf4ea] px-4 py-3 text-[14px] text-[#36613f]">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex items-center justify-center rounded-[10px] bg-[#1f1f1f] px-5 py-3 text-[15px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Save Details"}
      </button>
    </form>
  );
}
