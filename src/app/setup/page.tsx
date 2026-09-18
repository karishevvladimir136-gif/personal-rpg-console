import { redirect } from "next/navigation";
import { isConfigured } from "@/lib/server/auth";
import { SetupRequired } from "@/components/owner-access";
export const dynamic = "force-dynamic";
export default function Page() {
  if (isConfigured()) redirect("/login");
  return <SetupRequired />;
}
