import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentAnalyzingScreen } from "@/components/documents/analyzing-screen";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
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
    doc.status === "Processing" || (doc.status === "Uploaded" && !doc.analysis);
  if (isAnalyzing) {
    return (
      <div className="p-6 md:p-8">
        <DocumentAnalyzingScreen documentId={doc.id} title={doc.title} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/documents"
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
          >
            ← Documents
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {doc.title}
          </h1>
        </div>
        <Badge
          variant={
            doc.status === "Flagged"
              ? "destructive"
              : doc.status === "Analyzed"
                ? "success"
                : "secondary"
          }
        >
          {doc.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300">
                  {doc.analysis.summary ?? "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                  {doc.analysis.keyInsights ?? "—"}
                </div>
              </CardContent>
            </Card>
            <Card>
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

      <Card className="mt-6">
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
