import Link from "next/link";

const items = [
  {
    title: "1. Daten",
    text: "Wir nutzen kommende Spiele, historische Ergebnisse, gespeicherte Quoten und frühere Prognosen.",
  },
  {
    title: "2. Modell",
    text: "Das Modell bewertet Teams über Stärke, Form, Tore, Gegentore und Marktinformationen.",
  },
  {
    title: "3. Auswahl",
    text: "Es werden nicht alle Spiele angezeigt. Nur Picks mit ausreichender Qualität schaffen es in die Daily Picks.",
  },
  {
    title: "4. Kontrolle",
    text: "Jede Prognose wird nach dem Spiel ausgewertet. So entsteht eine echte Performance-Historie.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Methodik
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Wie entstehen die Daily Picks?
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-400">
            Football IQ kombiniert Daten, Quoten und Modellbewertung. Ziel sind wenige,
            verständliche und überprüfbare Prognosen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-2xl font-black">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-400">{item.text}</p>
            </div>
          ))}
        </section>

        <Link href="/daily-picks" className="inline-flex rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
          Daily Picks ansehen
        </Link>
      </div>
    </main>
  );
}
