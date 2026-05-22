import Link from "next/link";

const points = [
  {
    title: "Keine Fake-Confidence",
    text: "Wahrscheinlichkeiten werden historisch geprüft und kalibriert.",
  },
  {
    title: "Verified statt Masse",
    text: "Spiele ohne ausreichende Daten werden nicht künstlich als Pick verkauft.",
  },
  {
    title: "Öffentlicher Track Record",
    text: "Resolved Predictions und Marktperformance bleiben messbar.",
  },
];

export function TrustSection() {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 md:p-10">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
          Transparency First
        </p>

        <h2 className="mt-3 text-4xl font-black">
          Built for measurable model quality.
        </h2>

        <p className="mt-4 text-sm leading-7 text-neutral-400">
          Football IQ zeigt nicht nur Picks, sondern auch Datenqualität,
          Calibration, Performance und Systemgrenzen.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {points.map((point) => (
          <div
            key={point.title}
            className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"
          >
            <h3 className="font-black">{point.title}</h3>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              {point.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/methodology"
          className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white hover:border-emerald-400/40"
        >
          Methodik ansehen
        </Link>
      </div>
    </section>
  );
}
