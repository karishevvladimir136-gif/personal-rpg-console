import { notFound, redirect } from "next/navigation";
import { campaignHref, findCampaign } from "@/lib/campaign-routing";
export default async function Page({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  if (!findCampaign(campaignId)) notFound();
  redirect(campaignHref(campaignId));
}
