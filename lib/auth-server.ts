import { createHash } from "crypto";
import { db } from "@/lib/db";

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
