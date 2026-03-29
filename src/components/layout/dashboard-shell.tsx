import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-canvas flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
