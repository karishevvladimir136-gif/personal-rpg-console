import { notFound, redirect } from "next/navigation";
import { navigation, type Screen } from "@/lib/mock-data";
import { ScreenView } from "@/components/screens";
import { campaignHref } from "@/lib/campaign-routing";
import { campaign } from "@/lib/mock-data";
import { GeneralSettings } from "@/components/screens";
export function generateStaticParams() {
  return navigation.map(([screen]) => ({ screen }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!navigation.some(([key]) => key === screen)) notFound();
  if (screen === "campaigns") return <ScreenView screen="campaigns" />;
  if (screen === "settings") return <GeneralSettings />;
  redirect(
    campaignHref(campaign.campaign_id, screen as Exclude<Screen, "campaigns">),
  );
}
