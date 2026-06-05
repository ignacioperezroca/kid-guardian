import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getWorkspaceForUser } from "@/lib/store";
import { AppShell } from "@/components/app-shell";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const workspace = await getWorkspaceForUser(user.id);

  return <AppShell workspace={workspace}>{children}</AppShell>;
}

