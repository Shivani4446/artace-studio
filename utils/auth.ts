import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  getWordPressJwtEndpoint,
  getWordPressUserFromToken,
} from "@/utils/wordpress-auth";

type JwtAuthPayload = {
  token?: string;
  user_email?: string;
  user_display_name?: string;
  user_nicename?: string;
  user_id?: number | string;
};

const safeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const safeId = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const integer = Math.floor(parsed);
  return integer > 0 ? integer : 0;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "WordPress",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = safeText(credentials?.username);
        const password = safeText(credentials?.password);

        if (!username || !password) {
          return null;
        }

        const response = await fetch(getWordPressJwtEndpoint(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          cache: "no-store",
        });

        const payload = (await response.json()) as JwtAuthPayload;

        if (!response.ok || !payload.token) {
          return null;
        }

        const wpUser = await getWordPressUserFromToken(payload.token);
        const resolvedId = wpUser?.id || safeId(payload.user_id);
        const resolvedName =
          wpUser?.name ||
          safeText(payload.user_display_name) ||
          safeText(payload.user_nicename) ||
          username;
        const resolvedEmail = wpUser?.email || safeText(payload.user_email) || username;
        const resolvedUsername =
          wpUser?.username || safeText(payload.user_nicename) || username;

        return {
          id: String(resolvedId || resolvedUsername || resolvedEmail),
          name: resolvedName,
          email: resolvedEmail,
          username: resolvedUsername,
          accessToken: payload.token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken =
          "accessToken" in user && typeof user.accessToken === "string"
            ? user.accessToken
            : undefined;
        token.username =
          "username" in user && typeof user.username === "string"
            ? user.username
            : undefined;
      }

      if (trigger === "update" && session?.user) {
        if (typeof session.user.name === "string") {
          token.name = session.user.name;
        }
        if (typeof session.user.email === "string") {
          token.email = session.user.email;
        }
        if (typeof session.user.username === "string") {
          token.username = session.user.username;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : undefined;
        session.user.name = typeof token.name === "string" ? token.name : session.user.name;
        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email;
        session.user.username =
          typeof token.username === "string" ? token.username : undefined;
      }
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
