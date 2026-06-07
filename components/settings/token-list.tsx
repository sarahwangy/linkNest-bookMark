"use client";
import { useTransition } from "react";
import { revokeToken } from "@/lib/actions/tokens";
import { toast } from "sonner";

interface Token {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export function TokenList({ tokens }: { tokens: Token[] }) {
  const [isPending, startTransition] = useTransition();

  if (tokens.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No tokens yet. Create one above to connect the extension.
      </p>
    );
  }

  function handleRevoke(id: string, name: string) {
    if (!confirm(`Revoke token "${name}"? The extension will stop syncing.`)) return;
    startTransition(async () => {
      const result = await revokeToken(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Token revoked");
      }
    });
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {tokens.map((token) => (
        <div key={token.id} className="flex items-center justify-between px-3 py-2.5 gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{token.name}</p>
            <p className="text-xs text-muted-foreground">
              <code className="font-mono">{token.prefix}…</code>
              {" · "}
              Created {new Date(token.createdAt).toLocaleDateString()}
              {token.lastUsedAt && ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`}
            </p>
          </div>
          <button
            onClick={() => handleRevoke(token.id, token.name)}
            disabled={isPending}
            className="shrink-0 px-2 h-7 text-xs text-destructive border border-destructive/30 rounded hover:bg-destructive/10 disabled:opacity-50"
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
