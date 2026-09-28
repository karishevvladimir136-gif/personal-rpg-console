import { adventureError, adventureService } from "@/lib/server/adventures";
import { parseWorldCommand } from "@/lib/adventures/validation";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { FoundationValidationError } from "@/lib/foundation-loop/fields";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    if (new URL(request.url).searchParams.size !== 0)
      throw new FoundationValidationError();
    return publicJson(await (await adventureService(null)).worlds());
  } catch (cause) {
    return errorResponse(adventureError(cause));
  }
}
export async function POST(request: Request) {
  try {
    const command = parseWorldCommand(await readWriteRequest(request));
    return publicJson(
      await (await adventureService(null)).performWorld(command),
    );
  } catch (cause) {
    return errorResponse(adventureError(cause));
  }
}
