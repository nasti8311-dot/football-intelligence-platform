export type EventRow = {
  id?: string;
  matchId: string;
  team: string;
  eventType: string;
  minute: number;
  x: number | null;
  y: number | null;
  endX: number | null;
  endY: number | null;
  xg: number | null;
  outcome: string | null;
};

const XT_GRID = [
  [0.01, 0.02, 0.03, 0.05, 0.08],
  [0.02, 0.03, 0.05, 0.09, 0.14],
  [0.03, 0.05, 0.08, 0.15, 0.25],
  [0.02, 0.03, 0.05, 0.09, 0.14],
  [0.01, 0.02, 0.03, 0.05, 0.08],
];

function zoneValue(x?: number | null, y?: number | null) {
  if (x == null || y == null) return 0;

  const col = Math.min(4, Math.max(0, Math.floor((x / 100) * 5)));
  const row = Math.min(4, Math.max(0, Math.floor((y / 100) * 5)));

  return XT_GRID[row][col];
}

export function calculateXThreat(event: EventRow) {
  if (event.eventType !== "pass" && event.eventType !== "carry") return 0;

  const start = zoneValue(event.x, event.y);
  const end = zoneValue(event.endX, event.endY);

  return Math.max(0, end - start);
}

export function isProgressive(event: EventRow) {
  if (event.x == null || event.endX == null) return false;
  return event.endX - event.x >= 15;
}

export function analyzeEvents(events: EventRow[]) {
  const teams = Array.from(new Set(events.map((e) => e.team)));

  return teams.map((team) => {
    const teamEvents = events.filter((e) => e.team === team);

    const shots = teamEvents.filter((e) => e.eventType === "shot");
    const passes = teamEvents.filter((e) => e.eventType === "pass");
    const pressures = teamEvents.filter((e) => e.eventType === "pressure");

    const xg = shots.reduce((sum, e) => sum + (e.xg ?? 0), 0);
    const xThreat = teamEvents.reduce((sum, e) => sum + calculateXThreat(e), 0);
    const progressiveActions = teamEvents.filter(isProgressive).length;

    const finalThirdEntries = teamEvents.filter(
      (e) => e.endX != null && e.endX >= 66
    ).length;

    const successfulPressures = pressures.filter(
      (e) => e.outcome === "success"
    ).length;

    return {
      team,
      events: teamEvents.length,
      shots: shots.length,
      passes: passes.length,
      pressures: pressures.length,
      xg: Number(xg.toFixed(2)),
      xThreat: Number(xThreat.toFixed(2)),
      progressiveActions,
      finalThirdEntries,
      pressureSuccessRate:
        pressures.length > 0
          ? Number(((successfulPressures / pressures.length) * 100).toFixed(1))
          : 0,
    };
  });
}

export function buildMomentum(events: EventRow[]) {
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const start = i * 9;
    const end = start + 9;

    const bucketEvents = events.filter(
      (e) => e.minute >= start && e.minute < end
    );

    const score = bucketEvents.reduce((sum, e) => {
      if (e.eventType === "shot") return sum + 3 + (e.xg ?? 0) * 10;
      if (e.eventType === "pass") return sum + calculateXThreat(e) * 20;
      if (e.eventType === "pressure") return sum + 1;
      return sum;
    }, 0);

    return {
      minute: `${start}-${end}`,
      momentum: Number(score.toFixed(2)),
    };
  });

  return buckets;
}
export function calculatePossessionValue(event: EventRow) {
  let value = 0;

  if (event.eventType === "shot") {
    value += 0.35 + (event.xg ?? 0);
  }

  if (event.eventType === "pass") {
    value += calculateXThreat(event);

    if (isProgressive(event)) {
      value += 0.08;
    }

    if (event.endX != null && event.endX >= 66) {
      value += 0.06;
    }

    if (event.outcome === "complete") {
      value += 0.03;
    }
  }

  if (event.eventType === "pressure") {
    value += event.outcome === "success" ? 0.07 : 0.02;
  }

  return Number(value.toFixed(3));
}

export function calculatePassingValueAdded(event: EventRow) {
  if (event.eventType !== "pass") return 0;

  const xt = calculateXThreat(event);
  const progressiveBonus = isProgressive(event) ? 0.05 : 0;
  const completionBonus = event.outcome === "complete" ? 0.02 : -0.03;

  return Number((xt + progressiveBonus + completionBonus).toFixed(3));
}

export function buildAdvancedTeamRanking(events: EventRow[]) {
  const base = analyzeEvents(events);

  return base
    .map((team) => {
      const teamEvents = events.filter((e) => e.team === team.team);

      const possessionValue = teamEvents.reduce(
        (sum, e) => sum + calculatePossessionValue(e),
        0
      );

      const passingValueAdded = teamEvents.reduce(
        (sum, e) => sum + calculatePassingValueAdded(e),
        0
      );

      const dangerActions = teamEvents.filter(
        (e) =>
          e.eventType === "shot" ||
          calculateXThreat(e) >= 0.05 ||
          isProgressive(e)
      ).length;

      const intelligenceScore =
        team.xg * 22 +
        team.xThreat * 35 +
        team.progressiveActions * 1.8 +
        team.finalThirdEntries * 1.2 +
        team.pressureSuccessRate * 0.4 +
        possessionValue * 18 +
        passingValueAdded * 20;

      return {
        ...team,
        possessionValue: Number(possessionValue.toFixed(2)),
        passingValueAdded: Number(passingValueAdded.toFixed(2)),
        dangerActions,
        intelligenceScore: Number(intelligenceScore.toFixed(1)),
      };
    })
    .sort((a, b) => b.intelligenceScore - a.intelligenceScore);
}
export function buildPossessionChains(events: EventRow[]) {
  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  const chains: {
    team: string;
    startMinute: number;
    endMinute: number;
    events: EventRow[];
    value: number;
    progressiveActions: number;
    shots: number;
  }[] = [];

  let current: typeof chains[number] | null = null;

  for (const event of sorted) {
    const shouldStartNew =
      !current ||
      current.team !== event.team ||
      event.eventType === "shot";

    if (shouldStartNew) {
      if (current) chains.push(current);

      current = {
        team: event.team,
        startMinute: event.minute,
        endMinute: event.minute,
        events: [event],
        value: calculatePossessionValue(event),
        progressiveActions: isProgressive(event) ? 1 : 0,
        shots: event.eventType === "shot" ? 1 : 0,
      };
    } else {
      if (!current) continue;

      current.endMinute = event.minute;
      current.events.push(event);
      current.value += calculatePossessionValue(event);
      current.progressiveActions += isProgressive(event) ? 1 : 0;
      current.shots += event.eventType === "shot" ? 1 : 0;
    }
  }

  if (current) chains.push(current);

  return chains
    .map((chain) => ({
      ...chain,
      value: Number(chain.value.toFixed(2)),
      length: chain.events.length,
      danger:
        chain.value >= 0.45 ||
        chain.shots > 0 ||
        chain.progressiveActions >= 2,
    }))
    .sort((a, b) => b.value - a.value);
}

export function buildSequenceSummary(events: EventRow[]) {
  const chains = buildPossessionChains(events);
  const dangerousChains = chains.filter((c) => c.danger);
  const totalValue = chains.reduce((s, c) => s + c.value, 0);

  return {
    chains,
    totalChains: chains.length,
    dangerousChains: dangerousChains.length,
    averageChainValue:
      chains.length > 0 ? Number((totalValue / chains.length).toFixed(2)) : 0,
    bestChain: chains[0] ?? null,
  };
}
export function getFieldZone(x?: number | null, y?: number | null) {
  if (x == null || y == null) return "Unknown";

  const vertical =
    y < 33 ? "Left" : y > 66 ? "Right" : "Central";

  const horizontal =
    x < 33 ? "Defensive" : x < 66 ? "Middle" : "Attacking";

  return `${horizontal} ${vertical}`;
}

export function buildTacticalPatterns(events: EventRow[]) {
  const zoneMap = new Map<string, number>();
  const pressingZones = new Map<string, number>();
  const passNetwork = new Map<string, number>();

  for (const event of events) {
    const zone = getFieldZone(event.x, event.y);
    zoneMap.set(zone, (zoneMap.get(zone) ?? 0) + 1);

    if (event.eventType === "pressure") {
      pressingZones.set(zone, (pressingZones.get(zone) ?? 0) + 1);
    }

    if (event.eventType === "pass") {
      const from = getFieldZone(event.x, event.y);
      const to = getFieldZone(event.endX, event.endY);
      const key = `${from} → ${to}`;
      passNetwork.set(key, (passNetwork.get(key) ?? 0) + 1);
    }
  }

  const dominantZones = [...zoneMap.entries()]
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const pressingTriggers = [...pressingZones.entries()]
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const passRoutes = [...passNetwork.entries()]
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const insights = [
    dominantZones[0]
      ? `Dominante Aktivitätszone: ${dominantZones[0].zone} mit ${dominantZones[0].count} Events.`
      : "Noch keine dominante Aktivitätszone erkannt.",
    pressingTriggers[0]
      ? `Häufigster Pressing-Trigger: ${pressingTriggers[0].zone}.`
      : "Noch keine Pressing-Muster erkannt.",
    passRoutes[0]
      ? `Wichtigste Passroute: ${passRoutes[0].route}.`
      : "Noch keine Passnetzwerk-Route erkannt.",
  ];

  return {
    dominantZones,
    pressingTriggers,
    passRoutes,
    insights,
  };
}
export function buildAutomatedInsights(events: EventRow[]) {
  const ranking = buildAdvancedTeamRanking(events);
  const sequence = buildSequenceSummary(events);
  const tactical = buildTacticalPatterns(events);

  const leader = ranking[0];
  const second = ranking[1];

  const insights: string[] = [];

  if (leader) {
    insights.push(
      `${leader.team} führt das Event-Intelligence-Ranking mit einem Score von ${leader.intelligenceScore}.`
    );
    insights.push(
      `${leader.team} erzeugt ${leader.xThreat} xThreat und ${leader.possessionValue} Possession Value.`
    );
  }

  if (second) {
    const gap = Number((leader.intelligenceScore - second.intelligenceScore).toFixed(1));
    insights.push(
      `Der Abstand zu ${second.team} beträgt ${gap} Intelligence-Punkte.`
    );
  }

  if (sequence.bestChain) {
    insights.push(
      `Die gefährlichste Sequenz kam von ${sequence.bestChain.team} zwischen Minute ${sequence.bestChain.startMinute}-${sequence.bestChain.endMinute}.`
    );
  }

  if (tactical.dominantZones[0]) {
    insights.push(
      `Die dominante Zone war ${tactical.dominantZones[0].zone} mit ${tactical.dominantZones[0].count} Aktionen.`
    );
  }

  if (tactical.passRoutes[0]) {
    insights.push(
      `Die wichtigste Passroute war ${tactical.passRoutes[0].route}.`
    );
  }

  return {
    headline: leader
      ? `${leader.team} zeigt das stärkste taktische Profil`
      : "Noch nicht genug Eventdaten",
    summary: insights,
    riskFlags: [
      sequence.dangerousChains > 3
        ? "Viele gefährliche Ballbesitzketten erkannt."
        : "Wenige gefährliche Ballbesitzketten.",
      tactical.pressingTriggers.length > 0
        ? "Pressingmuster wurden erkannt."
        : "Keine klaren Pressingmuster erkannt.",
    ],
  };
}
