# Datenbank-Setup

Diese Version enthält eine produktionsfähige Datenbank-Schicht mit PostgreSQL + Prisma.

## Enthaltene Tabellen

- `Organization`, `User` für spätere SaaS-Mandantenfähigkeit
- `League`, `Team`, `TeamStatSnapshot` für Teamdaten und historische Stärkewerte
- `Match` für Fixtures und Resultate
- `ModelVersion` für reproduzierbare Modellversionen
- `Prediction`, `ScoreProbability`, `PredictionMarket` für gespeicherte Prognosen
- `FixtureSource`, `ApiSyncLog` für spätere API-Imports und Monitoring

## Schnellstart mit Cloud-Postgres

Am einfachsten ist eine kostenlose PostgreSQL-Datenbank bei Neon, Supabase oder Railway.

1. PostgreSQL-Projekt erstellen
2. Connection String kopieren
3. Datei `.env` im Projektordner erstellen:

```bash
cp .env.example .env
```

4. In `.env` `DATABASE_URL` einsetzen.
5. Prisma installieren/generieren und Datenbank befüllen:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Datenbank öffnen

```bash
npm run db:studio
```

Dann öffnet sich Prisma Studio im Browser.

## API-Endpunkte

- `GET /api/teams` liefert Teams aus der Datenbank, mit Static-Fallback.
- `GET /api/matches` liefert gespeicherte Fixtures.
- `GET /api/predictions` liefert gespeicherte Prognosen.
- `POST /api/predict` berechnet Prognosen. Mit `{ "persist": true }` werden sie gespeichert.

## Beispiel für Prediction speichern

```bash
curl -X POST http://localhost:3000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"homeTeamId":"mci","awayTeamId":"rma","persist":true}'
```

## Production-Hinweis

Für echtes SaaS später:

- PostgreSQL bei Neon/Supabase/Railway
- Prisma Migrations statt `db:push`
- Auth über Clerk/Auth.js
- Row-Level-Tenant-Checks über `organizationId`
- Scheduled API Imports für Fixtures und Teamstats
