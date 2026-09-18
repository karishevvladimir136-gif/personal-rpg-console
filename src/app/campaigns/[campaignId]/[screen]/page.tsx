import { notFound } from "next/navigation";
import { ScreenView } from "@/components/screens";
import {
  connectedCampaigns,
  campaignScreens,
  findCampaign,
  isCampaignScreen,
} from "@/lib/campaign-routing";

export function generateStaticParams() {
  return connectedCampaigns.flatMap((campaign) =>
    [...campaignScreens.map(([screen]) => screen), "camp"].map((screen) => ({
      campaignId: campaign.campaign_id,
      screen,
    })),
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ campaignId: string; screen: string }>;
}) {
  const { campaignId, screen } = await params;
  if (!findCampaign(campaignId) || !isCampaignScreen(screen)) notFound();
  return <ScreenView screen={screen} />;
}
