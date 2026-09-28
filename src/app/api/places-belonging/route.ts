import { saveBelonging } from "@/lib/places-belonging/server";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
export async function POST(request: Request) {
  try {
    return publicJson(await saveBelonging(await readWriteRequest(request)));
  } catch (cause) {
    return errorResponse(cause);
  }
}
