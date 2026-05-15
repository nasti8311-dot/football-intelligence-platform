type Props = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="glass-card glow relative overflow-hidden rounded-3xl p-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-20 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          {eyebrow}
        </p>

        <h1 className="page-title mt-4 text-5xl font-black">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-300">
          {description}
        </p>
      </div>
    </section>
  );
}
