import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Shield, Zap, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="mesh-gradient min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-4 w-4" />
            </span>
            DocuFlow AI
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300">
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-indigo-600 shadow-md shadow-indigo-500/20 hover:bg-indigo-700">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,rgba(99,102,241,0.06)_40%,transparent)] dark:bg-[linear-gradient(to_bottom,transparent,rgba(99,102,241,0.08)_40%,transparent)]" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-medium text-indigo-800 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-950/50 dark:text-indigo-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              AI document operations for modern teams
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
              Turn documents into{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-sky-400">
                decisions
              </span>
              , not busywork
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Upload, classify, and automate review with AI summaries, workflow
              rules, and analytics — built for teams that need speed and auditability.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-indigo-600 px-8 shadow-lg shadow-indigo-500/25 hover:bg-indigo-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Start free
                  <ArrowRight className="h-4 w-4 opacity-80" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-12 border-slate-300 bg-white/80 px-8 dark:border-slate-600 dark:bg-slate-900/80">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Everything you need to run document ops
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
              From intake to action — one place for your team.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                title: "Document processing",
                desc: "Upload PDF & DOCX, get instant AI summaries and key insights.",
                accent: "from-blue-500 to-indigo-600",
              },
              {
                icon: Sparkles,
                title: "AI analysis",
                desc: "Classification, suggested actions, and confidence scores.",
                accent: "from-violet-500 to-purple-600",
              },
              {
                icon: Zap,
                title: "Workflow automation",
                desc: "Rules-based routing: queues, flags, and next steps.",
                accent: "from-amber-500 to-orange-600",
              },
              {
                icon: Shield,
                title: "Audit trail",
                desc: "Activity logs and role-based access for compliance.",
                accent: "from-emerald-500 to-teal-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-500/40"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-lg transition-transform duration-300 group-hover:scale-105`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-200/80 bg-white/50 py-10 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              © {new Date().getFullYear()} DocuFlow AI
            </span>
            <div className="flex gap-6">
              <Link href="/sign-in" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Sign in
              </Link>
              <Link href="/sign-up" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Create account
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
