import { Suspense } from "react";
import SignupPageShell from "@/components/auth/SignupPageShell";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageShell />
    </Suspense>
  );
}
