import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateTokenForm } from "@/components/settings/create-token-form";
import { TokenList } from "@/components/settings/token-list";
import { AccountColorForm } from "@/components/settings/account-color-form";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [tokens, accounts, user] = await Promise.all([
    db.apiToken.findMany({
      where: { userId, revokedAt: null },
      select: { id: true, name: true, prefix: true, createdAt: true, lastUsedAt: true },
      orderBy: { createdAt: "desc" },
    }),
    db.account.findMany({
      where: { userId },
      select: { id: true, label: true, browser: true, color: true },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, image: true },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your API tokens and account preferences
        </p>
      </div>

      {/* Profile */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
          {user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-10 w-10 rounded-full" />
          )}
          <div>
            <p className="text-sm font-medium">{user?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* API Tokens */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">API Tokens</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each browser extension needs its own token. Paste it into the extension options page.
          </p>
        </div>
        <CreateTokenForm />
        <TokenList tokens={tokens} />
      </section>

      {/* Account Colors */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Account Colors</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Colors appear in the dashboard charts and bookmark badges.
          </p>
        </div>
        <AccountColorForm accounts={accounts} />
      </section>

      {/* Extension Setup */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Extension Setup</h2>
        <div className="rounded-md border border-border bg-card p-4 space-y-2 text-sm">
          <p className="font-medium">How to connect the Chrome extension:</p>
          <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
            <li>Install the extension from <code className="text-xs bg-muted px-1 rounded">dist-chrome/</code> (load unpacked in chrome://extensions)</li>
            <li>Click the extension icon → Options</li>
            <li>Paste your API URL: <code className="text-xs bg-muted px-1 rounded">{process.env.NEXTAUTH_URL ?? "https://your-app.vercel.app"}</code></li>
            <li>Create a token above, paste it into the extension</li>
            <li>Click "Sync Now" — bookmarks will appear on the dashboard</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
