// Game player 1: the app's server code, in-process, on a local PGlite database. The app talks to Postgres through
// supabase-js (`rpc` for the rpg_* functions, a few `from(...).select(...).eq(...)` reads, `auth.getUser` for the owner);
// this module stands in for `@supabase/supabase-js` and `@supabase/ssr` and sends the same calls to the PGlite database
// that `globalThis.__gamePlayerDb` holds — the same SQL functions and migrations the owner's database runs. The owner's
// database is never reached: there is no network client here at all.
const state = () => {
  const s = globalThis.__gamePlayerDb;
  if (!s?.db) throw new Error("game-player-1: the local database is not open");
  return s;
};
const ident = (name) => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error(`shim: unsafe identifier ${name}`);
  return `"${name}"`;
};
const param = (value) => (value === undefined ? null : value !== null && typeof value === "object" ? JSON.stringify(value) : value);
const errorOf = (error) => ({ message: String(error?.message ?? error), code: error?.code ?? null, details: error?.detail ?? null, hint: error?.hint ?? null });

/** Serialised access: one statement at a time on the single connection (PGlite queues them too; this keeps a function
 * call and its follow-up reads from interleaving with another session's). */
let queue = Promise.resolve();
const serial = (work) => { const run = queue.then(work, work); queue = run.catch(() => {}); return run; };

const kinds = new Map();
async function returnKind(db, name) {
  if (kinds.has(name)) return kinds.get(name);
  const row = (await db.query(`select p.proretset, t.typtype from pg_proc p join pg_type t on t.oid = p.prorettype
    where p.proname = $1 and p.pronamespace = 'public'::regnamespace limit 1`, [name])).rows[0];
  const kind = !row ? "scalar" : row.proretset ? "set" : row.typtype === "c" ? "row" : "scalar";
  kinds.set(name, kind);
  return kind;
}

/** The one compatibility repair of this run. On a campaign whose world foundation carries the Astra takeover flag (every
 * new structured campaign does), the claim of an out-of-game «?» turn (a legacy-identity turn: runtime_identity NULL)
 * comes back from migration 46's wrapper rebuilt from the stored source without the timeline stamp every other claim
 * carries (`t.runtime_identity<>'astra-primary-v1'` is NULL, not true, for NULL), and the old engine refuses it as a
 * conflict. The owner's «?» is answered at his table (FIX_S4_TABLE item 1), so the stamp is put back here exactly as the
 * fencing wrapper writes it (the timeline the call was fenced on) — on the claim's source of an «ooc» turn only, counted
 * in `globalThis.__gamePlayerRestamps` for the report. */
function restampClaim(result, timeline) {
  const source = result?.source;
  if (!source || !timeline || result?.turn?.input?.mode !== "ooc") return result;
  if (source.runtime?.timeline && source.snapshot?.timeline) return result;
  globalThis.__gamePlayerRestamps = (globalThis.__gamePlayerRestamps ?? 0) + 1;
  const turns = (source.runtime?.turns ?? []).map((t) => (t.timeline ? t : { ...t, timeline }));
  return { ...result, source: { ...source, runtime: { ...source.runtime, timeline, turns }, snapshot: { ...source.snapshot, timeline } } };
}

/** A thenable result with the single-row helpers supabase-js offers. */
function thenable(run) {
  let shape = "many";
  const p = {
    single() { shape = "single"; return p; },
    maybeSingle() { shape = "maybe"; return p; },
    throwOnError() { return p; },
    then(resolve, reject) {
      return run().then((rows) => {
        if (rows.error) return { data: null, error: rows.error };
        const data = rows.data;
        if (shape === "many" || !Array.isArray(data)) return { data, error: null };
        if (shape === "single" && data.length !== 1) return { data: null, error: { message: `expected one row, got ${data.length}`, code: "PGRST116" } };
        return { data: data[0] ?? null, error: null };
      }).then(resolve, reject);
    },
  };
  return p;
}

function rpc(name, args = {}) {
  return thenable(() => serial(async () => {
    const { db } = state();
    const keys = Object.keys(args ?? {});
    const call = `public.${ident(name)}(${keys.map((k, i) => `${ident(k)} => $${i + 1}`).join(", ")})`;
    try {
      const kind = await returnKind(db, name);
      const sql = kind === "scalar" ? `select ${call} as result` : `select to_jsonb(r) as result from ${call} r`;
      const rows = (await db.query(sql, keys.map((k) => param(args[k])))).rows;
      const data = kind === "scalar" ? rows[0]?.result ?? null : kind === "row" ? rows[0]?.result ?? null : rows.map((r) => r.result);
      return { data: name === "rpg_runtime" && args.p_action === "claim" ? restampClaim(data, args.p_timeline) : data };
    } catch (error) {
      return { error: errorOf(error) };
    }
  }));
}

function from(table) {
  const where = [], values = [];
  let columns = "*", order = null, limit = null, offset = null;
  const builder = {
    select(cols = "*") { columns = cols; return builder; },
    eq(col, value) { values.push(param(value)); where.push(`${ident(col)} = $${values.length}`); return builder; },
    neq(col, value) { values.push(param(value)); where.push(`${ident(col)} <> $${values.length}`); return builder; },
    in(col, list) { values.push(list); where.push(`${ident(col)} = any($${values.length})`); return builder; },
    is(col, value) { where.push(`${ident(col)} is ${value === null ? "null" : value ? "true" : "false"}`); return builder; },
    order(col, opts = {}) { order = `${ident(col)} ${opts.ascending === false ? "desc" : "asc"}`; return builder; },
    limit(n) { limit = Number(n); return builder; },
    range(a, b) { offset = Number(a); limit = Number(b) - Number(a) + 1; return builder; },
    insert() { throw new Error(`shim: insert into ${table} is not supported (the app writes through its rpg_* functions)`); },
    update() { throw new Error(`shim: update of ${table} is not supported`); },
    delete() { throw new Error(`shim: delete from ${table} is not supported`); },
  };
  const run = () => serial(async () => {
    const { db } = state();
    const cols = columns.trim() === "*" ? "*" : columns.split(",").map((c) => ident(c.trim())).join(", ");
    const sql = `select ${cols} from public.${ident(table)}${where.length ? ` where ${where.join(" and ")}` : ""}${order ? ` order by ${order}` : ""}${limit !== null ? ` limit ${limit}` : ""}${offset !== null ? ` offset ${offset}` : ""}`;
    try { return { data: (await db.query(sql, values)).rows }; } catch (error) { return { error: errorOf(error) }; }
  });
  const t = thenable(run);
  return Object.assign(builder, { single: () => t.single(), maybeSingle: () => t.maybeSingle(), then: (a, b) => t.then(a, b) });
}

function client() {
  return {
    rpc, from,
    auth: {
      getUser: async () => ({ data: { user: { id: state().owner, email: "owner@game-player-1.local" } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    storage: { from: () => { throw new Error("shim: storage is not used in this run (pictures and soundtrack are off)"); } },
  };
}

export const createClient = () => client();
export const createServerClient = () => client();
const supabase = { createClient, createServerClient };
export default supabase;
