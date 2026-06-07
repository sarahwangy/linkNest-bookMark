import { vi, describe, it, expect, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
  default: class MockOpenAI {
    embeddings = { create: mockCreate };
  },
}));

import { generateEmbedding } from "@/lib/openai";

describe("generateEmbedding", () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue({ data: [{ embedding: new Array(1536).fill(0.1) }] });
  });

  it("returns a 1536-dimensional embedding", async () => {
    const result = await generateEmbedding("hello world");
    expect(result).toHaveLength(1536);
    expect(typeof result[0]).toBe("number");
  });

  it("truncates input to 8000 chars", async () => {
    const longText = "a".repeat(10000);
    await generateEmbedding(longText);
    const callArg = mockCreate.mock.calls[0][0];
    expect(callArg.input.length).toBeLessThanOrEqual(8000);
  });
});
