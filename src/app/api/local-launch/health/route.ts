import {
  hasTrustedLocalCredentials,
  isLoopbackRequest,
  isTrustedLocalOwnerRequest,
  localOwnerModeAllowed,
} from "@/lib/server/trusted-local-owner";

export async function GET(request: Request) {
  if (
    !localOwnerModeAllowed(process.env) ||
    !isLoopbackRequest(request.url, request.headers)
  )
    return new Response(null, { status: 404 });
  return Response.json(
    {
      app: "personal-rpg-console",
      trustedLocalOwner:
        isTrustedLocalOwnerRequest(request.url, request.headers, process.env) &&
        hasTrustedLocalCredentials(process.env),
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
