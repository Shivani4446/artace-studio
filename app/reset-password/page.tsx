import { Suspense } from "react";
import ResetPasswordPageShell from "@/components/auth/ResetPasswordPageShell";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageShell />
    </Suspense>
  );
}
