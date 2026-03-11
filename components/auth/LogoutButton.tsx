"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

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
        await signOut({ callbackUrl });
      }}
      className={className}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : label}
    </button>
  );
}
