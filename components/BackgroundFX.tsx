export default function BackgroundFX() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[35%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
    </>
  );
}
