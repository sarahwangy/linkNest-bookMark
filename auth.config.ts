import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Edge-compatible auth config — no Prisma adapter, no Node.js-only imports.
// Used by proxy.ts (Edge Runtime). Full auth with adapter lives in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const PUBLIC_PATHS = ["/", "/login", "/demo"];
      const PUBLIC_API = ["/api/auth", "/api/sync", "/api/health", "/api/inngest"];
      const { pathname } = nextUrl;

      const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p);
      const isPublicApi = PUBLIC_API.some((p) => pathname.startsWith(p));

      if (isPublicPath || isPublicApi) return true;
      if (isLoggedIn) return true;
      return false;
    },
  },
};
