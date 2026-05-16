import Link from "next/link";

const steps = [
  ["Upload better data", "/upload-center"],
  ["Check data health", "/data-health"],
  ["Review scout reports", "/scout-dashboard"],
  ["Prepare opponent", "/opponent-prep"],
];

export default function NextSteps() {
  return (
    <section className="glass-card rounded-3xl p-6">
      <p className="text-sm text-cyan-300">Recommended Workflow</p>
      <h2 className="mt-1 text-3xl font-black">Next Steps</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {steps.map(([label, href], i) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl bg-slate-950/60 p-5 transition hover:bg-cyan-400 hover:text-slate-950"
          >
            <p className="text-3xl font-black">0{i + 1}</p>
            <p className="mt-3 font-bold">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
