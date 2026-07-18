import { BoardShell } from "@/components/logistics/board-shell";

const previewUser = {
  id: "preview-user",
  name: "Aravind Ranganathan",
  image:
    "https://api.dicebear.com/9.x/thumbs/svg?seed=Aravind&backgroundColor=2970ff",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BoardShell
      user={previewUser}
      basePath="/preview"
      banner={
        <div className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
          Preview mode — mock user, no Discord session required. Real app:{" "}
          <a href="/home" className="underline">
            /home
          </a>
        </div>
      }
    >
      {children}
    </BoardShell>
  );
}
