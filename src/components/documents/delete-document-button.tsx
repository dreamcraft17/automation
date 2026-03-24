"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();

  const onDelete = async () => {
    const ok = window.confirm(
      "Hapus dokumen ini? Tindakan ini tidak bisa dibatalkan."
    );
    if (!ok) return;

    const res = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      alert(data?.error ?? "Gagal menghapus dokumen.");
      return;
    }

    router.push("/documents");
    router.refresh();
  };

  return (
    <Button type="button" variant="destructive" onClick={onDelete}>
      Hapus dokumen
    </Button>
  );
}
