import { LogisticsHome } from "@/components/logistics/logistics-home";

const previewUser = {
  id: "preview-user",
  name: "Aravind Ranganathan",
  image:
    "https://api.dicebear.com/9.x/thumbs/svg?seed=Aravind&backgroundColor=2970ff",
};

/** Unauthenticated design preview for the logged-in logistics home. */
export default function PreviewPage() {
  return <LogisticsHome user={previewUser} />;
}
