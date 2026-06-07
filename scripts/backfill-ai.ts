import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CATEGORIES = [
  "Technology", "Science", "Business", "Finance", "Health", "Entertainment",
  "Sports", "Politics", "Education", "Design", "Food", "Travel",
  "News", "Reference", "Shopping", "Social", "Productivity", "Uncategorized",
];

async function classifyOne(b: { url: string; title: string; ogDescription: string | null }) {
  const prompt = `Classify this bookmark. Return ONLY valid JSON, no markdown.

URL: ${b.url}
Title: ${b.title}
${b.ogDescription ? `Description: ${b.ogDescription}` : ""}

Categories: ${CATEGORIES.join(", ")}

Respond with exactly:
{"category": "<one of the categories above>", "tags": ["<tag1>", "<tag2>", "<tag3>"]}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 128,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const parsed = JSON.parse(text) as { category: string; tags: string[] };
    return {
      category: CATEGORIES.includes(parsed.category) ? parsed.category : "Uncategorized",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  } catch {
    return { category: "Uncategorized", tags: [] };
  }
}

async function embedOne(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

async function main() {
  const toClassify = await db.bookmark.findMany({
    where: { aiCategory: null, deletedAt: null },
    select: { id: true, url: true, title: true, ogDescription: true },
    take: 500,
  });
  console.log(`Classifying ${toClassify.length} bookmarks…`);

  for (let i = 0; i < toClassify.length; i++) {
    const b = toClassify[i];
    const result = await classifyOne(b);
    await db.bookmark.update({
      where: { id: b.id },
      data: { aiCategory: result.category, aiTags: result.tags },
    });
    if ((i + 1) % 10 === 0) console.log(`  classified ${i + 1}/${toClassify.length}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  const withAI = await db.bookmark.findMany({
    where: { aiCategory: { not: null }, deletedAt: null, embedding: { is: null } },
    select: { id: true, title: true, ogDescription: true, aiTags: true },
    take: 500,
  });
  console.log(`\nEmbedding ${withAI.length} bookmarks…`);

  for (let i = 0; i < withAI.length; i++) {
    const b = withAI[i];
    const text = [b.title, b.ogDescription, b.aiTags.join(" ")].filter(Boolean).join(" ");
    const embedding = await embedOne(text);
    const vector = `[${embedding.join(",")}]`;
    await db.$executeRaw`
      INSERT INTO "BookmarkEmbedding" ("bookmarkId", embedding)
      VALUES (${b.id}, ${vector}::vector)
      ON CONFLICT ("bookmarkId") DO UPDATE SET embedding = EXCLUDED.embedding
    `;
    if ((i + 1) % 10 === 0) console.log(`  embedded ${i + 1}/${withAI.length}`);
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\nDone.");
  await db.$disconnect();
}

main().catch(console.error);
