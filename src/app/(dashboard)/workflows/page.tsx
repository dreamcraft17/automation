import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function WorkflowsPage() {
  const rules = await prisma.workflowRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Workflows"
        description="Automation rules: trigger, condition, action"
      />

      <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
              {rules.length === 0 ? (
                <li className="text-slate-500">No workflow rules yet.</li>
              ) : (
                rules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant="outline">{rule.triggerType}</Badge>
                    <span className="text-slate-500">if</span>
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-800">
                      {rule.conditionValue}
                    </code>
                    <span className="text-slate-500">→</span>
                    <Badge variant="secondary">{rule.actionType}</Badge>
                    {rule.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </li>
                ))
              )}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
