import Link from "next/link";
import { HopLogo } from "@/components/hop-logo";

export function SiteHeader() {
  return (
    <>
      <div className="fixed left-0 top-0 z-50 flex h-[50px] w-full justify-center border-b border-gray-200 bg-white px-4">
        <header className="flex h-full w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex h-6 items-center" aria-label="Hop home">
            <HopLogo />
          </Link>
          <p className="text-sm font-medium text-gray-500">Network School</p>
        </header>
      </div>
      <div className="h-[50px]" />
    </>
  );
}
