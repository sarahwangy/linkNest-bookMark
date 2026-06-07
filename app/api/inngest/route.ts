import { serve } from "inngest/next";

export const runtime = "nodejs";
import { inngest, helloWorld, enrichBookmark, classifyBookmarkFn, generateEmbeddingFn } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, enrichBookmark, classifyBookmarkFn, generateEmbeddingFn],
});
