import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import UIProvider from "@/components/UIProvider";
import CommandPalette from "@/components/CommandPalette";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <UIProvider>
      <div className="flex min-h-screen bg-paper">
        <Sidebar label={session.label} isAdmin={session.isAdmin} />
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
      <CommandPalette isAdmin={session.isAdmin} />
    </UIProvider>
  );
}
