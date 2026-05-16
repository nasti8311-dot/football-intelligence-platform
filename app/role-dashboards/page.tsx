import Link from "next/link";
import PageHero from "@/components/PageHero";

const roles = [
  {
    role: "Coach",
    title: "Prepare your next match",
    text: "Use Coach View, Opponent Prep and Match Center to understand risks and game plans.",
    links: [
      ["Coach View", "/coach-view"],
      ["Opponent Prep", "/opponent-prep"],
      ["Match Center", "/match-center"],
    ],
  },
  {
    role: "Scout",
    title: "Find better players",
    text: "Use Scout Dashboard, Transfer Market and Player Profiles to identify recruitment targets.",
    links: [
      ["Scout Dashboard", "/scout-dashboard"],
      ["Transfer Market", "/transfer-market"],
      ["Player Profile", "/player-profile"],
    ],
  },
  {
    role: "Analyst",
    title: "Understand performance",
    text: "Use Team Intelligence, Event Map and Data Health to analyse football data quality and trends.",
    links: [
      ["Team Intelligence", "/team-intelligence"],
      ["Event Map", "/event-map"],
      ["Data Health", "/data-health"],
    ],
  },
];

export default function RoleDashboardsPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="User Roles"
          title="Role Dashboards"
          description="Choose your role and jump directly into the most useful football analytics workflows."
        />

        <section className="grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <div key={r.role} className="glass-card rounded-3xl p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                {r.role}
              </p>

              <h2 className="mt-4 text-3xl font-black">
                {r.title}
              </h2>

              <p className="mt-4 text-slate-300">
                {r.text}
              </p>

              <div className="mt-8 space-y-3">
                {r.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-2xl bg-slate-950/60 px-5 py-4 font-bold text-slate-200 transition hover:bg-cyan-400 hover:text-slate-950"
                  >
                    {label} →
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
