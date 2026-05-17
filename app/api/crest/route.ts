import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ids: Record<string, number> = {
  arsenal: 57,
  "aston-villa": 58,
  chelsea: 61,
  everton: 62,
  fulham: 63,
  liverpool: 64,
  "manchester-city": 65,
  "manchester-united": 66,
  newcastle: 67,
  tottenham: 73,
  wolves: 76,
  brighton: 397,
  brentford: 402,
  "west-ham": 563,
  bournemouth: 1044,
  burnley: 328,
  leeds: 341,
  bayern: 5,
  dortmund: 4,
  leverkusen: 3,
  leipzig: 721,
  barcelona: 81,
  "real-madrid": 86,
  atletico: 78,
  juventus: 109,
  inter: 108,
  milan: 98,
  roma: 100,
  napoli: 113,
  psg: 524,
};

function keyFor(team: string) {
  const k = team.toLowerCase();

  if (k.includes("arsenal")) return "arsenal";
  if (k.includes("aston villa")) return "aston-villa";
  if (k.includes("chelsea")) return "chelsea";
  if (k.includes("everton")) return "everton";
  if (k.includes("fulham")) return "fulham";
  if (k.includes("liverpool")) return "liverpool";
  if (k.includes("manchester city") || k.includes("man city")) return "manchester-city";
  if (k.includes("manchester united") || k.includes("man united")) return "manchester-united";
  if (k.includes("newcastle")) return "newcastle";
  if (k.includes("tottenham")) return "tottenham";
  if (k.includes("wolves") || k.includes("wolverhampton")) return "wolves";
  if (k.includes("brighton")) return "brighton";
  if (k.includes("brentford")) return "brentford";
  if (k.includes("west ham")) return "west-ham";
  if (k.includes("bournemouth")) return "bournemouth";
  if (k.includes("burnley")) return "burnley";
  if (k.includes("leeds")) return "leeds";

  if (k.includes("bayern")) return "bayern";
  if (k.includes("dortmund")) return "dortmund";
  if (k.includes("leverkusen")) return "leverkusen";
  if (k.includes("leipzig")) return "leipzig";

  if (k.includes("barcelona")) return "barcelona";
  if (k.includes("real madrid")) return "real-madrid";
  if (k.includes("atletico")) return "atletico";

  if (k.includes("juventus")) return "juventus";
  if (k.includes("inter")) return "inter";
  if (k.includes("milan") && !k.includes("inter")) return "milan";
  if (k.includes("roma")) return "roma";
  if (k.includes("napoli")) return "napoli";
  if (k.includes("psg") || k.includes("paris")) return "psg";

  return null;
}

function fallbackSvg(team: string) {
  const initials = team.slice(0, 2).toUpperCase();

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#22d3ee"/>
        <stop offset="1" stop-color="#10b981"/>
      </linearGradient>
    </defs>
    <circle cx="128" cy="128" r="124" fill="url(#g)"/>
    <circle cx="128" cy="128" r="104" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="8"/>
    <text x="128" y="150" text-anchor="middle" font-family="Arial" font-size="72" font-weight="900" fill="#020617">${initials}</text>
  </svg>`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const team = searchParams.get("team") || "Team";
  const debug = searchParams.get("debug") === "1";

  const key = keyFor(team);
  const id = key ? ids[key] : null;

  if (debug) {
    return NextResponse.json({
      team,
      key,
      id,
      url: id ? `https://crests.football-data.org/${id}.png` : null,
    });
  }

  if (!id) {
    return new NextResponse(fallbackSvg(team), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }

  const res = await fetch(`https://crests.football-data.org/${id}.png`, {
    cache: "no-store",
    headers: { "User-Agent": "PredictPro/1.0" },
  });

  if (!res.ok) {
    return new NextResponse(fallbackSvg(team), {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }

  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
