import { AuthStatusBanner } from "@/components/auth-status-banner";
import { DiscordSignInButton } from "@/components/discord-sign-in-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type HomePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { error } = await searchParams;

  return (
    <div style={{ backgroundColor: "#131316" }}>
      <div className="relative min-h-screen text-black">
        <SiteHeader />

        <section
          className="relative flex w-full flex-col items-center justify-center overflow-hidden text-black md:min-h-[640px]"
          style={{ height: "calc(100vh - 50px)" }}
        >
          <div className="absolute inset-0 h-full w-full overflow-hidden bg-white">
            <div className="hero-particles absolute inset-0 h-full w-full opacity-40" />
          </div>

          <div className="z-10 flex h-full w-full flex-col items-center justify-center space-y-4 p-6 text-center md:space-y-0">
            <p className="z-20 mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 animate-[fade-in_0.5s_ease-out]">
              Network School
            </p>
            <h1 className="font-display z-20 pb-0 text-[44px] font-bold leading-[52px] drop-shadow-xl animate-[rise-in_0.7s_ease-out] md:pb-2.5 md:text-6xl md:leading-[84px] lg:text-8xl lg:leading-[100px]">
              NS Logistics
            </h1>
            <h4 className="z-20 max-w-xl pb-3 text-xl text-gray-800 animate-[fade-in_0.8s_ease-out] md:pb-8 md:text-3xl">
              Coordinate rides to and from NS together.
            </h4>

            <div className="z-20 flex w-full flex-col items-center gap-5 animate-[fade-in_1s_ease-out]">
              <AuthStatusBanner error={error} />
              <DiscordSignInButton />
              <p className="max-w-md text-sm text-gray-600">
                Sign in with Discord. Access is limited to members of the
                Network School Discord server.
              </p>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
