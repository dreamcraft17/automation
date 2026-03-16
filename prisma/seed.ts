import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required. Set it in .env");

// Railway (self-signed cert): biarkan TLS terima cert (hanya untuk seed)
if (url.includes("rlwy.net")) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Hapus sslmode dari URL supaya opsi ssl di bawah yang dipakai
const connectionString = url.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?&/, "?").replace(/\?$/, "");

const adapter = new PrismaPg({
  connectionString,
  ssl: url.includes("rlwy.net") ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter });

const DUMMY_DOCUMENTS = [
  { title: "Q1 Business Review", category: "Report" },
  { title: "Vendor Proposal 2025", category: "Proposal" },
  { title: "Product Requirement Brief", category: "Brief" },
  { title: "Internal SOP Update", category: "SOP" },
  { title: "Budget Planning Memo", category: "Report" },
  { title: "Operations Performance Report", category: "Report" },
  { title: "Technical Specification Sheet", category: "Specification" },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@insightflow.demo" },
    create: {
      clerkId: "seed-admin",
      email: "admin@insightflow.demo",
      name: "Admin User",
      role: "Admin",
    },
    update: {},
  });

  for (const { title, category } of DUMMY_DOCUMENTS) {
    const doc = await prisma.document.create({
      data: {
        title,
        fileUrl: "https://example.com/doc.pdf",
        fileType: "application/pdf",
        status: "Analyzed",
        category,
        uploadedById: user.id,
      },
    });
    await prisma.documentAnalysis.create({
      data: {
        documentId: doc.id,
        summary: `Summary for ${title}.`,
        keyInsights: "- Key point 1\n- Key point 2",
        suggestedAction: "Review and approve.",
        confidenceScore: 0.92,
      },
    });
    await prisma.activityLog.create({
      data: {
        documentId: doc.id,
        userId: user.id,
        action: "uploaded",
        details: title,
      },
    });
  }

  const rules = [
    {
      name: "Proposal → Review",
      triggerType: "DocumentAnalyzed",
      conditionValue: "category = Proposal",
      actionType: "Queue for Review",
    },
    {
      name: "Keyword flag",
      triggerType: "DocumentAnalyzed",
      conditionValue: "keyword detected",
      actionType: "Flagged",
    },
    {
      name: "Incomplete → Revision",
      triggerType: "DocumentAnalyzed",
      conditionValue: "document incomplete",
      actionType: "Needs Revision",
    },
  ];

  for (const r of rules) {
    await prisma.workflowRule.create({ data: r });
  }

  console.log("Seed done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
