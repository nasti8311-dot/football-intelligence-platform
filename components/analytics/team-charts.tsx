"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

type SeriesPoint = { match: number; opponent: string; points: number; ppg: number; xgd: number; xgFor: number; xgAgainst: number };

type RadarPoint = { metric: string; value: number; fullMark: number };

export function TeamTrendCharts({ series, radar, splits }: { series: SeriesPoint[]; radar: RadarPoint[]; splits: { name: string; points: number }[] }) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="xl:col-span-2">
        <Card className="h-[360px]">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-pitch-400/80">Performance Trend</p>
              <h3 className="text-xl font-semibold text-white">Punkte & xG-Differenz Verlauf</h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">chronologisch</span>
          </div>
          <ResponsiveContainer width="100%" height="78%">
            <AreaChart data={series} margin={{ left: 0, right: 18, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="points" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#36f29a" stopOpacity={0.35}/><stop offset="95%" stopColor="#36f29a" stopOpacity={0}/></linearGradient>
                <linearGradient id="xgd" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.28}/><stop offset="95%" stopColor="#7dd3fc" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="match" stroke="rgba(255,255,255,.45)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,.45)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16 }} />
              <Area type="monotone" dataKey="points" stroke="#36f29a" fill="url(#points)" strokeWidth={2} />
              <Area type="monotone" dataKey="xgd" stroke="#7dd3fc" fill="url(#xgd)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Card className="h-[360px]">
          <p className="text-xs uppercase tracking-[0.28em] text-pitch-400/80">Team Fingerprint</p>
          <h3 className="mb-4 text-xl font-semibold text-white">Stärkenprofil</h3>
          <ResponsiveContainer width="100%" height="78%">
            <RadarChart data={radar} outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,.12)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,.72)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#36f29a" fill="#36f29a" fillOpacity={0.24} />
              <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="xl:col-span-3">
        <Card className="h-[280px]">
          <p className="text-xs uppercase tracking-[0.28em] text-pitch-400/80">Home / Away Split</p>
          <h3 className="mb-4 text-xl font-semibold text-white">Punkte nach Spielort</h3>
          <ResponsiveContainer width="100%" height="70%">
            <BarChart data={splits} margin={{ left: 0, right: 18, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,.45)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,.45)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16 }} />
              <Bar dataKey="points" fill="#36f29a" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  );
}
