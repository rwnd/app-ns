import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { redirect } from "next/navigation";

export default async function HelloPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/?error=SessionRequired");
  }

  const name = session.user.name ?? "there";

  return (
    <div style={{ backgroundColor: "#131316" }}>
      <div className="relative min-h-screen text-black">
        <SiteHeader />

        <section
          className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white text-black"
          style={{ minHeight: "calc(100vh - 50px)" }}
        >
          <div className="hero-particles absolute inset-0 opacity-30" />
          <div className="z-10 flex flex-col items-center gap-6 px-6 py-16 text-center animate-[rise-in_0.55s_ease-out]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              Login successful
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight text-gray-900 md:text-7xl">
              Hello World
            </h1>
            <p className="max-w-md text-lg text-gray-700 md:text-xl">
              Welcome, {name}. You&apos;re signed in as an NS Discord member.
            </p>
            <SignOutButton />
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
