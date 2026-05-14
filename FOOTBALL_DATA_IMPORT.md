# Football-Data.co.uk Import

Diese Version unterstützt echte Match-CSV-Dateien im bekannten Football-Data.co.uk-Format.

## Unterstützte Spalten

Der Import erkennt u. a.:

- `Div` Liga-Code, z. B. `E0`, `D1`, `I1`, `SP1`, `F1`
- `Date`, `Time`
- `HomeTeam`, `AwayTeam`
- `FTHG`, `FTAG`, `FTR`
- `HTHG`, `HTAG`, `HTR`
- `HS`, `AS`, `HST`, `AST`
- `HF`, `AF`, `HC`, `AC`
- `HY`, `AY`, `HR`, `AR`
- Quoten wie `B365H`, `B365D`, `B365A`, `AvgH`, `AvgD`, `AvgA`, `MaxH`, `MaxD`, `MaxA`

## Was automatisch passiert

Beim Import werden automatisch erstellt oder aktualisiert:

1. League
2. Team
3. Match
4. MatchStat
5. MatchOdds
6. ApiSyncLog

Danach berechnet das System aus den importierten Spielen automatisch:

- Elo-Rating
- Formwert aus den letzten 5 Spielen
- Attack Rating
- Defense Rating
- xG-Proxy aus Schüssen, Schüssen aufs Tor und Ecken
- xG gegen

## Nutzung

1. App starten:

```bash
npm run dev
```

2. Importer öffnen:

```text
http://localhost:3000/admin/import
```

3. Datentyp wählen:

```text
Football-Data.co.uk Match CSV
```

4. CSV einfügen oder Datei auswählen.

5. Import starten.

## Datenbank aktualisieren

Wenn du von einer älteren Version kommst, führe einmal aus:

```bash
npx prisma db push
npx prisma generate
```

Danach App neu starten.

## Liga-Codes

Beispiele:

| Code | Liga |
| --- | --- |
| E0 | Premier League |
| E1 | Championship |
| D1 | Bundesliga |
| I1 | Serie A |
| SP1 | La Liga |
| F1 | Ligue 1 |
| N1 | Eredivisie |
| P1 | Primeira Liga |
| B1 | Belgian Pro League |
| SC0 | Scottish Premiership |
| T1 | Süper Lig |

## Wichtig

Das System erfindet keine Werte. Wenn echte xG-Daten fehlen, wird ein transparenter xG-Proxy verwendet:

```text
xG Proxy = 0.32 × Shots on Target + 0.055 × Off-Target Shots + 0.025 × Corners
```

Das ist kein Ersatz für echtes eventbasiertes xG, aber ein nachvollziehbarer, deterministischer Startpunkt für historische CSV-Daten.
