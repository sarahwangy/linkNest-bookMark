import { describe, it, expect, vi } from "vitest";
import { classifyBookmark } from "@/lib/claude";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

describe("classifyBookmark", () => {
  it("returns category and tags from Claude", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: '{"category":"Technology","tags":["AI","search"]}' }],
    });
    const result = await classifyBookmark({
      url: "https://openai.com/blog/gpt-4",
      title: "GPT-4 Technical Report",
      ogDescription: "OpenAI's most capable model",
    });
    expect(result.category).toBe("Technology");
    expect(result.tags).toEqual(["AI", "search"]);
  });

  it("returns fallback on parse error", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "not json" }],
    });
    const result = await classifyBookmark({ url: "https://example.com", title: "Test" });
    expect(result.category).toBe("Uncategorized");
    expect(result.tags).toEqual([]);
  });
});
