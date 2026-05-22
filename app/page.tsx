import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/marketing/HeroSection";
import { StatsStrip } from "@/components/marketing/StatsStrip";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { TrustSection } from "@/components/marketing/TrustSection";
import { CTASection } from "@/components/marketing/CTASection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    matches,
    oddsRows,
    resolved,
    correct,
  ] = await Promise.all([
    prisma.match.count(),
    prisma.bookmakerOdds.count(),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: {
          not: null,
        },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: true,
      },
    }),
  ]);

  const accuracy =
    resolved > 0
      ? Number(((correct / resolved) * 100).toFixed(1))
      : 0;

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <HeroSection />

        <LiveModulesStrip />

        <StatsStrip
          matches={matches}
          oddsRows={oddsRows}
          resolved={resolved}
          accuracy={accuracy}
        />

        <FeatureGrid />

        <TrustSection />

        <CTASection />
      </div>
    </main>
  );
}
