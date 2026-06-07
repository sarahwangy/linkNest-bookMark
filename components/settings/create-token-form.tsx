"use client";
import { useState, useTransition } from "react";
import { createToken } from "@/lib/actions/tokens";
import { toast } from "sonner";

export function CreateTokenForm() {
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createToken(name);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setNewToken(result.token);
      setName("");
      toast.success("Token created");
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token name (e.g. Chrome Home)"
          className="flex-1 h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-3 h-9 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create"}
        </button>
      </form>

      {newToken && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 space-y-1.5">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            Copy this token now — it will never be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-background rounded px-2 py-1 border border-border break-all">
              {newToken}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newToken);
                toast.success("Copied!");
              }}
              className="shrink-0 px-2 h-7 text-xs border rounded hover:bg-muted"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewToken(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
