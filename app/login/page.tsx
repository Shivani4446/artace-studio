import { Suspense } from "react";
import LoginPageShell from "@/components/auth/LoginPageShell";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageShell />
    </Suspense>
  );
}
