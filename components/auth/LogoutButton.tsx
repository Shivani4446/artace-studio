"use client";

import { useState } from "react";

export default function LogoutButton({
  callbackUrl = "/",
  className,
  label = "Logout",
}: {
  callbackUrl?: string;
  className?: string;
  label?: string;
}) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setIsPending(true);
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        window.location.href = callbackUrl;
      }}
      className={className}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : label}
    </button>
  );
}
