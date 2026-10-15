import { notFound } from "next/navigation";
import { Stage5Preview } from "@/components/registry/stage5-preview";
import { stage5Screens, type Stage5Screen } from "@/lib/ui/preview/stage5-screens";

/** Synthetic Stage 5 previews: sample records only, no server or database.
 * ?world=noir shows the second (non-D&D) sample; ?lang=en|ru picks the interface language. */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ screen?: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { screen = ["game"] } = await params;
  const query = await searchParams;
  const name = screen.join("/");
  if (screen.length !== 1 || !stage5Screens.includes(name as Stage5Screen)) notFound();
  return (
    <Stage5Preview
      screen={name as Stage5Screen}
      lang={query.lang === "en" ? "en" : query.lang === "ru" ? "ru" : null}
      variant={{
        world: query.world === "noir" ? "noir" : "shov",
        moment: query.moment === "1",
        combat: query.combat === "1",
        dice: query.dice === "1",
        talk: query.talk === "1",
        aside: query.aside === "1",
        step: query.step ? Number(query.step) : undefined,
        holding: query.holding ?? null,
      }}
    />
  );
}
