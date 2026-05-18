import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>
          Football Intelligence Platform · Predictions are probabilities, not guarantees.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link href="/methodology" className="hover:text-cyan-300">Methodology</Link>
          <Link href="/prediction-performance" className="hover:text-cyan-300">Performance</Link>
          <Link href="/privacy" className="hover:text-cyan-300">Privacy</Link>
          <Link href="/terms" className="hover:text-cyan-300">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
