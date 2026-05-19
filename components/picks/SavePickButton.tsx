"use client";

import { useState } from "react";

export default function SavePickButton({
  matchId,
  market,
  pick,
  probability,
}: {
  matchId: string;
  market: string;
  pick: string;
  probability: number;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);

    await fetch("/api/user/saved-picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, market, pick, probability }),
    }).catch(() => null);

    setSaved(true);
    setLoading(false);
  }

  return (
    <button
      onClick={save}
      disabled={loading || saved}
      className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-60"
    >
      {saved ? "Saved" : loading ? "Saving..." : "Save Pick"}
    </button>
  );
}
