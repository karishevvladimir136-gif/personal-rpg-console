import { signIn } from "@/lib/server/auth";
import { readWriteRequest, RequestError } from "@/lib/persistence/http-policy";
import { publicJson, errorResponse } from "@/lib/persistence/route-response";
export async function POST(request: Request) {
  try {
    const input = await readWriteRequest(request);
    if (
      !input ||
      typeof input !== "object" ||
      !("email" in input) ||
      !("password" in input) ||
      typeof input.email !== "string" ||
      typeof input.password !== "string" ||
      input.email.length > 254 ||
      input.password.length > 1024
    )
      throw new RequestError("validation");
    await signIn(input.email, input.password);
    return publicJson({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
