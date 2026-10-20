import { BattlePreview } from "@/components/live2d/battle/battle-preview";
import { fightRounds, type Fight } from "@/lib/ui/preview/live2d-battle-fixture";

/** Synthetic battle previews: two scripted fights, round by round, sample records only.
 * ?fight=ford|lair&round=N&view=map|zones&lang=en|ru */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const fight: Fight = query.fight === "lair" ? "lair" : "ford";
  const round = Math.min(fightRounds(fight), Math.max(1, Number(query.round) || 1));
  return <BattlePreview fight={fight} round={round} view={query.view === "zones" ? "zones" : "map"} lang={query.lang === "en" ? "en" : query.lang === "ru" ? "ru" : null} />;
}
