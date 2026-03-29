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
    <aside className="flex w-64 flex-col border-r border-slate-200/90 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-16 items-center border-b border-slate-200/90 px-4 dark:border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="truncate">DocuFlow AI</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-indigo-600/10 to-violet-600/10 text-indigo-900 shadow-sm ring-1 ring-indigo-500/20 dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-indigo-100 dark:ring-indigo-400/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-50"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-500"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/90 p-3 dark:border-slate-800">
        <SignOutButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </aside>
  );
}
