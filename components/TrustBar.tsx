export default function TrustBar() {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="grid gap-4 text-center md:grid-cols-4">
        <Trust label="Live Database" value="Supabase" />
        <Trust label="Analytics Engine" value="Prisma + Next.js" />
        <Trust label="Use Case" value="Scouting & Coaching" />
        <Trust label="Status" value="Production Demo" />
      </div>
    </section>
  );
}

function Trust({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 font-bold text-cyan-300">{value}</p>
    </div>
  );
}
