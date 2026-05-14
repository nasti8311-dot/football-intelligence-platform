export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm text-cyan-400">Football Intelligence SaaS</p>

          <h1 className="mt-2 text-4xl font-bold">Login</h1>

          <p className="mt-3 text-slate-400">
            Später für Club-Accounts, Analysten und Admins.
          </p>

          <div className="mt-8 space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white"
              placeholder="Email"
            />

            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white"
              placeholder="Password"
              type="password"
            />

            <button className="w-full rounded-2xl bg-cyan-400 p-4 font-bold text-slate-950">
              Sign in
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
