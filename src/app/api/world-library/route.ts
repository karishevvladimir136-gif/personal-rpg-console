import {
  ownerLibraryError,
  ownerLibraryService,
} from "@/lib/server/world-library/authoring";
import { readWriteRequest } from "@/lib/persistence/http-policy";
import { errorResponse, publicJson } from "@/lib/persistence/route-response";
import { ensure, uuid } from "@/lib/world-library/validation";

// Deliberately separate from campaign Library and campaign read APIs.
export async function GET(request: Request) {
  try {
    const service = await ownerLibraryService();
    const params = new URL(request.url).searchParams;
    ensure(
      [...params.keys()].every((key) => ["kind", "versionId"].includes(key)),
    );
    if (!params.size) return publicJson(await service.read());
    ensure(
      params.size === 2 &&
        params.getAll("kind").length === 1 &&
        params.getAll("versionId").length === 1,
    );
    const versionId = uuid(params.get("versionId"));
    ensure(params.get("kind") === "source" || params.get("kind") === "pack");
    return publicJson(
      params.get("kind") === "source"
        ? await service.source(versionId)
        : await service.pack(versionId),
    );
  } catch (cause) {
    return errorResponse(ownerLibraryError(cause));
  }
}

export async function POST(request: Request) {
  try {
    const input = await readWriteRequest(request);
    const service = await ownerLibraryService();
    return publicJson(await service.execute(input));
  } catch (cause) {
    return errorResponse(ownerLibraryError(cause));
  }
}
