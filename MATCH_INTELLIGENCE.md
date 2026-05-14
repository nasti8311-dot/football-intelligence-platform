# Match Intelligence Modul

Neue Routen:

- `/matches` — Match Explorer für importierte Spiele
- `/matches/[matchId]` — Detailanalyse eines Spiels

Das Modul nutzt keine Zufallswerte. Die Prognose entsteht deterministisch aus den in PostgreSQL gespeicherten Teamprofilen:

- Attack Rating
- Defense Rating
- Elo Rating
- Form Score
- xG For / xG Against Proxy
- Home/Away Baseline
- Poisson Score Matrix

## Value-Bet-Logik

Wenn Football-Data.co.uk Quoten in der CSV enthalten sind, berechnet das System:

- Modellwahrscheinlichkeit
- implizite Markt-Wahrscheinlichkeit
- faire Quote
- angebotene Quote
- Edge
- Kelly Fraction

Das ist kein Wett-Tipp und keine Gewinn-Garantie, sondern ein analytisches Signal für Abweichungen zwischen Modell und Markt.
