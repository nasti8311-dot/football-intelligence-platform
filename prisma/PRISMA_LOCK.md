# PRISMA PRODUCTION LOCK

DO NOT USE:
- prisma db push ❌ (breaks production consistency)

ONLY USE:
- prisma migrate dev (local)
- prisma migrate deploy (production)
- prisma migrate resolve (fix state)

DATABASE SOURCE OF TRUTH:
- Supabase PostgreSQL

MIGRATION RULE:
- Every schema change MUST have a migration
