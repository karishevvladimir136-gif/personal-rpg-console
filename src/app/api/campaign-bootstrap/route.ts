import { performBootstrap } from "@/lib/server/adventure-bootstrap";
import { parseBootstrapCommand } from "@/lib/adventures/bootstrap-validation";
import { adventureError } from "@/lib/server/adventures";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    return publicJson(
      await performBootstrap(
        parseBootstrapCommand(await readWriteRequest(request)),
      ),
    );
  } catch (cause) {
    return errorResponse(adventureError(cause));
  }
}
