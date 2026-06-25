import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    establishmentId?: string;
    slug?: string;
  }

  interface Session {
    user: {
      establishmentId?: string;
      slug?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    establishmentId?: string;
    slug?: string;
  }
}
