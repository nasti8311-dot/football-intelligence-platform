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
  const radius = 30;
  const stroke = 6;
  const normalized = radius * 2 * Math.PI;
  const offset = normalized - (value / 100) * normalized;

  const colors = {
    emerald: "#10b981",
    blue: "#3b82f6",
    neutral: "#a3a3a3",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg
          className="-rotate-90"
          width="80"
          height="80"
        >
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="transparent"
          />

          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={colors[color]}
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={normalized}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-xs font-semibold text-neutral-400">
            {label}
          </span>

          <span className="text-sm font-black text-white">
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
}
