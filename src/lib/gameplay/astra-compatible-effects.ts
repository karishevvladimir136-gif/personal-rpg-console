import type { TurnInput } from "./contracts.ts";
import type { MechanicsResolution, RuntimeSource } from "./server-contracts.ts";
import type { AstraEffectIntent } from "./astra-settlement.ts";
import { planAstraOrderedEffects } from "./astra-ordered-effects.ts";

/** Reuse the existing atomic, ordered settlement authority. Narrative fragments
 * depend on original intent positions, never model-written RecordChanges. */
export function planAstraCompatibleEffects(source: RuntimeSource, input: TurnInput,
  effects: AstraEffectIntent[], baseResolution: MechanicsResolution) {
  const plan = planAstraOrderedEffects(source, input, effects, baseResolution);
  return { plan, acceptedIndexes: plan?.indices ?? [],
    rejectedIndexes: plan?.rejected.map((entry) => entry.index) ?? [] };
}
