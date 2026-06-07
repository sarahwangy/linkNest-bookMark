"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes, createHash } from "crypto";

export async function createToken(name: string): Promise<{ token: string; id: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name required" };

  const raw = "lnk_" + randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);

  const created = await db.apiToken.create({
    data: {
      userId: session.user.id,
      name: trimmed,
      tokenHash,
      prefix,
    },
  });

  revalidatePath("/settings");
  return { token: raw, id: created.id };
}

export async function revokeToken(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.apiToken.updateMany({
    where: { id, userId: session.user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/settings");
  return {};
}
