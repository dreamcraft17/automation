"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STATUSES = [
  "Uploaded",
  "Processing",
  "Analyzed",
  "Evaluated",
  "ActionRequired",
  "Safe",
  "Archived",
] as const;

export function DocumentsFilters({
  categories,
  initialSearch,
  initialCategory,
  initialStatus,
}: {
  categories: string[];
  initialSearch: string;
  initialCategory: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updates: { q?: string; category?: string; status?: string }) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      router.push(`/documents?${next.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q = (form.querySelector('[name="q"]') as HTMLInputElement)?.value ?? "";
        setParams({ q: q || undefined });
      }}
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="q" className="sr-only">
          Search
        </Label>
        <Input
          id="q"
          name="q"
          placeholder="Search title or category..."
          defaultValue={initialSearch}
          className="w-48"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="category" className="sr-only">
          Category
        </Label>
        <Select
          id="category"
          value={initialCategory}
          onChange={(e) => setParams({ category: e.target.value || undefined })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="status" className="sr-only">
          Status
        </Label>
        <Select
          id="status"
          value={initialStatus}
          onChange={(e) => setParams({ status: e.target.value || undefined })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="secondary">
        Apply
      </Button>
    </form>
  );
}
