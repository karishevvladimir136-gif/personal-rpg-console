import { PersistentMainMenu } from "@/components/owner-access";
import { requireOwnerPage } from "@/lib/persistence/page-access";
import { trustedLocalOwnerFromHeaders } from "@/lib/server/trusted-local-owner";
import { headers } from "next/headers";
export const dynamic = "force-dynamic";
export default async function Home() {
  await requireOwnerPage();
  const trustedLocalOwner = trustedLocalOwnerFromHeaders(
    "/",
    await headers(),
    process.env,
  );
  return <PersistentMainMenu trustedLocalOwner={trustedLocalOwner} />;
}
