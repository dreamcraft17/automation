import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getOrCreateUserFromClerk } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");
  await getOrCreateUserFromClerk(
    clerkUser.id,
    clerkUser.emailAddresses[0]?.emailAddress ?? "",
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User"
  );
  return <DashboardShell>{children}</DashboardShell>;
}
