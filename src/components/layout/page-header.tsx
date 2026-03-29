import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          DocuFlow AI
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-slate-600 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
