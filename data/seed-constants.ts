export const CATEGORIES = [
  "Tech", "Design", "Reading", "Tools", "Reference",
  "Entertainment", "News", "Learning", "Career", "Lifestyle",
];

export const ACCOUNTS = [
  { label: "work@gmail.com", browser: "chrome", color: "#7c3aed" },
  { label: "personal@gmail.com", browser: "chrome", color: "#2563eb" },
  { label: "Firefox", browser: "firefox", color: "#ea580c" },
];

export const MOCK_KPI = {
  totalBookmarks: 623,
  activeAccounts: 3,
  addedThisMonth: 47,
  deadLinks: 12,
};

export const MOCK_ACCOUNT_DISTRIBUTION = [
  { account: "work@gmail.com", count: 289, color: "#7c3aed" },
  { account: "personal@gmail.com", count: 241, color: "#2563eb" },
  { account: "Firefox", count: 93, color: "#ea580c" },
];

export const MOCK_CATEGORY_DISTRIBUTION = [
  { name: "Tech", value: 187, color: "#7c3aed" },
  { name: "Reading", value: 134, color: "#2563eb" },
  { name: "Tools", value: 89, color: "#16a34a" },
  { name: "Design", value: 76, color: "#ea580c" },
  { name: "Learning", value: 65, color: "#db2777" },
  { name: "Reference", value: 42, color: "#0891b2" },
  { name: "Other", value: 30, color: "#6b7280" },
];

export const MOCK_GROWTH = Array.from({ length: 24 }, (_, i) => {
  const d = new Date(2024, i, 1);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return {
    month: `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
    count: [15, 22, 18, 31, 27, 45, 38, 52, 41, 29, 63, 48, 55, 37, 44, 61, 58, 72, 49, 66, 53, 70, 47, 58][i],
  };
});

export const MOCK_TAGS = [
  { text: "react", value: 45 }, { text: "typescript", value: 38 },
  { text: "nextjs", value: 32 }, { text: "design-system", value: 28 },
  { text: "ai", value: 25 }, { text: "productivity", value: 22 },
  { text: "ux", value: 20 }, { text: "performance", value: 18 },
  { text: "api", value: 16 }, { text: "css", value: 15 },
  { text: "devops", value: 14 }, { text: "testing", value: 13 },
  { text: "architecture", value: 12 }, { text: "open-source", value: 11 },
  { text: "security", value: 10 }, { text: "nodejs", value: 9 },
  { text: "database", value: 8 }, { text: "animation", value: 7 },
  { text: "mobile", value: 7 }, { text: "career", value: 6 },
];

// Calendar heatmap: fixed past activity data (deterministic, not random)
export const MOCK_CALENDAR_DATA: Record<string, number> = {
  "2025-06-01": 3, "2025-06-03": 5, "2025-06-05": 2,
  "2025-05-28": 7, "2025-05-25": 4, "2025-05-20": 6,
  "2025-05-15": 3, "2025-05-10": 8, "2025-05-05": 2,
  "2025-04-30": 5, "2025-04-25": 3, "2025-04-20": 7,
  "2025-04-15": 4, "2025-04-10": 6, "2025-04-05": 2,
  "2025-03-30": 5, "2025-03-25": 3, "2025-03-20": 8,
  "2025-03-15": 4, "2025-03-10": 6, "2025-03-05": 2,
  "2025-02-28": 3, "2025-02-20": 5, "2025-02-10": 7,
  "2025-01-31": 4, "2025-01-20": 6, "2025-01-10": 3,
  "2024-12-31": 8, "2024-12-25": 2, "2024-12-15": 5,
  "2024-12-05": 4, "2024-11-30": 6, "2024-11-20": 3,
  "2024-11-10": 7, "2024-10-31": 5, "2024-10-20": 4,
  "2024-10-10": 6, "2024-09-30": 3, "2024-09-20": 8,
};
