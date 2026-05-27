export function motivationBoost({
  mustWin,
  relegation,
  titleRace,
}: {
  mustWin?: boolean;
  relegation?: boolean;
  titleRace?: boolean;
}) {
  let boost = 0;

  if (mustWin) boost += 5;
  if (relegation) boost += 4;
  if (titleRace) boost += 4;

  return boost;
}
