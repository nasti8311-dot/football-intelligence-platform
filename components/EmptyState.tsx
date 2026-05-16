import Link from "next/link";

export default function EmptyState({
  title = "No data available",
  text = "Upload data or check your imports to unlock this view.",
  href = "/upload-center",
}: {
  title?: string;
  text?: string;
  href?: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-10 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10 text-4xl">
        ⚽
      </div>

      <h2 className="mt-6 text-3xl font-black">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-400">
        {text}
      </p>

      <Link
        href={href}
        className="mt-8 inline-block rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950"
      >
        Upload Data
      </Link>
    </div>
  );
}
