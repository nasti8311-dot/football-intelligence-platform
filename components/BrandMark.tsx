export default function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-400/20">
        FI
      </div>

      <div>
        <p className="text-sm font-black leading-none text-white">
          Football Intelligence
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Premium Prediction Engine
        </p>
      </div>
    </div>
  );
}
