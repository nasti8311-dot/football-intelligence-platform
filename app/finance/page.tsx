const revenue = [
  {
    plan: "Scout",
    users: 18,
    mrr: 522,
  },
  {
    plan: "Analyst",
    users: 7,
    mrr: 833,
  },
  {
    plan: "Professional Club",
    users: 2,
    mrr: 1998,
  },
];

export default function FinancePage() {
  const totalUsers = revenue.reduce(
    (s, r) => s + r.users,
    0
  );

  const totalMRR = revenue.reduce(
    (s, r) => s + r.mrr,
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-emerald-400">
            SaaS Operations
          </p>

          <h1 className="text-5xl font-bold">
            Finance Dashboard
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Subscription Revenue, MRR und
            SaaS-Metriken deiner Football
            Intelligence Platform.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card
            title="Customers"
            value={totalUsers.toString()}
          />

          <Card
            title="Monthly Recurring Revenue"
            value={`€${totalMRR}`}
          />

          <Card
            title="Enterprise Clubs"
            value="2"
          />
        </section>

        <section className="grid gap-5">
          {revenue.map((r) => (
            <div
              key={r.plan}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-emerald-300">
                    Subscription Tier
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {r.plan}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {r.users} active customers
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-400">
                    MRR
                  </p>

                  <p className="text-3xl font-bold text-emerald-300">
                    €{r.mrr}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
