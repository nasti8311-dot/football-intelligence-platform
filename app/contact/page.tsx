import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function ContactPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHero
          eyebrow="Get Started"
          title="Ready to use Football Intelligence?"
          description="Use the demo, upload data, explore reports or prepare the next scouting workflow."
        />

        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-3xl font-black">Start here</h2>
          <p className="mt-4 text-slate-300">
            This platform is ready as a production demo for football analytics, scouting and coaching workflows.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/demo-tour" className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950">
              Open Demo Tour
            </Link>

            <Link href="/upload-center" className="rounded-2xl bg-white/10 px-6 py-4 font-bold text-white">
              Upload Data
            </Link>

            <Link href="/reports-center" className="rounded-2xl bg-white/10 px-6 py-4 font-bold text-white">
              View Reports
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
