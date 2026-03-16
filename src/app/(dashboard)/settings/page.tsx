import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/auth";
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Your profile and role
        </p>
      </div>

      <Card>
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
