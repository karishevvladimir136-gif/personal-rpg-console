import { notFound, redirect } from "next/navigation";
import { MainMenu } from "@/components/main-menu";
import { GeneralSettings, ScreenView } from "@/components/screens";
import { findCampaign, isCampaignScreen } from "@/lib/campaign-routing";
import { MegaDmPreview } from "@/components/mega-dm-preview";
export default async function Preview({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  if (!segments.length) return <MainMenu />;
  if (segments.length === 1 && segments[0] === "campaigns")
    return <ScreenView screen="campaigns" />;
  if (segments.length === 1 && segments[0] === "settings")
    return <GeneralSettings />;
  if (segments.length === 1 && segments[0] === "mega-dm")
    return <MegaDmPreview />;
  if (segments[0] === "campaigns" && findCampaign(segments[1])) {
    if (segments.length === 2)
      redirect(`/preview/campaigns/${segments[1]}/game`);
    if (segments.length === 3 && isCampaignScreen(segments[2]))
      return <ScreenView screen={segments[2]} />;
  }
  notFound();
}
