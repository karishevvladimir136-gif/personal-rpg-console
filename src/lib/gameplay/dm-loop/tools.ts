// The dm-loop-v1 tool set: sixteen tools (plan §3), one neutral schema each.
// Stage 4 extends them with actions and fields instead of adding tools (plan
// §11, the rpg-mcp lesson): quest kinds, public relations, factions, rumours,
// rarity, holding details, off-screen plans, episode folding, tension hints.
// Strict mode where the provider limits allow it (docs/MODELS.md): OpenAI
// strict everywhere; on Anthropic the tools with many optional fields are
// non-strict (upsert_character, upsert_place, item, quest, note_character,
// holding and, since Stage 4, note_world), because at most 24 optional
// parameters may be strict in total.
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
export const QUEST_KINDS = ["quest", "thread", "debt", "promise", "arc"] as const;
export const RELATION_GROUPS = ["family", "ally", "murky", "neutral", "foe"] as const;
export const ITEM_RARITIES = ["common", "relic", "magic", "story"] as const;
export const TENSION_CLASSES = ["calm", "tense", "climax"] as const;
export const ENCOUNTER_OUTCOMES = ["victory", "escape", "surrender", "negotiation", "objective-completion"] as const;
export const POSITIONS = ["nearby", "far", "cover"] as const;

const sheetField = (description: string): DmSchema => ({ type: "string", minLength: 1, maxLength: 80, description });

export const dmLoopTools: readonly DmToolDefinition[] = [
  {
    name: "roll",
    // Polish group 2 added skill, difficulty, bonuses and advantageReason: past
    // Anthropic's 24 optional strict parameters, so the roll is non-strict there.
    strict: { anthropic: false },
    description: "Roll dice on the server with a receipt. Any formula such as 1d20+5, 2d6, 1d100, 3d8-1. A single d20 with a difficulty is a check. A check of the hero or a companion is always the player's: it shows on their roll card with the reason, the bonuses and their sources, advantage and why, and the difficulty in words; an NPC's or the world's roll stays private. The sheet gives bonuses: pass skill (the skill, trade or trait as the sheet names it — the server reads its number, or +2 / +4 / +6 for named / good / master in the sheet's words) or modifierField (a numeric stat). The fiction gives bonuses too: bonuses [{source, value}] for tools, help, prepared gear, a clear position (the server caps their sum at ±6 and shows each source). Difficulty by the ladder: easy 8, normal 10, hard 13, very_hard 16, nearly_impossible 19 — an expert at their own trade in fair conditions gets normal or no roll at all. A natural 20 is the hero's moment: the success plus a visible extra in their favour; a natural 1 costs something, tied to what they tried.",
    parameters: object({
      formula: str("Dice formula like 1d20+3, 2d6, 1d100. Up to 20 dice of up to 1000 sides, optional +/- modifier.", 32),
      reason: str("The moment in words, in the campaign language: the skill or approach and what is at stake (for example «Скрытность: подслушать через щель»). Shown on the player's roll card.", L.maxShortText),
      actorRef: ref("Who rolls. Use \"dm\" for a roll that belongs to nobody."),
      visibility: { type: "string", enum: ["player", "private"], description: "player: the player may see the roll; private: the DM keeps it. A check of a party member is shown regardless; an NPC's roll is private regardless." },
      dc: opt({ type: "integer", minimum: 1, maximum: 40, description: "Difficulty the total must reach (d20 checks only); prefer difficulty in words." }),
      difficulty: opt({ type: "string", enum: ["easy", "normal", "hard", "very_hard", "nearly_impossible"], description: "Difficulty in words (8 / 10 / 13 / 16 / 19); shown to the player in words. Use it instead of dc." }),
      skill: opt(str("The skill, trade or trait as the character's sheet names it (for example «ныряльщик», «Знание старой техники»); the server resolves the bonus from the sheet and shows its source.", 80)),
      modifierField: opt(sheetField("Name of the actor's numeric sheet stat added to the roll (for example skill, attack, stealth). Shown in the receipt.")),
      bonuses: opt({ type: "array", maxItems: 4, items: object({ source: str("Where the bonus comes from, in the campaign language (инструменты, помощь Мокея, смоляные рукавицы).", 80), value: { type: "integer", minimum: -6, maximum: 6 } }), description: "Bonuses and penalties from the fiction; each with its source, shown on the card." }),
      advantage: opt({ type: "string", enum: ["normal", "advantage", "disadvantage"], description: "Roll two single dice and keep the higher (advantage) or lower (disadvantage)." }),
      advantageReason: opt(str("Why advantage or disadvantage, in the campaign language (shown on the card).", 160)),
      kind: opt({ type: "string", enum: ["skill", "attack", "save", "other"], description: "What kind of check this is; default skill." }),
      damage: opt(str("Fix the pair in one call: an attack's damage formula (1d8+3), rolled by the server only when the attack hits (a natural 20 doubles its dice); or a save's damage (kind save: full on a failed save, half on a success with halfOnSave, none otherwise).", 32)),
      targetRef: opt(ref("Who takes the damage: the attack's target; for a save the one who saves (the default). The server subtracts it from their hit points and returns what is left.")),
      halfOnSave: opt({ type: "boolean", description: "kind save with damage: a successful save still takes half (Fireball, Lightning Bolt)." }),
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
    // Fix run B2 (3), (5): the private notes the dossier's budget left out, closed notes, and «what was true then».
    name: "recall",
    description: "Search your private notes and plans, closed and archived ones too, by a name or words; atWorldMinutes keeps only what was true then. Read-only. For a person, place or thread back after long absence, or a note missing from the dossier.",
    parameters: object({
      query: str("Words that must all match.", 200),
      atWorldMinutes: opt({ type: "integer", minimum: 0, maximum: 100_000_000 }),
    }),
  },
  {
    name: "upsert_character",
    description: "Create or update a non-player character, companion or faction the moment the story needs one: name, description, presence in the scene, optional stat block. A new companion joins the party when party is true. The player's hero cannot be rewritten here. If the name is close to an existing character the receipt returns that ID as a hint; you decide whether it is the same person. Public knowledge the hero has goes here too: relation (how this person stands to the hero, as the hero sees it), important (a person worth a Character Model and a portrait), attitude (a companion's observable attitude toward the hero), factionRef, homeRef. A faction is a record of kind faction with its public note as description and its standing in relation.",
    strict: { anthropic: false },
    parameters: object({
      ref: opt(ref("Existing character or faction to update.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$", description: "Your own key for a new record, reusable in later calls of this turn (for example miller)." }),
      name: opt(str("Display name.", L.maxName)),
      kind: opt({ type: "string", enum: ["npc", "companion", "faction"] }),
      description: opt(str("Public description, appearance, role; for a faction its public note.", L.maxLongText)),
      present: opt({ type: "boolean", description: "Is the character in the current scene." }),
      party: opt({ type: "boolean", description: "Companion travels with the party." }),
      relation: opt(object({ group: { type: "string", enum: [...RELATION_GROUPS] }, note: str("One public line: why, as the hero knows it.", L.maxShortText) })),
      important: opt({ type: "boolean", description: "An important person: keep a Character Model for them (note_character)." }),
      attitude: opt(str("A companion's attitude toward the hero as the hero could observe it now (not private thoughts).", L.maxShortText)),
      factionRef: opt(ref("Faction this person belongs to, as the hero knows.")),
      homeRef: opt(ref("Place where this person lives when not with the party.")),
      hp: opt({ type: "integer", minimum: 0, maximum: L.maxResourceValue }),
      maxHp: opt({ type: "integer", minimum: 1, maximum: L.maxResourceValue }),
      stats: opt({ type: "array", maxItems: 40, items: object({ name: sheetField("Stat name, lowercase (skill, attack, defense, stealth...)."), value: { type: "integer", minimum: -100, maximum: 1000 } }) }),
      statblock: opt(str("Free-text stat block or notes for the DM (private).", L.maxLongText)),
    }),
  },
  {
    name: "upsert_place",
    description: "Create or update a location: name, description, status (rumored: the hero only heard of it; known; visited). questRefs ties the place to the goals of quests (the map shows it as a goal).",
    strict: { anthropic: false },
    parameters: object({
      ref: opt(ref("Existing place to update.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$", description: "Your key for a new place." }),
      name: opt(str("Place name.", L.maxName)),
      description: opt(str("Description.", L.maxLongText)),
      status: opt({ type: "string", enum: ["rumored", "known", "visited"] }),
      questRefs: opt({ type: "array", maxItems: 8, items: ref("A quest whose goal lies here.") }),
      parentRef: opt(ref("The place this one lies in (a town for a tavern, a region for a town); the map lays it out by itself.")),
      whereabouts: opt(str("Where it sits, in words («на краю гавани», «у понтонов»).", L.maxShortText)),
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
    description: "Items: create (new item for an owner, or into the camp), transfer (ownership moves to another character or the camp; a pledged or lent item transferred back to its owner is returned), consume (use UP a quantity: food, a potion, a torch, ammunition — never for taking off, putting away or giving), equip, unequip (taking off or putting away; the item stays), lose (the item is gone: dropped in the water, broken, stolen — say how in reason; the record remembers where it went), modify (the same item changes with the story: a new name, description or properties, its identity and history kept — a shirt cut at the hem, a note soaked), pledge / lend (the owner keeps title, the holder has it; ownerRef names the holder, condition the terms of return), split (part of a stack into a new stack). Categories: weapon, armor, gear, tool, consumable, misc. Properties are free text (damage, effects, quality).",
    strict: { anthropic: false },
    parameters: object({
      action: { type: "string", enum: ["create", "transfer", "consume", "equip", "unequip", "split", "lose", "modify", "pledge", "lend"] },
      itemRef: opt(ref("The item (all actions but create).")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$", description: "Your key for a created or split stack." }),
      name: opt(str("Item name (create).", L.maxName)),
      category: opt({ type: "string", enum: [...ITEM_CATEGORIES] }),
      description: opt(str("What it looks like, where it came from (create).", L.maxLongText)),
      properties: opt(str("Mechanical properties as text: damage dice, armor value, effects, charges (create).", L.maxLongText)),
      rarity: opt({ type: "string", enum: [...ITEM_RARITIES], description: "Significance of the item (create, or with itemRef to set it later): common, relic, magic, story." }),
      quantity: opt({ type: "integer", minimum: 1, maximum: L.maxItemQuantity, description: "Create: stack size (default 1). Transfer/consume/split: how many (default all / 1 / required)." }),
      ownerRef: opt(ref("Create: the owner; transfer: the recipient. Use \"camp\" for the shared camp stock.")),
      slot: opt({ type: "string", minLength: 1, maxLength: 80, description: "Equip: slot id (head, body, hand, offhand, belt, legs, boots, neck); default the first free slot that accepts the category." }),
      reason: opt(str("lose: what happened to it, in the campaign language (shown to the player); consume of a non-consumable: why it is used up; modify: what changed and why.", L.maxShortText)),
      condition: opt(str("pledge / lend: the terms of return in the campaign language (for example «вернёт за 16 монет»).", L.maxShortText)),
    }),
  },
  {
    name: "money",
    description: "Money as named currencies: the world's own word in the campaign language, in any script (монеты, талеры, coins, silver pieces); inflected forms of one word are one currency and the campaign keeps one canonical name. transfer moves between two characters (balances never go negative), grant creates money for a recipient with a reason (a paid job, loot, a gift), spend destroys money (a purchase from the world, a fee). For a quest reward use quest claim_reward instead (it also completes the quest); a grant that pays a quest must name questRef and is refused once that reward was paid. A rejected money call is retried with the fix the reason names, never replaced by a note.",
    parameters: object({
      action: { type: "string", enum: ["transfer", "grant", "spend"] },
      currency: str("Currency name in the campaign language (the world's own word).", 32),
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
    description: "The journal: quests and jobs, open threads, debts, promises and the main arc share this record (kind). create (title, description, reward terms, issuer, kind, steps for the arc), update (also the arc's steps, done flags, places), complete, fail, claim_reward (pays the agreed reward exactly once, to the recipient, default the hero; an open quest is completed by it, so complete and claim_reward may travel in one message in either order). Reward terms are kept by the server; a second claim is refused. A debt or promise names its counterpart.",
    strict: { anthropic: false },
    parameters: object({
      action: { type: "string", enum: ["create", "update", "complete", "fail", "claim_reward"] },
      questRef: opt(ref("Existing quest, thread, debt, promise or arc.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$" }),
      kind: opt({ type: "string", enum: [...QUEST_KINDS], description: "quest (default), thread (an open story line the hero knows), debt, promise, arc (the main arc; one per campaign)." }),
      title: opt(str("Title.", L.maxName)),
      description: opt(str("What must be done, for whom, by when.", L.maxLongText)),
      issuerRef: opt(ref("Who gives the job.")),
      counterpartRef: opt(ref("Debt or promise: the other party.")),
      steps: opt({ type: "array", maxItems: 12, items: object({ text: str("A step of the main arc.", L.maxShortText), done: { type: "boolean" } }), description: "The arc's steps (replace the list)." }),
      locationRefs: opt({ type: "array", maxItems: 8, items: ref("A place tied to this goal.") }),
      recipientRef: opt(ref("Who receives the reward (claim_reward; default the hero).")),
      reward: opt(object({
        currency: opt(str("Currency name (the world's own word).", 32)),
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
    description: "A short or long rest for the party (or listed participants) — one call for the whole rest, no resource call per counter. Time passes (60 / 480 minutes unless given); on a safe rest HP recovers by the campaign setting and the counters named in restore go back to their maximum (a safe long rest refills spell slots anyway); listed supplies are consumed.",
    parameters: object({
      kind: { type: "string", enum: ["short", "long"] },
      safe: { type: "boolean", description: "Your judgment: a safe rest recovers; an unsafe or interrupted one does not." },
      participantRefs: opt({ type: "array", maxItems: 20, items: ref("Participant.") }),
      consume: opt({ type: "array", maxItems: 10, items: object({ itemRef: ref("Supply used."), quantity: { type: "integer", minimum: 1, maximum: L.maxItemQuantity } }) }),
      minutes: opt({ type: "integer", minimum: 1, maximum: L.maxMinutesPerTurn }),
      restore: opt({ type: "array", maxItems: 20, items: { type: "string", minLength: 1, maxLength: 60 }, description: "Counters this rest refills (ki, hit_dice…)." }),
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
      speech: opt({ ...object({
        register: str("Vocabulary and register in a line.", L.characterModel.voice),
        sentenceLength: { type: "string", enum: ["short", "mixed", "long"] },
        tics: { type: "array", maxItems: L.characterModel.speechItems, items: object({ phrase: str("A verbal tic or gesture.", L.characterModel.listText), frequency: { type: "string", enum: ["rare", "sometimes", "often"] } }) },
        neverSays: { type: "array", maxItems: L.characterModel.speechItems, items: str("What they never say.", L.characterModel.listText) },
        address: { type: "array", maxItems: L.characterModel.speechItems, items: object({ actorRef: { type: "string", minLength: 1, maxLength: 200 }, form: { type: "string", enum: ["ты", "вы"] } }) },
      }), description: "How the person talks (replaces the stored profile); every line of theirs comes from it. Tic frequency: rare once a session, sometimes once a scene, often never twice in one exchange." }),
      foldEpisodes: opt({ ...object({ keep: { type: "integer", minimum: 1, maximum: L.characterModel.episodes, description: "How many of the newest stored episodes to keep." }, summary: str("One episode that stands for the older ones.", L.characterModel.longText) }),
        description: "When the episode list is full: fold the stored older episodes into one summary episode, then append the new ones from episodes." }),
    }),
  },
  {
    name: "note_world",
    strict: { anthropic: false },
    description: "Private DM notes about the world: facts (set), clocks (set or advance by an amount), factions, consequences, and off-screen plans. Keys are stable identifiers (lowercase, dashes). A plan is a fact whose key starts with plan_: who pursues what, when it comes due (in game minutes from now), the consequence and whether the hero gets a fair warning; the receipts of advance_time, move_party and rest list the plans that came due, and you resolve a plan by setting planStatus. A note that stopped being true is closed (operation close), not overwritten; recall still finds it. The player never sees these.",
    parameters: object({
      kind: { type: "string", enum: ["fact", "clock", "faction", "consequence"] },
      key: { type: "string", minLength: 1, maxLength: 120, pattern: "^[a-zA-Z0-9_-]+$" },
      operation: { type: "string", enum: ["set", "advance", "close"] },
      value: opt(str("The note (set); for a plan: the goal and the steps in a few lines.", 2000)),
      amount: opt({ type: "integer", minimum: 0, maximum: 100, description: "Clock advance (advance)." }),
      actorRef: opt({ type: "string", minLength: 1, maxLength: 200, description: "Plan: who pursues it (a character or faction reference: an ID, a local key or an exact name), or \"world\" for a plan that belongs to nobody in particular (weather, the tide, the law)." }),
      dueInMinutes: opt({ type: "integer", minimum: 0, maximum: 525600, description: "Plan: game minutes from now until the next step lands." }),
      consequence: opt(str("Plan: what happens when it lands and nobody interferes.", L.maxShortText)),
      warning: opt(str("Plan: the fair warning the hero may notice before it lands (empty: none).", L.maxShortText)),
      planStatus: opt({ type: "string", enum: ["open", "done", "dropped"], description: "Plan: resolve it (done or dropped) or reopen it with a new due time." }),
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
    description: "Party property with its own storage: a transport (cart, boat, ship), a base (house, camp site, hideout) or a mount. create, update, remove. Items can be transferred to a holding by its reference. Public details the hero knows: features (a cabin, a forge), armament, passengerRefs (crew and people aboard).",
    strict: { anthropic: false },
    parameters: object({
      action: { type: "string", enum: ["create", "update", "remove"] },
      holdingRef: opt(ref("Existing holding.")),
      localKey: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9_-]+$" }),
      kind: opt({ type: "string", enum: ["transport", "base", "mount"] }),
      name: opt(str("Name.", L.maxName)),
      description: opt(str("Description, capacity, condition.", L.maxLongText)),
      features: opt({ type: "array", maxItems: 12, items: object({ name: str("Feature name.", L.maxName), description: str("What it gives.", L.maxShortText) }), description: "Replace the list of features." }),
      armament: opt(str("Armament as text (empty: none).", L.maxShortText)),
      passengerRefs: opt({ type: "array", maxItems: 20, items: ref("A person aboard or living here."), description: "Replace the list of passengers and crew." }),
    }),
  },
  {
    name: "finish_turn",
    description: "Call once when the narration is complete: what kinds of scene this turn was, which characters and threads were in focus, whether you hand the decisive moment to the player (playerMoment: only after a SUCCESSFUL player-visible roll that decides a tense or climactic scene — finishing an important enemy, the decisive act of a scene; the turn ends with an invitation and the player's next input describes the moment within the already accepted result; the server refuses the flag on any other turn), how tense the next turn will be (nextTension: calm, tense or climax — the depth of thinking follows it), and, when you learned something new about what the player enjoys, a short playerLikes note.",
    parameters: object({
      sceneKinds: { type: "array", minItems: 1, maxItems: 4, items: { type: "string", enum: [...SCENE_KINDS] } },
      spotlight: { type: "array", maxItems: 12, items: ref("A character in focus.") },
      playerMoment: { type: "boolean" },
      nextTension: opt({ type: "string", enum: [...TENSION_CLASSES] }),
      threadRefs: opt({ type: "array", maxItems: 8, items: ref("A thread, debt, promise or quest this turn touched.") }),
      playerLikes: opt(str("A NEW observation of what the player enjoys (themes, scene kinds, pace), one or two short lines; it is appended to your notes (they are never rewritten whole), so only what the notes do not hold yet; up to 1200 characters (longer is clipped). The player's own words in the dossier are theirs — never repeat or rewrite them here.", L.maxLongText)),
      npcRefused: opt({ type: "boolean", description: "True when a character refused, bargained down or walked away from the hero this turn." }),
      ownerRule: opt(str("Only a standing table rule the player wrote OUT OF GAME this turn, in one line; it becomes an owner-pinned fact. Never invented.", 300)),
    }),
  },
];

export const DM_LOOP_TOOL_NAMES = dmLoopTools.map((tool) => tool.name);
