// HTTP tests and acceptance scripts talk to a running app. The owner's real
// app listens on 127.0.0.1:3000 with the real campaign database, so nothing
// falls back to it: an explicit PREVIEW_URL pointing at an isolated server is
// required, and port 3000 additionally needs RPG_TEST_ALLOW_OWNER_PORT=1.
export const OWNER_PORT = "3000";

export function previewTarget(env = process.env) {
  const raw = env.PREVIEW_URL?.trim();
  if (!raw)
    return { base: null, skip: "PREVIEW_URL is not set; HTTP tests need an isolated app server (see CLAUDE.md)" };
  let url;
  try {
    url = new URL(raw);
  } catch {
    return { base: null, skip: "PREVIEW_URL is not a valid URL" };
  }
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  if (port === OWNER_PORT && env.RPG_TEST_ALLOW_OWNER_PORT !== "1")
    return {
      base: null,
      skip: "PREVIEW_URL uses port 3000, where the owner's app runs; set RPG_TEST_ALLOW_OWNER_PORT=1 to allow it",
    };
  return { base: url.origin, skip: false };
}

/** For scripts that cannot skip: the same rule, as a hard error. */
export function requirePreviewBase(env = process.env) {
  const { base, skip } = previewTarget(env);
  if (!base) throw new Error(skip);
  return base;
}
