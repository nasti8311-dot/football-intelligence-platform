"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

export function SimulationOutcomeChart({ data }: { data: { name: string; poisson: number; simulation: number; low: number; high: number }[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">Monte-Carlo vs Poisson</h3>
      <p className="mt-1 text-sm text-slate-400">Vergleicht das analytische Modell mit 20.000 deterministischen Low-Discrepancy-Simulationen.</p>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} stroke="#94a3b8" />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14 }} />
            <Bar dataKey="poisson" radius={[8, 8, 0, 0]} />
            <Bar dataKey="simulation" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ScenarioProbabilityChart({ data }: { data: { label: string; probability: number }[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">Scenario Probabilities</h3>
      <p className="mt-1 text-sm text-slate-400">Szenarien aus den simulierten Spielverläufen.</p>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} stroke="#94a3b8" />
            <YAxis type="category" dataKey="label" width={130} stroke="#94a3b8" />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14 }} />
            <Bar dataKey="probability" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ScoreDistributionLine({ data }: { data: { goals: string; home: number; away: number }[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">Goal Distribution</h3>
      <p className="mt-1 text-sm text-slate-400">Simulierte Torverteilung je Team.</p>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="goals" stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} stroke="#94a3b8" />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14 }} />
            <Line type="monotone" dataKey="home" strokeWidth={3} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="away" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
