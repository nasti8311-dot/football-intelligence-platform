type Props = {
  team: string;
  size?: number;
};

export default function TeamBadge({ team, size = 44 }: Props) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-2 ring-white/20"
      style={{ width: size, height: size, minWidth: size }}
      title={team}
    >
      <img
        src={`/api/crest?team=${encodeURIComponent(team)}`}
        alt={team}
        className="h-full w-full object-contain bg-white p-1"
      />
    </div>
  );
}
