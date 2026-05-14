"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { percent } from "@/lib/utils/format";

interface ProbabilityChartProps {
  data: Array<{ name: string; probability: number }>;
}

export function ProbabilityChart({ data }: ProbabilityChartProps) {
  return (
    <Card className="h-[360px]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Match Probability Breakdown</h2>
          <p className="text-sm text-slate-400">Aus dem normalisierten Poisson-Scoregrid abgeleitet.</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" stroke="rgba(226,232,240,.65)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(226,232,240,.65)" fontSize={12} tickFormatter={(value) => `${Math.round(Number(value) * 100)}%`} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, color: "#fff" }}
            formatter={(value) => [percent(Number(value)), "Wahrscheinlichkeit"]}
          />
          <Bar dataKey="probability" radius={[12, 12, 0, 0]} fill="url(#probabilityGradient)" />
          <defs>
            <linearGradient id="probabilityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#36f29a" stopOpacity="1" />
              <stop offset="100%" stopColor="#16d17d" stopOpacity="0.45" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
