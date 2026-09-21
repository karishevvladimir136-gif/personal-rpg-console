import { readFile } from "node:fs/promises";
import { labFixture } from "./d1-sql-fixture.mjs";

/** The accepted D1 synthetic state, upgraded in a fresh disposable PGlite DB. */
export async function d2aFixture(options = {}) {
  const f = await labFixture(options);
  await f.db.exec(await readFile(new URL(
    "../supabase/migrations/202609200015_world_lab_d2a.sql", import.meta.url,
  ), "utf8"));
  return f;
}
export { d2aFixture as fixture };
