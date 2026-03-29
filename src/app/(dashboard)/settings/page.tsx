import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const dbUser = await getUserByClerkId(clerkUser.id);
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User";

  return (
    <div className="p-6 md:p-8">
      <PageHeader title="Settings" description="Your profile and role" />

      <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle>User info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="text-slate-500">Name:</span> {name}
          </p>
          <p>
            <span className="text-slate-500">Email:</span> {email}
          </p>
          {dbUser && (
            <p>
              <span className="text-slate-500">Role:</span>{" "}
              <Badge variant="secondary">{dbUser.role}</Badge>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
