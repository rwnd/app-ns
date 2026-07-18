"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NsLogo } from "@/components/ns-logo";
import { SignOutButton } from "@/components/sign-out-button";

type AppTopbarProps = {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
  /** Prefixed base for preview mode, e.g. "/preview" → /preview + /preview/stats */
  basePath?: "/home" | "/preview";
};

export function AppTopbar({ user, basePath = "/home" }: AppTopbarProps) {
  const pathname = usePathname();
  const displayName = user.name ?? "Member";
  const initial = displayName.charAt(0).toUpperCase();
  const homeHref = basePath;
  const statsHref = basePath === "/preview" ? "/preview/stats" : "/stats";
  const onHome =
    pathname === homeHref ||
    pathname === `${homeHref}/` ||
    (basePath === "/home" && pathname === "/home");
  const onStats = pathname === statsHref || pathname.startsWith(`${statsHref}/`);

  return (
    <div className="sticky top-0 z-50 flex h-[56px] w-full items-center justify-center border-b border-[var(--iron-200)] bg-white px-4">
      <header className="flex h-full w-full max-w-3xl items-center justify-between">
        <div className="flex items-center gap-5">
          <Link
            href={homeHref}
            className="flex items-center"
            aria-label="NS Logistics home"
          >
            <NsLogo className="h-5 w-auto text-[var(--ns-ink)]" />
          </Link>

          <nav className="flex items-center gap-1" aria-label="Main">
            <TopLink href={homeHref} active={onHome} label="Trips">
              <HomeIcon />
            </TopLink>
            <TopLink href={statsHref} active={onStats} label="Stats">
              <StatsIcon />
            </TopLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[var(--ns-ink)]">
              {displayName}
            </p>
            <p className="text-xs font-medium text-[var(--accent)]">Member</p>
          </div>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="h-9 w-9 rounded-full border border-[var(--iron-200)] object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ns-ink)] text-sm font-semibold text-white">
              {initial}
            </div>
          )}
          <SignOutButton />
        </div>
      </header>
    </div>
  );
}

function TopLink({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold transition",
        active
          ? "bg-[var(--iron-100)] text-[var(--ns-ink)]"
          : "text-[var(--iron-500)] hover:bg-[var(--iron-50)] hover:text-[var(--ns-ink)]",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3.2 3.5 10v10.3A1.5 1.5 0 0 0 5 21.8h4.2v-6.2h5.6v6.2H19a1.5 1.5 0 0 0 1.5-1.5V10L12 3.2Z" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 19.5h16v-1.8H4v1.8Zm2.2-3.6h2.4V9.2H6.2v6.7Zm4.6 0h2.4V5.5h-2.4v10.4Zm4.6 0H18V11h-2.6v4.9Z" />
    </svg>
  );
}
