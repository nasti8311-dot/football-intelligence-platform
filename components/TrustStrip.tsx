export default function TrustStrip() {
  const items = [
    ["63%", "Backtest-Trefferquote", "aus ausgewerteten Snapshots"],
    ["5–10", "Premium-Picks", "je nach Spielplan"],
    ["24/7", "Datenpipeline", "Fixtures, Quoten, News"],
    ["Beta", "Kostenloser Zugang", "für frühe Mitglieder"],
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {items.map(([value, label, sub]) => (
        <div
          key={label}
          className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl"
        >
          <p className="text-3xl font-black text-cyan-300">{value}</p>
          <p className="mt-2 font-black text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{sub}</p>
        </div>
      ))}
    </section>
  );
}
