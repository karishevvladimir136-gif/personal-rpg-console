import { PersistentMainMenu } from "@/components/owner-access";
import { requireOwnerPage } from "@/lib/persistence/page-access";
export const dynamic = "force-dynamic";
export default async function Home() {
  await requireOwnerPage();
  return <PersistentMainMenu />;
}
