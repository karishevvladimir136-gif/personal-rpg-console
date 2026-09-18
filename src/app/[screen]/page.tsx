import { notFound, redirect } from "next/navigation";
import { requireOwnerPage } from "@/lib/persistence/page-access";
import { PersistentCampaigns } from "@/components/persistent-campaigns";
import { PersistentGeneralSettings } from "@/components/persistent-settings";
import { isCampaignScreen } from "@/lib/campaign-routing";
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
    !isCampaignScreen(screen)
  )
    notFound();
  await requireOwnerPage();
  if (screen === "campaigns") return <PersistentCampaigns />;
  if (screen === "settings") return <PersistentGeneralSettings />;
  redirect("/campaigns");
}
