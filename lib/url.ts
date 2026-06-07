const TRACKING_PARAMS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "utm_id", "utm_name", "fbclid", "gclid", "msclkid", "ref", "source",
  "_ga", "mc_cid", "mc_eid",
]);

export function normalizeUrl(input: string): string {
  try {
    const u = new URL(input.trim());
    u.hostname = u.hostname.toLowerCase();

    const params = new URLSearchParams();
    const entries: [string, string][] = [];
    u.searchParams.forEach((value, key) => {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) {
        entries.push([key, value]);
      }
    });
    entries.sort(([a], [b]) => a.localeCompare(b));
    for (const [key, value] of entries) {
      params.append(key, value);
    }
    u.search = params.toString();
    u.hash = "";

    if (u.pathname !== "/" && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.replace(/\/+$/, "");
    }

    return u.toString();
  } catch {
    return input;
  }
}
