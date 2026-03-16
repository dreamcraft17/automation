"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const POLL_INTERVAL_MS = 3000;

export function DocumentAnalyzingScreen({
  documentId,
  title,
}: {
  documentId: string;
  title: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 md:p-8">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Loader2 className="h-10 w-10 animate-spin text-slate-600 dark:text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Menganalisis dokumen
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            AI sedang menganalisis &quot;{title}&quot;. Ringkasan dan klasifikasi akan muncul
            sebentar lagi.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Halaman ini akan diperbarui otomatis. Tidak perlu refresh manual.
        </p>
        <Link
          href="/documents"
          className="text-sm text-slate-500 underline-offset-4 hover:underline dark:text-slate-400"
        >
          ← Kembali ke daftar dokumen
        </Link>
      </div>
    </div>
  );
}
