import Link from "next/link";

const features = [
  {
    title: "Verified Picks",
    href: "/verified-picks",
    desc: "Nur veröffentlichte Picks mit echter Datenqualität.",
  },
  {
    title: "Track Record",
    href: "/public-track-record",
    desc: "Historische Modellperformance transparent dargestellt.",
  },
  {
    title: "Model Quality",
    href: "/model-quality",
    desc: "Calibration, Marktqualität und Systemdiagnostik.",
  },
  {
    title: "Ops Center",
    href: "/ops-center",
    desc: "Coverage, Odds-Qualität und Live-Systemstatus.",
  },
];

export function FeatureGrid() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {features.map((feature) => (
        <Link
          key={feature.href}
          href={feature.href}
          className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-emerald-400/40 hover:bg-emerald-500/[0.03]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black">
              {feature.title}
            </h3>

            <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
              LIVE
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-neutral-400">
            {feature.desc}
          </p>
        </Link>
      ))}
    </section>
  );
}
