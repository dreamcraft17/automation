"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-[260px] shrink-0 flex-col border-r backdrop-blur-xl",
        "border-slate-200/80 bg-white/90 dark:border-slate-800/60 dark:bg-[color:var(--dashboard-sidebar)]"
      )}
    >
      <div className="flex h-[4.25rem] items-center border-b border-slate-200/80 px-4 dark:border-slate-800/80">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-500/10">
            <Sparkles className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <span className="truncate text-[15px]">DocuFlow AI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {nav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-900 shadow-sm dark:bg-indigo-500/12 dark:text-indigo-100 dark:shadow-none"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-300"
                    : "text-slate-400 dark:text-slate-500"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80">
        <SignOutButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-xl text-[13px] text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
}
