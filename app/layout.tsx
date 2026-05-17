import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import SidebarStatus from "@/components/SidebarStatus";
import TopBar from "@/components/TopBar";
import BackgroundFX from "@/components/BackgroundFX";
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
      ["/board-room", "Board Room"],
      ["/reports-center", "Reports"],
      ["/action-center", "Actions"],
      ["/notification-center", "Notifications"],
      ["/settings", "Settings"],
      ["/operations-center", "Operations"],
      ["/onboarding", "Onboarding"],
      ["/workspace", "Workspace"],
      ["/client-portal", "Client Portal"],
      ["/saved-reports", "Saved Reports"],
      ["/coach-view", "Coach View"],
      ["/opponent-prep", "Opponent Prep"],
      ["/guide", "Guide"],
      ["/demo-tour", "Demo Tour"],
      ["/role-dashboards", "Role Dashboards"],
      ["/newsroom", "Newsroom"],
      ["/about", "About"],
      ["/contact", "Contact"],
      ["/trust", "Trust"],
      ["/pricing", "Pricing"],
      ["/pitch", "Pitch"],
      ["/white-label", "White Label"],
      ["/case-studies", "Case Studies"],
      ["/features", "Features"],
      ["/mobile-preview", "Mobile Preview"],
      ["/product-roadmap", "Roadmap"],
      ["/help-center", "Help Center"],
      ["/academy", "Academy"],
      ["/glossary", "Glossary"],
    ],
  },
  {
    title: "Analytics",
    items: [
      ["/team-intelligence", "Teams"],
      ["/league-intelligence", "Leagues"],
      ["/form-guide", "Form"],
      ["/momentum", "Momentum"],
      ["/event-map", "Event Map"],
      ["/team-profile", "Team Profile"],
      ["/club-house", "Club House"],
      ["/club-dna", "Club DNA"],
      ["/club-comparison", "Club Comparison"],
    ],
  },
  {
    title: "AI Tools",
    items: [
      ["/prediction-center", "Predictions"],
      ["/predictions-hub", "Predictions Hub"],
      ["/best-predictions", "Best Predictions"],
      ["/prediction-performance", "Performance"],
      ["/match-center", "Match Center"],
      ["/match-room", "Match Room"],
      ["/ai-scout-report", "Scout Reports"],
      ["/scout-dashboard", "Scout Dashboard"],
      ["/transfer-market", "Transfer Market"],
      ["/talent-pipeline", "Talent Pipeline"],
      ["/ai-insights", "AI Insights"],
      ["/ai-assistant", "AI Assistant"],
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
        <BackgroundFX />
        <div className="flex min-h-screen">
          <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-black/20 xl:block">
            <div className="relative overflow-hidden border-b border-white/10 p-6">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl"></div>
              <p className="relative text-sm uppercase tracking-[0.3em] text-cyan-400">
                Football AI
              </p>

              <h1 className="page-title glow-text mt-3 text-2xl font-black">
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

            <SidebarStatus />
          </aside>

          <main className="relative z-10 flex-1">
            <TopBar />
            <div className="floating-nav sticky top-0 z-50 px-6 py-4 xl:hidden">
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
            <Footer />
            <MobileBottomNav />
          </main>
        </div>
      </body>
    </html>
  );
}
