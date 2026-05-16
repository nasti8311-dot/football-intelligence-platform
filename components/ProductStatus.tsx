export default function ProductStatus() {
  const items = [
    ["Database", "Online"],
    ["AI Reports", "Active"],
    ["Scouting", "Ready"],
    ["Visual Maps", "Ready"],
  ];

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="grid gap-4 md:grid-cols-4">
        {items.map(([label, status]) => (
          <div key={label} className="rounded-2xl bg-slate-950/60 p-5">
            <div className="mb-4 h-3 w-3 rounded-full bg-emerald-400" />
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-cyan-300">{status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
