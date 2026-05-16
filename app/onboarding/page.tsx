import Link from "next/link";
import PageHero from "@/components/PageHero";

const steps = [
  ["1", "Upload Data", "Import match or event CSV files.", "/upload-center"],
  ["2", "Check Data Health", "See if the data is strong enough.", "/data-health"],
  ["3", "Open Reports", "Review team, scout and coach reports.", "/reports-center"],
  ["4", "Explore Clubs", "Open Club House and Team Profiles.", "/club-house"],
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Getting Started"
          title="Onboarding"
          description="A simple path for new users to understand and use the platform."
        />

        <section className="grid gap-6 md:grid-cols-4">
          {steps.map(([num, title, text, href]) => (
            <Link key={title} href={href} className="glass-card rounded-3xl p-6 transition hover:scale-[1.03]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-2xl font-black text-slate-950">
                {num}
              </div>
              <h2 className="mt-6 text-2xl font-black">{title}</h2>
              <p className="mt-3 text-slate-300">{text}</p>
              <p className="mt-6 font-bold text-cyan-300">Open →</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
