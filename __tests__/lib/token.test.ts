import { createHash, randomBytes } from "crypto";
import { describe, it, expect } from "vitest";

describe("token hashing", () => {
  it("produces consistent SHA-256 hash", () => {
    const raw = randomBytes(32).toString("hex");
    const h1 = createHash("sha256").update(raw).digest("hex");
    const h2 = createHash("sha256").update(raw).digest("hex");
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it("extracts 12-char prefix from lnk_ token", () => {
    const raw = "lnk_abcdef1234567890";
    const prefix = raw.slice(0, 12);
    expect(prefix).toBe("lnk_abcdef12");
  });
});
