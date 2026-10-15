// The dm-loop-v1 tool set: sixteen tools (plan §3), one neutral schema each.
// Strict mode where the provider limits allow it (docs/MODELS.md): OpenAI
// strict everywhere; on Anthropic the tools with many optional fields are
// non-strict, because at most 24 optional parameters may be strict in total.
// The server validates every call against the shadow state regardless.
import type { DmObjectSchema, DmSchema, DmToolDefinition } from "../../server/dm/model/schema-compiler.ts";
import { dmLoopLimits as L } from "./limits.ts";

const ref = (description: string): DmSchema => ({ type: "string", minLength: 1, maxLength: 200,
  description: `${description} Reference: an ID from the context, the local key of a record created earlier in this turn, or an exact unique name.` });
const str = (description: string, maxLength: number): DmSchema => ({ type: "string", minLength: 1, maxLength, description });
const opt = <T extends DmSchema>(schema: T): T => ({ ...schema, optional: true });
const object = (properties: Record<string, DmSchema>): DmObjectSchema => ({ type: "object", properties });

export const ITEM_CATEGORIES = ["weapon", "armor", "gear", "tool", "consumable", "misc"] as const;
export const SCENE_KINDS = ["combat", "conversation", "mystery", "exploration", "quiet", "humor", "trade", "travel", "other"] as const;
export const ENCOUNTER_OUTCOMES = ["victory", "escape", "surrender", "negotiation", "objective-completion"] as const;
export const POSITIONS = ["nearby", "far", "cover"] as const;

const sheetField = (description: string): DmSchema => ({ type: "string", minLength: 1, maxLength: 80, description });

export const dmLoopTools: readonly DmToolDefinition[] = [
  {
    name: "roll",
    description: "Roll dice on the server with a receipt. Any formula such as 1d20+5, 2d6, 1d100, 3d8-1. A single d20 with a DC is a check: the player sees it when the campaign's roll mode shows it, and an important player check may pause for interactive dice. Give the modifier source as a sheet field (stats) when it comes from the character sheet; the receipt shows it.",
    parameters: object({
      formula: str("Dice formula like 1d20+3, 2d6, 1d100. Up to 20 dice of up to 1000 sides, optional +/- modifier.", 32),
      reason: str("Why this roll happens, in the campaign language, shown to the player with the result.", L.maxShortText),
      actorRef: ref("Who rolls. Use \"dm\" for a roll that belongs to nobody."),
      visibility: { type: "string", enum: ["player", "private"], description: "player: the player may see the roll; private: the DM keeps it." },
      dc: opt({ type: "integer", minimum: 1, maximum: 40, description: "Difficulty the total must reach (d20 checks only)." }),
      modifierField: opt(sheetField("Name of the actor's sheet stat added to the roll (for example skill, attack, stealth). Shown in the receipt.")),
      advantage: opt({ type: "string", enum: ["normal", "advantage", "disadvantage"], description: "Roll two single dice and keep the higher (advantage) or lower (disadvantage)." }),
      kind: opt({ type: "string", enum: ["skill", "attack", "save", "other"], description: "What kind of check this is; default skill." }),
    }),
  },
  {
    name: "query_state",
    description: "Exact current values from the campaign state after the changes already accepted in this turn: party HP and resources, inventories, money, the current place, quests, time. Deterministic; never rolls.",
    parameters: object({
      topic: { type: "string", enum: ["party", "character", "inventory", "money", "place", "quests", "time", "all"] },
      ref: opt(ref("For character or inventory: whose.")),
    }),
  },
  {
    name: "upsert_character",
    description: "Create or update a non-player character or companion the moment the story needs one: name, description, presence in the scene, optional stat block. A new companion joins the party when party is true. The player's hero cannot be rewritten here. If the name is close to an existing character the receipt returns that ID as a hint; you decide whether it is the same person.",
    strict: { anthropic: false },
    parameters: object({
      ref: opt(ref("Existing character to update.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$", description: "Your own key for a new record, reusable in later calls of this turn (for example miller)." }),
      name: opt(str("Display name.", L.maxName)),
      kind: opt({ type: "string", enum: ["npc", "companion"] }),
      description: opt(str("Public description, appearance, role.", L.maxLongText)),
      present: opt({ type: "boolean", description: "Is the character in the current scene." }),
      party: opt({ type: "boolean", description: "Companion travels with the party." }),
      hp: opt({ type: "integer", minimum: 0, maximum: L.maxResourceValue }),
      maxHp: opt({ type: "integer", minimum: 1, maximum: L.maxResourceValue }),
      stats: opt({ type: "array", maxItems: 40, items: object({ name: sheetField("Stat name, lowercase (skill, attack, defense, stealth...)."), value: { type: "integer", minimum: -100, maximum: 1000 } }) }),
      statblock: opt(str("Free-text stat block or notes for the DM (private).", L.maxLongText)),
    }),
  },
  {
    name: "upsert_place",
    description: "Create or update a location: name, description, known or visited.",
    strict: { anthropic: false },
    parameters: object({
      ref: opt(ref("Existing place to update.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$", description: "Your key for a new place." }),
      name: opt(str("Place name.", L.maxName)),
      description: opt(str("Description.", L.maxLongText)),
      status: opt({ type: "string", enum: ["known", "visited"] }),
    }),
  },
  {
    name: "move_party",
    description: "The party travels to a place. Time must pass (minutes > 0). Companions in the party come along; local characters stay unless you mark them present.",
    parameters: object({
      placeRef: ref("Destination."),
      minutes: { type: "integer", minimum: 1, maximum: L.maxMinutesPerTurn, description: "Travel time in minutes." },
    }),
  },
  {
    name: "item",
    description: "Items: create (new item for an owner, or into the camp), transfer (to another character or the camp), consume (use up a quantity of any consumable: food, potion, torch...), equip, unequip, split (part of a stack into a new stack). Categories: weapon, armor, gear, tool, consumable, misc. Properties are free text (damage, effects, quality).",
    strict: { anthropic: false },
    parameters: object({
      action: { type: "string", enum: ["create", "transfer", "consume", "equip", "unequip", "split"] },
      itemRef: opt(ref("The item (all actions but create).")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$", description: "Your key for a created or split stack." }),
      name: opt(str("Item name (create).", L.maxName)),
      category: opt({ type: "string", enum: [...ITEM_CATEGORIES] }),
      description: opt(str("What it looks like, where it came from (create).", L.maxLongText)),
      properties: opt(str("Mechanical properties as text: damage dice, armor value, effects, charges (create).", L.maxLongText)),
      quantity: opt({ type: "integer", minimum: 1, maximum: L.maxItemQuantity, description: "Create: stack size (default 1). Transfer/consume/split: how many (default all / 1 / required)." }),
      ownerRef: opt(ref("Create: the owner; transfer: the recipient. Use \"camp\" for the shared camp stock.")),
      slot: opt({ type: "string", minLength: 1, maxLength: 80, description: "Equip: slot id (head, body, hand, offhand, belt, legs, boots, neck); default the first free slot that accepts the category." }),
    }),
  },
  {
    name: "money",
    description: "Money as named currencies (lowercase words, e.g. coins, silver, credits). transfer moves between two characters (balances never go negative), grant creates money for a recipient with a reason (a paid job, loot, a gift), spend destroys money (a purchase from the world, a fee). For a quest reward use quest claim_reward instead; a grant that pays a quest must name questRef and is refused once that reward was paid.",
    parameters: object({
      action: { type: "string", enum: ["transfer", "grant", "spend"] },
      currency: str("Currency name, lowercase words.", 32),
      amount: { type: "integer", minimum: 1, maximum: L.maxMoneyPerCall },
      fromRef: opt(ref("Payer (transfer, spend).")),
      toRef: opt(ref("Recipient (transfer, grant).")),
      reason: opt(str("Why (grant, spend).", L.maxShortText)),
      questRef: opt(ref("If this grant pays a quest reward.")),
    }),
  },
  {
    name: "resource",
    description: "Change a character's HP or a named counter (spell slots, stress, sanity, ammunition...). Use delta for a change or set for an exact value; max sets the maximum. HP stays within 0..max. Damage to HP should follow a roll receipt or an explicit rule.",
    parameters: object({
      actorRef: ref("Whose resource."),
      resource: str("hp, or a counter name in lowercase (stress, sanity, spell_slots_1, arrows).", 60),
      delta: opt({ type: "integer", minimum: -L.maxResourceValue, maximum: L.maxResourceValue }),
      set: opt({ type: "integer", minimum: 0, maximum: L.maxResourceValue }),
      max: opt({ type: "integer", minimum: 0, maximum: L.maxResourceValue }),
      reason: str("Why, shown to the player.", L.maxShortText),
    }),
  },
  {
    name: "quest",
    description: "Quests and jobs: create (title, description, reward terms, issuer), update, complete, fail, claim_reward (pays the agreed reward exactly once, to the recipient, default the hero). Reward terms are kept by the server; a second claim is refused.",
    strict: { anthropic: false },
    parameters: object({
      action: { type: "string", enum: ["create", "update", "complete", "fail", "claim_reward"] },
      questRef: opt(ref("Existing quest.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$" }),
      title: opt(str("Quest title.", L.maxName)),
      description: opt(str("What must be done, for whom, by when.", L.maxLongText)),
      issuerRef: opt(ref("Who gives the job.")),
      recipientRef: opt(ref("Who receives the reward (claim_reward; default the hero).")),
      reward: opt(object({
        currency: opt(str("Currency name.", 32)),
        amount: opt({ type: "integer", minimum: 1, maximum: L.maxMoneyPerCall }),
        items: opt({ type: "array", maxItems: 10, items: object({ name: str("Item name.", L.maxName), category: { type: "string", enum: [...ITEM_CATEGORIES] }, quantity: { type: "integer", minimum: 1, maximum: L.maxItemQuantity }, properties: opt(str("Properties as text.", L.maxLongText)) }) }),
        note: opt(str("Other promised reward in words (a favor, information).", L.maxShortText)),
      })),
    }),
  },
  {
    name: "advance_time",
    description: "In-world time passes without travel: waiting, a long talk, work, a night in town (minutes, with a reason).",
    parameters: object({
      minutes: { type: "integer", minimum: 0, maximum: L.maxMinutesPerTurn },
      reason: str("What takes the time.", L.maxShortText),
    }),
  },
  {
    name: "rest",
    description: "A short or long rest for the party (or listed participants). Time passes (60 / 480 minutes unless given), HP recovers by the campaign's recovery setting when the rest is safe, listed supplies are consumed, and a rest record is kept.",
    parameters: object({
      kind: { type: "string", enum: ["short", "long"] },
      safe: { type: "boolean", description: "Your judgment: a safe rest recovers; an unsafe or interrupted one does not." },
      participantRefs: opt({ type: "array", maxItems: 20, items: ref("Participant.") }),
      consume: opt({ type: "array", maxItems: 10, items: object({ itemRef: ref("Supply used."), quantity: { type: "integer", minimum: 1, maximum: L.maxItemQuantity } }) }),
      minutes: opt({ type: "integer", minimum: 1, maximum: L.maxMinutesPerTurn }),
    }),
  },
  {
    name: "note_character",
    description: "Private Character Model of a non-player character or companion: identity (set once for a new model; fixed afterwards), current state (goal, stress, preoccupation, obligation), beliefs, relationships, remembered episodes. Only the DM sees it. Lists replace the stored lists.",
    strict: { anthropic: false },
    parameters: object({
      actorRef: ref("Whose model."),
      identity: opt(object({
        values: opt({ type: "array", maxItems: L.characterModel.listItems, items: str("A value.", L.characterModel.listText) }),
        wants: opt({ type: "array", maxItems: L.characterModel.listItems, items: str("A want.", L.characterModel.listText) }),
        boundaries: opt({ type: "array", maxItems: L.characterModel.listItems, items: str("A boundary.", L.characterModel.listText) }),
        loyalties: opt({ type: "array", maxItems: L.characterModel.listItems, items: str("A loyalty.", L.characterModel.listText) }),
        signatures: opt({ type: "array", maxItems: L.characterModel.listItems, items: str("A signature habit or phrase.", L.characterModel.listText) }),
        observableVoice: opt(str("How they sound and behave to an observer.", L.characterModel.voice)),
      })),
      current: opt(object({
        goal: opt(str("Current goal.", L.characterModel.listText)),
        stress: opt({ type: "string", enum: ["settled", "strained", "acute"] }),
        preoccupation: opt(str("What occupies them now.", L.characterModel.listText)),
        obligation: opt(str("What they owe or must do.", L.characterModel.listText)),
      })),
      beliefs: opt({ type: "array", maxItems: L.characterModel.beliefs, items: object({ text: str("What they believe.", L.characterModel.longText), confidence: { type: "string", enum: ["tentative", "supported"] }, aboutRef: opt(ref("Who it is about.")) }) }),
      relationships: opt({ type: "array", maxItems: L.characterModel.relationships, items: object({ actorRef: ref("The other person."), affection: { type: "string", enum: ["distant", "open", "close"] }, trust: { type: "string", enum: ["low", "guarded", "earned"] }, respect: { type: "string", enum: ["low", "mixed", "high"] }, unresolvedHurt: opt(str("An unresolved hurt.", L.characterModel.listText)) }) }),
      episodes: opt({ type: "array", maxItems: L.characterModel.episodes, items: object({ meaning: str("What this episode meant to them.", L.characterModel.longText), cue: opt(str("What brings it back.", L.characterModel.cue)) }) }),
    }),
  },
  {
    name: "note_world",
    description: "Private DM notes about the world: facts (set), clocks (set or advance by an amount), factions, consequences. Keys are stable identifiers (lowercase, dashes). The player never sees these.",
    parameters: object({
      kind: { type: "string", enum: ["fact", "clock", "faction", "consequence"] },
      key: { type: "string", minLength: 1, maxLength: 120, pattern: "^[a-zA-Z0-9_-]+$" },
      operation: { type: "string", enum: ["set", "advance"] },
      value: opt(str("The note (set).", 2000)),
      amount: opt({ type: "integer", minimum: 0, maximum: 100, description: "Clock advance (advance)." }),
    }),
  },
  {
    name: "combat",
    description: "Encounters: start (with participants and a summary), position (move participants: nearby, far, cover), end (with an outcome). Attacks and damage are rolls plus resource changes.",
    parameters: object({
      action: { type: "string", enum: ["start", "position", "end"] },
      participantRefs: opt({ type: "array", maxItems: 20, items: ref("Participant.") }),
      positions: opt({ type: "array", maxItems: 20, items: object({ actorRef: ref("Who."), position: { type: "string", enum: [...POSITIONS] } }) }),
      outcome: opt({ type: "string", enum: [...ENCOUNTER_OUTCOMES] }),
      summary: opt(str("Public summary of the encounter.", L.maxShortText)),
    }),
  },
  {
    name: "holding",
    description: "Party property with its own storage: a transport (cart, boat, ship), a base (house, camp site, hideout) or a mount. create, update, remove. Items can be transferred to a holding by its reference.",
    strict: { anthropic: false },
    parameters: object({
      action: { type: "string", enum: ["create", "update", "remove"] },
      holdingRef: opt(ref("Existing holding.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$" }),
      kind: opt({ type: "string", enum: ["transport", "base", "mount"] }),
      name: opt(str("Name.", L.maxName)),
      description: opt(str("Description, capacity, condition.", L.maxLongText)),
    }),
  },
  {
    name: "finish_turn",
    description: "Call once when the narration is complete: what kinds of scene this turn was, which characters were in focus, and whether you hand the decisive moment to the player (playerMoment: the turn ends with an invitation and the player's next input describes the moment within the already accepted result).",
    parameters: object({
      sceneKinds: { type: "array", minItems: 1, maxItems: 4, items: { type: "string", enum: [...SCENE_KINDS] } },
      spotlight: { type: "array", maxItems: 12, items: ref("A character in focus.") },
      playerMoment: { type: "boolean" },
    }),
  },
];

export const DM_LOOP_TOOL_NAMES = dmLoopTools.map((tool) => tool.name);
