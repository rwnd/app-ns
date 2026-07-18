import { auth } from "@/auth";
import { LogisticsHome } from "@/components/logistics/logistics-home";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/?error=SessionRequired");
  }

  return (
    <LogisticsHome
      user={{
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      }}
    />
  );
}
