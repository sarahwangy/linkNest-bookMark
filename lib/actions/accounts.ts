"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_COLORS = [
  "#7c3aed", "#2563eb", "#ea580c", "#16a34a", "#db2777",
  "#0891b2", "#d97706", "#dc2626", "#4f46e5", "#059669",
];

export async function updateAccountColor(accountId: string, color: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (!ALLOWED_COLORS.includes(color)) return { error: "Invalid color" };

  await db.account.updateMany({
    where: { id: accountId, userId: session.user.id },
    data: { color },
  });

  revalidatePath("/settings");
  return {};
}
