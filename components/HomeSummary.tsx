import Link from "next/link";

export default function HomeSummary() {
  const blocks = [
    {
      title: "For Coaches",
      text: "Get simple team advice, opponent prep and match reports.",
      href: "/coach-view",
    },
    {
      title: "For Scouts",
      text: "Find players, rankings, AI scores and transfer targets.",
      href: "/scout-dashboard",
    },
    {
      title: "For Analysts",
      text: "Explore event maps, xG, team profiles and data health.",
      href: "/event-map",
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {blocks.map((b) => (
        <Link key={b.href} href={b.href} className="glass-card rounded-3xl p-8">
          <p className="text-sm text-cyan-300">Role View</p>
          <h2 className="mt-3 text-3xl font-black">{b.title}</h2>
          <p className="mt-4 text-slate-300">{b.text}</p>
          <p className="mt-6 font-bold text-cyan-300">Open →</p>
        </Link>
      ))}
    </section>
  );
}
