const messages = [
  {
    role: "AI Scout",
    text: "Hohe Pressing-Intensität bei Team Alpha erkannt.",
  },
  {
    role: "Prediction Engine",
    text: "Win Probability steigt auf 68%.",
  },
  {
    role: "Recruitment AI",
    text: "Neues Similarity-Match für zentrale Mittelfeldrolle gefunden.",
  },
  {
    role: "Tactical AI",
    text: "Überladung auf linker Seite erkannt.",
  },
];

export default function AIAssistantPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Conversational Intelligence
          </p>

          <h1 className="text-5xl font-bold">
            AI Assistant
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Interaktive Football-Intelligence-
            Konsole für Tactical-, Recruitment-
            und Match-Insights.
          </p>
        </section>

        <section className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-sm text-cyan-300">
                {m.role}
              </p>

              <p className="mt-2 text-lg">
                {m.text}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6">
          <p className="text-sm text-cyan-300">
            Future Vision
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Conversational Football Intelligence
          </h2>

          <p className="mt-3 text-slate-300">
            Zukünftig kann deine Plattform
            komplette Match-, Tactical- und
            Recruitment-Fragen per AI beantworten.
          </p>
        </section>
      </div>
    </main>
  );
}
