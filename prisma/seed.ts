import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required. Set it in .env");

const isRailway = url.includes("rlwy.net");

// Railway (self-signed cert): biarkan TLS terima cert (hanya untuk seed)
if (isRailway) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

// Untuk non-Railway (mis. cPanel) jangan diubah; Prisma/driver perlu sslmode sesuai URL.
// Untuk Railway, kita drop sslmode supaya `ssl` option di adapter yang dipakai.
const connectionString = isRailway
  ? url
      .replace(/[?&]sslmode=[^&]*/g, "")
      .replace(/\?&/, "?")
      .replace(/\?$/, "")
  : url;

const adapter = new PrismaPg({
  connectionString,
  ssl: isRailway ? { rejectUnauthorized: false } : undefined,
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
        status: "Safe",
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
        decisionReason: "No issues detected in this demo document.",
        priority: "Low",
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
      name: "ActionRequired → Needs Attention",
      triggerType: "DocumentEvaluated",
      conditionValue: "status = ActionRequired",
      actionType: "Add to Needs Attention",
    },
    {
      name: "High priority alert",
      triggerType: "DocumentEvaluated",
      conditionValue: "priority = High",
      actionType: "Highlight in Dashboard",
    },
    {
      name: "Proposal route",
      triggerType: "DocumentAnalyzed",
      conditionValue: "category = Proposal",
      actionType: "Suggest Review",
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
