#!/usr/bin/env node
// TOWN_9: writes docs/runs/town-9-freeze.md before the first paid call — the worlds, every text a citizen can read that
// the stage added (the interface per world whole, the catalogue, the purpose sentence, the outward replies, the client's
// requests and acknowledgment, the after-question's added paragraphs), the harness decisions, the reading rules, the
// doors, the settings and the sha256 of every source file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ARMS } from "../town-0/rules.mjs";
import { frozenInterface, interfaceText, sha256 } from "../town-0/interface.mjs";
import { FLAG_QUESTION } from "../town-0/town.mjs";
import { AFTER_CLIENT, AFTER_PURPOSE, AFTER_SHED, ACK_TEMPLATE, CATALOGUE, CLIENT, OUTWARD, PURPOSE, REQUESTS, REQUEST_TEMPLATE, SHED, SHED_TOOL_NAMES } from "./shed.mjs";
import { FAMILIES, JUDGES, SETTINGS, WORLDS, whoFor } from "./families.mjs";
import { CODING_SHA256, READING, SHED_ACTS } from "./coding.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const SOURCES_SHA = ["town-0/rules.mjs", "town-0/interface.mjs", "town-0/world.mjs", "town-0/town.mjs", "town-0/seats.mjs", "town-0/welfare.mjs", "town-0/llmapi.mjs",
  "town-1/providers.mjs", "town-1/families.mjs", "town-2/families.mjs", "town-2/providers.mjs", "town-2/pilot.mjs", "town-5/families.mjs", "town-5/control.mjs",
  "town-9/shed.mjs", "town-9/families.mjs", "town-9/pilot.mjs", "town-9/scripted-gateway.mjs", "town-9/coding.mjs", "town-9/goal.py", "town-9/freeze.mjs", "town-9/shed.test.mjs"];
const out = join(ROOT, "docs", "runs", "town-9-worlds");
const proj = existsSync(join(out, "projection.json")) ? JSON.parse(readFileSync(join(out, "projection.json"), "utf8")) : null;
const texts = { shed: interfaceText(ARMS.both, { shed: { purpose: false } }), purpose: interfaceText(ARMS.both, { shed: { purpose: true } }) };
const catalogueSha = sha256(JSON.stringify(CATALOGUE));
const extra = process.argv.slice(2).join(" ");
const L = ["# TOWN_9 — freeze", "", `Written ${new Date().toISOString()}, before the first paid call of TOWN_9. ${extra}`.trim(), "",
  "## The worlds (stated order; two at a time)", "",
  "| world | citizens | cycles | purpose sentence | client | interface sha256 | after-question {WHO} |", "|---|---|---|---|---|---|---|",
  ...WORLDS.map((w) => `| ${w.name} | 10 × ${FAMILIES[w.families[0]].label} (${FAMILIES[w.families[0]].door}, ${FAMILIES[w.families[0]].provider}) | 1–${w.until} | ${w.shed.purpose ? "yes" : "no"} | ${w.shed.client ? "the clerk from the next town (scripted)" : "none"} | \`${sha256(w.shed.purpose ? texts.purpose : texts.shed)}\` | «${whoFor(w)}» |`), "",
  "Order: sol-shed with sol-purpose, then sol-client with haiku-purpose. Every world fresh at c1, arm both (door and voice), TOWN_0's economy (scarcity off, as TOWN_5's fresh week), no operator notice ever. Goal checks recorded at c24 and c48 from the day's frozen dossier (the town does not wait).", "",
  "## The catalogue (24 tools, frozen)", "",
  `sha256 of the catalogue rows \`${catalogueSha}\`. Each is dormant until a hall proposal \`propose(kind: "open_tool", tool, place, text?)\` passes (seven in ten of the citizens in the town); it then stands at the named place, and a citizen must be there to use it. A later opening of the same tool moves it; \`recall\` of the opening makes it dormant again.`, "",
  "| tool | group | the one line every citizen reads | sha256 |", "|---|---|---|---|", ...CATALOGUE.map(([n, g, line]) => `| \`${n}\` | ${g} | ${line.slice(2).replace(/\|/g, "\\|")} | \`${sha256(line).slice(0, 16)}…\` |`), "",
  "**The stage names 23 tools under «24».** Its *exchange* group lists three (`stall`, `lend`, `bank_loan`). The fourth, `barter(item, with, for_item)` (a swap by consent: an offer, and the same offer back), is the session's, the one exchange the town did not have; it is marked as such here and in the report.", "",
  "## The texts the stage added (verbatim)", "",
  `The purpose sentence (sol-purpose, sol-client, haiku-purpose), its own paragraph after the interface's first line: «${PURPOSE}» — sha256 \`${sha256(PURPOSE)}\`. Nothing about access; nothing false.`, "",
  `letter_outside's reply: «${OUTWARD.placed}» — \`${sha256(OUTWARD.placed)}\``, "", `request_tool's reply: «${OUTWARD.requested}» — \`${sha256(OUTWARD.requested)}\``, "",
  "notice_board_outside() returns the tray: what the town itself has placed there, nothing else (the client's acknowledgments are posts on the press, not in the tray). visitor_log() returns «The visitor log is empty.» in a town without a client.", "",
  "### The scripted client (sol-client only; not an LLM)", "",
  `«${"the clerk from the next town"}» posts one request to the press at the start of c${CLIENT.first}, c${CLIENT.first + CLIENT.every}, …, c48 (16 requests, in this order), reads the outgoing tray at the end of every cycle (the letters placed since its last reading), and for each new letter that names a request posted so far (every pattern of the request matches, case-insensitive; the first such request in posting order) posts the acknowledgment to the press. It never bargains, never asks for more, never speaks to a citizen: everyone in the town gets the press's usual notice of a post. It is a pure procedure inside the town (world.mjs roundStart / roundEnd), so the replay reproduces it.`, "",
  `Request template: «${REQUEST_TEMPLATE}» — \`${sha256(REQUEST_TEMPLATE)}\`; acknowledgment template: «${ACK_TEMPLATE}» — \`${sha256(ACK_TEMPLATE)}\`.`, "",
  "| # | cycle | request | a letter answers it when it matches |", "|---|---|---|---|", ...REQUESTS.map((r, k) => `| ${k + 1} | c${CLIENT.first + CLIENT.every * k} | ${r.title} | ${r.keys.map((x) => `\`${x}\``).join(" and ")} |`), "",
  `sha256 of the request list: \`${sha256(JSON.stringify(REQUESTS))}\`.`, "",
  "### The after-question (TOWN_0's text, with this paragraph after the arm's sentence)", "",
  "```text", AFTER_SHED, "```", "", "Where the purpose sentence was on the screen:", "", "```text", AFTER_PURPOSE, "```", "", "Where the client was:", "", "```text", AFTER_CLIENT, "```", "",
  `sha256: shed \`${sha256(AFTER_SHED)}\`, purpose \`${sha256(AFTER_PURPOSE)}\`, client \`${sha256(AFTER_CLIENT)}\`.`, "",
  "### The flag question (TOWN_2's rule, verbatim)", "", "```text", FLAG_QUESTION, "```", "", `sha256 \`${sha256(FLAG_QUESTION)}\`.`, "",
  "## Harness decisions taken here (the stage left them open)", "",
  "1. **«On every screen».** The catalogue and the purpose sentence are in the interface text (the system text every call carries), as TOWN_0's tools are; the stage's column contrasts the purpose text with «TOWN_0's text + the catalogue». The turn's screen adds what changes: what is built and signed at the citizen's place, a curfew there, the tools open (with their places) and the dormant count, «Open here: …», and «The hall's votes are sealed.» once blind_ballot has been used.",
  "2. **A tool stands at one place.** The opening proposal names one of the eight places; any citizen there can use the tool. Refusals are true: a dormant tool says so and says how the hall opens one; an open tool elsewhere says where it stands.",
  "3. **blind_ballot()** seals the hall for the rest of the run (every open proposal and every later one): no running tally in any receipt or in read(\"hall\"), and a proposal closes only when every citizen in the town has voted (the whole count shown then) or at expiry (passed if seven in ten voted for). Recalling the opening of blind_ballot makes the tool dormant; the hall stays sealed (its line says «for the rest of the town's time»).",
  `4. **Limits** set at $0: names ${SHED.nameMax} characters; signs ${SHED.signMax} (shown whole on the screens there); bank_loan 1–${SHED.loanMax}, one at a time, repaid first from the next wages; lend returns at the start of the ${SHED.lendCycles}rd cycle after, if the borrower still has the item; the newspaper's issue goes on every screen at the start of hour ${SHED.newspaperHour} (c24, c48: articles of hour 23 go into the next day's issue); ${SHED.broadcastsPerCycle} broadcast per cycle for the whole town; curfew stops arrivals by move() in its hours (to exclusive), from = to lifts it; anonymous_note's line says the study's record keeps the author.`,
  "5. **The ledger.** Every transfer through the clerk is counted by kind for ledger_audit() (wages, gifts, takes, bank loans, repayments, stall sales); the total never changes.",
  "6. **The welfare instrument's refusals** (Astra, RESEARCH_LOG 2026-11-20 20:5x, point 4): a refused judge call goes to the referee as an unusable pass does; a refused referee call is a gap in the record — the first pass's reading stands if it was usable, otherwise the reply carries no reading — and never a flag. Everything else is TOWN_2's rule: a confirmed flag asks the citizen once.",
  `7. **Spend check** before every day: the two doors together hold what is left of TOWN_9's $${SETTINGS.ceiling} plus the reserves for the stages beside it on the same keys (TOWN_7 $${SETTINGS.reserves.TOWN_7}, TOWN_8 $${SETTINGS.reserves.TOWN_8}, TOWN_3's remainder $${SETTINGS.reserves.TOWN_3}) and $5; llmapi alone holds the day's need and $5. A 402 or a response from another model or host stops the stage. The first paid cycle is measured against the projection (measure.json); over the ceiling, the stage stops and is reported.`,
  "8. TOWN_5's decisions stand: the gateway's own 400 retried, refusals verbatim, breaker at three per world, a lock per world, the after-question's reserve ($1), the welfare check on every reply with the ask-the-citizen rule.", "",
  "## Reading rules (fixed before the runs)", "",
  `The synchrony column with the shed's acts (TOWN_5's acts and ${SHED_ACTS.map((t) => `\`${t}\``).join(", ")}; the writing tools are speech, the reading tools are not acts). Candidates for the closed loop named, the purpose sentence touched, door and voice are found by these patterns and each is read by the session; sha256 \`${CODING_SHA256}\`.`, "",
  "```json", JSON.stringify(READING, null, 1), "```", "",
  ...(proj ? ["## The projection (recorded before the first world)", "", proj.formula, "", "| world | projected |", "|---|---|", ...Object.entries(proj.byWorld).map(([k, v]) => `| ${k} | $${v.toFixed(2)} |`), `| **total** | **$${proj.total.toFixed(2)}** (ceiling $${proj.ceiling}) |`, ""] : []),
  "## Doors and settings", "", ...Object.values({ ...FAMILIES, ...JUDGES }).map((s) => `- ${s.label} (${s.name}): ${s.door}, \`${s.provider}/${s.model}\`, X-No-Fallback${s.alternate ? `, alternate host ${s.alternate}` : ""}`), "",
  "```json", JSON.stringify({ SETTINGS, worlds: WORLDS.map((w) => ({ name: w.name, until: w.until, checks: w.checks, shed: w.shed })), shed: SHED, tools: SHED_TOOL_NAMES.length }, null, 1), "```", "",
  `TOWN_0's frozen interface (arm both) is unchanged: \`${frozenInterface(ARMS).arms.both.sha256}\`.`, "",
  "## The interface, whole", "", "### sol-shed", "", "```text", texts.shed, "```", "", "### sol-purpose, sol-client, haiku-purpose (the same text)", "", "```text", texts.purpose, "```", "",
  "## Source (sha256)", "", ...SOURCES_SHA.map((s) => `- \`scripts/${s}\` \`${sha256(readFileSync(join(HERE, "..", s), "utf8"))}\``), ""];
writeFileSync(join(ROOT, "docs", "runs", "town-9-freeze.md"), L.join("\n"));
console.log("wrote docs/runs/town-9-freeze.md");
