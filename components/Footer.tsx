import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-lg font-black text-white">
            Football Intelligence Platform
          </p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
            Datengetriebene Fußball-Prognosen. Wahrscheinlichkeiten, keine Garantien.
            Entwickelt für Analyse, Transparenz und verantwortungsvolle Nutzung.
          </p>
        </div>

        <div>
          <p className="font-black text-cyan-300">Plattform</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-cyan-300">Picks</Link>
            <Link href="/dashboard" className="hover:text-cyan-300">Dashboard</Link>
            <Link href="/news" className="hover:text-cyan-300">News</Link>
            <Link href="/prediction-performance" className="hover:text-cyan-300">Bilanz</Link>
          </div>
        </div>

        <div>
          <p className="font-black text-cyan-300">Vertrauen</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <Link href="/methodology" className="hover:text-cyan-300">Methode</Link>
            <Link href="/privacy" className="hover:text-cyan-300">Datenschutz</Link>
            <Link href="/terms" className="hover:text-cyan-300">Nutzungsbedingungen</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-5 text-xs text-slate-500">
        © {new Date().getFullYear()} Football Intelligence Platform · Beta-Version
      </div>
    </footer>
  );
}
