type Props = {
  team: string;
  size?: number;
};

function logoFor(team: string) {
  const key = team.toLowerCase();

  if (key.includes("bayern")) return "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_München_logo_%282017%29.svg";
  if (key.includes("dortmund")) return "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg";
  if (key.includes("leverkusen")) return "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg";
  if (key.includes("arsenal")) return "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg";
  if (key.includes("liverpool")) return "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg";
  if (key.includes("city") || key.includes("manchester")) return "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg";
  if (key.includes("chelsea")) return "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg";
  if (key.includes("tottenham")) return "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg";
  if (key.includes("real")) return "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg";
  if (key.includes("barcelona")) return "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg";
  if (key.includes("juventus")) return "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg";
  if (key.includes("milan")) return "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg";
  if (key.includes("inter")) return "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg";
  if (key.includes("psg") || key.includes("paris")) return "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg";

  return null;
}

export default function TeamBadge({ team, size = 44 }: Props) {
  const logo = logoFor(team);

  if (logo) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-white p-2 shadow-2xl"
        style={{ width: size, height: size, minWidth: size }}
        title={team}
      >
        <img
          src={logo}
          alt={team}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 font-black text-slate-950 shadow-2xl"
      style={{ width: size, height: size, minWidth: size }}
      title={team}
    >
      {team.slice(0, 2).toUpperCase()}
    </div>
  );
}
