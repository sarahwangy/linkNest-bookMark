import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { createHash } from "crypto";
import type { Adapter, AdapterUser } from "next-auth/adapters";

// PrismaAdapter v2 hardcodes `p.account` but our schema uses `authAccount`.
// Wrap the adapter to redirect account operations to the correct model.
function createAdapter(): Adapter {
  const base = PrismaAdapter(db) as Adapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authAccount = (db as any).authAccount as {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<unknown>;
  };

  return {
    ...base,
    async getUserByAccount(provider_providerAccountId) {
      const account = await authAccount.findUnique({
        where: { provider_providerAccountId },
        include: { user: true },
      }) as ({ user: AdapterUser } & Record<string, unknown>) | null;
      return account?.user ?? null;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    linkAccount: (data: any) => authAccount.create({ data }) as ReturnType<NonNullable<Adapter["linkAccount"]>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unlinkAccount: (provider_providerAccountId: any) =>
      authAccount.delete({
        where: provider_providerAccountId,
      }) as ReturnType<NonNullable<Adapter["unlinkAccount"]>>,
    async getAccount(providerAccountId: string, provider: string) {
      return authAccount.findFirst({
        where: { providerAccountId, provider },
      }) as ReturnType<NonNullable<Adapter["getAccount"]>>;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: createAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export async function requireToken(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7);
  const hash = createHash("sha256").update(raw).digest("hex");
  const token = await db.apiToken.findFirst({
    where: { tokenHash: hash, revokedAt: null },
  });
  if (!token) return null;
  await db.apiToken.update({
    where: { id: token.id },
    data: { lastUsedAt: new Date() },
  });
  return token.userId;
}
