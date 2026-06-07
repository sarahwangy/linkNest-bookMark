import { db } from "@/lib/db";
import { fetchOgData } from "@/lib/og";
import { checkUrl } from "@/lib/dead-check";
import { getFaviconUrl } from "@/lib/favicon";
import { classifyBookmark } from "@/lib/claude";
import { generateEmbedding } from "@/lib/openai";
import { inngest } from "@/lib/inngest-client";

export { inngest };

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
  async ({
    event,
    step,
  }: {
    event: { data: { bookmarkId: string; url: string } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    step: any;
  }) => {
    const { bookmarkId, url } = event.data;

    const favicon = getFaviconUrl(url);
    const [og, deadCheck] = await Promise.all([fetchOgData(url), checkUrl(url)]);

    const bookmark = await db.bookmark.update({
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
      select: { id: true, title: true, ogDescription: true },
    });

    await step.sendEvent({
      name: "bookmark.enriched",
      data: {
        bookmarkId,
        url,
        title: bookmark.title,
        ogDescription: bookmark.ogDescription,
      },
    });

    return { bookmarkId, enriched: true };
  }
);

export const classifyBookmarkFn = inngest.createFunction(
  {
    id: "classify-bookmark",
    triggers: [{ event: "bookmark.enriched" }],
    concurrency: { limit: 5 },
    retries: 2,
  },
  async ({
    event,
    step,
  }: {
    event: {
      data: {
        bookmarkId: string;
        url: string;
        title: string;
        ogDescription?: string | null;
      };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    step: any;
  }) => {
    const { bookmarkId, url, title, ogDescription } = event.data;

    const result = await classifyBookmark({ url, title, ogDescription });

    await db.bookmark.update({
      where: { id: bookmarkId },
      data: { aiCategory: result.category, aiTags: result.tags },
    });

    const textForEmbedding = [title, ogDescription, result.tags.join(" ")]
      .filter(Boolean)
      .join(" ");

    await step.sendEvent({
      name: "bookmark.classified",
      data: { bookmarkId, text: textForEmbedding },
    });

    return { bookmarkId, category: result.category, tags: result.tags };
  }
);

export const generateEmbeddingFn = inngest.createFunction(
  {
    id: "generate-embedding",
    triggers: [{ event: "bookmark.classified" }],
    concurrency: { limit: 5 },
    retries: 2,
  },
  async ({
    event,
  }: {
    event: { data: { bookmarkId: string; text: string } };
  }) => {
    const { bookmarkId, text } = event.data;

    const embedding = await generateEmbedding(text);
    const vector = `[${embedding.join(",")}]`;

    await db.$executeRaw`
      INSERT INTO "BookmarkEmbedding" ("bookmarkId", embedding)
      VALUES (${bookmarkId}, ${vector}::vector)
      ON CONFLICT ("bookmarkId") DO UPDATE SET embedding = EXCLUDED.embedding
    `;

    return { bookmarkId, embedded: true };
  }
);
