import Link from "next/link";
import { NsLogo } from "@/components/ns-logo";

export function SiteHeader() {
  return (
    <>
      <div className="fixed left-0 top-0 z-50 flex h-[50px] w-full justify-center border-b border-gray-200 bg-white px-4">
        <header className="flex h-full w-full max-w-7xl items-center justify-between">
          <Link href="/" className="flex h-6 items-center" aria-label="Go to homepage">
            <NsLogo className="h-5 w-auto text-[#111827]" />
          </Link>
          <p className="text-sm font-medium text-gray-500">Logistics</p>
        </header>
      </div>
      <div className="h-[50px]" />
    </>
  );
}
