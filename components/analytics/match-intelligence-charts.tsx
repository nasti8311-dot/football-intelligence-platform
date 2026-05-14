"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

export function OutcomeBars({ data }: { data: { name: string; probability: number }[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">1X2 Probability Breakdown</h3>
      <p className="mt-1 text-sm text-slate-400">Aus der normalisierten Poisson-Score-Matrix abgeleitet.</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} stroke="#94a3b8" />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14 }} />
            <Bar dataKey="probability" radius={[10, 10, 0, 0]}>
              {data.map((_, index) => <Cell key={index} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function TopScoreChart({ data }: { data: { score: string; probability: number }[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">Top Scorelines</h3>
      <p className="mt-1 text-sm text-slate-400">Wahrscheinlichste exakte Resultate.</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} stroke="#94a3b8" />
            <YAxis type="category" dataKey="score" stroke="#94a3b8" width={60} />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14 }} />
            <Bar dataKey="probability" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function TeamComparisonChart({ data }: { data: { metric: string; home: number; away: number }[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold">Team Strength Comparison</h3>
      <p className="mt-1 text-sm text-slate-400">Modell-Inputs aus Datenbankprofilen.</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="metric" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 14 }} />
            <Line type="monotone" dataKey="home" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="away" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
