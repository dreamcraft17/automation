"use client";

import { UploadButton as UploadThingButton } from "@uploadthing/react";
import { useRouter } from "next/navigation";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function UploadButton() {
  const router = useRouter();

  return (
    <UploadThingButton<OurFileRouter, "documentUpload">
      endpoint="documentUpload"
      onClientUploadComplete={async (res) => {
        const file = res?.[0];
        const fileUrl = file?.ufsUrl ?? file?.url;
        if (!fileUrl) return;
        try {
          const r = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: fileUrl, name: file?.name }),
          });
          const data = await r.json();
          if (data.id) router.push(`/documents/${data.id}`);
          else router.refresh();
        } catch {
          router.refresh();
        }
      }}
      onUploadError={(err) => {
        console.error(err);
      }}
      content={{
        button: "Upload document",
        allowedContent: "PDF, DOCX (max 16MB)",
      }}
      appearance={{
        button:
          "inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 ut-uploading:cursor-not-allowed",
      }}
    />
  );
}
