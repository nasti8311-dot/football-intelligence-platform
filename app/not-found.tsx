import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-10 text-white md:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="glass-card glow rounded-[2rem] p-8 text-center md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            404
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Diese Seite gibt es nicht.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Zurück zu den Picks oder zum Dashboard.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950"
            >
              Picks ansehen
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl bg-white/10 px-6 py-4 font-black text-white"
            >
              Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
