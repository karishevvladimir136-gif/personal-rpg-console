import { CampaignDataProvider } from "@/components/persistence-context";
import { PersistentShell } from "@/components/persistent-shell";
import { readCampaign } from "@/lib/server/repository";
import {
  requireOwnerPage,
  campaignPageError,
} from "@/lib/persistence/page-access";
export const dynamic = "force-dynamic";
export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ campaignId: string }>;
  children: React.ReactNode;
}) {
  await requireOwnerPage();
  const { campaignId } = await params;
  const data = await readCampaign(campaignId).catch(campaignPageError);
  return (
    <CampaignDataProvider
      key={campaignId}
      campaignId={campaignId}
      initialData={data}
    >
      <PersistentShell>{children}</PersistentShell>
    </CampaignDataProvider>
  );
}
