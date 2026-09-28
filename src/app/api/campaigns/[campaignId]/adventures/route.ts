import { adventureError, adventureService } from "@/lib/server/adventures";
import {
  adventureTimeline,
  parseAdventureCommand,
} from "@/lib/adventures/validation";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { ensure, uuid } from "@/lib/foundation-loop/fields";
export const runtime = "nodejs";
type Context = { params: Promise<{ campaignId: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const campaignId = uuid((await context.params).campaignId),
      query = new URL(request.url).searchParams;
    ensure(query.size === 2 && query.has("timelineId") && query.has("epoch"));
    const epoch = query.get("epoch");
    ensure(epoch && /^[1-9]\d*$/.test(epoch));
    const timeline = adventureTimeline({
      timelineId: query.get("timelineId"),
      epoch: Number(epoch),
    });
    return publicJson(
      await (await adventureService(campaignId)).read(campaignId, timeline),
    );
  } catch (cause) {
    return errorResponse(adventureError(cause));
  }
}
export async function POST(request: Request, context: Context) {
  try {
    const campaignId = uuid((await context.params).campaignId),
      command = parseAdventureCommand(await readWriteRequest(request));
    ensure(command.input.campaignId === campaignId, "scope");
    return publicJson(
      await (await adventureService(campaignId)).perform(command),
    );
  } catch (cause) {
    return errorResponse(adventureError(cause));
  }
}
