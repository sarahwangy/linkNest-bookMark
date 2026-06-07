import * as cheerio from "cheerio";

export interface OgData {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
}

export async function fetchOgData(url: string): Promise<OgData> {
  const empty: OgData = { ogTitle: null, ogDescription: null, ogImage: null };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Linknest/1.0 (+https://linknest.app)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return empty;

    const html = await res.text();
    const $ = cheerio.load(html);

    return {
      ogTitle:
        $('meta[property="og:title"]').attr("content") ??
        $("title").text().trim() ??
        null,
      ogDescription:
        $('meta[property="og:description"]').attr("content") ??
        $('meta[name="description"]').attr("content") ??
        null,
      ogImage: $('meta[property="og:image"]').attr("content") ?? null,
    };
  } catch {
    return empty;
  }
}
