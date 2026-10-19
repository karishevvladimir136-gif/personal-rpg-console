import type { RuntimeSource, ContextStage } from "./server-contracts";
import type { TurnInput } from "./contracts";
import type { CraftRole, CraftVersion } from "../dm-craft/contracts.ts";
import { CRAFT_SELECTOR_POLICY, LEGACY_CRAFT_SELECTOR_POLICY } from "../dm-craft/contracts.ts";
import { parseDmStyle } from "../dm-craft/validation.ts";
import { DmError } from "./dm-errors.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";

/** A card as the context reads it: the text in the campaign's language, its key, its role and its triggers
 * (polish 3 §7: the role picks whom it travels with; the triggers let the bookkeeper's selection run on
 * the narration and the ledger, as the SQL selector runs on the player's input). */
export type ContextCard = { key: string; title: string; guidance: string; avoid: string; role: CraftRole; triggers: string[] };

function card(value: CraftVersion, stage: "plan" | "narrate", locale: "en" | "ru"): ContextCard {
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
  const role: CraftRole = value.role === "writer" || value.role === "bookkeeper" ? value.role : "both";
  return { key: value.key, title: text.title, guidance: text.guidance, avoid: text.avoid, role, triggers: Array.isArray(value.triggers) ? value.triggers.filter((t) => typeof t === "string") : [] };
}

/** Whether a card travels with a role of the turn: the single loop takes every card, the writer the
 * writer's and the shared ones, the bookkeeper the bookkeeper's and the shared ones. */
export function cardForRole(cardRole: CraftRole, role: "dm" | "writer" | "bookkeeper"): boolean {
  return role === "dm" || cardRole === "both" || cardRole === role;
}

/** The selector of `dm_craft_stage_v2` in TypeScript: the cards whose literal triggers occur in the text,
 * by the count of triggers found, at most `limit` (two, as the SQL). The bookkeeper's selection runs on the
 * narration and the ledger; the replay tool's on the owner's line. */
export function selectCraftCards<T extends { key: string; triggers: string[] }>(library: T[], text: string, limit = 2): T[] {
  const lower = text.toLocaleLowerCase();
  return library
    .map((entry) => ({ entry, score: entry.triggers.filter((trigger) => trigger.trim().length >= 2 && lower.includes(trigger.toLocaleLowerCase())).length }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.key.localeCompare(b.entry.key))
    .slice(0, limit)
    .map((row) => row.entry);
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
    (pinned.policyVersion !== CRAFT_SELECTOR_POLICY && pinned.policyVersion !== LEGACY_CRAFT_SELECTOR_POLICY) ||
    pinned.ownerId !== source.ownerId ||
    pinned.campaignId !== request.campaignId ||
    pinned.operationId !== request.operationId ||
    (request.timeline && (!isTimelineFence(pinned.timeline) || !sameTimeline(request.timeline, pinned.timeline))) ||
    !Number.isSafeInteger(pinned.styleRevision) ||
    pinned.styleRevision < 1 ||
    !Array.isArray(pinned.plan) ||
    !Array.isArray(pinned.narrate) ||
    pinned.plan.length > 2 ||
    pinned.narrate.length > 2 ||
    (pinned.library !== undefined && (!Array.isArray(pinned.library) || pinned.library.length > 60))
  )
    throw new DmError("context");
  const turn = source.runtime.turns.find((entry) => entry.id === request.operationId);
  if (turn && turn.settingsRevision !== pinned.styleRevision)
    throw new DmError("context");
  let style;
  try {
    style = parseDmStyle(pinned.style);
  } catch {
    throw new DmError("context");
  }
  if (stage === "feedback")
    return { styleRevision: pinned.styleRevision, style, doctrine: null, cards: [] as ContextCard[], library: [] as ContextCard[] };
  const locale = source.snapshot.settings.values.language;
  if (locale !== "en" && locale !== "ru") throw new DmError("context");
  if (pinned.doctrine && (pinned.doctrine.kind !== "doctrine" || pinned.doctrine.key !== "core-doctrine"))
    throw new DmError("context");
  const selected = stage === "plan" ? pinned.plan : pinned.narrate;
  if (new Set(selected.map((entry) => entry.id)).size !== selected.length || selected.some((entry) => entry.kind !== "card"))
    throw new DmError("context");
  const library = (pinned.library ?? []).filter((entry) => entry.kind === "card" && entry.stages.includes(stage));
  if (new Set(library.map((entry) => entry.id)).size !== library.length) throw new DmError("context");
  return {
    styleRevision: pinned.styleRevision,
    style,
    doctrine: pinned.doctrine ? card(pinned.doctrine, stage, locale) : null,
    /** The cards the SQL selector chose for this turn (at most two, by the input's words and the public signal). */
    cards: selected.map((entry) => card(entry, stage, locale)),
    /** The whole approved library (every active card of the stage), for a selection run on other text. */
    library: library.map((entry) => card(entry, stage, locale)),
  };
}
