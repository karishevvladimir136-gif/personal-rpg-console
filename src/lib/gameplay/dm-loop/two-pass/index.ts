// The experimental writer + bookkeeper runtime (docs/stages/DM_ARCH.md).
// Off unless the server is started with DM_TWO_PASS naming the bookkeeper
// (see twoPassFlag); the default loop is untouched either way.
export { runTwoPassTurn, resumeTwoPassTurn, bookkeeperStart, writerToolset, bookkeeperToolset, TWO_PASS_RUNTIME,
  type TwoPassDependencies, type TwoPassBookkeeper, type TwoPassObservation } from "./runtime.ts";
export { writerSystem, bookkeeperSystem, bookkeeperBrief, splitLedger, createLedgerGate, LEDGER_OPEN, LEDGER_CLOSE,
  BOOKKEEPER_MARKER } from "./prompts.ts";

type FlagModel = { providerId: "anthropic" | "openai"; modelId: string; effort: "low" | "medium" | "high" | "xhigh" | "max" };

function parseModel(raw: string | undefined, defaultEffort: FlagModel["effort"]): FlagModel | null {
  const value = (raw ?? "").trim();
  if (!value || value === "0" || value === "off") return null;
  const match = /^(anthropic|openai)\/([a-z0-9.-]+)(?:@(low|medium|high|xhigh|max))?$/i.exec(value);
  if (!match) return null;
  return { providerId: match[1].toLowerCase() as FlagModel["providerId"], modelId: match[2],
    effort: (match[3]?.toLowerCase() as FlagModel["effort"] | undefined) ?? defaultEffort };
}

/** The server flag (read by the registration in gameplay-service): `DM_TWO_PASS`
 * names the bookkeeper as `<provider>/<model>[@effort]`, e.g.
 * `anthropic/claude-opus-5-5@high`; unset, empty, `0` or `off` means the default
 * loop. `DM_TWO_PASS_WRITER`, optional in the same form, plays the writer instead
 * of the campaign's own DM model (the settings screen cannot name Fable 5.1). */
export function twoPassFlag(env: NodeJS.ProcessEnv = process.env): { bookkeeper: FlagModel; writer: FlagModel | null } | null {
  const bookkeeper = parseModel(env.DM_TWO_PASS, "high");
  if (!bookkeeper) return null;
  return { bookkeeper, writer: parseModel(env.DM_TWO_PASS_WRITER, "high") };
}
