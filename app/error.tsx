"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-10 text-white md:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="glass-card glow rounded-[2rem] p-8 text-center md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-red-300">
            Fehler
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Etwas ist schiefgelaufen.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Bitte versuche es erneut. Wenn der Fehler bleibt, werden die Daten
            beim nächsten Sync automatisch wieder aktualisiert.
          </p>

          <button
            onClick={() => reset()}
            className="mt-8 rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950"
          >
            Erneut versuchen
          </button>
        </section>
      </div>
    </main>
  );
}
