import { Card } from "@/components/ui/card";

export function ModelPanel({ notes }: { notes: string[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Model Architecture</h2>
      <div className="mt-5 grid gap-3">
        {notes.map((note) => (
          <div key={note} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-300">{note}</div>
        ))}
      </div>
    </Card>
  );
}
