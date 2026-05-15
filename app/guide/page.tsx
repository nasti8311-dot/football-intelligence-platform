const items = [
  {
    title: "xG",
    meaning: "Expected Goals",
    text: "Zeigt, wie wahrscheinlich ein Abschluss ein Tor wird. Höher ist besser.",
  },
  {
    title: "Form",
    meaning: "Aktuelle Leistung",
    text: "Zeigt die letzten Ergebnisse eines Teams: W = Sieg, D = Remis, L = Niederlage.",
  },
  {
    title: "AI Score",
    meaning: "Gesamtbewertung",
    text: "Ein einfacher Score, der Aktionen, Chancen, Pässe und defensive Aktionen zusammenfasst.",
  },
  {
    title: "Event Map",
    meaning: "Spielfeldkarte",
    text: "Zeigt, wo Aktionen auf dem Feld passieren: Schüsse, Pässe und andere Events.",
  },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">User Guide</p>
          <h1 className="text-5xl font-black">Was bedeutet das alles?</h1>
          <p className="mt-4 text-slate-400">
            Einfache Erklärung der wichtigsten Football-Analytics-Begriffe.
          </p>
        </section>

        <section className="grid gap-5">
          {items.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-cyan-300">{item.meaning}</p>
              <h2 className="mt-1 text-3xl font-bold">{item.title}</h2>
              <p className="mt-3 text-slate-300">{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
