"use client";

import { useState, useCallback, useTransition } from "react";
import Image from "next/image";
import { Search, Zap, Type, ExternalLink } from "lucide-react";

type SearchResult = {
  id: string;
  url: string;
  title: string;
  favicon: string | null;
  ogDescription: string | null;
  aiCategory: string | null;
  aiTags: string[];
  addDate: string;
  account: { label: string; color: string | null };
  similarity?: number;
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"keyword" | "semantic">("keyword");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const search = useCallback(
    async (q: string, m: "keyword" | "semantic") => {
      if (q.trim().length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }
      startTransition(async () => {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&mode=${m}&limit=20`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setSearched(true);
      });
    },
    []
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    search(q, mode);
  };

  const handleMode = (m: "keyword" | "semantic") => {
    setMode(m);
    if (query.trim().length >= 2) search(query, m);
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search your bookmarks..."
            value={query}
            onChange={handleInput}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-md border border-input overflow-hidden text-sm">
          <button
            onClick={() => handleMode("keyword")}
            className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
              mode === "keyword"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Type className="h-3.5 w-3.5" />
            Keyword
          </button>
          <button
            onClick={() => handleMode("semantic")}
            className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
              mode === "semantic"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Semantic
          </button>
        </div>
      </div>

      {/* Results */}
      {isPending && (
        <p className="text-sm text-muted-foreground animate-pulse">Searching…</p>
      )}

      {!isPending && searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No results for "{query}"</p>
      )}

      {!isPending && results.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border">
          {results.map((r) => (
            <li key={r.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
              {r.favicon ? (
                <Image
                  src={r.favicon}
                  alt=""
                  width={16}
                  height={16}
                  className="mt-0.5 rounded-sm flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="mt-0.5 h-4 w-4 rounded-sm bg-muted flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline line-clamp-1 flex items-center gap-1"
                >
                  {r.title}
                  <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                </a>
                {r.ogDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {r.ogDescription}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {r.aiCategory && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {r.aiCategory}
                    </span>
                  )}
                  {r.aiTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                  <span
                    className="text-xs px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: r.account.color ?? "#6b7280" }}
                  >
                    {r.account.label}
                  </span>
                  {r.similarity != null && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round(r.similarity * 100)}% match
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!searched && !isPending && (
        <p className="text-sm text-muted-foreground">
          {mode === "semantic"
            ? "Semantic search finds conceptually similar bookmarks, even without exact words."
            : "Keyword search matches title, URL, description, and tags."}
        </p>
      )}
    </div>
  );
}
