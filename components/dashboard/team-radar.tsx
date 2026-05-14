"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import type { TeamProfile } from "@/lib/types/football";

function scaleTeam(team: TeamProfile) {
  return {
    Attack: Math.round(team.attack * 75),
    Defense: Math.round(team.defense * 75),
    Elo: Math.round((team.elo - 1750) / 4),
    Form: Math.round((team.form + 1) * 50),
    xG: Math.round(team.xgFor * 35),
    Pressing: team.pressing ?? 70,
  };
}

export function TeamRadar({ home, away }: { home: TeamProfile; away: TeamProfile }) {
  const h = scaleTeam(home);
  const a = scaleTeam(away);
  const data = Object.keys(h).map((metric) => ({ metric, [home.shortName]: h[metric as keyof typeof h], [away.shortName]: a[metric as keyof typeof a] }));

  return (
    <Card className="h-[380px]">
      <h2 className="text-lg font-semibold text-white">Team Strength Radar</h2>
      <p className="mt-1 text-sm text-slate-400">Normalisierte Profilwerte für schnelle Stärken-/Schwächenanalyse.</p>
      <ResponsiveContainer width="100%" height="82%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,.12)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, color: "#fff" }} />
          <Radar name={home.shortName} dataKey={home.shortName} stroke="#36f29a" fill="#36f29a" fillOpacity={0.18} />
          <Radar name={away.shortName} dataKey={away.shortName} stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.12} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}
