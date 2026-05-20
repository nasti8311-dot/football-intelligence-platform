export default function ProbabilityRing({
  value,
  label,
  color = "#22d3ee",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  const deg = Math.round((v / 100) * 360);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full md:h-16 md:w-16"
        style={{
          background: `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07111f] md:h-12 md:w-12">
          <span className="text-xs font-black text-white">{v}%</span>
        </div>
      </div>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
