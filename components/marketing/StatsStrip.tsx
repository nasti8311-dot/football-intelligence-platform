type Props = {
  matches: number;
  oddsRows: number;
  accuracy: number;
  resolved: number;
};

export function StatsStrip({
  matches,
  oddsRows,
  accuracy,
  resolved,
}: Props) {
  const items = [
    {
      label: "Matches",
      value: matches,
    },
    {
      label: "Odds Rows",
      value: oddsRows,
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
    },
    {
      label: "Resolved Picks",
      value: resolved,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500">
            {item.label}
          </p>

          <p className="mt-3 text-4xl font-black text-white">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
