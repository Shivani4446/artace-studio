import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: DefaultSession["user"] & {
      id?: string;
      username?: string;
    };
  }

  interface User {
    accessToken?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    username?: string;
  }
}
