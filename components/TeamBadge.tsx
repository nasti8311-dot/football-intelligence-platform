type Props = {
  team: string;
  size?: number;
};

function logoFor(team: string) {
  const key = team.toLowerCase();

  // EPL
  if (key.includes("arsenal")) return "https://crests.football-data.org/57.png";
  if (key.includes("aston villa")) return "https://crests.football-data.org/58.png";
  if (key.includes("chelsea")) return "https://crests.football-data.org/61.png";
  if (key.includes("liverpool")) return "https://crests.football-data.org/64.png";
  if (key.includes("manchester city") || key.includes("man city")) return "https://crests.football-data.org/65.png";
  if (key.includes("manchester united")) return "https://crests.football-data.org/66.png";
  if (key.includes("newcastle")) return "https://crests.football-data.org/67.png";
  if (key.includes("tottenham")) return "https://crests.football-data.org/73.png";
  if (key.includes("everton")) return "https://crests.football-data.org/62.png";
  if (key.includes("west ham")) return "https://crests.football-data.org/563.png";
  if (key.includes("brighton")) return "https://crests.football-data.org/397.png";
  if (key.includes("wolves") || key.includes("wolverhampton")) return "https://crests.football-data.org/76.png";
  if (key.includes("crystal palace")) return "https://crests.football-data.org/354.png";
  if (key.includes("brentford")) return "https://crests.football-data.org/402.png";
  if (key.includes("fulham")) return "https://crests.football-data.org/63.png";
  if (key.includes("bournemouth")) return "https://crests.football-data.org/1044.png";
  if (key.includes("burnley")) return "https://crests.football-data.org/328.png";
  if (key.includes("leeds")) return "https://crests.football-data.org/341.png";

  // Bundesliga
  if (key.includes("bayern")) return "https://crests.football-data.org/5.png";
  if (key.includes("dortmund")) return "https://crests.football-data.org/4.png";
  if (key.includes("leverkusen")) return "https://crests.football-data.org/3.png";
  if (key.includes("leipzig")) return "https://crests.football-data.org/721.png";

  // Spain
  if (key.includes("real madrid")) return "https://crests.football-data.org/86.png";
  if (key.includes("barcelona")) return "https://crests.football-data.org/81.png";
  if (key.includes("atletico")) return "https://crests.football-data.org/78.png";

  // Italy
  if (key.includes("juventus")) return "https://crests.football-data.org/109.png";
  if (key.includes("inter")) return "https://crests.football-data.org/108.png";
  if (key.includes("milan") && !key.includes("inter")) return "https://crests.football-data.org/98.png";
  if (key.includes("napoli")) return "https://crests.football-data.org/113.png";
  if (key.includes("roma")) return "https://crests.football-data.org/100.png";

  // France
  if (key.includes("psg") || key.includes("paris")) return "https://crests.football-data.org/524.png";

  return null;
}

export default function TeamBadge({ team, size = 44 }: Props) {
  const logo = logoFor(team);

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-2 ring-white/20"
      style={{ width: size, height: size, minWidth: size }}
      title={team}
    >
      {logo ? (
        <img
          src={logo}
          alt={team}
          className="h-full w-full object-contain bg-white p-1"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-emerald-400 font-black text-slate-950">
          {team.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
