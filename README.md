# Football Analytics SaaS – Football-Data Import Edition

Professionelle Next.js/Prisma/PostgreSQL App für Fußball-Datenanalyse mit CSV-Import.

## Neu in dieser Version

- Football-Data.co.uk-kompatibler Import
- automatische Erstellung von Ligen, Teams und Matches
- Speicherung von Match-Stats und Quoten
- Elo-Neuberechnung aus echten Resultaten
- Attack/Defense-Ratings aus historischen Spielen
- Formwert aus den letzten fünf Spielen
- deterministischer xG-Proxy aus Schüssen, Schüssen aufs Tor und Ecken
- API/Importer unter `/admin/import`

## Start

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
```

Importer öffnen:

```text
http://localhost:3000/admin/import
```

Mehr Details findest du in `FOOTBALL_DATA_IMPORT.md`.
