export default function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-black shadow-lg shadow-emerald-500/20">
        IQ
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white" />
      </div>

      <div>
        <p className="text-base font-black leading-none tracking-tight text-white">
          Football IQ
        </p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
          Intelligence Platform
        </p>
      </div>
    </div>
  );
}
