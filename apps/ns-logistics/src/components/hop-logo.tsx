type HopLogoProps = {
  className?: string;
};

/**
 * B/W mark in the NS ink language: solid black tile, white hop glyph
 * (two hubs + a short leap). Wordmark sits beside it.
 */
export function HopMark({ className }: HopLogoProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" rx="4" fill="currentColor" />
      {/* Left hub */}
      <circle cx="5.5" cy="13.25" r="1.65" fill="#fff" />
      {/* Right hub */}
      <circle cx="14.5" cy="13.25" r="1.65" fill="#fff" />
      {/* Short hop between hubs */}
      <path
        d="M6.6 12.1C8.15 7.35 11.85 7.35 13.4 12.1"
        stroke="#fff"
        strokeWidth="1.85"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function HopLogo({ className }: HopLogoProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 text-[var(--ns-ink)]",
        className ?? "",
      ].join(" ")}
    >
      <HopMark className="h-5 w-5 shrink-0" />
      <span className="font-display text-[1.15rem] font-semibold leading-none tracking-[-0.04em]">
        Hop
      </span>
    </span>
  );
}
