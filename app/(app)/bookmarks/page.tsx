import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { Input } from "@/components/ui/input";

interface BookmarksPageProps {
  searchParams: Promise<{
    q?: string;
    account?: string;
    category?: string;
    dead?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 50;

export default async function BookmarksPage({ searchParams }: BookmarksPageProps) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const userId = session.user.id;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    userId,
    deletedAt: null,
    ...(params.account && params.account !== "all" ? { account: { label: params.account } } : {}),
    ...(params.category && params.category !== "all" ? { aiCategory: params.category } : {}),
    ...(params.dead === "true" ? { isDead: true } : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" as const } },
            { url: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [bookmarks, total, accounts, categories] = await Promise.all([
    db.bookmark.findMany({
      where,
      include: { account: { select: { label: true, color: true } } },
      orderBy: { addDate: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    db.bookmark.count({ where }),
    db.account.findMany({ where: { userId }, select: { label: true } }),
    db.bookmark.groupBy({
      by: ["aiCategory"],
      where: { userId, deletedAt: null, aiCategory: { not: null } },
      _count: { aiCategory: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <form className="flex gap-2 flex-wrap">
        <Input
          name="q"
          placeholder="Search title or URL..."
          defaultValue={params.q}
          className="w-64"
        />
        <select
          name="account"
          title="Filter by account"
          defaultValue={params.account ?? "all"}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background"
        >
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.label} value={a.label}>{a.label}</option>
          ))}
        </select>
        <select
          name="category"
          title="Filter by category"
          defaultValue={params.category ?? "all"}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background"
        >
          <option value="all">All categories</option>
          {categories.map((c) =>
            c.aiCategory ? (
              <option key={c.aiCategory} value={c.aiCategory}>{c.aiCategory}</option>
            ) : null
          )}
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Filter
        </button>
      </form>

      <BookmarkList bookmarks={bookmarks} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <a
              href={`?page=${page - 1}&q=${params.q ?? ""}&account=${params.account ?? ""}&category=${params.category ?? ""}`}
              className="px-3 py-1 text-sm border rounded hover:bg-muted"
            >
              Previous
            </a>
          )}
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`?page=${page + 1}&q=${params.q ?? ""}&account=${params.account ?? ""}&category=${params.category ?? ""}`}
              className="px-3 py-1 text-sm border rounded hover:bg-muted"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
