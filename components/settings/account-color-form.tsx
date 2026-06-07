"use client";
import { useTransition } from "react";
import { updateAccountColor } from "@/lib/actions/accounts";
import { toast } from "sonner";

const COLORS = [
  "#7c3aed", "#2563eb", "#ea580c", "#16a34a", "#db2777",
  "#0891b2", "#d97706", "#dc2626", "#4f46e5", "#059669",
];

interface Account {
  id: string;
  label: string;
  browser: string;
  color: string | null;
}

export function AccountColorForm({ accounts }: { accounts: Account[] }) {
  const [isPending, startTransition] = useTransition();

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No accounts synced yet. Install the extension to get started.
      </p>
    );
  }

  function handleColorChange(accountId: string, color: string) {
    startTransition(async () => {
      const result = await updateAccountColor(accountId, color);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Color updated");
      }
    });
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div key={account.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{account.label}</p>
            <p className="text-xs text-muted-foreground capitalize">{account.browser}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(account.id, color)}
                disabled={isPending}
                className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 disabled:opacity-50"
                style={{
                  backgroundColor: color,
                  borderColor: account.color === color ? "white" : "transparent",
                  boxShadow: account.color === color ? `0 0 0 2px ${color}` : undefined,
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
