export default function SidebarStatus() {
  return (
    <div className="m-4 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-emerald-400" />
        <p className="text-sm font-bold text-emerald-300">
          System Online
        </p>
      </div>

      <p className="text-xs text-slate-400">
        Database, analytics engine and reports are active.
      </p>
    </div>
  );
}
