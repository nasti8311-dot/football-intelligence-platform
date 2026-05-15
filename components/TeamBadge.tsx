type Props = {
  team: string;
  size?: number;
};

const colors: Record<string, string> = {
  Bayern: "from-red-500 to-red-700",
  Dortmund: "from-yellow-300 to-yellow-500",
  Leverkusen: "from-red-400 to-black",
  Arsenal: "from-red-500 to-white",
  Liverpool: "from-red-600 to-emerald-500",
  City: "from-sky-400 to-sky-700",
};

export default function TeamBadge({
  team,
  size = 44,
}: Props) {
  const color =
    colors[team] || "from-cyan-400 to-emerald-400";

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${color} font-black text-slate-950 shadow-2xl`}
      style={{
        width: size,
        height: size,
        minWidth: size,
      }}
    >
      {team.slice(0, 2).toUpperCase()}
    </div>
  );
}
