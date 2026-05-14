import type { PrismaClient } from "@prisma/client";
import { slugify, toFloat, toInt } from "./csv";

type Row = Record<string, string>;

const LEAGUE_NAMES: Record<string, { name: string; country: string }> = {
  E0: { name: "Premier League", country: "England" },
  E1: { name: "Championship", country: "England" },
  E2: { name: "League One", country: "England" },
  E3: { name: "League Two", country: "England" },
  D1: { name: "Bundesliga", country: "Germany" },
  D2: { name: "2. Bundesliga", country: "Germany" },
  I1: { name: "Serie A", country: "Italy" },
  I2: { name: "Serie B", country: "Italy" },
  SP1: { name: "La Liga", country: "Spain" },
  SP2: { name: "La Liga 2", country: "Spain" },
  F1: { name: "Ligue 1", country: "France" },
  F2: { name: "Ligue 2", country: "France" },
  N1: { name: "Eredivisie", country: "Netherlands" },
  P1: { name: "Primeira Liga", country: "Portugal" },
  B1: { name: "Belgian Pro League", country: "Belgium" },
  SC0: { name: "Scottish Premiership", country: "Scotland" },
  T1: { name: "Süper Lig", country: "Turkey" },
  G1: { name: "Super League Greece", country: "Greece" },
};

const BOOKMAKERS = [
  ["B365", "Bet365"], ["BW", "Bet&Win"], ["IW", "Interwetten"], ["PS", "Pinnacle"],
  ["WH", "William Hill"], ["VC", "VC Bet"], ["BbAv", "Bookmaker Average"], ["Avg", "Market Average"], ["Max", "Market Max"],
] as const;

function pick(row: Row, key: string) {
  return row[key] ?? row[key.toLowerCase()] ?? row[key.toUpperCase()] ?? "";
}

function parseFootballDataDate(row: Row) {
  const raw = pick(row, "Date");
  if (!raw) return undefined;
  const time = pick(row, "Time") || "12:00";
  const parts = raw.includes("/") ? raw.split("/") : raw.split("-");
  let day = 1, month = 1, year = 2000;
  if (parts.length === 3) {
    day = Number(parts[0]); month = Number(parts[1]); year = Number(parts[2]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
  }
  const [hour, minute] = time.split(":").map((v) => Number(v));
  const date = new Date(Date.UTC(year, month - 1, day, Number.isFinite(hour) ? hour : 12, Number.isFinite(minute) ? minute : 0));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function xgProxy(shots?: number | null, shotsOnTarget?: number | null, corners?: number | null) {
  if (shots == null && shotsOnTarget == null) return null;
  const s = Math.max(shots ?? shotsOnTarget ?? 0, shotsOnTarget ?? 0);
  const sot = shotsOnTarget ?? Math.round(s * 0.35);
  const offTarget = Math.max(s - sot, 0);
  const value = sot * 0.32 + offTarget * 0.055 + (corners ?? 0) * 0.025;
  return Number(Math.max(0.05, Math.min(4.8, value)).toFixed(3));
}

function scoreResult(home: number, away: number) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

function expectedHomeScore(homeElo: number, awayElo: number) {
  return 1 / (1 + Math.pow(10, ((awayElo - (homeElo + 65)) / 400)));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export async function importFootballDataRows(prisma: PrismaClient, rows: Row[]) {
  let imported = 0;
  let skipped = 0;
  const touchedTeamIds = new Set<string>();
  const touchedLeagueCodes = new Set<string>();

  for (const row of rows) {
    const div = pick(row, "Div") || pick(row, "league") || "custom";
    const homeName = pick(row, "HomeTeam");
    const awayName = pick(row, "AwayTeam");
    if (!homeName || !awayName) { skipped++; continue; }

    const known = LEAGUE_NAMES[div] ?? { name: div, country: null as unknown as string };
    const league = await prisma.league.upsert({
      where: { code: div },
      update: { name: known.name, country: known.country ?? null },
      create: { code: div, name: known.name, country: known.country ?? null },
    });
    touchedLeagueCodes.add(div);

    const homeId = slugify(homeName);
    const awayId = slugify(awayName);
    for (const [id, name] of [[homeId, homeName], [awayId, awayName]] as const) {
      await prisma.team.upsert({
        where: { id },
        update: { name, shortName: name.slice(0, 3).toUpperCase(), leagueId: league.id },
        create: { id, name, shortName: name.slice(0, 3).toUpperCase(), leagueId: league.id, attack: 1, defense: 1, elo: 1500, form: 0, xgFor: 1.35, xgAgainst: 1.35 },
      });
      touchedTeamIds.add(id);
    }

    const kickoff = parseFootballDataDate(row);
    const season = pick(row, "Season") || inferSeason(kickoff) || "unknown";
    const fthg = pick(row, "FTHG") !== "" ? toInt(pick(row, "FTHG")) : null;
    const ftag = pick(row, "FTAG") !== "" ? toInt(pick(row, "FTAG")) : null;
    const sourceId = `${div}-${season}-${kickoff?.toISOString().slice(0, 10) ?? "nodate"}-${homeId}-${awayId}`;

    const match = await prisma.match.upsert({
      where: { source_sourceId: { source: "football-data.co.uk", sourceId } },
      update: { leagueId: league.id, season, kickoff, status: fthg == null || ftag == null ? "SCHEDULED" : "FINISHED", homeGoals: fthg, awayGoals: ftag },
      create: { leagueId: league.id, season, kickoff, status: fthg == null || ftag == null ? "SCHEDULED" : "FINISHED", homeTeamId: homeId, awayTeamId: awayId, homeGoals: fthg, awayGoals: ftag, source: "football-data.co.uk", sourceId },
    });

    const hs = nullableInt(pick(row, "HS")); const as = nullableInt(pick(row, "AS"));
    const hst = nullableInt(pick(row, "HST")); const ast = nullableInt(pick(row, "AST"));
    const hc = nullableInt(pick(row, "HC")); const ac = nullableInt(pick(row, "AC"));
    await prisma.matchStat.upsert({
      where: { matchId: match.id },
      update: statData(row, hs, as, hst, ast, hc, ac),
      create: { matchId: match.id, ...statData(row, hs, as, hst, ast, hc, ac) },
    });

    for (const [prefix, bookmaker] of BOOKMAKERS) {
      const homeOdds = nullableFloat(pick(row, `${prefix}H`));
      const drawOdds = nullableFloat(pick(row, `${prefix}D`));
      const awayOdds = nullableFloat(pick(row, `${prefix}A`));
      if (homeOdds || drawOdds || awayOdds) {
        await prisma.matchOdds.upsert({
          where: { matchId_bookmaker: { matchId: match.id, bookmaker } },
          update: { homeOdds, drawOdds, awayOdds, payload: row },
          create: { matchId: match.id, bookmaker, homeOdds, drawOdds, awayOdds, payload: row },
        });
      }
    }
    imported++;
  }

  const recalculated = await recalculateTeamStrengths(prisma, [...touchedTeamIds]);
  return { type: "footballData", imported, skipped, teamsUpdated: recalculated, leaguesTouched: touchedLeagueCodes.size };
}

function statData(row: Row, hs: number | null, as: number | null, hst: number | null, ast: number | null, hc: number | null, ac: number | null) {
  return {
    homeShots: hs, awayShots: as, homeShotsOnTarget: hst, awayShotsOnTarget: ast, homeCorners: hc, awayCorners: ac,
    homeFouls: nullableInt(pick(row, "HF")), awayFouls: nullableInt(pick(row, "AF")),
    homeYellowCards: nullableInt(pick(row, "HY")), awayYellowCards: nullableInt(pick(row, "AY")),
    homeRedCards: nullableInt(pick(row, "HR")), awayRedCards: nullableInt(pick(row, "AR")),
    halfTimeHomeGoals: nullableInt(pick(row, "HTHG")), halfTimeAwayGoals: nullableInt(pick(row, "HTAG")),
    fullTimeResult: pick(row, "FTR") || null, halfTimeResult: pick(row, "HTR") || null,
    homeXgProxy: xgProxy(hs, hst, hc), awayXgProxy: xgProxy(as, ast, ac), payload: row,
  };
}

function nullableInt(value: string) { return value === "" ? null : toInt(value); }
function nullableFloat(value: string) { return value === "" ? null : toFloat(value); }
function inferSeason(date?: Date) {
  if (!date) return null;
  const y = date.getUTCFullYear();
  return date.getUTCMonth() >= 6 ? `${y}/${String(y + 1).slice(2)}` : `${y - 1}/${String(y).slice(2)}`;
}

async function recalculateTeamStrengths(prisma: PrismaClient, teamIds: string[]) {
  if (!teamIds.length) return 0;
  const matches = await prisma.match.findMany({
    where: { status: "FINISHED", OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }] },
    include: { stats: true }, orderBy: { kickoff: "asc" },
  });
  const allIds = new Set(matches.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
  const elo = new Map([...allIds].map((id) => [id, 1500]));
  const agg = new Map([...allIds].map((id) => [id, { played: 0, xgf: 0, xga: 0, pts: [] as number[] }]));

  for (const match of matches) {
    if (match.homeGoals == null || match.awayGoals == null) continue;
    const hElo = elo.get(match.homeTeamId) ?? 1500;
    const aElo = elo.get(match.awayTeamId) ?? 1500;
    const expected = expectedHomeScore(hElo, aElo);
    const actual = match.homeGoals > match.awayGoals ? 1 : match.homeGoals === match.awayGoals ? 0.5 : 0;
    elo.set(match.homeTeamId, Math.round(hElo + 24 * (actual - expected)));
    elo.set(match.awayTeamId, Math.round(aElo + 24 * ((1 - actual) - (1 - expected))));

    const hxg = match.stats?.homeXgProxy ?? match.homeGoals;
    const axg = match.stats?.awayXgProxy ?? match.awayGoals;
    const h = agg.get(match.homeTeamId)!; const a = agg.get(match.awayTeamId)!;
    h.played++; h.xgf += hxg; h.xga += axg; h.pts.push(match.homeGoals > match.awayGoals ? 3 : match.homeGoals === match.awayGoals ? 1 : 0);
    a.played++; a.xgf += axg; a.xga += hxg; a.pts.push(match.awayGoals > match.homeGoals ? 3 : match.homeGoals === match.awayGoals ? 1 : 0);
  }

  const played = [...agg.values()].filter((a) => a.played > 0);
  const leagueAvgXgf = played.reduce((s, a) => s + a.xgf / a.played, 0) / Math.max(played.length, 1) || 1.35;
  let updated = 0;
  for (const id of allIds) {
    const a = agg.get(id)!;
    if (!a.played) continue;
    const avgFor = a.xgf / a.played;
    const avgAgainst = a.xga / a.played;
    const recent = a.pts.slice(-5);
    const form = recent.length ? (recent.reduce((s, p) => s + p, 0) / (recent.length * 3)) * 2 - 1 : 0;
    const attack = clamp(avgFor / leagueAvgXgf, 0.55, 1.65);
    const defense = clamp(1 + ((leagueAvgXgf - avgAgainst) / leagueAvgXgf) * 0.5, 0.55, 1.45);
    await prisma.team.update({
      where: { id },
      data: { attack: Number(attack.toFixed(3)), defense: Number(defense.toFixed(3)), elo: elo.get(id) ?? 1500, form: Number(form.toFixed(3)), xgFor: Number(avgFor.toFixed(3)), xgAgainst: Number(avgAgainst.toFixed(3)) },
    });
    updated++;
  }
  return updated;
}
