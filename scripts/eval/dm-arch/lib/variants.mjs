// The four variants of the DM architecture bake-off (docs/stages/DM_ARCH.md).
// The writer's base effort is "high"; the campaign's depth rule (high … xhigh)
// chooses the level per turn, as in today's runtime. The bookkeeper runs at a
// fixed effort of its own.
export const MODELS = {
  opus: { providerId: "anthropic", modelId: "claude-opus-5-5", label: "Opus 5.5" },
  fable: { providerId: "anthropic", modelId: "claude-fable-5-1", label: "Fable 5.1" },
  sonnet: { providerId: "anthropic", modelId: "claude-sonnet-5-5", label: "Sonnet 5.5" },
};

export const VARIANTS = {
  A: { id: "A", label: "Opus 5.5, single loop", runtime: "single", writer: MODELS.opus, effort: "high", bookkeeper: null },
  B: { id: "B", label: "Fable 5.1, single loop", runtime: "single", writer: MODELS.fable, effort: "high", bookkeeper: null },
  C: { id: "C", label: "Fable 5.1 writer + Opus 5.5 bookkeeper", runtime: "two-pass", writer: MODELS.fable, effort: "high",
    bookkeeper: { ...MODELS.opus, effort: "high" } },
  D: { id: "D", label: "Opus 5.5 writer + Sonnet 5.5 bookkeeper", runtime: "two-pass", writer: MODELS.opus, effort: "high",
    bookkeeper: { ...MODELS.sonnet, effort: "high" } },
};

/** The eight scenes of the Russian harbour replay (scenario 19) that stand for the
 * voice plan's kinds: the opening look, bargaining, the dive, the evening debt
 * (money), the night (quiet), the watch (tense), the fight, the payoff talk. */
export const SCENES = ["s01", "s05", "s08", "s11", "s13", "s16", "s18", "s28"];

export const SCENARIO = "19-polish-ru-replay";

export function variant(id) {
  const found = VARIANTS[id];
  if (!found) throw new Error(`unknown variant ${id}; variants: ${Object.keys(VARIANTS).join(", ")}`);
  return found;
}
