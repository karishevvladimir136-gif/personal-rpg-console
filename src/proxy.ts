import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ensureTrustedLocalOwnerSession,
  hasTrustedLocalCredentials,
  isTrustedLocalOwnerRequest,
} from "@/lib/server/trusted-local-owner";

// Refresh validated Auth cookies before protected Server Components read them.
// Authorization still occurs in every page/repository operation and in Postgres.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/local-launch/health")
    return NextResponse.next();
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !process.env.RPG_OWNER_USER_ID)
    return NextResponse.next();
  let response = NextResponse.next({ request });
  const client = createServerClient(url, key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  const trustedLocal =
    isTrustedLocalOwnerRequest(request.url, request.headers, process.env) &&
    hasTrustedLocalCredentials(process.env);
  if (trustedLocal) {
    try {
      await ensureTrustedLocalOwnerSession(
        client,
        process.env.RPG_OWNER_USER_ID!,
        {
          email: process.env.RPG_LOCAL_OWNER_EMAIL!,
          password: process.env.RPG_LOCAL_OWNER_PASSWORD!,
        },
      );
      if (request.nextUrl.pathname === "/login") {
        const redirect = NextResponse.redirect(
          new URL("/campaigns", request.url),
        );
        for (const cookie of response.headers.getSetCookie())
          redirect.headers.append("Set-Cookie", cookie);
        redirect.headers.set("Cache-Control", "private, no-store, max-age=0");
        return redirect;
      }
      response.headers.set("Cache-Control", "private, no-store, max-age=0");
      return response;
    } catch {
      // The candidate response may contain cookies set before owner verification.
      // Never return it, even when Supabase could not clear that candidate.
      return new NextResponse(
        "Local owner access is unavailable. Please check the launcher and try again.",
        {
          status: 503,
          headers: { "Cache-Control": "private, no-store, max-age=0" },
        },
      );
    }
  }
  try {
    await client.auth.getUser();
  } catch {
    /* Protected reads fail closed themselves. */
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|art/|preview).*)",
  ],
};
