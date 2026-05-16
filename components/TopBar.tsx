import Link from "next/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Football Intelligence
          </p>
          <p className="text-sm text-slate-400">
            Premium analytics cockpit
          </p>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/demo-tour"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white"
          >
            Demo Tour
          </Link>

          <Link
            href="/upload-center"
            className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"
          >
            Upload Data
          </Link>
        </div>
      </div>
    </header>
  );
}
