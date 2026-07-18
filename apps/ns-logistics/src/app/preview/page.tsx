import { AppTopbar } from "@/components/app-topbar";
import { LogisticsHome } from "@/components/logistics/logistics-home";

/** Unauthenticated design preview for the logged-in logistics home. */
export default function PreviewPage() {
  return (
    <>
      <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
        Preview mode — mock user, no Discord session required. Real app:{" "}
        <a href="/home" className="underline">
          /home
        </a>
      </div>
      <AppTopbar
        user={{
          name: "Aravind Ranganathan",
          image: "https://api.dicebear.com/9.x/thumbs/svg?seed=Aravind&backgroundColor=7c3aed",
        }}
      />
      <LogisticsHome
        user={{
          id: "preview-user",
          name: "Aravind Ranganathan",
          image:
            "https://api.dicebear.com/9.x/thumbs/svg?seed=Aravind&backgroundColor=7c3aed",
        }}
      />
    </>
  );
}
