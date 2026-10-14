import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isConfigured } from "@/lib/server/auth";
import { trustedLocalOwnerFromHeaders } from "@/lib/server/trusted-local-owner";
import { OwnerLogin } from "@/components/owner-access";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!isConfigured()) redirect("/setup");
  if (trustedLocalOwnerFromHeaders("/login", await headers(), process.env))
    redirect("/campaigns");
  return <OwnerLogin />;
}
