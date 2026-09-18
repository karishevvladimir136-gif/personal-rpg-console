import { signOut } from "@/lib/server/auth";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function POST(request: Request) {
  try {
    await readWriteRequest(request);
    await signOut();
    return publicJson({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
