import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
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
        if (typeof token.sub === "string") {
          session.user.id = token.sub;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (typeof token.username === "string") {
          session.user.username = token.username;
        }
      }
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
