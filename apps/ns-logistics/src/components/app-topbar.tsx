import Link from "next/link";
import { NsLogo } from "@/components/ns-logo";
import { SignOutButton } from "@/components/sign-out-button";

type AppTopbarProps = {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
};

export function AppTopbar({ user }: AppTopbarProps) {
  const displayName = user.name ?? "Member";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="sticky top-0 z-50 flex h-[56px] w-full items-center justify-center border-b border-gray-200 bg-white px-4">
      <header className="flex h-full w-full max-w-[1440px] items-center justify-between">
        <Link href="/home" className="flex items-center" aria-label="NS Logistics home">
          <NsLogo className="h-5 w-auto text-[#111827]" />
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">Member</p>
          </div>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="h-9 w-9 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
              {initial}
            </div>
          )}
          <SignOutButton />
        </div>
      </header>
    </div>
  );
}
