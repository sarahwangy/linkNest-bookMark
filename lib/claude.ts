import Anthropic from "@anthropic-ai/sdk";

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const CATEGORIES = [
  "Technology", "Science", "Business", "Finance", "Health", "Entertainment",
  "Sports", "Politics", "Education", "Design", "Food", "Travel",
  "News", "Reference", "Shopping", "Social", "Productivity", "Uncategorized",
];

export interface ClassifyResult {
  category: string;
  tags: string[];
}

export async function classifyBookmark(input: {
  url: string;
  title: string;
  ogDescription?: string | null;
}): Promise<ClassifyResult> {
  const prompt = `Classify this bookmark. Return ONLY valid JSON, no markdown.

URL: ${input.url}
Title: ${input.title}
${input.ogDescription ? `Description: ${input.ogDescription}` : ""}

Categories: ${CATEGORIES.join(", ")}

Respond with exactly:
{"category": "<one of the categories above>", "tags": ["<tag1>", "<tag2>", "<tag3>"]}

Rules:
- category must be one of the listed categories
- tags: 2-5 lowercase single-word or hyphenated descriptors
- no explanation, no markdown, only JSON`;

  try {
    const msg = await getClient().messages.create({
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
