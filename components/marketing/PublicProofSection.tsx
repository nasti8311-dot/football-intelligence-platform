import Link from "next/link";

export function PublicProofSection({
  resolved,
  accuracy,
}: {
  resolved: number;
  accuracy: number;
}) {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-black p-8 md:p-10">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Public Proof
          </p>
          <h2 className="mt-3 text-4xl font-black">
            Every prediction becomes measurable.
          </h2>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Football IQ speichert Predictions, resolved Ergebnisse automatisch
            und macht Modellqualität über Track Record und Calibration sichtbar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/public-track-record"
              className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black"
            >
              Track Record
            </Link>

            <Link
              href="/model-quality"
              className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white"
            >
              Calibration
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/40 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
            Resolved Predictions
          </p>

          <p className="mt-3 text-6xl font-black text-white">
            {resolved}
          </p>

          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
            Historical Accuracy
          </p>

          <p className="mt-3 text-6xl font-black text-emerald-400">
            {accuracy}%
          </p>
        </div>
      </div>
    </section>
  );
}
