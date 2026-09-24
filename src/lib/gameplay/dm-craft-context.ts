import type { RuntimeSource, ContextStage } from "./server-contracts";
import type { TurnInput } from "./contracts";
import type { CraftVersion } from "../dm-craft/contracts.ts";
import { CRAFT_SELECTOR_POLICY } from "../dm-craft/contracts.ts";
import { parseDmStyle } from "../dm-craft/validation.ts";
import { DmError } from "./dm-errors.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";

function card(value: CraftVersion, stage: "plan" | "narrate", locale: "en" | "ru") {
  if (
    !value ||
    typeof value.id !== "string" ||
    typeof value.key !== "string" ||
    !Number.isSafeInteger(value.version) ||
    value.version < 1 ||
    !Array.isArray(value.stages) ||
    !value.stages.includes(stage)
  )
    throw new DmError("context");
  const text = value[locale];
  if (
    !text ||
    typeof text.title !== "string" ||
    typeof text.guidance !== "string" ||
    typeof text.avoid !== "string" ||
    text.title.length > 120 ||
    text.guidance.length > 1600 ||
    text.avoid.length > 800
  )
    throw new DmError("context");
  return { title: text.title, guidance: text.guidance, avoid: text.avoid };
}

/** Only the pinned, stage-appropriate, public-safe owner guidance is admitted. */
export function pinnedCraftForStage(
  source: RuntimeSource,
  request: TurnInput,
  stage: ContextStage,
) {
  const pinned = source.craft;
  if (!pinned) return null; // Old pending operations retain their original behavior.
  if (
    pinned.policyVersion !== CRAFT_SELECTOR_POLICY ||
    pinned.ownerId !== source.ownerId ||
    pinned.campaignId !== request.campaignId ||
    pinned.operationId !== request.operationId ||
    (request.timeline && (!isTimelineFence(pinned.timeline) || !sameTimeline(request.timeline, pinned.timeline))) ||
    !Number.isSafeInteger(pinned.styleRevision) ||
    pinned.styleRevision < 1 ||
    !Array.isArray(pinned.plan) ||
    !Array.isArray(pinned.narrate) ||
    pinned.plan.length > 2 ||
    pinned.narrate.length > 2
  )
    throw new DmError("context");
  let style;
  try {
    style = parseDmStyle(pinned.style);
  } catch {
    throw new DmError("context");
  }
  if (stage === "feedback")
    return { styleRevision: pinned.styleRevision, style, doctrine: null, cards: [] };
  const locale = source.snapshot.settings.values.language;
  if (locale !== "en" && locale !== "ru") throw new DmError("context");
  if (pinned.doctrine && (pinned.doctrine.kind !== "doctrine" || pinned.doctrine.key !== "core-doctrine"))
    throw new DmError("context");
  const selected = stage === "plan" ? pinned.plan : pinned.narrate;
  if (new Set(selected.map((entry) => entry.id)).size !== selected.length || selected.some((entry) => entry.kind !== "card"))
    throw new DmError("context");
  return {
    styleRevision: pinned.styleRevision,
    style,
    doctrine: pinned.doctrine ? card(pinned.doctrine, stage, locale) : null,
    cards: selected.map((entry) => card(entry, stage, locale)),
  };
}
