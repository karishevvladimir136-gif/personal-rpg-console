import { readWorkspace } from "@/lib/server/repository";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function GET() {
  try {
    return publicJson(await readWorkspace());
  } catch (error) {
    return errorResponse(error);
  }
}
