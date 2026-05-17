[1mdiff --git a/app/daily-picks/page.tsx b/app/daily-picks/page.tsx[m
[1mindex a8ca113..e7b46f7 100644[m
[1m--- a/app/daily-picks/page.tsx[m
[1m+++ b/app/daily-picks/page.tsx[m
[36m@@ -223,6 +223,44 @@[m [mexport default async function DailyPicksPage() {[m
                     </Link>[m
                   </div>[m
 [m
[32m+[m[32m                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">[m
[32m+[m[32m                    <div className="rounded-2xl bg-slate-950/60 p-3">[m
[32m+[m[32m                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">[m
[32m+[m[32m                        Prediction Details[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                      <p className="mt-1 text-sm font-black text-cyan-300">[m
[32m+[m[32m                        {p.bestMarket}[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                    </div>[m
[32m+[m
[32m+[m[32m                    <div className="rounded-2xl bg-slate-950/60 p-3">[m
[32m+[m[32m                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">[m
[32m+[m[32m                        Probability[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                      <p className="mt-1 text-sm font-black text-white">[m
[32m+[m[32m                        {Math.round(p.bestProbability)}%[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                    </div>[m
[32m+[m
[32m+[m[32m                    <div className="rounded-2xl bg-slate-950/60 p-3">[m
[32m+[m[32m                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">[m
[32m+[m[32m                        Expected Goals[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                      <p className="mt-1 text-sm font-black text-white">[m
[32m+[m[32m                        {p.homeXg.toFixed(1)} : {p.awayXg.toFixed(1)}[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                    </div>[m
[32m+[m
[32m+[m[32m                    <div className="rounded-2xl bg-slate-950/60 p-3">[m
[32m+[m[32m                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">[m
[32m+[m[32m                        Tracking[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                      <p className="mt-1 text-sm font-black text-emerald-300">[m
[32m+[m[32m                        LIVE[m
[32m+[m[32m                      </p>[m
[32m+[m[32m                    </div>[m
[32m+[m[32m                  </div>[m
[32m+[m
                   <div className="mt-6 grid grid-cols-3 gap-2">[m
                     <Market label="1" value={pct(p.homeWin)} tone="cyan" />[m
                     <Market label="X" value={pct(p.draw)} tone="slate" />[m
[36m@@ -232,11 +270,11 @@[m [mexport default async function DailyPicksPage() {[m
                     <Market label="BTTS" value={pct(p.bttsYes)} tone="pink" />[m
                   </div>[m
 [m
[31m-                  <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">[m
[31m-                    <p className="text-sm font-bold text-cyan-300">[m
[31m-                      Begründung[m
[32m+[m[32m                  <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">[m
[32m+[m[32m                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">[m
[32m+[m[32m                      Match Insight[m
                     </p>[m
[31m-                    <p className="mt-2 text-sm text-slate-300">{p.reason}</p>[m
[32m+[m[32m                    <p className="mt-2 text-sm leading-7 text-slate-200">{p.reason}</p>[m
 [m
                     {p.oddsPrice && ([m
                       <div className="mt-4 rounded-2xl bg-cyan-400/10 p-3">[m
