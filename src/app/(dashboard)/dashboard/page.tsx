import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDbUserByClerkId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, TrendingUp, Layers } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const dbUser = await requireDbUserByClerkId(userId);

  const [totalDocs, processed, needsAttention, recent] = await Promise.all([
    prisma.document.count({ where: { uploadedById: dbUser.id } }),
    prisma.document.count({
      where: {
        uploadedById: dbUser.id,
        status: { in: ["Safe", "ActionRequired", "Archived"] },
      },
    }),
    prisma.document.count({
      where: { uploadedById: dbUser.id, status: "ActionRequired" },
    }),
    prisma.document.findMany({
      take: 5,
      where: { uploadedById: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: { select: { name: true } } },
    }),
  ]);

  const byCategory = await prisma.document.groupBy({
    by: ["category"],
    _count: true,
    where: { uploadedById: dbUser.id, category: { not: null } },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Overview of documents and activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-slate-200/90 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Documents
            </CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalDocs}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-slate-200/90 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Processed
            </CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {processed}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-slate-200/90 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Needs attention
            </CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {needsAttention}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-slate-200/90 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              By Category
            </CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <Layers className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {byCategory.length}
            </p>
            <p className="text-xs text-slate-500">categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle>Documents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-sm text-slate-500">No categories yet</p>
            ) : (
              <ul className="space-y-2">
                {byCategory.map((c) => (
                  <li
                    key={c.category ?? "uncategorized"}
                    className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {c.category ?? "Uncategorized"}
                    </span>
                    <span className="font-semibold tabular-nums">{c._count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
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
