import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-card backdrop-blur-xl", className)}>{children}</section>;
}
