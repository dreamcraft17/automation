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
  let decisionReason = "";
  let priority: "Low" | "Medium" | "High" | null = null;
  let verdict: "ActionRequired" | "Safe" | null = null;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const prompt = `You are an AI decision engine for document operations.\n\nDocument title: "${doc.title}". We only have the title (no file text).\n\nTasks:\n1) Produce analysis: summary, keyInsights (bullet list), category (one of: Proposal, Report, SOP, Invoice, Brief, Specification), suggestedAction, confidenceScore (0-1).\n2) Produce evaluation verdict: status must be one of ["ActionRequired","Safe"].\n3) Provide decisionReason (short, specific).\n4) Provide priority: one of ["Low","Medium","High"].\n\nReply with ONLY valid JSON (no markdown):\n{\n  \"summary\": string,\n  \"keyInsights\": string,\n  \"category\": string,\n  \"suggestedAction\": string,\n  \"confidenceScore\": number,\n  \"status\": \"ActionRequired\" | \"Safe\",\n  \"decisionReason\": string,\n  \"priority\": \"Low\" | \"Medium\" | \"High\"\n}\n`;
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
            status?: "ActionRequired" | "Safe";
            decisionReason?: string;
            priority?: "Low" | "Medium" | "High";
          };
          summary = parsed.summary ?? "";
          keyInsights = parsed.keyInsights ?? "";
          suggestedAction = parsed.suggestedAction ?? "";
          category = parsed.category ?? "";
          confidenceScore = parsed.confidenceScore ?? 0.9;
          verdict = parsed.status ?? null;
          decisionReason = parsed.decisionReason ?? "";
          priority = parsed.priority ?? null;
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
              const parsed = JSON.parse(jsonStr) as { summary?: string; keyInsights?: string; category?: string; suggestedAction?: string; confidenceScore?: number; status?: "ActionRequired" | "Safe"; decisionReason?: string; priority?: "Low" | "Medium" | "High" };
              summary = parsed.summary ?? ""; keyInsights = parsed.keyInsights ?? ""; suggestedAction = parsed.suggestedAction ?? ""; category = parsed.category ?? ""; confidenceScore = parsed.confidenceScore ?? 0.9;
              verdict = parsed.status ?? null; decisionReason = parsed.decisionReason ?? ""; priority = parsed.priority ?? null;
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
      verdict = "ActionRequired";
      decisionReason = "AI evaluation unavailable (API error).";
      priority = "Medium";
    }
  } else {
    summary = "Auto-generated placeholder summary for " + doc.title + ".";
    keyInsights = "- Placeholder insight 1\n- Placeholder insight 2";
    suggestedAction = "Review and classify manually.";
    category = "Report";
    verdict = "Safe";
    decisionReason = "No AI evaluation configured.";
    priority = "Low";
  }

  await prisma.documentAnalysis.upsert({
    where: { documentId },
    create: {
      documentId,
      summary,
      keyInsights,
      suggestedAction,
      confidenceScore,
      decisionReason: decisionReason || null,
      priority,
    },
    update: {
      summary,
      keyInsights,
      suggestedAction,
      confidenceScore,
      decisionReason: decisionReason || null,
      priority,
    },
  });

  // Analysis complete
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "Analyzed", category: category || null },
  });

  // Evaluation step
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "Evaluated" },
  });

  const finalStatus = verdict ?? "ActionRequired";
  await prisma.document.update({
    where: { id: documentId },
    data: { status: finalStatus },
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

    await prisma.activityLog.create({
      data: {
        documentId,
        userId: docForLog.uploadedById,
        action: "evaluated",
        details: `Verdict: ${finalStatus}${priority ? ` | Priority: ${priority}` : ""}${decisionReason ? ` | ${decisionReason}` : ""}`,
      },
    });
  }
}
