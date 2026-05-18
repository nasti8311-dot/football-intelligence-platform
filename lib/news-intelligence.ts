export type NewsItem = {
  title?: string | null;
  description?: string | null;
  source?: string | null;
  publishedAt?: Date | string | null;
};

export function analyzeNews(items: NewsItem[]) {
  const text = items
    .map((n) => `${n.title || ""} ${n.description || ""}`)
    .join(" ")
    .toLowerCase();

  const count = (words: string[]) =>
    words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);

  const injuries = count([
    "injury",
    "injured",
    "ruled out",
    "out injured",
    "hamstring",
    "knee",
    "ankle",
    "muscle injury",
  ]);

  const suspensions = count([
    "suspended",
    "suspension",
    "red card",
    "yellow card ban",
    "ban",
  ]);

  const doubtful = count([
    "doubtful",
    "fitness test",
    "late decision",
    "uncertain",
    "questionable",
  ]);

  const lineup = count([
    "lineup",
    "starting xi",
    "team news",
    "probable xi",
    "predicted xi",
  ]);

  const returns = count([
    "returns",
    "back in training",
    "available",
    "fit again",
    "back from injury",
  ]);

  const score = injuries * 2 + suspensions * 2 + doubtful + lineup - returns;

  const risk =
    score >= 5 ? "High" : score >= 2 ? "Medium" : "Low";

  const tags: string[] = [];

  if (injuries) tags.push(`${injuries} Injury Signal${injuries > 1 ? "s" : ""}`);
  if (suspensions) tags.push(`${suspensions} Suspension Signal${suspensions > 1 ? "s" : ""}`);
  if (doubtful) tags.push(`${doubtful} Doubtful Signal${doubtful > 1 ? "s" : ""}`);
  if (lineup) tags.push("Lineup News");
  if (returns) tags.push("Return Boost");

  if (!tags.length) tags.push("No major squad issue found");

  return {
    risk,
    score,
    tags: tags.slice(0, 5),
  };
}
