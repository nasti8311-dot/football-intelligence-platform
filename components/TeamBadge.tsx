type Props = {
  team: string;
  size?: number;
};

function logoFor(team: string) {
  const key = team.toLowerCase();

  if (key.includes("arsenal")) return "/logos/arsenal.png";
  if (key.includes("aston villa")) return "/logos/aston-villa.png";
  if (key.includes("chelsea")) return "/logos/chelsea.png";
  if (key.includes("everton")) return "/logos/everton.png";
  if (key.includes("fulham")) return "/logos/fulham.png";
  if (key.includes("liverpool")) return "/logos/liverpool.png";
  if (key.includes("manchester city") || key.includes("man city")) return "/logos/manchester-city.png";
  if (key.includes("manchester united") || key.includes("man united")) return "/logos/manchester-united.png";
  if (key.includes("newcastle")) return "/logos/newcastle.png";
  if (key.includes("tottenham")) return "/logos/tottenham.png";
  if (key.includes("wolves") || key.includes("wolverhampton")) return "/logos/wolves.png";
  if (key.includes("brighton")) return "/logos/brighton.png";
  if (key.includes("brentford")) return "/logos/brentford.png";
  if (key.includes("west ham")) return "/logos/west-ham.png";
  if (key.includes("bournemouth")) return "/logos/bournemouth.png";
  if (key.includes("burnley")) return "/logos/burnley.png";
  if (key.includes("leeds")) return "/logos/leeds.png";

  if (key.includes("bayern")) return "/logos/bayern.png";
  if (key.includes("dortmund")) return "/logos/dortmund.png";
  if (key.includes("leverkusen")) return "/logos/leverkusen.png";
  if (key.includes("leipzig")) return "/logos/leipzig.png";

  if (key.includes("barcelona")) return "/logos/barcelona.png";
  if (key.includes("real madrid")) return "/logos/real-madrid.png";
  if (key.includes("atletico")) return "/logos/atletico.png";

  if (key.includes("juventus")) return "/logos/juventus.png";
  if (key.includes("inter")) return "/logos/inter.png";
  if (key.includes("milan") && !key.includes("inter")) return "/logos/milan.png";
  if (key.includes("roma")) return "/logos/roma.png";
  if (key.includes("napoli")) return "/logos/napoli.png";
  if (key.includes("psg") || key.includes("paris")) return "/logos/psg.png";

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
        <img src={logo} alt={team} className="h-full w-full bg-white object-contain p-1" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-400 to-emerald-400 font-black text-slate-950">
          {team.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
