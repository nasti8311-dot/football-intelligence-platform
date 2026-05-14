"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Database, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const samples = {
  footballData: `Div,Date,Time,HomeTeam,AwayTeam,FTHG,FTAG,FTR,HTHG,HTAG,HTR,HS,AS,HST,AST,HF,AF,HC,AC,HY,AY,HR,AR,B365H,B365D,B365A\nE0,16/08/25,15:00,Arsenal,Chelsea,2,1,H,1,0,H,15,9,6,3,11,13,7,4,2,3,0,0,1.95,3.60,4.10\nE0,17/08/25,16:30,Liverpool,Man City,1,1,D,0,1,A,12,14,5,5,10,9,5,6,1,2,0,0,2.70,3.50,2.55`,
  leagues: `code,name,country\nepl,Premier League,England\nbundesliga,Bundesliga,Germany`,
  teams: `id,name,shortName,leagueCode,leagueName,country,attack,defense,elo,form,xgFor,xgAgainst,possession,pressing,tempo\nars,Arsenal,ARS,epl,Premier League,England,1.22,0.84,1888,0.71,1.92,0.88,61,78,72\nbvb,Borussia Dortmund,BVB,bundesliga,Bundesliga,Germany,1.12,0.96,1774,0.46,1.74,1.18,56,70,75`,
  matches: `sourceId,leagueCode,season,matchday,kickoff,homeTeamId,awayTeamId,venue\nepl-ars-bvb-2026-01-18,epl,2025/26,22,2026-01-18T17:30:00.000Z,ars,bvb,Emirates Stadium`,
};

type ImportType = keyof typeof samples;

export default function CsvImportPage() {
  const [type, setType] = useState<ImportType>("footballData");
  const [csv, setCsv] = useState(samples.footballData);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function importCsv() {
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/import/csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, csv }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Import fehlgeschlagen.");
      return;
    }

    setStatus("success");
    setMessage(`${payload.imported} Datensätze importiert, ${payload.skipped} übersprungen.${payload.teamsUpdated ? ` ${payload.teamsUpdated} Teams neu bewertet.` : ""}`);
  }

  async function readFile(file?: File) {
    if (!file) return;
    setCsv(await file.text());
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
            <Database className="h-3.5 w-3.5" /> CSV Data Importer
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Daten ohne API-Key importieren</h1>
          <p className="max-w-3xl text-slate-400">
            Importiere eigene CSVs oder echte Football-Data.co.uk Dateien direkt in PostgreSQL. Der Import erstellt automatisch Ligen, Teams, Matches, Stats, Quoten und berechnet Elo/Form/Attack/Defense.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="space-y-5 border-white/10 bg-white/[0.04] p-5">
            <div>
              <label className="text-sm font-medium text-slate-300">Datentyp</label>
              <select
                value={type}
                onChange={(event) => {
                  const next = event.target.value as ImportType;
                  setType(next);
                  setCsv(samples[next]);
                  setStatus("idle");
                  setMessage("");
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm outline-none ring-cyan-400/40 focus:ring-2"
              >
                <option value="footballData">Football-Data.co.uk Match CSV</option>
                <option value="leagues">Leagues</option>
                <option value="teams">Teams</option>
                <option value="matches">Matches</option>
              </select>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-6 text-center text-sm text-slate-300 hover:bg-cyan-400/10">
              <UploadCloud className="h-8 w-8 text-cyan-200" />
              CSV-Datei auswählen
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => readFile(event.target.files?.[0])} />
            </label>

            <button
              onClick={importCsv}
              disabled={status === "loading"}
              className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Import läuft..." : "In Datenbank importieren"}
            </button>

            {message && (
              <div className={`flex gap-2 rounded-xl border p-3 text-sm ${status === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
                {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <span>{message}</span>
              </div>
            )}
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">CSV Inhalt</h2>
              <button onClick={() => setCsv(samples[type])} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/10">
                Beispiel laden
              </button>
            </div>
            <textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              spellCheck={false}
              className="h-[520px] w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs leading-6 text-slate-200 outline-none ring-cyan-400/40 focus:ring-2"
            />
          </Card>
        </div>
      </div>
    </main>
  );
}
