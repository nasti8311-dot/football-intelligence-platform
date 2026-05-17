"use client";

type Props = {
  team: string;
  size?: number;
};

function clean(team: string) {
  return team.toLowerCase();
}

function logoFor(team: string) {
  const key = clean(team);

  if (key.includes("bayern")) return "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_München_logo_%282017%29.svg";
  if (key.includes("dortmund")) return "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg";
  if (key.includes("leverkusen")) return "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg";
  if (key.includes("leipzig")) return "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg";

  if (key.includes("arsenal")) return "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg";
  if (key.includes("liverpool")) return "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg";
  if (key.includes("manchester city") || key.includes("man city") || key === "city") return "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg";
  if (key.includes("chelsea")) return "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg";
  if (key.includes("tottenham")) return "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg";
  if (key.includes("newcastle")) return "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg";
  if (key.includes("west ham")) return "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg";
  if (key.includes("everton")) return "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg";
  if (key.includes("crystal palace")) return "https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg";
  if (key.includes("brighton")) return "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg";
  if (key.includes("wolves") || key.includes("wolverhampton")) return "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg";
  if (key.includes("fulham")) return "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg";
  if (key.includes("bournemouth")) return "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg";
  if (key.includes("brentford")) return "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg";
  if (key.includes("leeds")) return "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg";
  if (key.includes("sunderland")) return "https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg";
  if (key.includes("burnley")) return "https://upload.wikimedia.org/wikipedia/en/0/02/Burnley_FC_badge.png";
  if (key.includes("aston villa")) return "https://upload.wikimedia.org/wikipedia/en/9/9a/Aston_Villa_FC_new_crest.svg";

  return null;
}

export default function TeamBadge({ team, size = 44 }: Props) {
  const logo = logoFor(team);
  const initials = team.slice(0, 2).toUpperCase();

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-2 ring-cyan-300/40"
      style={{ width: size, height: size, minWidth: size }}
      title={team}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-emerald-400 font-black text-slate-950">
        {initials}
      </div>

      {logo && (
        <img
          src={logo}
          alt={team}
          className="relative z-10 h-full w-full bg-white object-contain p-2"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
