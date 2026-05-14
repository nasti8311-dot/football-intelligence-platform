# Prediction Engine v2

Diese Version ergänzt die Plattform um eine professionelle, nachvollziehbare Monte-Carlo-Schicht für zukünftige Spielanalysen.

## Neue Route

```text
http://localhost:3000/predictions
```

## Was berechnet wird

- Poisson-basierte Basiswahrscheinlichkeiten
- 20.000 deterministische Monte-Carlo-Simulationen pro Match
- 1X2-Wahrscheinlichkeiten mit Confidence-Bands
- Goal Distribution je Team
- Szenario-Buckets wie Over 2.5, BTTS, klare Siege, knappe Spiele
- Confidence Score
- Volatility Score
- Upset Risk
- Draw Risk
- Risk-adjusted Value-Bet Edge

## Warum deterministisch?

Die Simulation nutzt eine Low-Discrepancy-Sequenz statt unkontrollierter Zufallswerte. Dadurch sind Ergebnisse reproduzierbar, stabil und für ein SaaS-Produkt besser testbar.

## Wichtige Dateien

```text
lib/model/monte-carlo.ts
components/analytics/prediction-v2-charts.tsx
app/predictions/page.tsx
app/matches/[matchId]/page.tsx
```

## Start

```bash
npm install
npx prisma db push --accept-data-loss
npx prisma generate
npm run dev
```

Dann öffnen:

```text
http://localhost:3000/predictions
```
