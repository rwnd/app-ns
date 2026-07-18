"use client";

type DiscordConfirmProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Opt-in gate before any Discord write (thread create or rider mention). */
export function DiscordConfirm({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: DiscordConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--iron-200)] bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-[var(--ns-ink)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--iron-500)]">
          {body}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--ns-ink)] hover:bg-[var(--iron-100)]"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752C4]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
