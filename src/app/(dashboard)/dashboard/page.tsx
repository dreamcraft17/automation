import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [totalDocs, processed, flagged, recent] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { status: "Analyzed" } }),
    prisma.document.count({ where: { status: "Flagged" } }),
    prisma.document.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: { select: { name: true } } },
    }),
  ]);

  const byCategory = await prisma.document.groupBy({
    by: ["category"],
    _count: true,
    where: { category: { not: null } },
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of documents and activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDocs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Processed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{processed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Flagged
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{flagged}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{byCategory.length}</p>
            <p className="text-xs text-slate-500">categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Documents by Category</CardTitle>
            <CardContent className="pt-4">
              {byCategory.length === 0 ? (
                <p className="text-sm text-slate-500">No categories yet</p>
              ) : (
                <ul className="space-y-2">
                  {byCategory.map((c) => (
                    <li
                      key={c.category ?? "uncategorized"}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {c.category ?? "Uncategorized"}
                      </span>
                      <span className="font-medium">{c._count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/documents">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500">No documents yet</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <span className="truncate text-sm font-medium">
                        {doc.title}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {doc.status}
                      </Badge>
                    </Link>
                    <p className="mt-1 pl-2 text-xs text-slate-500">
                      {doc.uploadedBy.name} ·{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
