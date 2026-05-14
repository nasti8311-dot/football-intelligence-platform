"use client";

import type { TeamProfile } from "@/lib/types/football";

interface TeamSelectorProps {
  teams: TeamProfile[];
  homeTeamId: string;
  awayTeamId: string;
  onHomeChange: (id: string) => void;
  onAwayChange: (id: string) => void;
}

export function TeamSelector({ teams, homeTeamId, awayTeamId, onHomeChange, onAwayChange }: TeamSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Heimteam</span>
        <select value={homeTeamId} onChange={(event) => onHomeChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white outline-none ring-pitch-400/40 transition focus:ring-4">
          {teams.map((team) => <option key={team.id} value={team.id} disabled={team.id === awayTeamId}>{team.name} · {team.league}</option>)}
        </select>
      </label>
      <div className="hidden rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-xs uppercase tracking-[0.22em] text-slate-500 md:block">vs</div>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">Auswärtsteam</span>
        <select value={awayTeamId} onChange={(event) => onAwayChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white outline-none ring-pitch-400/40 transition focus:ring-4">
          {teams.map((team) => <option key={team.id} value={team.id} disabled={team.id === homeTeamId}>{team.name} · {team.league}</option>)}
        </select>
      </label>
    </div>
  );
}
