import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  summary: string | null;
  aiTags: string[];
  aiCategory: string | null;
  isDead: boolean;
  addDate: Date;
  account: { label: string; color: string | null };
}

interface BookmarkListProps {
  bookmarks: Bookmark[];
}

export function BookmarkList({ bookmarks }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No bookmarks found. Install the extension and sync your bookmarks.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="mt-0.5 shrink-0">
            {bm.favicon ? (
              <Image
                src={bm.favicon}
                alt=""
                width={16}
                height={16}
                className="rounded-sm"
                unoptimized
              />
            ) : (
              <div className="h-4 w-4 rounded-sm bg-muted" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <a
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:text-primary truncate flex items-center gap-1"
              >
                {bm.title}
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
              </a>
              {bm.isDead && (
                <Badge variant="destructive" className="text-xs py-0 h-4">dead</Badge>
              )}
            </div>

            {bm.summary && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{bm.summary}</p>
            )}

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs py-0 h-4"
                style={{ borderColor: bm.account.color ?? "#7c3aed", color: bm.account.color ?? "#7c3aed" }}
              >
                {bm.account.label}
              </Badge>
              {bm.aiCategory && (
                <Badge variant="secondary" className="text-xs py-0 h-4">{bm.aiCategory}</Badge>
              )}
              {bm.aiTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs py-0 h-4 text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(bm.addDate).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
}
