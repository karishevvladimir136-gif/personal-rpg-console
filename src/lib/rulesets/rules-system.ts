// Fix S3 item 3 (docs/stages/FINDINGS_S3.md, «The rules system is set at creation»): the campaign's rules-system
// setting, which the 5e module (`isFifthEdition`) and the rules module (`rulesOnByDefault`) read by its label. A new
// campaign whose world names D&D 5e or Pathfinder is created with that label; the stored ruleset id the turn path
// needs (`world-logic-v1`) never changes, only the label. Words in Russian and English, no model call. The owner's
// choice on «Правила и кости» always wins: creation fills in only the bootstrap's own untouched default.
// Pure, client-safe.
import type { CampaignSettings, RulesSystem } from "../campaign-settings.ts";
import type { CampaignSnapshot, MutationInput } from "../persistence/contracts.ts";
import { isFifthEdition } from "../live2d/battle/rules-5e.ts";

export type RulesSystemChoice = "world" | "dnd5e" | "pathfinder";
export const RULES_SYSTEM_CHOICES: readonly RulesSystemChoice[] = ["world", "dnd5e", "pathfinder"];
/** The label the bootstrap gives a new World Logic campaign (migration 202609300031). */
export const WORLD_LOGIC_LABEL = "World Logic";
const NAMED_LABEL = { dnd5e: "D&D 5e", pathfinder: "Pathfinder" } as const;
/** The label a campaign returns to when the owner picks no named system, by its stored ruleset id. */
const OWN_LABEL: Record<string, string> = { "world-logic-v1": WORLD_LOGIC_LABEL, "console-basic-v1": "Console basic house rules" };
const PATHFINDER_LABEL = /pathfinder|(?:^|[^\p{L}])pf\s?[12]|следопыт|пасфайндер/iu;

type System = Pick<RulesSystem, "id" | "label">;

/** Which named system the setting carries: the 5e module's own test first, then Pathfinder; anything else is the world's own logic. */
export function rulesSystemChoice(system: System | null | undefined): RulesSystemChoice {
  if (isFifthEdition(system)) return "dnd5e";
  return PATHFINDER_LABEL.test(system?.label ?? "") ? "pathfinder" : "world";
}

/** The setting with the owner's choice: only the label changes (the id stays what the turn path reads); the same choice keeps it as it is. */
export function withRulesSystemChoice(system: RulesSystem, choice: RulesSystemChoice): RulesSystem {
  if (rulesSystemChoice(system) === choice) return system;
  return { ...system, label: choice === "world" ? OWN_LABEL[system.id] ?? "Custom rules" : NAMED_LABEL[choice] };
}

// --- naming a system in a world's description ----------------------------------------------------------------------
const DND = /(?<![\p{L}\p{N}&])(a?d\s?&\s?d|dnd|днд|д\s?&\s?д|dungeons\s*(?:&|and)\s*dragons|подземель\p{L}*\s+и\s+дракон\p{L}*)(?![\p{L}])/giu;
/** An edition other than the fifth right after the name («D&D 3.5», «ДнД 4-й редакции»); «AD&D» is the old game too. */
const OTHER_DND = /^\s*[(,:—-]?\s*(?:3\.5|[1-4](?:e|st|nd|rd|th|[-‑]?(?:я|й|ая|ой)|\s*(?:ed|edition|ред))|трет\p{L}*|четв[её]рт\p{L}*|втор\p{L}*\s+ред|перв\p{L}*\s+ред|(?:first|second|third|fourth)\s+edition)/iu;
const FIFTH = /(?<![\p{L}\p{N}.])(5e|5th\s+edition|5[-‑]?(?:я|й|ая|ой)\s+редакц\p{L}*|пят(?:ая|ой|ую)\s+редакц\p{L}*|srd\s*5(?:\.[12])?)(?![\p{L}\p{N}])/giu;
/** Words before a bare «5e» that keep it a rules word; any other capitalised name before it is another game's edition («Shadowrun 5e»). */
const RULE_WORD = /^(?:правил\p{L}*|систем\p{L}*|редакц\p{L}*|по|на|в|во|и|rules?|system|edition|by|using|uses?|in|on|with|and|plays?|играем)$/iu;
/** «Pathfinder», «PF2e», «Пасфайндер»; the plain English noun («a pathfinder») only with an edition. */
const PATHFINDER = /(?<![\p{L}\p{N}])(?:Pathfinder|PATHFINDER|pathfinder(?=\s*(?:[12]e|[12](?![\p{N}.])|remaster|second|first))|[pP][fF]\s?[12]e?|[Пп]асфайндер\p{L}*)(?![\p{L}\p{N}])/gu;
/** «Следопыт» as the system's Russian name, never the plain word («следопыты в лесу», «правила следопытов»): the
 * capitalised singular after «правила»/«система», in quotes or with an edition. */
const SLEDOPYT = /(?:(?:[Пп]равил\p{L}*|[Сс]истем\p{L}*|НРИ)\s+[«"„“]?Следопыт(?:а|у|ом|е)?(?![\p{L}])|[«"„“]Следопыт(?:а|у|ом|е)?[»"”“]|Следопыт(?:а|у|ом|е)?\s+(?:[12]e|[12][-‑]?(?:я|й|ая|ой)\s+редакц|(?:[Пп]ерв|[Вв]тор)\p{L}*\s+редакц))/gu;
/** «не D&D», «not a D&D game», «без ДнД», «вместо Pathfinder»: a name the text turns away from. */
const NEGATED = /(?:^|[^\p{L}])(?:не|без|кроме|вместо|not|no|without|instead\s+of)\s+(?:[\p{L}-]+\s+)?[«"„“]?$/iu;

/** The rules system a world's description names, or null: the earliest mention the text does not turn away from. */
export function detectRulesSystem(text: string): { choice: "dnd5e" | "pathfinder"; label: string } | null {
  const found: { at: number; choice: "dnd5e" | "pathfinder" }[] = [];
  const negated = (at: number) => NEGATED.test(text.slice(Math.max(0, at - 40), at));
  for (const match of text.matchAll(DND)) {
    const at = match.index, end = at + match[0].length;
    if (!negated(at) && !/^a/iu.test(match[1]) && !OTHER_DND.test(text.slice(end, end + 30))) found.push({ at, choice: "dnd5e" });
  }
  for (const match of text.matchAll(FIFTH)) {
    const at = match.index;
    const before = /([\p{L}\p{N}&.-]+)\s*[«"„“]?$/u.exec(text.slice(Math.max(0, at - 40), at))?.[1] ?? "";
    if (!negated(at) && !(/^\p{Lu}/u.test(before) && !RULE_WORD.test(before))) found.push({ at, choice: "dnd5e" });
  }
  for (const match of [...text.matchAll(PATHFINDER), ...text.matchAll(SLEDOPYT)])
    if (!negated(match.index)) found.push({ at: match.index, choice: "pathfinder" });
  const earliest = found.sort((a, b) => a.at - b.at)[0];
  return earliest ? { choice: earliest.choice, label: NAMED_LABEL[earliest.choice] } : null;
}

/** At creation: the rules system the world names, only over the bootstrap's own untouched World Logic default and
 * only when no earlier revision carried a named system; null leaves the campaign as it is. */
export function rulesSystemAtCreation(current: RulesSystem, history: readonly { values: Pick<CampaignSettings, "rulesSystem"> }[], worldText: string): RulesSystem | null {
  if (current.id !== "world-logic-v1" || current.label !== WORLD_LOGIC_LABEL) return null;
  if (history.some((row) => rulesSystemChoice(row.values?.rulesSystem) !== "world")) return null;
  const found = detectRulesSystem(worldText);
  return found ? { ...current, label: found.label } : null;
}

/** The settings save that gives a just-created campaign its world's rules system, or null when nothing changes. */
export function creationRulesSystemSave(snapshot: Pick<CampaignSnapshot, "campaign" | "settings" | "settingsHistory" | "timeline">, world: { title: string; premise: string }): MutationInput | null {
  const rulesSystem = rulesSystemAtCreation(snapshot.settings.values.rulesSystem, snapshot.settingsHistory ?? [], `${world.title}\n${world.premise}`);
  if (!rulesSystem || !snapshot.timeline) return null;
  return { operation: "settings.save", campaignId: snapshot.campaign.id, expectedRevision: snapshot.settings.revision, timeline: snapshot.timeline,
    correctionScope: "timeline", payload: { ...snapshot.settings.values, rulesSystem } };
}
