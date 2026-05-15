import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Football Intelligence Platform",
  description: "Modern football analytics powered by AI",
};

const nav = [
  {
    title: "Overview",
    items: [
      ["/insight-hub", "Insight Hub"],
      ["/", "Dashboard"],
      ["/executive-summary", "Summary"],
      ["/reports-center", "Reports"],
      ["/action-center", "Actions"],
      ["/coach-view", "Coach View"],
      ["/opponent-prep", "Opponent Prep"],
      ["/guide", "Guide"],
    ],
  },
  {
    title: "Analytics",
    items: [
      ["/team-intelligence", "Teams"],
      ["/league-intelligence", "Leagues"],
      ["/form-guide", "Form"],
      ["/event-map", "Event Map"],
      ["/team-profile", "Team Profile"],
      ["/club-house", "Club House"],
      ["/club-comparison", "Club Comparison"],
    ],
  },
  {
    title: "AI Tools",
    items: [
      ["/prediction-center", "Predictions"],
      ["/match-center", "Match Center"],
      ["/ai-scout-report", "Scout Reports"],
      ["/scout-dashboard", "Scout Dashboard"],
      ["/player-radar", "Player Radar"],
      ["/player-profile", "Player Profile"],
      ["/event-intelligence", "Advanced Events"],
    ],
  },
  {
    title: "Data",
    items: [
      ["/upload-center", "Upload"],
      ["/admin/import", "Import"],
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <div className="flex min-h-screen">
          <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-black/20 xl:block">
            <div className="border-b border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                Football AI
              </p>

              <h1 className="page-title mt-3 text-2xl font-black">
                Intelligence Platform
              </h1>
            </div>

            <nav className="space-y-8 p-4">
              {nav.map((group) => (
                <div key={group.title}>
                  <p className="mb-3 px-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                    {group.title}
                  </p>

                  <div className="flex flex-col gap-2">
                    {group.items.map(([href, label]) => (
                      <Link
                        key={href}
                        href={href}
                        className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <div className="border-b border-white/10 bg-black/20 px-6 py-4 xl:hidden">
              <div className="flex flex-wrap gap-2">
                {nav.flatMap((group) =>
                  group.items.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300"
                    >
                      {label}
                    </Link>
                  ))
                )}
              </div>
            </div>

            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
