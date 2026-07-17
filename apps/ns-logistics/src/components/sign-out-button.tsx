import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
      >
        Sign out
      </button>
    </form>
  );
}
