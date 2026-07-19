import { auth } from "@/auth";
import { BoardShell } from "@/components/logistics/board-shell";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/?error=SessionRequired");
  }

  return (
    <BoardShell user={session.user} basePath="/home">
      {children}
    </BoardShell>
  );
}
