// Persona memory 1: the Postgres backend — the `persona_memory` schema (migration 202610230101) behind one RPC,
// `public.persona_memory(owner, action, payload)`, executable by service_role only (the sandbox's Supabase
// conventions: logic in TypeScript, invariants and atomicity in SQL). The caller supplies the transport: supabase-js
// with the service key on the server, or a plain SQL query function (PGlite in the tests).
import type { PersonaStore } from "./store.ts";
import { PersonaMemoryError, type DossierLine, type Episode, type Fact, type Fold } from "./schema.ts";

export type PersonaRpc = (action: string, payload: Record<string, unknown>) => Promise<unknown>;

const CODES: [RegExp, string][] = [[/persona_conflict|duplicate key/, "conflict"], [/persona_not_found/, "not_found"], [/persona_immutable/, "immutable"],
  [/persona_forbidden/, "forbidden"], [/persona_validation|violates check constraint/, "invalid"]];

/** An RPC over a SQL query function (`select public.persona_memory($1,$2,$3::jsonb)`), e.g. PGlite's or node-postgres'. */
export function sqlRpc(query: (sql: string, params: unknown[]) => Promise<{ rows: Record<string, unknown>[] } | Record<string, unknown>[]>, ownerId: string): PersonaRpc {
  return async (action, payload) => {
    const result = await query("select public.persona_memory($1,$2,$3::jsonb) as result", [ownerId, action, JSON.stringify(payload)]);
    const rows = Array.isArray(result) ? result : result.rows;
    return rows[0]?.result;
  };
}

export function postgresStore(rpc: PersonaRpc): PersonaStore {
  const call = async <T>(action: string, payload: Record<string, unknown> = {}): Promise<T> => {
    try { return (await rpc(action, payload)) as T; } catch (error) {
      const message = String((error as Error)?.message ?? error);
      const code = CODES.find(([pattern]) => pattern.test(message))?.[1];
      // The database's message names the constraint, never a key or a token.
      throw code ? new PersonaMemoryError(code, `${action}: ${message.slice(0, 200)}`) : error;
    }
  };
  return {
    kind: "postgres",
    insertEpisode: async (episode: Episode) => { await call("episode.insert", { episode }); },
    episodes: () => call<Episode[]>("episodes.list"),
    appendNote: (episodeId, note) => call<Episode>("episode.note", { episodeId, note }),
    insertFold: async (fold: Fold) => { await call("fold.insert", { fold }); },
    folds: () => call<Fold[]>("folds.list"),
    dossier: () => call<DossierLine[]>("dossier.list"),
    appendDossier: async (lines: DossierLine[]) => { await call("dossier.append", { lines }); },
    facts: () => call<Fact[]>("facts.list"),
    setFact: async (fact: Fact) => { await call("fact.set", { fact }); },
    embeddingsGet: async (model, keys) => new Map(Object.entries(keys.length ? await call<Record<string, number[]>>("embeddings.get", { model, keys }) : {})),
    embeddingsPut: async (model, entries) => { if (entries.length) await call("embeddings.put", { model, entries }); },
  };
}
