import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}

export function KpiCard({ label, value, detail, accent }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", accent && "border-pitch-400/30 bg-pitch-400/[0.09]")}> 
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pitch-400/10 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
    </Card>
  );
}
