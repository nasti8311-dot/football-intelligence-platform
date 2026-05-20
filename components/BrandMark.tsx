export default function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-xl shadow-lg shadow-cyan-400/20">
        ⚽
      </div>

      <div>
        <p className="text-lg font-black leading-none tracking-[-0.04em] text-white">
          Football IQ
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300/80">
          Predictive Football
        </p>
      </div>
    </div>
  );
}
