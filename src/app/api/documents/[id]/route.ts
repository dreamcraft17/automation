import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireDbUserByClerkId } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await requireDbUserByClerkId(userId);
  const { id } = await params;

  const doc = await prisma.document.findFirst({
    where: { id, uploadedById: dbUser.id },
    select: { id: true, title: true },
  });
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        documentId: doc.id,
        userId: dbUser.id,
        action: "deleted",
        details: doc.title,
      },
    });
    await tx.document.delete({ where: { id: doc.id } });
  });

  return NextResponse.json({ ok: true });
}
