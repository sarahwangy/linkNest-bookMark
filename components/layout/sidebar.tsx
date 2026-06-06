"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bookmark, Search, MessageSquare,
  Tag, Calendar, AlertTriangle, GitMerge, Upload, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/search", label: "Search", icon: Search },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/timeline", label: "Timeline", icon: Calendar },
  { href: "/dead", label: "Dead Links", icon: AlertTriangle },
  { href: "/dedupe", label: "Deduplicate", icon: GitMerge },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <Bookmark className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Linknest</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
              pathname === href && "text-foreground bg-muted font-medium"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
