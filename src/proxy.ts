import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresh validated Auth cookies before protected Server Components read them.
// Authorization still occurs in every page/repository operation and in Postgres.
export async function proxy(request: NextRequest) {
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
