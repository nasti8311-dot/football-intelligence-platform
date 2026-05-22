async function getData() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/pick-quality",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function PickQualityPage() {
  const data = await getData();

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Calibration
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Pick Quality
          </h1>
        </section>

        <section className="grid gap-4">
          {data.map((row: any) => (
            <div
              key={row.bucket}
              className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div>
                <p className="text-2xl font-black">
                  {row.bucket}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {row.total} Predictions
                </p>
              </div>

              <div className="text-right">
                <p className="text-4xl font-black text-emerald-300">
                  {row.accuracy}%
                </p>

                <p className="text-xs text-neutral-500">
                  Accuracy
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
