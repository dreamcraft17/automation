"use client";

import { UploadButton as UploadThingButton } from "@uploadthing/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function UploadButton() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <>
      <UploadThingButton<OurFileRouter, "documentUpload">
        endpoint="documentUpload"
        onClientUploadComplete={async (res) => {
          const file = res?.[0];
          const fileUrl = file?.ufsUrl ?? file?.url;
          if (!fileUrl) return;
          setIsProcessing(true);
          try {
            const r = await fetch("/api/documents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: fileUrl, name: file?.name }),
            });
            const data = await r.json();
            if (data.id) router.push(`/documents/${data.id}`);
            else {
              setIsProcessing(false);
              router.refresh();
            }
          } catch {
            setIsProcessing(false);
            router.refresh();
          }
        }}
        onUploadError={(err) => {
          console.error(err);
          setIsProcessing(false);
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

      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Memproses dokumen...
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              File berhasil di-upload. AI sedang menganalisis isi dokumen.
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-900 dark:bg-slate-100" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
