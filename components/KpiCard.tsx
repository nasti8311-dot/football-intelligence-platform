type Props = {
  label: string;
  value: string | number;
  hint?: string;
};

export default function KpiCard({ label, value, hint }: Props) {
  return (
    <div className="glass-card rounded-3xl p-6 transition hover:scale-[1.02]">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-5xl font-black text-cyan-300">{value}</p>
      {hint && <p className="mt-3 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
