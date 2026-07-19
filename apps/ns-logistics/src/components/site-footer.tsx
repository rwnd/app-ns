import type { CSSProperties } from "react";
import Link from "next/link";
import { NsMark } from "@/components/ns-logo";

const footerStyle = {
  backgroundColor: "#131316",
  ["--text-color" as string]: "#A0A0AB",
  ["--text-hover-color" as string]: "#ffffff",
  ["--logo-color" as string]: "#3F3F46",
  ["--logo-hover-color" as string]: "#ffffff",
} as CSSProperties;

export function SiteFooter() {
  return (
    <div className="flex justify-center px-3 py-2 md:px-4 md:py-4" style={footerStyle}>
      <div className="flex w-full max-w-lg flex-col items-center gap-4 md:gap-3">
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://ns.com"
            className="py-2 text-sm text-[var(--text-color)] transition-colors hover:text-[var(--text-hover-color)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            ns.com
          </a>
          <div className="h-5 w-px flex-shrink-0 bg-[#3F3F46]" />
          <a
            href="https://ns.com/support"
            className="py-2 text-sm text-[var(--text-color)] transition-colors hover:text-[var(--text-hover-color)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
        </div>
        <Link
          href="/"
          className="flex items-center pb-4 text-[var(--logo-color)] transition-colors hover:text-[var(--logo-hover-color)] md:pb-3"
          aria-label="Go to homepage"
        >
          <NsMark />
        </Link>
      </div>
    </div>
  );
}
