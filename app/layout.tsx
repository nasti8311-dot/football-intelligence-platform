import "./globals.css";

const nav = [
  ["/", "Command Center"],
  ["/predictions", "Predictions"],
  ["/matches", "Matches"],
  ["/teams", "Teams"],
  ["/event-intelligence", "Event Intelligence"],
  ["/event-map", "Event Map"],
  ["/players", "Players"],
  ["/recruitment", "Recruitment"],
  ["/scouting", "Scouting"],
  ["/team-style", "Team Style"],
  ["/opponent-analysis", "Opponent"],
  ["/tactical", "Tactical"],
  ["/admin/import", "CSV Import"],
  ["/admin/events", "Event Import"],
  ["/executive", "Executive"],
  ["/model-registry", "Model Registry"],
  ["/feature-store", "Feature Store"],
  ["/ml-lab", "ML Lab"],
  ["/control-room", "Control Room"],
  ["/api-center", "API Center"],
  ["/war-room", "War Room"],
  ["/live", "Live Engine"],
  ["/finance", "Finance"],
  ["/board-room", "Board Room"],
  ["/transfer-center", "Transfer Center"],
  ["/command", "Command"],
  ["/ai-assistant", "AI Assistant"],
  ["/workspace", "Workspaces"],
  ["/billing", "Billing"],
  ["/club-os", "Club OS"],
];

export const metadata = {
  title: "Football Intelligence Platform",
  description: "Professional football analytics SaaS platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-950 text-white">
        <div className="min-h-screen md:flex">
          <aside className="border-r border-white/10 bg-slate-950/95 p-4 md:fixed md:inset-y-0 md:left-0 md:w-72">
            <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Football AI</p>
              <h1 className="mt-2 text-xl font-bold">Command Center</h1>
            </div>

            <nav className="space-y-1">
              {nav.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="block rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex-1 md:ml-72">{children}</div>
        </div>
      </body>
    </html>
  );
}
