export default function EmptyNewsState() {
  return (
    <div className="rounded-[2rem] border border-cyan-400/10 bg-cyan-400/5 p-6 text-center">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
        News werden aufgebaut
      </p>
      <h3 className="mt-3 text-2xl font-black text-white">
        Für dieses Spiel liegen noch keine verlässlichen News vor.
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
        Unsere News-Abdeckung wird laufend erweitert. Picks bleiben weiterhin
        auf Modellwerten, Quoten, Form und historischer Kalibrierung basiert.
      </p>
    </div>
  );
}
