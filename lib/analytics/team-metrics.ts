import type { Match, Team, League, MatchStat } from "@prisma/client";

export type MatchWithTeams = Match & {
  homeTeam: Team;
  awayTeam: Team;
  league: League | null;
  stats: MatchStat | null;
};

export type TeamMatchRow = {
  id: string;
  date: string;
  league: string;
  opponent: string;
  venue: "Home" | "Away";
  gf: number;
  ga: number;
  result: "W" | "D" | "L";
  points: number;
  xgFor: number;
  xgAgainst: number;
  shotsFor: number | null;
  shotsAgainst: number | null;
};

export type TeamSummary = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  ppg: number;
  goalDifference: number;
  xgFor: number;
  xgAgainst: number;
  xgDifference: number;
  homePoints: number;
  awayPoints: number;
  formScore: number;
};

export type LeagueTableRow = {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  ppg: number;
  elo: number;
  form: number;
};

function xgProxy(goals: number, shots?: number | null, shotsOnTarget?: number | null, corners?: number | null) {
  if (shots == null && shotsOnTarget == null && corners == null) return Math.max(0.2, goals * 0.78 + 0.35);
  return Math.max(
    0.15,
    goals * 0.42 +
      (shots ?? 0) * 0.055 +
      (shotsOnTarget ?? 0) * 0.16 +
      (corners ?? 0) * 0.025
  );
}

export function toTeamRows(teamId: string, matches: MatchWithTeams[]): TeamMatchRow[] {
  return matches
    .filter((m) => m.homeGoals !== null && m.awayGoals !== null)
    .map((m) => {
      const isHome = m.homeTeamId === teamId;
      const gf = isHome ? m.homeGoals! : m.awayGoals!;
      const ga = isHome ? m.awayGoals! : m.homeGoals!;
      const result: "W" | "D" | "L" = gf > ga ? "W" : gf === ga ? "D" : "L";
      const points = result === "W" ? 3 : result === "D" ? 1 : 0;
      const s = m.stats;
      const xgFor = isHome
        ? s?.homeXgProxy ?? xgProxy(gf, s?.homeShots, s?.homeShotsOnTarget, s?.homeCorners)
        : s?.awayXgProxy ?? xgProxy(gf, s?.awayShots, s?.awayShotsOnTarget, s?.awayCorners);
      const xgAgainst = isHome
        ? s?.awayXgProxy ?? xgProxy(ga, s?.awayShots, s?.awayShotsOnTarget, s?.awayCorners)
        : s?.homeXgProxy ?? xgProxy(ga, s?.homeShots, s?.homeShotsOnTarget, s?.homeCorners);
      return {
        id: m.id,
        date: m.kickoff ? m.kickoff.toISOString().slice(0, 10) : "—",
        league: m.league?.name ?? "Unbekannt",
        opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
        venue: (isHome ? "Home" : "Away") as "Home" | "Away",
        gf,
        ga,
        result,
        points,
        xgFor: Number(xgFor.toFixed(2)),
        xgAgainst: Number(xgAgainst.toFixed(2)),
        shotsFor: isHome ? s?.homeShots ?? null : s?.awayShots ?? null,
        shotsAgainst: isHome ? s?.awayShots ?? null : s?.homeShots ?? null,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeTeam(rows: TeamMatchRow[]): TeamSummary {
  const played = rows.length;
  const wins = rows.filter((r) => r.result === "W").length;
  const draws = rows.filter((r) => r.result === "D").length;
  const losses = rows.filter((r) => r.result === "L").length;
  const goalsFor = rows.reduce((s, r) => s + r.gf, 0);
  const goalsAgainst = rows.reduce((s, r) => s + r.ga, 0);
  const points = rows.reduce((s, r) => s + r.points, 0);
  const xgFor = rows.reduce((s, r) => s + r.xgFor, 0);
  const xgAgainst = rows.reduce((s, r) => s + r.xgAgainst, 0);
  const recent = rows.slice(-5);
  const formScore = recent.length ? recent.reduce((s, r) => s + r.points, 0) / (recent.length * 3) : 0;
  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points,
    ppg: played ? points / played : 0,
    goalDifference: goalsFor - goalsAgainst,
    xgFor: Number(xgFor.toFixed(2)),
    xgAgainst: Number(xgAgainst.toFixed(2)),
    xgDifference: Number((xgFor - xgAgainst).toFixed(2)),
    homePoints: rows.filter((r) => r.venue === "Home").reduce((s, r) => s + r.points, 0),
    awayPoints: rows.filter((r) => r.venue === "Away").reduce((s, r) => s + r.points, 0),
    formScore,
  };
}

export function buildLeagueTable(matches: MatchWithTeams[]): LeagueTableRow[] {
  const map = new Map<string, LeagueTableRow>();
  const ensure = (team: Team) => {
    if (!map.has(team.id)) {
      map.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        ppg: 0,
        elo: team.elo,
        form: team.form,
      });
    }
    return map.get(team.id)!;
  };

  for (const m of matches) {
    if (m.homeGoals === null || m.awayGoals === null) continue;
    const h = ensure(m.homeTeam);
    const a = ensure(m.awayTeam);
    h.played++; a.played++;
    h.goalsFor += m.homeGoals; h.goalsAgainst += m.awayGoals;
    a.goalsFor += m.awayGoals; a.goalsAgainst += m.homeGoals;
    if (m.homeGoals > m.awayGoals) { h.wins++; a.losses++; h.points += 3; }
    else if (m.homeGoals < m.awayGoals) { a.wins++; h.losses++; a.points += 3; }
    else { h.draws++; a.draws++; h.points += 1; a.points += 1; }
  }

  return [...map.values()].map((r) => ({
    ...r,
    goalDifference: r.goalsFor - r.goalsAgainst,
    ppg: r.played ? r.points / r.played : 0,
  })).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
}

export function cumulativeSeries(rows: TeamMatchRow[]) {
  let points = 0;
  let xgd = 0;
  return rows.map((r, idx) => {
    points += r.points;
    xgd += r.xgFor - r.xgAgainst;
    return {
      match: idx + 1,
      opponent: r.opponent,
      points,
      ppg: Number((points / (idx + 1)).toFixed(2)),
      xgd: Number(xgd.toFixed(2)),
      xgFor: r.xgFor,
      xgAgainst: r.xgAgainst,
    };
  });
}
