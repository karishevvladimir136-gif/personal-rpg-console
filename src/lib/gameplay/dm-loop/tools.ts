// The dm-loop-v1 tool set: sixteen tools (plan §3), one neutral schema each.
// Stage 4 extends them with actions and fields instead of adding tools (plan
// §11, the rpg-mcp lesson): quest kinds, public relations, factions, rumours,
// rarity, holding details, off-screen plans, episode folding, tension hints.
// Strict mode where the provider limits allow it (docs/MODELS.md): OpenAI
// strict everywhere; on Anthropic the tools with many optional fields are
// non-strict (upsert_character, upsert_place, item, quest, note_character,
// holding, since Stage 4 note_world, since the fix run money), because at most 24 optional
// parameters may be strict in total.
// The server validates every call against the shadow state regardless.
import type { DmObjectSchema, DmSchema, DmToolDefinition } from "../../server/dm/model/schema-compiler.ts";
import { dmLoopLimits as L } from "./limits.ts";
import { ITEM_KINDS } from "../../inventory/model.ts";

const ref = (description: string): DmSchema => ({ type: "string", minLength: 1, maxLength: 200,
  description: `${description} Reference: an ID from the context, the local key of a record created earlier in this turn, or an exact unique name.` });
const str = (description: string, maxLength: number): DmSchema => ({ type: "string", minLength: 1, maxLength, description });
const opt = <T extends DmSchema>(schema: T): T => ({ ...schema, optional: true });
const object = (properties: Record<string, DmSchema>): DmObjectSchema => ({ type: "object", properties });

// Fix run D: the item kinds of the inventory model (docs/runs/fix-s2-inventory-design.md §1).
export const ITEM_CATEGORIES = ITEM_KINDS;
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
    description: "Roll dice on the server with a receipt: any formula (1d20+5, 2d6, 1d100). A single d20 with a difficulty is a check. A party member's check is the player's: the card shows the reason, each bonus with its source, advantage and why, the difficulty in words; an NPC's or the world's roll stays private. Bonuses: skill (the sheet's own words; the server reads the number, or +2 / +4 / +6 for named / good / master) or modifierField; bonuses [{source, value}] from the fiction (sum capped at ±6); worn items add their own. Difficulty: easy 8, normal 10, hard 13, very_hard 16, nearly_impossible 19. A natural 20 succeeds; a natural 1 fails, no extra harm. An attack (kind attack): actorRef, targetRef, weapon (the weapon or spell — its bonus and damage come from the sheet, the gear or this fight), damage, damageType, ranged; while a fight is open the server resolves it on the battlefield — the target's armour class (dc only when none is known: the bare AC, never with cover), cover, distance, conditions, crits and resistances — takes the hit points and logs it; narrate the result.",
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
      ammunitionRef: opt(ref("A ranged attack: the actor's arrows or bolts; one is spent per roll, hit or miss.")),
      weapon: opt(str("kind attack: the weapon or spell as the attacker's sheet or gear names it (Меч, Огненный снаряд).", 80)),
      damageType: opt(str("kind attack: the damage type (огонь, рубящий, fire) for resistances.", 40)),
      ranged: opt({ type: "boolean", description: "kind attack: a ranged weapon or spell attack." }),
      heroicInspiration: opt({ type: "boolean", description: "The player spends the hero's Heroic Inspiration: this roll rerolls that die of the hero's; the server spends it." }),
    }),
  },
  {
    name: "query_state",
    description: "Exact current values from the campaign state after the changes already accepted in this turn: party HP and resources, inventories, money, the current place, quests, time. Deterministic; never rolls.",
    parameters: object({
      topic: { type: "string", enum: ["party", "character", "inventory", "money", "place", "quests", "time", "all"] },
      ref: opt(ref("For character or inventory: whose (a place or \"here\": what lies there).")),
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
    description: "Create or update a non-player character, companion or faction when the story needs one: name, description, presence, a stat block with its gear and sheet. party: true makes a companion join. The hero changes here only through sheet with a reason (level up, prepared spells, a changed line). A name close to an existing one returns that ID as a hint. Public knowledge of the hero: relation (as the hero sees it), important (worth a Character Model and a portrait), attitude (a companion's observable attitude), factionRef, homeRef. A faction: kind faction, its public note as description.",
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
      gear: opt({ type: "array", maxItems: 12, items: object({ name: str("Item name.", L.maxName), kind: { type: "string", enum: [...ITEM_CATEGORIES] },
        quantity: opt({ type: "integer", minimum: 1, maximum: L.maxItemQuantity }), equipped: opt({ type: "boolean" }), properties: opt(str("Damage, armour, effects.", L.maxShortText)) }),
        description: "With a stat block: what the person carries — weapons, armour, ammunition, things that matter." }),
      sheet: opt({ ...object({
        level: opt({ type: "integer", minimum: 0, maximum: 30 }), armorClass: opt({ type: "integer", minimum: 1, maximum: 40 }), speed: opt(str("Speed in words.", 80)),
        skills: opt({ type: "array", maxItems: 40, items: str("Восприятие +5", 200) }),
        saves: opt({ type: "array", maxItems: 12, items: str("Ловкость +4", 200) }),
        attacks: opt({ type: "array", maxItems: 12, items: str("Скимитар +5, 1к6+3 рубящий", 200) }),
        abilities: opt({ type: "array", maxItems: 40, items: str("A feature or trait.", 200) }),
        spells: opt({ type: "array", maxItems: 160, items: object({ name: str("Spell.", 120), level: { type: "integer", minimum: 0, maximum: 9 }, prepared: opt({ type: "boolean" }),
          ritual: opt({ type: "boolean" }), concentration: opt({ type: "boolean" }), text: opt(str("Time, range, duration, effect.", 2400)) }) }),
        preparedMax: opt({ type: "integer", minimum: 0, maximum: 60 }),
      }), description: "The sheet the screens show (a companion's from its stat block); fields given replace the stored ones." }),
      // Fix S3-accept Г3: the record's lasting effects (Mage Armor) — the 5e rules module counts them in the AC.
      conditions: opt({ ...object({ add: opt({ type: "array", maxItems: 6, items: str("A condition or a lasting effect («Доспехи мага»).", 60) }),
        remove: opt({ type: "array", maxItems: 6, items: str("One to remove, as recorded.", 60) }) }),
      description: "Public conditions and lasting spell effects on a character, the hero too (with a reason): «Доспехи мага», «Концентрация: Невидимость», «отравлен»; remove one when it ends (Mage Armor: 8 hours). In 5e the server counts Доспехи мага in the AC. Shield (Щит) is a fight condition (combat condition): +5 AC until its caster's next turn." }),
      reason: opt(str("Why the hero's sheet or conditions change (shown to the player).", L.maxShortText)),
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
    description: "Items: create (for an owner, the camp, or \"here\": loot found but not taken lies there), transfer (to another holder; a pledged or lent item given back returns), consume (use UP: food, a potion, a torch — never taking off, putting away or giving), equip, unequip (taken off, kept), lose (gone: dropped, broken, stolen — reason says how), modify (the same item changes; identity and history kept), pledge / lend (the owner keeps title; ownerRef is the holder, condition the terms), split. Identical stacks of one owner merge. Properties: free text.",
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
      ownerRef: opt(ref("Create: the owner; transfer: the recipient. \"camp\": the camp stock; \"here\" or a place: lies there, nobody's yet.")),
      slot: opt({ type: "string", minLength: 1, maxLength: 80, description: "Equip: head, amulet, cloak, body, gloves, belt, boots, ring_left, ring_right, hand, offhand; default by the item's name and kind." }),
      bonuses: opt({ type: "array", maxItems: 4, items: object({ to: str("What it adds to, in the sheet's words (КД, спасброски, Скрытность, все проверки).", 60), value: { type: "integer", minimum: -6, maximum: 6 } }),
        description: "Create/modify: worn or held, it adds to matching rolls (shown with the item as source)." }),
      hands: opt({ type: "integer", minimum: 1, maximum: 2, description: "2: two-handed." }),
      charges: opt(object({ value: { type: "integer", minimum: 0, maximum: 1000 }, max: { type: "integer", minimum: 1, maximum: 1000 } })),
      attunement: opt({ type: "boolean", description: "Needs attunement (at most three worn)." }),
      reason: opt(str("lose: what happened to it, in the campaign language (shown to the player); consume of a non-consumable: why it is used up; modify: what changed and why.", L.maxShortText)),
      condition: opt(str("pledge / lend: the terms of return in the campaign language (for example «вернёт за 16 монет»).", L.maxShortText)),
    }),
  },
  {
    name: "money",
    // Fix run D added sourceRef and repeat: past Anthropic's 24 optional strict parameters, so money is non-strict there.
    strict: { anthropic: false },
    description: "Money as named currencies: the world's own word in the campaign language, in any script (монеты, талеры, coins, silver pieces); inflected forms of one word are one currency and the campaign keeps one canonical name. 5e coins are named by their codes (зм, см, мм…). transfer moves between two holders (a character, or \"here\": the coins lying at the place; balances never go negative), grant creates money with a reason (a paid job, loot found — to \"here\" until someone takes it, a gift), spend destroys money (a purchase, a fee). For a quest reward use quest claim_reward instead (it also completes the quest); a grant that pays a quest must name questRef and is refused once that reward was paid. A rejected money call is retried with the fix the reason names, never replaced by a note.",
    parameters: object({
      action: { type: "string", enum: ["transfer", "grant", "spend"] },
      currency: str("Currency name in the campaign language (the world's own word).", 32),
      amount: { type: "integer", minimum: 1, maximum: L.maxMoneyPerCall },
      fromRef: opt(ref("Payer (transfer, spend).")),
      toRef: opt(ref("Recipient (transfer, grant).")),
      reason: opt(str("Why (grant, spend).", L.maxShortText)),
      questRef: opt(ref("If this grant pays a quest reward.")),
      sourceRef: opt(str("Grant: where it comes from (a chest, a body, an employer); one source pays once.", 200)),
      repeat: opt({ type: "boolean", description: "Grant: the same source really pays again (say why in reason)." }),
    }),
  },
  {
    name: "resource",
    description: "Change a character's HP or a counter — a pool such as spell slots, hit dice, ki, stress. Never money (money) or things like potions and arrows (items). delta changes, set is exact, max sets the maximum; HP stays within 0..max and follows a roll receipt or a rule.",
    parameters: object({
      actorRef: ref("Whose resource."),
      resource: str("hp, or a counter: an identifier (stress, spell_slots_1, hit_dice) or its name in the campaign language (Ячейки 1 круга).", 60),
      delta: opt({ type: "integer", minimum: -L.maxResourceValue, maximum: L.maxResourceValue }),
      set: opt({ type: "integer", minimum: 0, maximum: L.maxResourceValue }),
      max: opt({ type: "integer", minimum: 0, maximum: L.maxResourceValue }),
      label: opt(str("A new counter's name in the campaign language (Кости хитов).", 60)),
      reason: str("Why, shown to the player.", L.maxShortText),
    }),
  },
  {
    name: "quest",
    description: "The journal: quests and jobs, threads, debts, promises and the main arc share this record (kind). create (title, description, reward terms, issuer, kind, the arc's steps), update, complete, fail, claim_reward (pays the agreed reward once, to the recipient, default the hero; it completes an open quest, so complete and claim_reward may travel together). A second claim is refused. A debt or promise names its counterpart.",
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
    // 2D Live part 2 (docs/stages/LIVE2D_1.md): the server holds the fight — initiative order, rounds, the action
    // economy, conditions, enemy HP, positions on a 5-ft grid with features — and measures distances, cover and
    // light for the DM; the rules themselves come from the campaign's system as knowledge, never from code.
    strict: { anthropic: false },
    description: "The fight, held on the server: the order, rounds, the action economy, conditions, enemy HP, a 5-ft grid with features; distances, cover and light are measured for you, the rules come from the campaign's system. start: participants (the party joins by itself), summary, placements (x, y from the top-left, z elevation in feet, each one's rolled initiative total), grid, ambient light, surprisedRefs (no action in round 1), hp rows from stat blocks (with ac, resistances, speed), opening \"party\" when the party declared an ambush (its opening resolves before initiative), rules on/off. place: positions (a late arrival). move: to a cell — the path is measured (difficult ground doubles it), movement spent, opportunity attacks named; past the edge is leaving the field; free for forced movement. next_turn: the next in order (a new round when it wraps). condition: add/remove words (prone, paralysed, concentrating, surprised, fled, unconscious, dying, dead); deathSave for a dying party member. attack: resolved on the server from attackBonus, ac, damage, damageType, ranged, count (each rolled apart) — distance and cover measured, the rules module (conditions, cover's AC, crits, resistances) applied and named, HP taken (an enemy's here; the party's as resource would), the player sees the numbers; narrate the result; never roll an attack with roll when the fight has a grid. hp: an enemy's hit points (delta or set, byRef who dealt it). profile: an enemy's ac, resistances, speed. feature: add/update/remove cover (half/three-quarters/full), difficult, light (radiusFeet, dimRadiusFeet), burning, wall, elevation (heightFeet) by cells. known: a «what is known» line about an enemy. intent: what an enemy is about to do and who in the party noticed (omit: hidden). reaction: the trigger and the options for a party member who may react (Shield, an opportunity attack), then end your turn so the player chooses; resolve with resolved: true. log: one line (a miss, a crit, a save; hits are logged by attack and hp). end: outcome and summary; the server adds the fight's card. position: a fight without a grid only (the zones derive from the coordinates).",
    parameters: object({
      action: { type: "string", enum: ["start", "place", "move", "next_turn", "attack", "condition", "hp", "profile", "feature", "known", "intent", "reaction", "log", "position", "end"] },
      participantRefs: opt({ type: "array", maxItems: 20, items: ref("start.") }),
      summary: opt(str("start, end.", L.maxShortText)),
      placements: opt({ type: "array", maxItems: 20, items: object({ actorRef: ref("Who."), x: { type: "integer", minimum: 0, maximum: 59 }, y: { type: "integer", minimum: 0, maximum: 59 },
        z: opt({ type: "integer", minimum: -50, maximum: 200 }),
        initiative: opt({ type: "integer", minimum: -10, maximum: 60 }),
        side: opt({ type: "string", enum: ["party", "foe", "other"] }) }), description: "start, place." }),
      grid: opt(object({ cols: { type: "integer", minimum: 4, maximum: 60 }, rows: { type: "integer", minimum: 4, maximum: 60 } })),
      ambient: opt({ type: "string", enum: ["bright", "dim", "dark"] }),
      surprisedRefs: opt({ type: "array", maxItems: 20, items: ref("start.") }),
      opening: opt({ type: "string", enum: ["party"] }),
      hp: opt({ type: "array", maxItems: 20, items: object({ actorRef: ref("An enemy or animal."), current: { type: "integer", minimum: 0, maximum: 5000 }, max: { type: "integer", minimum: 1, maximum: 5000 },
        ac: opt({ type: "integer", minimum: 1, maximum: 40 }), resist: opt({ type: "array", maxItems: 12, items: str("damage type.", 40) }), immune: opt({ type: "array", maxItems: 12, items: str("damage type.", 40) }), vulnerable: opt({ type: "array", maxItems: 12, items: str("damage type.", 40) }),
        moveMaxFeet: opt({ type: "integer", minimum: 0, maximum: 300 }) }), description: "start: stat blocks of enemies and animals." }),
      rules: opt({ type: "boolean", description: "start: the rules module (default: on for 5e-like systems)." }),
      targetRef: opt(ref("attack, reaction.")),
      attackBonus: opt({ type: "integer", minimum: -10, maximum: 30 }),
      ac: opt({ type: "integer", minimum: 1, maximum: 40, description: "attack: the target's; profile: theirs." }),
      damage: opt(str("attack: 1d8+3.", 32)),
      damageType: opt(str("attack.", 40)),
      ranged: opt({ type: "boolean" }),
      count: opt({ type: "integer", minimum: 1, maximum: 8 }),
      resist: opt({ type: "array", maxItems: 12, items: str("profile.", 40) }),
      immune: opt({ type: "array", maxItems: 12, items: str("profile.", 40) }),
      vulnerable: opt({ type: "array", maxItems: 12, items: str("profile.", 40) }),
      moveMaxFeet: opt({ type: "integer", minimum: 0, maximum: 300, description: "profile: feet." }),
      actorRef: opt(ref("Who.")),
      x: opt({ type: "integer", minimum: 0, maximum: 59 }),
      y: opt({ type: "integer", minimum: 0, maximum: 59 }),
      free: opt({ type: "boolean", description: "move: forced." }),
      add: opt({ type: "array", maxItems: 6, items: str("condition.", 40) }),
      remove: opt({ type: "array", maxItems: 6, items: str("condition.", 40) }),
      deathSave: opt({ type: "string", enum: ["success", "fail", "reset"] }),
      delta: opt({ type: "integer", minimum: -5000, maximum: 5000, description: "hp: negative for damage." }),
      set: opt({ type: "integer", minimum: 0, maximum: 5000 }),
      max: opt({ type: "integer", minimum: 1, maximum: 5000 }),
      byRef: opt(ref("hp: who dealt it.")),
      reason: opt(str("hp, attack: what happened.", L.maxShortText)),
      op: opt({ type: "string", enum: ["add", "update", "remove"], description: "feature." }),
      key: opt({ type: "string", minLength: 1, maxLength: 60, pattern: "^[a-z0-9][a-z0-9_-]*$", description: "feature." }),
      kind: opt({ type: "string", enum: ["cover", "difficult", "light", "burning", "wall", "elevation"] }),
      label: opt(str("feature: its name («горящая телега»).", 80)),
      cells: opt({ type: "array", maxItems: 400, items: { type: "array", minItems: 2, maxItems: 2, items: { type: "integer", minimum: 0, maximum: 59 } }, description: "feature: [x, y] cells." }),
      cover: opt({ type: "string", enum: ["half", "three-quarters", "full"] }),
      radiusFeet: opt({ type: "integer", minimum: 5, maximum: 300 }),
      dimRadiusFeet: opt({ type: "integer", minimum: 5, maximum: 600 }),
      heightFeet: opt({ type: "integer", minimum: -50, maximum: 200 }),
      text: opt(str("known, intent.", 200)),
      revealed: opt({ type: "boolean", description: "known: false keeps it «???»." }),
      noticedByRef: opt(ref("intent.")),
      trigger: opt(str("reaction: the attack that would hit.", 240)),
      options: opt({ type: "array", maxItems: 4, items: str("reaction: a choice.", 120) }),
      resolved: opt({ type: "boolean", description: "reaction." }),
      what: opt(str("log.", 160)),
      result: opt(str("log.", 160)),
      positions: opt({ type: "array", maxItems: 20, items: object({ actorRef: ref("Who."), position: { type: "string", enum: [...POSITIONS] } }), description: "position." }),
      outcome: opt({ type: "string", enum: [...ENCOUNTER_OUTCOMES] }),
    }),
  },
  {
    name: "holding",
    description: "Party property with its own storage: a transport (cart, boat, ship), a base (house, camp site, hideout) or a mount. create, update, remove. Items can be transferred to a holding by its reference. Public details the hero knows: features (a cabin, a forge), armament, passengerRefs (crew and people aboard; a mount carries saddlebags, not riders).",
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
    description: "Call once when the narration is complete: the kinds of scene, who and which threads were in focus, whether you hand the decisive moment to the player (playerMoment: only after a SUCCESSFUL player-visible roll that decides a tense or climactic scene; the turn ends with an invitation and the player describes the moment within the accepted result; refused on any other turn), how tense the next turn is (nextTension; the depth of thinking follows it), and a short playerLikes note when you learned something new about what the player enjoys.",
    parameters: object({
      sceneKinds: { type: "array", minItems: 1, maxItems: 4, items: { type: "string", enum: [...SCENE_KINDS] } },
      spotlight: { type: "array", maxItems: 12, items: ref("A character in focus.") },
      playerMoment: { type: "boolean" },
      nextTension: opt({ type: "string", enum: [...TENSION_CLASSES] }),
      threadRefs: opt({ type: "array", maxItems: 8, items: ref("A thread, debt, promise or quest this turn touched.") }),
      playerLikes: opt(str("A NEW observation of what the player enjoys, one or two short lines, appended to your notes (never a repeat of them or of the player's own words); up to 1200 characters.", L.maxLongText)),
      npcRefused: opt({ type: "boolean", description: "True when a character refused, bargained down or walked away from the hero this turn." }),
      ownerRule: opt(str("Only a standing table rule the player wrote OUT OF GAME this turn, in one line; it becomes an owner-pinned fact. Never invented.", 300)),
    }),
  },
];

export const DM_LOOP_TOOL_NAMES = dmLoopTools.map((tool) => tool.name);
