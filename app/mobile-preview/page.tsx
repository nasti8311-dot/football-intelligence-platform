import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";

export default function MobilePreviewPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Mobile Experience"
          title="Mobile Preview"
          description="A concept view for how the Football Intelligence Platform could look on mobile."
        />

        <section className="flex justify-center">
          <div className="glass-card w-full max-w-sm rounded-[3rem] p-5">
            <div className="rounded-[2.5rem] bg-slate-950/80 p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-300">Today</p>
                  <h2 className="text-2xl font-black">Match Hub</h2>
                </div>
                <div className="h-10 w-10 rounded-full bg-cyan-400" />
              </div>

              <div className="rounded-3xl bg-white/10 p-5 text-center">
                <div className="flex items-center justify-between">
                  <TeamBadge team="Bayern" size={56} />
                  <p className="text-4xl font-black text-cyan-300">2:1</p>
                  <TeamBadge team="Dortmund" size={56} />
                </div>
                <p className="mt-4 text-sm text-slate-400">AI Confidence 78%</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Mini title="xG" value="1.82" />
                <Mini title="Shots" value="14" />
                <Mini title="Passes" value="421" />
                <Mini title="Threat" value="High" />
              </div>

              <div className="mt-5 rounded-3xl bg-white/10 p-5">
                <p className="text-sm text-cyan-300">Coach Advice</p>
                <p className="mt-2 text-sm text-slate-300">
                  Press early and protect central zones in transition.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Mini({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
