"use client";

import { useState } from "react";

export default function EventImportPage() {
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Import läuft...");

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/events/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("Fehler: " + (data.error ?? "Unbekannter Fehler"));
      return;
    }

    setStatus(`${data.imported} Events importiert.`);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Admin</p>
          <h1 className="text-4xl font-bold">Event Data Import</h1>
          <p className="mt-3 text-slate-400">
            Importiere echte Eventdaten für Shots, Passes, Pressure und xG.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
        >
          <input
            name="file"
            type="file"
            accept=".csv"
            required
            className="block w-full rounded-xl bg-slate-900 p-3 text-sm"
          />

          <button
            type="submit"
            className="mt-4 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
          >
            CSV importieren
          </button>

          {status && <p className="mt-4 text-slate-300">{status}</p>}
        </form>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold">CSV Format</h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm text-slate-300">
{`matchId,team,eventType,minute,x,y,endX,endY,xg,outcome
1,Arsenal,shot,14,82,45,,,0.31,goal
1,Liverpool,pass,21,44,52,61,48,,complete
1,Arsenal,pressure,33,58,39,,,,success`}
          </pre>
        </section>
      </div>
    </main>
  );
}