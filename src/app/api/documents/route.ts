import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUserFromClerk } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, name } = body as { url: string; name?: string };
    if (!url) {
      return NextResponse.json(
        { error: "Missing file url" },
        { status: 400 }
      );
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
    const displayName =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "User";
    const syncedUser = await getOrCreateUserFromClerk(userId, email, displayName);

    const fileType = name?.endsWith(".pdf")
      ? "application/pdf"
      : name?.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/octet-stream";

    const doc = await prisma.document.create({
      data: {
        title: name ?? "Untitled",
        fileUrl: url,
        fileType,
        status: "Uploaded",
        uploadedById: syncedUser.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        documentId: doc.id,
        userId: syncedUser.id,
        action: "uploaded",
        details: name ?? undefined,
      },
    });

    // Trigger AI analysis in background (sync for MVP)
    await analyzeDocument(doc.id);

    return NextResponse.json({ id: doc.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create document" },
      { status: 500 }
    );
  }
}

async function analyzeDocument(documentId: string) {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) return;

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "Processing" },
  });

  let summary = "";
  let keyInsights = "";
  let suggestedAction = "";
  let category = "";
  let confidenceScore = 0.9;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const prompt = `You are analyzing a document titled "${doc.title}". Since we only have the title, infer a brief professional summary, 3 key insights, a document category (one of: Proposal, Report, SOP, Invoice, Brief, Specification), and a suggested next action. Reply with ONLY a valid JSON object, no markdown or extra text: { "summary": string, "keyInsights": string (bullet list), "category": string, "suggestedAction": string, "confidenceScore": number 0-1 }`;
    const modelsToTry = ["gemini-3-flash-preview", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"] as const;
    let lastError: unknown;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        const text = response.text?.trim();
        if (text) {
          const jsonStr = text.replace(/^```json\s*|\s*```$/g, "").trim();
          const parsed = JSON.parse(jsonStr) as {
            summary?: string;
            keyInsights?: string;
            category?: string;
            suggestedAction?: string;
            confidenceScore?: number;
          };
          summary = parsed.summary ?? "";
          keyInsights = parsed.keyInsights ?? "";
          suggestedAction = parsed.suggestedAction ?? "";
          category = parsed.category ?? "";
          confidenceScore = parsed.confidenceScore ?? 0.9;
          break;
        }
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const is429 = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota");
        if (is429) {
          await new Promise((r) => setTimeout(r, 45000));
          try {
            const response = await ai.models.generateContent({ model, contents: prompt });
            const text = response.text?.trim();
            if (text) {
              const jsonStr = text.replace(/^```json\s*|\s*```$/g, "").trim();
              const parsed = JSON.parse(jsonStr) as { summary?: string; keyInsights?: string; category?: string; suggestedAction?: string; confidenceScore?: number };
              summary = parsed.summary ?? ""; keyInsights = parsed.keyInsights ?? ""; suggestedAction = parsed.suggestedAction ?? ""; category = parsed.category ?? ""; confidenceScore = parsed.confidenceScore ?? 0.9;
              break;
            }
          } catch {
            console.error(`Gemini (${model}) retry after 429 failed:`, msg);
          }
        } else {
          console.error(`Gemini analysis error (${model}):`, msg);
        }
      }
    }
    if (!summary && lastError) {
      console.error("Gemini failed for all models. Last error:", lastError instanceof Error ? lastError.message : lastError);
      summary = "Analysis pending (API error).";
      keyInsights = "- Review manually";
      suggestedAction = "Check document and re-run analysis if needed.";
      category = "Uncategorized";
    }
  } else {
    summary = "Auto-generated placeholder summary for " + doc.title + ".";
    keyInsights = "- Placeholder insight 1\n- Placeholder insight 2";
    suggestedAction = "Review and classify manually.";
    category = "Report";
  }

  await prisma.documentAnalysis.upsert({
    where: { documentId },
    create: {
      documentId,
      summary,
      keyInsights,
      suggestedAction,
      confidenceScore,
    },
    update: {
      summary,
      keyInsights,
      suggestedAction,
      confidenceScore,
    },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "Analyzed", category: category || null },
  });

  const docForLog = await prisma.document.findUnique({
    where: { id: documentId },
    select: { uploadedById: true },
  });
  if (docForLog) {
    await prisma.activityLog.create({
      data: {
        documentId,
        userId: docForLog.uploadedById,
        action: "processed",
        details: `Category: ${category}`,
      },
    });
  }
}
