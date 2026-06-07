import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkUrl } from "@/lib/dead-check";

describe("checkUrl", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns status 200 for successful HEAD request", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      status: 200,
      url: "https://example.com/",
      ok: true,
    } as Response);

    const result = await checkUrl("https://example.com/");
    expect(result.httpStatus).toBe(200);
    expect(result.isDead).toBe(false);
    expect(result.finalUrl).toBe("https://example.com/");
  });

  it("marks 404 as dead", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      status: 404,
      url: "https://example.com/gone",
      ok: false,
    } as Response);

    const result = await checkUrl("https://example.com/gone");
    expect(result.httpStatus).toBe(404);
    expect(result.isDead).toBe(true);
  });

  it("marks network error as dead with status 0", async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

    const result = await checkUrl("https://example.com/");
    expect(result.httpStatus).toBe(0);
    expect(result.isDead).toBe(true);
  });
});
