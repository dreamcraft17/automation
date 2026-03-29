import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { DocumentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireDbUserByClerkId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, TrendingUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

function statusBadgeVariant(
  status: DocumentStatus
): "destructive" | "success" | "secondary" | "warning" | "outline" {
  switch (status) {
    case "ActionRequired":
      return "destructive";
    case "Safe":
      return "success";
    case "Archived":
      return "secondary";
    case "Uploaded":
    case "Processing":
      return "warning";
    default:
      return "outline";
  }
}

function formatStatusLabel(status: DocumentStatus): string {
  const map: Partial<Record<DocumentStatus, string>> = {
    ActionRequired: "Action required",
  };
  return map[status] ?? status;
}

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

  const statDefs = [
    {
      label: "Total documents",
      value: totalDocs,
      icon: FileText,
      bar: "from-indigo-500 via-violet-500 to-purple-500",
      iconWrap: "bg-indigo-500/12 text-indigo-600 dark:text-indigo-300",
    },
    {
      label: "Processed",
      value: processed,
      icon: TrendingUp,
      bar: "from-emerald-500 to-teal-500",
      iconWrap: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Needs attention",
      value: needsAttention,
      icon: AlertTriangle,
      bar: "from-amber-500 to-orange-500",
      iconWrap: "bg-amber-500/12 text-amber-800 dark:text-amber-300",
    },
    {
      label: "Categories",
      value: byCategory.length,
      sub: "unique labels",
      icon: Layers,
      bar: "from-violet-500 to-fuchsia-500",
      iconWrap: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
    },
  ] as const;

  return (
    <div className="p-6 pb-12 md:p-8 md:pb-16">
      <PageHeader
        title="Dashboard"
        description="Documents, routing, and recent activity at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statDefs.map((s) => (
          <Card
            key={s.label}
            className="overflow-hidden border-slate-200/90 p-0 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-700/45 dark:hover:shadow-black/40"
          >
            <div
              className={cn(
                "h-1 w-full bg-gradient-to-r opacity-95",
                s.bar
              )}
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                  {s.label}
                </p>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    s.iconWrap
                  )}
                >
                  <s.icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {s.value}
              </p>
              {"sub" in s && s.sub ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.sub}</p>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/90 dark:border-slate-700/45">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">By category</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No categories yet — upload a document to get started.
              </p>
            ) : (
              <ul className="space-y-2">
                {byCategory.map((c) => (
                  <li
                    key={c.category ?? "uncategorized"}
                    className="flex items-center justify-between rounded-xl bg-slate-50/90 px-4 py-3 text-sm dark:bg-white/[0.04]"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {c.category ?? "Uncategorized"}
                    </span>
                    <span className="tabular-nums text-slate-600 dark:text-slate-300">
                      {c._count}{" "}
                      <span className="text-slate-400 dark:text-slate-500">
                        docs
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/90 dark:border-slate-700/45">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Link href="/documents">
              <Button variant="outline" size="sm" className="rounded-lg text-xs">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recent.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No documents yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/90">
                {recent.map((doc) => (
                  <li key={doc.id} className="py-4 first:pt-0 last:pb-0">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="group flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                          {doc.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {doc.uploadedBy.name}
                          <span className="text-slate-300 dark:text-slate-600">
                            {" "}
                            ·{" "}
                          </span>
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={statusBadgeVariant(doc.status)}
                        className="w-fit shrink-0 text-[11px] font-medium"
                      >
                        {formatStatusLabel(doc.status)}
                      </Badge>
                    </Link>
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
