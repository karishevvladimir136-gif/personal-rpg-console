// The experimental writer + bookkeeper runtime (docs/stages/DM_ARCH.md).
// Off unless the server is started with DM_TWO_PASS=1 and the bookkeeper is
// named; the default loop is untouched either way.
export { runTwoPassTurn, resumeTwoPassTurn, bookkeeperStart, writerToolset, bookkeeperToolset, TWO_PASS_RUNTIME,
  type TwoPassDependencies, type TwoPassBookkeeper, type TwoPassObservation } from "./runtime.ts";
export { writerSystem, bookkeeperSystem, bookkeeperBrief, splitLedger, createLedgerGate, LEDGER_OPEN, LEDGER_CLOSE,
  BOOKKEEPER_MARKER } from "./prompts.ts";

/** The server flag (read by the registration in gameplay-service): `DM_TWO_PASS`
 * names the bookkeeper as `<provider>/<model>[@effort]`, e.g.
 * `anthropic/claude-opus-5-5@high`; unset or empty means the default loop. */
export function twoPassFlag(env: NodeJS.ProcessEnv = process.env): { providerId: "anthropic" | "openai"; modelId: string; effort: "low" | "medium" | "high" | "xhigh" | "max" } | null {
  const raw = (env.DM_TWO_PASS ?? "").trim();
  if (!raw || raw === "0" || raw === "off") return null;
  const match = /^(anthropic|openai)\/([a-z0-9.-]+)(?:@(low|medium|high|xhigh|max))?$/i.exec(raw);
  if (!match) return null;
  return { providerId: match[1].toLowerCase() as "anthropic" | "openai", modelId: match[2], effort: (match[3]?.toLowerCase() as "low" | "medium" | "high" | "xhigh" | "max" | undefined) ?? "high" };
}
