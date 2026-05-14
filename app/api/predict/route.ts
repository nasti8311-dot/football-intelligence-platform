import { NextResponse } from "next/server";
import { predictMatch } from "@/lib/model/prediction";
import { savePrediction } from "@/lib/db/repositories/prediction-repository";
import type { ModelConfig } from "@/lib/types/football";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { homeTeamId?: string; awayTeamId?: string; matchId?: string; config?: Partial<ModelConfig>; persist?: boolean };
    if (!body.homeTeamId || !body.awayTeamId) {
      return NextResponse.json({ error: "homeTeamId and awayTeamId are required." }, { status: 400 });
    }

    const prediction = predictMatch({ homeTeamId: body.homeTeamId, awayTeamId: body.awayTeamId, config: body.config });

    const shouldPersist = body.persist === true || process.env.PERSIST_PREDICTIONS === "true";
    if (shouldPersist && process.env.DATABASE_URL) {
      const saved = await savePrediction(prediction, body.matchId);
      return NextResponse.json({ prediction, savedPredictionId: saved.id });
    }

    return NextResponse.json({ prediction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown prediction error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
