import { after } from "next/server";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { exactKeys } from "@/lib/visual-frame/real-frame";
import { PersistenceError } from "@/lib/server/errors";
import type { Schedule } from "@/lib/server/media/pictures-service";
import { live2dAction, readBoardInLanguage } from "@/lib/live2d/server/service";

// The 2D board of a campaign (docs/stages/LIVE2D_1.md): GET the public projection
// (never a seed, never a prompt), POST an owner's action. Paid work (a scene, a
// region map, the checks) runs after the response, like the Stage V pictures.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 240;
type Context = { params: Promise<{ campaignId: string }> };

const schedule: Schedule = (work) => after(() => work().catch((error) => console.error(JSON.stringify({ event: "live2d_job_failed", message: String((error as Error)?.message ?? error).slice(0, 200) }))));

export async function GET(_request: Request, context: Context) {
  try {
    // Fix S3-accept Б2: the read redoes, once, a scene sheet written in plain English before the rule (failure-safe).
    return publicJson(await readBoardInLanguage((await context.params).campaignId));
  } catch (cause) {
    return errorResponse(cause);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    const value = await readWriteRequest(request);
    if (!exactKeys(value, ["action", "input"]) || typeof value.action !== "string") throw new PersistenceError("validation");
    return publicJson(await live2dAction(campaignId, value.action, value.input, schedule));
  } catch (cause) {
    return errorResponse(cause);
  }
}
