import { readProviderSettings } from "@/lib/server/production-configuration";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return publicJson(await readProviderSettings()); } catch (error) { return errorResponse(error); }
}
