import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isUuid } from "../persistence/validation";
import { PersistenceError } from "./errors";

export function isConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY) &&
    isUuid(process.env.RPG_OWNER_USER_ID),
  );
}
async function clientForRequest() {
  if (!isConfigured()) throw new PersistenceError("not_configured");
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    (process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)!,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          try {
            for (const { name, value, options } of values)
              jar.set(name, value, options);
          } catch (error) {
            // Server Components cannot write cookies; the Next proxy refreshes before those reads.
            if (
              !(error instanceof Error) ||
              !error.message.includes("Cookies can only be modified")
            )
              throw error;
          }
        },
      },
    },
  );
}
export async function requireOwner() {
  const client = await clientForRequest();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new PersistenceError("unauthenticated");
  if (data.user.id !== process.env.RPG_OWNER_USER_ID)
    throw new PersistenceError("forbidden");
  const result = await client.rpc("rpg_is_owner");
  if (result.error) throw new PersistenceError("unavailable");
  if (result.data !== true) throw new PersistenceError("forbidden");
  return { client, user: data.user };
}
export async function signIn(email: string, password: string) {
  if (
    typeof email !== "string" ||
    email.length > 320 ||
    !email.includes("@") ||
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 1024
  )
    throw new PersistenceError("validation");
  const client = await clientForRequest();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) throw new PersistenceError("unauthenticated");
  const check =
    data.user.id === process.env.RPG_OWNER_USER_ID
      ? await client.rpc("rpg_is_owner")
      : null;
  if (check?.error || check?.data !== true) {
    await client.auth.signOut({ scope: "local" });
    throw new PersistenceError(check?.error ? "unavailable" : "forbidden");
  }
}
export async function signOut() {
  const client = await clientForRequest();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) throw new PersistenceError("unavailable");
}
