import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/dashboard");

  return <>{children}</>;
}
