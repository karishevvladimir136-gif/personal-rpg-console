import { executeDmCraft, readDmCraft } from "@/lib/server/dm-craft";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return publicJson(await readDmCraft());
  } catch (cause) {
    return errorResponse(cause);
  }
}
export async function POST(request: Request) {
  try {
    return publicJson(await executeDmCraft(await readWriteRequest(request)));
  } catch (cause) {
    return errorResponse(cause);
  }
}
