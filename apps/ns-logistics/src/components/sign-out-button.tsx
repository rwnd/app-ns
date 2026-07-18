"use client";

import { signOutAction } from "@/lib/auth-actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-full border border-[var(--iron-200)] px-3 py-1.5 text-xs font-semibold text-[var(--iron-500)] transition-colors hover:bg-[var(--iron-50)] hover:text-[var(--ns-ink)]"
      >
        Sign out
      </button>
    </form>
  );
}
