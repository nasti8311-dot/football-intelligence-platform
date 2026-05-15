import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Football Intelligence Platform",
  description: "Modern football analytics powered by AI",
};

const nav = [
  ["/", "Home"],
  ["/team-intelligence", "Team Analysis"],
  ["/form-guide", "Form Guide"],
  ["/league-intelligence", "Leagues"],
  ["/prediction-center", "Predictions"],
  ["/ai-scout-report", "Scout Reports"],
  ["/player-radar", "Player Radar"],
  ["/event-map", "Event Map"],
  ["/event-intelligence", "Advanced Events"],
  ["/admin/import", "Import Data"],
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
          <aside className="hidden w-72 border-r border-white/10 bg-black/20 xl:block">
            <div className="border-b border-white/10 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
                Football AI
              </p>

              <h1 className="mt-3 text-2xl font-black">
                Intelligence Platform
              </h1>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              {nav.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <div className="border-b border-white/10 bg-black/20 px-6 py-4 xl:hidden">
              <div className="flex flex-wrap gap-2">
                {nav.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
