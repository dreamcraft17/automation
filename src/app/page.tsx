import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Shield, Zap } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            InsightFlow
          </span>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            AI-powered document operations for your team
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Upload, classify, and automate document review with AI summaries,
            workflow rules, and analytics — built for enterprise.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Start free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileText,
              title: "Document processing",
              desc: "Upload PDF & DOCX, get instant AI summaries and key insights.",
            },
            {
              icon: Sparkles,
              title: "AI analysis",
              desc: "Automatic classification, suggested actions, and confidence scores.",
            },
            {
              icon: Zap,
              title: "Workflow automation",
              desc: "Rules-based routing: review queues, flags, and next steps.",
            },
            {
              icon: Shield,
              title: "Audit trail",
              desc: "Activity logs and role-based access for compliance.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <item.icon className="h-8 w-8 text-slate-700 dark:text-slate-300" />
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
