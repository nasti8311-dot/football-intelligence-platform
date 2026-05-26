export default function Loading() {
  return (
    <main className="min-h-screen bg-[#07111f] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[320px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
    </main>
  );
}
