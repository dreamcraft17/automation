import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import type { DocumentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireDbUserByClerkId } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadButton } from "@/components/documents/upload-button";
import { DocumentsFilters } from "@/components/documents/documents-filters";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;
  const dbUser = await requireDbUserByClerkId(userId);

  const params = await searchParams;
  const q = params.q ?? "";
  const category = params.category ?? "";
  const status = params.status ?? "";

  const where = {
    uploadedById: dbUser.id,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { category: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category }),
    ...(status && { status: status as DocumentStatus }),
  };

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  const categories = await prisma.document.findMany({
    select: { category: true },
    where: { uploadedById: dbUser.id, category: { not: null } },
    distinct: ["category"],
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Documents
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search, filter, and manage documents
          </p>
        </div>
        <UploadButton />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All documents</CardTitle>
            <DocumentsFilters
              categories={categories.map((c) => c.category).filter(Boolean) as string[]}
              initialSearch={q}
              initialCategory={category}
              initialStatus={status}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium text-slate-900 hover:underline dark:text-slate-50"
                    >
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {doc.category ? (
                      <Badge variant="secondary">{doc.category}</Badge>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
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
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {doc.uploadedBy.name}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link href={`/documents/${doc.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {documents.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No documents found. Upload your first document above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
