type Props = {
  team: string;
  size?: number;
};

function logoFor(team: string) {
  const key = team.toLowerCase();

  if (key.includes("arsenal")) return "/logos/arsenal.svg";
  if (key.includes("liverpool")) return "/logos/liverpool.svg";
  if (key.includes("manchester city") || key.includes("man city") || key === "city") return "/logos/manchester-city.svg";
  if (key.includes("chelsea")) return "/logos/chelsea.svg";
  if (key.includes("tottenham")) return "/logos/tottenham.svg";
  if (key.includes("newcastle")) return "/logos/newcastle.svg";
  if (key.includes("west ham")) return "/logos/west-ham.svg";
  if (key.includes("everton")) return "/logos/everton.svg";
  if (key.includes("crystal palace")) return "/logos/crystal-palace.svg";
  if (key.includes("brighton")) return "/logos/brighton.svg";
  if (key.includes("wolves") || key.includes("wolverhampton")) return "/logos/wolves.svg";
  if (key.includes("fulham")) return "/logos/fulham.svg";
  if (key.includes("bournemouth")) return "/logos/bournemouth.svg";
  if (key.includes("brentford")) return "/logos/brentford.svg";
  if (key.includes("leeds")) return "/logos/leeds.svg";
  if (key.includes("burnley")) return "/logos/burnley.png";
  if (key.includes("aston villa")) return "/logos/aston-villa.svg";

  if (key.includes("bayern")) return "/logos/bayern.svg";
  if (key.includes("dortmund")) return "/logos/dortmund.svg";
  if (key.includes("leverkusen")) return "/logos/leverkusen.svg";
  if (key.includes("leipzig")) return "/logos/leipzig.svg";

  if (key.includes("real madrid")) return "/logos/real-madrid.svg";
  if (key.includes("barcelona")) return "/logos/barcelona.svg";
  if (key.includes("atletico")) return "/logos/atletico.svg";

  if (key.includes("psg") || key.includes("paris")) return "/logos/psg.svg";
  if (key.includes("juventus")) return "/logos/juventus.svg";
  if (key.includes("inter")) return "/logos/inter.svg";
  if (key.includes("milan") && !key.includes("inter")) return "/logos/milan.svg";
  if (key.includes("napoli")) return "/logos/napoli.svg";
  if (key.includes("roma")) return "/logos/roma.svg";

  return null;
}

export default function TeamBadge({ team, size = 44 }: Props) {
  const logo = logoFor(team);

  if (logo) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-white p-2 shadow-2xl ring-2 ring-white/25"
        style={{ width: size, height: size, minWidth: size }}
        title={team}
      >
        <img src={logo} alt={team} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 font-black text-slate-950 shadow-2xl ring-2 ring-white/25"
      style={{ width: size, height: size, minWidth: size }}
      title={team}
    >
      {team.slice(0, 2).toUpperCase()}
    </div>
  );
}
