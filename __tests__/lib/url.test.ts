import { describe, it, expect } from "vitest";
import { normalizeUrl } from "@/lib/url";

describe("normalizeUrl", () => {
  it("lowercases hostname", () => {
    expect(normalizeUrl("https://GITHUB.COM/path")).toBe("https://github.com/path");
  });

  it("removes UTM tracking params", () => {
    expect(normalizeUrl("https://example.com/page?utm_source=twitter&utm_medium=social&keep=this"))
      .toBe("https://example.com/page?keep=this");
  });

  it("removes fbclid and gclid", () => {
    expect(normalizeUrl("https://example.com/?fbclid=abc123&gclid=xyz"))
      .toBe("https://example.com/");
  });

  it("removes fragment", () => {
    expect(normalizeUrl("https://example.com/page#section")).toBe("https://example.com/page");
  });

  it("normalizes trailing slash — root path keeps slash", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("normalizes trailing slash — sub-path removes slash", () => {
    expect(normalizeUrl("https://example.com/path/")).toBe("https://example.com/path");
  });

  it("keeps non-tracking query params", () => {
    expect(normalizeUrl("https://example.com/search?q=react&page=2"))
      .toBe("https://example.com/search?page=2&q=react");
  });

  it("returns original on invalid URL", () => {
    expect(normalizeUrl("not-a-url")).toBe("not-a-url");
  });

  it("sorts query params for deterministic output", () => {
    expect(normalizeUrl("https://example.com/?b=2&a=1"))
      .toBe(normalizeUrl("https://example.com/?a=1&b=2"));
  });
});
