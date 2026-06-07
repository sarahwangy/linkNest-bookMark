import { Inngest } from "inngest";
import { db } from "@/lib/db";
import { fetchOgData } from "@/lib/og";
import { checkUrl } from "@/lib/dead-check";
import { getFaviconUrl } from "@/lib/favicon";

export const inngest = new Inngest({ id: "linknest" });

export const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "test/hello" }] },
  async ({ event }: { event: { data: { name?: string } } }) => {
    return { message: `Hello, ${event.data.name ?? "world"}!` };
  }
);

export const enrichBookmark = inngest.createFunction(
  {
    id: "enrich-bookmark",
    triggers: [{ event: "bookmark.created" }],
    concurrency: { limit: 10 },
    retries: 3,
  },
  async ({ event }: { event: { data: { bookmarkId: string; url: string } } }) => {
    const { bookmarkId, url } = event.data;

    const favicon = getFaviconUrl(url);
    const [og, deadCheck] = await Promise.all([
      fetchOgData(url),
      checkUrl(url),
    ]);

    await db.bookmark.update({
      where: { id: bookmarkId },
      data: {
        favicon,
        ogTitle: og.ogTitle,
        ogDescription: og.ogDescription,
        ogImage: og.ogImage,
        httpStatus: deadCheck.httpStatus,
        finalUrl: deadCheck.finalUrl,
        isDead: deadCheck.isDead,
        lastCheckedAt: deadCheck.lastCheckedAt,
      },
    });

    return { bookmarkId, enriched: true };
  }
);
