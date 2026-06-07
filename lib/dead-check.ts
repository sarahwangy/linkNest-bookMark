export interface CheckResult {
  httpStatus: number;
  finalUrl: string;
  isDead: boolean;
  lastCheckedAt: Date;
}

export async function checkUrl(url: string): Promise<CheckResult> {
  const now = new Date();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Linknest/1.0 (+https://linknest.app)" },
    });
    clearTimeout(timeout);

    const isDead = res.status >= 400;
    return {
      httpStatus: res.status,
      finalUrl: res.url || url,
      isDead,
      lastCheckedAt: now,
    };
  } catch {
    return {
      httpStatus: 0,
      finalUrl: url,
      isDead: true,
      lastCheckedAt: now,
    };
  }
}
