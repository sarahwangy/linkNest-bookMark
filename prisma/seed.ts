import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "crypto";

// Direct client for seed script (not the Next.js singleton)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  "Tech", "Design", "Reading", "Tools", "Reference",
  "Entertainment", "News", "Learning", "Career", "Lifestyle",
];

const SAMPLE_BOOKMARKS = [
  { url: "https://react.dev/learn/thinking-in-react", title: "Thinking in React", tags: ["react", "frontend"] },
  { url: "https://nextjs.org/docs/app/building-your-application", title: "Next.js App Router Docs", tags: ["nextjs", "react"] },
  { url: "https://www.typescriptlang.org/docs/handbook/intro.html", title: "TypeScript Handbook", tags: ["typescript"] },
  { url: "https://tailwindcss.com/docs", title: "Tailwind CSS Documentation", tags: ["css", "design-system"] },
  { url: "https://ui.shadcn.com/docs", title: "shadcn/ui Components", tags: ["react", "design-system", "ui"] },
  { url: "https://www.prisma.io/docs", title: "Prisma ORM Documentation", tags: ["database", "orm"] },
  { url: "https://inngest.com/docs", title: "Inngest — Event-driven Functions", tags: ["devops", "queue"] },
  { url: "https://pgvector.github.io", title: "pgvector: Vector similarity search", tags: ["database", "ai", "search"] },
  { url: "https://vercel.com/docs", title: "Vercel Deployment Docs", tags: ["devops", "hosting"] },
  { url: "https://www.framer.com/motion/", title: "Framer Motion — React Animation", tags: ["animation", "react"] },
  { url: "https://recharts.org/en-US/guide", title: "Recharts — React Charts", tags: ["react", "visualization"] },
  { url: "https://nivo.rocks/docs", title: "Nivo Data Visualization", tags: ["visualization", "react"] },
  { url: "https://developer.chrome.com/docs/extensions/mv3/intro/", title: "Chrome Extensions MV3", tags: ["extension", "browser"] },
  { url: "https://www.patterns.dev", title: "Patterns.dev — Modern Web Patterns", tags: ["architecture", "javascript"] },
  { url: "https://web.dev/performance/", title: "Web Performance Best Practices", tags: ["performance", "ux"] },
  { url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library", title: "Common Mistakes with RTL", tags: ["testing", "react"] },
  { url: "https://overreacted.io/a-complete-guide-to-useeffect/", title: "A Complete Guide to useEffect", tags: ["react", "hooks"] },
  { url: "https://www.joshwcomeau.com/css/custom-css-reset/", title: "A Modern CSS Reset", tags: ["css"] },
  { url: "https://excalidraw.com", title: "Excalidraw — Virtual Whiteboard", tags: ["tools", "design"] },
  { url: "https://linear.app/blog/scaling-with-linear-method", title: "The Linear Method", tags: ["productivity", "career"] },
];

async function main() {
  console.log("Seeding demo user...");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@linknest.app" },
    update: {},
    create: { email: "demo@linknest.app", name: "Demo User" },
  });

  const accountDefs = [
    { label: "work@gmail.com", browser: "chrome", color: "#7c3aed" },
    { label: "personal@gmail.com", browser: "chrome", color: "#2563eb" },
    { label: "Firefox", browser: "firefox", color: "#ea580c" },
  ];

  for (const acc of accountDefs) {
    const account = await prisma.account.upsert({
      where: { userId_label: { userId: demoUser.id, label: acc.label } },
      update: {},
      create: { ...acc, userId: demoUser.id, lastSyncAt: new Date() },
    });

    const count = acc.label === "Firefox" ? 90 : 200;
    for (let i = 0; i < count; i++) {
      const base = SAMPLE_BOOKMARKS[i % SAMPLE_BOOKMARKS.length];
      const urlNormalized = i === 0 ? base.url : `${base.url}?i=${i}`;
      const daysAgo = Math.floor((i / count) * 365);
      const addDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await prisma.bookmark.upsert({
        where: { accountId_urlNormalized: { accountId: account.id, urlNormalized } },
        update: {},
        create: {
          userId: demoUser.id,
          accountId: account.id,
          url: base.url,
          urlNormalized,
          title: i < 20 ? base.title : `${base.title} (${Math.floor(i / 20) + 1})`,
          addDate,
          aiCategory: CATEGORIES[i % CATEGORIES.length],
          aiTags: base.tags,
          isDead: i % 25 === 0,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(base.url).hostname}&sz=64`,
        },
      });
    }
    console.log(`  ✓ ${acc.label}: ${count} bookmarks`);
  }

  // Demo API token
  const raw = "lnk_demo_0000000000000000";
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  await prisma.apiToken.upsert({
    where: { tokenHash },
    update: {},
    create: {
      userId: demoUser.id,
      name: "Demo Token",
      tokenHash,
      prefix: raw.slice(0, 12),
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
