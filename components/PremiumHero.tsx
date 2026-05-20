import TrustBadge from "@/components/TrustBadge";

export default function PremiumHero() {
  return (
    <section className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-[#07111f]/95 p-8 shadow-2xl shadow-black/40 md:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-emerald-400/10" />

      <div className="relative">
        <TrustBadge />

        <h1 className="page-title mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white md:text-7xl">
          Fußballspiele.
          <br />
          Klar bewertet.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          5–10 täglich analysierte Spiele mit KI-Modell, Risiko-Kontrolle,
          Quotenvergleich und Wahrscheinlichkeiten.
        </p>
      </div>
    </section>
  );
}
