import TrustBar from "@/components/TrustBar";
import PageHero from "@/components/PageHero";
import Link from "next/link";

const reports = [
  {
    title: "Executive Summary",
    desc: "Ein einfacher Überblick über Daten, Teams, Matches und Plattformstatus.",
    href: "/executive-summary",
    tag: "Overview",
  },
  {
    title: "Coach View",
    desc: "Konkrete Handlungsempfehlungen für Teams und Trainer.",
    href: "/coach-view",
    tag: "Coaching",
  },
  {
    title: "Opponent Prep",
    desc: "Gegneranalyse mit Schwächen, Bedrohung und Matchplan.",
    href: "/opponent-prep",
    tag: "Opponent",
  },
  {
    title: "Scout Dashboard",
    desc: "Spieler-Rankings, Rollen, Scores und Scouting-Kandidaten.",
    href: "/scout-dashboard",
    tag: "Scouting",
  },
  {
    title: "Team Profile",
    desc: "Detailanalyse einzelner Teams mit Form, Toren und Events.",
    href: "/team-profile",
    tag: "Team",
  },
  {
    title: "Match Center",
    desc: "Einzelne Spiele mit Score, Events und Spielfeldkarte analysieren.",
    href: "/match-center",
    tag: "Match",
  },
];

export default function ReportsCenterPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero eyebrow="Reports" title="Reports Center" description="Alle verständlichen Analyseberichte an einem Ort." />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:scale-[1.02] hover:border-cyan-400/40 hover:bg-white/[0.07]"
            >
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                {report.tag}
              </span>

              <h2 className="mt-5 text-3xl font-black group-hover:text-cyan-300">
                {report.title}
              </h2>

              <p className="mt-4 text-slate-400">
                {report.desc}
              </p>

              <div className="mt-7 text-sm font-bold text-cyan-300">
                Open report →
              </div>
            </Link>
          ))}
        </section>
              <TrustBar />
      </div>
    </main>
  );
}
