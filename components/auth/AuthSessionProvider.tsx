"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppAuthSession } from "@/utils/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  session: AppAuthSession | null;
  status: AuthStatus;
  refreshSession: () => Promise<void>;
  updateSession: (nextSession: AppAuthSession | null) => void;
};

const AuthSessionContext = createContext<AuthContextValue | null>(null);

const readSession = async (): Promise<AppAuthSession | null> => {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    session?: AppAuthSession | null;
  };

  return payload.session || null;
};

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<AppAuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshSession = useCallback(async () => {
    const nextSession = await readSession();
    setSession(nextSession);
    setStatus(nextSession ? "authenticated" : "unauthenticated");
  }, []);

  const updateSession = useCallback((nextSession: AppAuthSession | null) => {
    setSession(nextSession);
    setStatus(nextSession ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    let isActive = true;

    const hydrateSession = async () => {
      const nextSession = await readSession();
      if (!isActive) {
        return;
      }
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    };

    void hydrateSession();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      status,
      refreshSession,
      updateSession,
    }),
    [refreshSession, session, status, updateSession]
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider.");
  }

  return context;
};
