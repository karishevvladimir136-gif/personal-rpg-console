import { notFound, redirect } from "next/navigation";
import { requireOwnerPage } from "@/lib/persistence/page-access";
import { PersistentCampaigns } from "@/components/persistent-campaigns";
import { PersistentGeneralSettings } from "@/components/persistent-settings";
import { isCampaignScreen } from "@/lib/campaign-routing";
import { WorldLibrary } from "@/components/world-library/world-library";
import { DmCraftOwner } from "@/components/dm-craft-owner";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (
    screen !== "campaigns" &&
    screen !== "settings" &&
    screen !== "world-library" &&
    screen !== "dm-craft" &&
    !isCampaignScreen(screen)
  )
    notFound();
  await requireOwnerPage();
  if (screen === "campaigns") return <PersistentCampaigns />;
  if (screen === "settings") return <PersistentGeneralSettings />;
  if (screen === "world-library") return <WorldLibrary />;
  if (screen === "dm-craft") return <DmCraftOwner />;
  redirect("/campaigns");
}
