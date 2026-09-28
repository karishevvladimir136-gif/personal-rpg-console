import { saveVisualFrame } from "@/lib/visual-frame/server";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function POST(request: Request) {
  try {
    return publicJson(await saveVisualFrame(await readWriteRequest(request)));
  } catch (error) {
    return errorResponse(error);
  }
}
