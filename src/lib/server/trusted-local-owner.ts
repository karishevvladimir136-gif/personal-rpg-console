// This module contains only the local admission policy. Credentials are read
// solely by the server-side proxy after this policy admits a request.
type HeaderReader = Pick<Headers, "get">;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function loopbackHost(value: string | null) {
  if (!value) return false;
  try {
    const parsed = new URL(`http://${value}`);
    return (
      !parsed.username &&
      !parsed.password &&
      !parsed.pathname.replaceAll("/", "") &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function isLoopbackRequest(url: string, headers: HeaderReader) {
  try {
    const parsed = new URL(url);
    const host = headers.get("host");
    if (
      parsed.protocol !== "http:" ||
      !loopbackHost(host) ||
      !loopbackHost(parsed.host) ||
      parsed.host !== host
    )
      return false;
    const forwardedHost = headers.get("x-forwarded-host");
    if (forwardedHost && forwardedHost !== host) return false;
    if (headers.get("forwarded")) return false;
    for (const header of ["x-forwarded-for", "x-real-ip"]) {
      const value = headers.get(header);
      if (
        value &&
        !value
          .split(",")
          .every((part) => ["127.0.0.1", "::1"].includes(part.trim()))
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}

export type TrustedLocalEnvironment = Partial<
  Record<
    | "NODE_ENV"
    | "RPG_TRUSTED_LOCAL_OWNER"
    | "SUPABASE_URL"
    | "RPG_OWNER_USER_ID"
    | "RPG_LOCAL_OWNER_EMAIL"
    | "RPG_LOCAL_OWNER_PASSWORD",
    string
  >
>;

export function isTrustedLocalOwnerRequest(
  url: string,
  headers: HeaderReader,
  environment: TrustedLocalEnvironment,
) {
  if (
    environment.NODE_ENV === "production" ||
    environment.RPG_TRUSTED_LOCAL_OWNER !== "1" ||
    !isLoopbackRequest(url, headers) ||
    !uuidPattern.test(environment.RPG_OWNER_USER_ID || "")
  )
    return false;
  try {
    const supabase = new URL(environment.SUPABASE_URL || "");
    return (
      supabase.protocol === "http:" &&
      !supabase.username &&
      !supabase.password &&
      (supabase.hostname === "localhost" || supabase.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function hasTrustedLocalCredentials(
  environment: TrustedLocalEnvironment,
) {
  return Boolean(
    environment.RPG_LOCAL_OWNER_EMAIL?.includes("@") &&
    environment.RPG_LOCAL_OWNER_PASSWORD,
  );
}

export function trustedLocalOwnerFromHeaders(
  path: string,
  headers: HeaderReader,
  environment: TrustedLocalEnvironment,
) {
  const host = headers.get("host");
  return (
    !!host &&
    isTrustedLocalOwnerRequest(`http://${host}${path}`, headers, environment) &&
    hasTrustedLocalCredentials(environment)
  );
}

type OwnerAuthClient = {
  auth: {
    getUser(): Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
    signInWithPassword(input: { email: string; password: string }): Promise<{
      data: { user: { id: string } | null };
      error: unknown;
    }>;
    signOut(input: { scope: "local" }): Promise<{ error: unknown }>;
  };
  rpc(name: "rpg_is_owner"): PromiseLike<{ data: unknown; error: unknown }>;
};

function isMissingSession(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "AuthSessionMissingError"
  );
}

function isRejectedSession(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    (error.status === 400 || error.status === 401) &&
    "name" in error &&
    (error.name === "AuthApiError" || error.name === "AuthInvalidJwtError")
  );
}

async function clearLocalSession(client: OwnerAuthClient) {
  const result = await client.auth.signOut({ scope: "local" });
  if (result.error) throw new Error("local_owner_denied");
}

export async function ensureTrustedLocalOwnerSession(
  client: OwnerAuthClient,
  ownerId: string,
  credentials: { email: string; password: string },
) {
  const current = await client.auth.getUser();
  if (current.error) {
    // A rejected/expired Auth cookie can be replaced. A transport failure or
    // conflicting user+error result cannot establish trusted identity.
    if (
      current.data.user ||
      (!isMissingSession(current.error) && !isRejectedSession(current.error))
    )
      throw new Error("local_owner_denied");
    if (!isMissingSession(current.error)) await clearLocalSession(client);
  } else if (current.data.user?.id === ownerId) {
    const owner = await client.rpc("rpg_is_owner");
    if (owner.error || owner.data !== true)
      throw new Error("local_owner_denied");
    return;
  } else if (current.data.user) {
    // A previous local sign-in to another account must not strand /login.
    // Supabase clears the old Auth cookie before establishing the owner one.
    await clearLocalSession(client);
  }
  try {
    const result = await client.auth.signInWithPassword(credentials);
    if (result.error || !result.data.user || result.data.user.id !== ownerId)
      throw new Error("local_owner_denied");
    const verified = await client.auth.getUser();
    if (verified.error || verified.data.user?.id !== ownerId)
      throw new Error("local_owner_denied");
    const owner = await client.rpc("rpg_is_owner");
    if (owner.error || owner.data !== true)
      throw new Error("local_owner_denied");
  } catch {
    try {
      await client.auth.signOut({ scope: "local" });
    } catch {
      // The proxy discards every candidate Set-Cookie header on failure.
    }
    throw new Error("local_owner_denied");
  }
}
