import { redirect } from "next/navigation";
import { isConfigured } from "@/lib/server/auth";
import { OwnerLogin } from "@/components/owner-access";
export const dynamic = "force-dynamic";
export default function Page() {
  if (!isConfigured()) redirect("/setup");
  return <OwnerLogin />;
}
