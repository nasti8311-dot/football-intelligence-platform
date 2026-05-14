# Team Analytics Erweiterung

Diese Version ergänzt die Plattform um ein professionelles Team-Analytics-Modul.

## Neue Seiten

- `/teams` — Power Ranking / Ligatabelle / Teamübersicht
- `/teams/[teamId]` — Team Detail Page mit KPIs, Formkurve, xG-Trend, Radarprofil, Home/Away Split und Matchhistorie
- `/admin/import` — Football-Data.co.uk CSV Import bleibt vorhanden

## Ablauf nach dem Entpacken

```bash
npm install
npx prisma db push --accept-data-loss
npx prisma generate
npm run dev
```

Danach öffnen:

```text
http://localhost:3000/teams
```

## Voraussetzung

Vorher echte CSV-Daten unter `/admin/import` importieren. Danach füllen sich die Teamseiten automatisch aus der PostgreSQL-Datenbank.

## Enthaltene Analytics

- Punkte, Bilanz, Tordifferenz
- xG-Proxy und xG-Differenz
- Home/Away Split
- Performance Trend
- Radarprofil für Attack, Defense, Elo, Form, xG
- Matchhistorie mit Ergebnis, Shots und xG-Proxy
