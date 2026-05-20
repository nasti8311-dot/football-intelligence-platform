type Props = {
  label: string;
  value: number;
  color?: "emerald" | "blue" | "neutral";
};

export default function ProbabilityRing({
  label,
  value,
  color = "emerald",
}: Props) {
  const safeValue = Math.min(100, Math.max(0, value || 0));
  const radius = 28;
  const stroke = 6;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safeValue / 100) * circumference;

  const colors = {
    emerald: "#10b981",
    blue: "#3b82f6",
    neutral: "#a3a3a3",
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-black/25 py-3 ring-1 ring-white/10">
      <div className="relative flex h-[76px] w-[76px] items-center justify-center">
        <svg className="-rotate-90" width="76" height="76">
          <circle
            cx="38"
            cy="38"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="transparent"
          />

          <circle
            cx="38"
            cy="38"
            r={radius}
            stroke={colors[color]}
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-[10px] font-black text-neutral-500">
            {label}
          </span>

          <span className="text-sm font-black text-white">
            {safeValue}%
          </span>
        </div>
      </div>
    </div>
  );
}
