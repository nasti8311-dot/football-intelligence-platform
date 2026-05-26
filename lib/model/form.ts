export type RecentForm = {
  attack: number;
  defense: number;
};

export function calculateRecentForm(matches: any[], team: string): RecentForm {
  if (!matches?.length) {
    return {
      attack: 1,
      defense: 1,
    };
  }

  const recent = matches.slice(0, 5);

  let scored = 0;
  let conceded = 0;

  for (const m of recent) {
    const isHome = m.homeTeam === team;

    const gf = isHome ? Number(m.homeScore || 0) : Number(m.awayScore || 0);
    const ga = isHome ? Number(m.awayScore || 0) : Number(m.homeScore || 0);

    scored += gf;
    conceded += ga;
  }

  const avgScored = scored / recent.length;
  const avgConceded = conceded / recent.length;

  return {
    attack: Math.max(0.7, Math.min(1.35, avgScored / 1.4)),
    defense: Math.max(0.7, Math.min(1.35, 1.4 / Math.max(avgConceded, 0.5))),
  };
}
