import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentAnalyzingScreen } from "@/components/documents/analyzing-screen";
import { requireDbUserByClerkId } from "@/lib/auth";
import { DeleteDocumentButton } from "@/components/documents/delete-document-button";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) notFound();
  const dbUser = await requireDbUserByClerkId(userId);

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id, uploadedById: dbUser.id },
    include: {
      uploadedBy: { select: { name: true, email: true } },
      analysis: true,
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!doc) notFound();

  const isAnalyzing =
    doc.status === "Uploaded" ||
    doc.status === "Processing" ||
    doc.status === "Analyzed" ||
    doc.status === "Evaluated" ||
    (!doc.analysis && doc.status !== "Archived");
  if (isAnalyzing) {
    return (
      <div className="p-6 md:p-8">
        <DocumentAnalyzingScreen documentId={doc.id} title={doc.title} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            DocuFlow AI
          </p>
          <Link
            href="/documents"
            className="mt-1 inline-flex text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            ← Back to documents
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            {doc.title}
          </h1>
        </div>
        <Badge
          className="shrink-0 self-start sm:self-center"
          variant={
            doc.status === "ActionRequired"
              ? "destructive"
              : doc.status === "Safe"
                ? "success"
                : "secondary"
          }
        >
          {doc.status}
        </Badge>
      </div>
      <div className="mb-6">
        <DeleteDocumentButton documentId={doc.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Document info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Type:</span> {doc.fileType}
            </p>
            <p>
              <span className="text-slate-500">Uploaded by:</span>{" "}
              {doc.uploadedBy.name}
            </p>
            <p>
              <span className="text-slate-500">Uploaded at:</span>{" "}
              {new Date(doc.createdAt).toLocaleString()}
            </p>
            {doc.category && (
              <p>
                <span className="text-slate-500">Category:</span>{" "}
                <Badge variant="secondary">{doc.category}</Badge>
              </p>
            )}
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline dark:text-blue-400"
            >
              Open file →
            </a>
          </CardContent>
        </Card>

        {doc.analysis && (
          <>
            <Card className="border-slate-200/90 shadow-sm dark:border-slate-800 lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300">
                  {doc.analysis.summary ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle>Key insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                  {doc.analysis.keyInsights ?? "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle>Classification &amp; action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="text-slate-500">Suggested action:</span>{" "}
                  {doc.analysis.suggestedAction ?? "—"}
                </p>
                {doc.analysis.confidenceScore != null && (
                  <p>
                    <span className="text-slate-500">Confidence:</span>{" "}
                    {Math.round(doc.analysis.confidenceScore * 100)}%
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="mt-6 border-slate-200/90 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Timeline / Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {doc.activityLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center gap-2 border-b border-slate-100 py-2 last:border-0 dark:border-slate-800"
              >
                <Badge variant="outline" className="shrink-0">
                  {log.action}
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">
                  {log.user?.name ?? "System"}
                  {log.details ? ` — ${log.details}` : ""}
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
            {doc.activityLogs.length === 0 && (
              <p className="text-slate-500">No activity yet</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
