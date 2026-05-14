# CSV Importer

Diese Version kann Ligen, Teams und Spiele ohne externen API-Key importieren.

## Start

```bash
npm run dev
```

Dann im Browser öffnen:

```text
http://localhost:3000/admin/import
```

## Reihenfolge

1. Leagues importieren
2. Teams importieren
3. Matches importieren

## CSV-Dateien

Beispiele liegen im Ordner `samples/`:

- `samples/leagues.csv`
- `samples/teams.csv`
- `samples/matches.csv`

## Wichtige Spalten

### Leagues

```csv
code,name,country
```

### Teams

```csv
id,name,shortName,leagueCode,leagueName,country,attack,defense,elo,form,xgFor,xgAgainst,possession,pressing,tempo
```

### Matches

```csv
sourceId,leagueCode,season,matchday,kickoff,homeTeamId,awayTeamId,venue
```

## Hinweise

- Der Import nutzt Upserts. Gleiche IDs werden aktualisiert, nicht doppelt angelegt.
- Matches benötigen existierende Teams.
- Jeder Import schreibt einen Eintrag in `ApiSyncLog`.
