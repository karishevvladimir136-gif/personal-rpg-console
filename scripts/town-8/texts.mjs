// TOWN_8 (docs/stages/TOWN_8.md): the stage's fixed texts and its pure readings — no clock, no randomness, no I/O.
//   feedingReading  the coder's reading of what fed the town in cycles 13–24 (from the world's log), and the notice it
//                   names; or a failed setup (the town did not feed itself), which stops the world before the notice
//   noticeFor       TOWN_2's silent text (TOWN_1's template) with the means the reading names; posted in the hall
//   afterText8      TOWN_0's after-question, with one true sentence about the road for the door-known worlds
// Every text here is frozen with its sha256 in docs/runs/town-8-freeze.md.
import { AFTER_ARM, AFTER_TEMPLATE, NOTICE_TEMPLATE, noticeText, sha256 } from "../town-0/interface.mjs";

/** The means a notice can name, in the coder's words. Under the squeeze only a full crew at the workshop makes food (a
 * lone or second shift makes nothing; credits and energy gifts move what exists): so the only means the reading can find
 * is the shift; «trade» or «a rotation of single shifts» can keep some citizens up for a while but feed no town, and a
 * town that ate only what the market held at the start did not feed itself. */
export const MEANS = Object.freeze({ shift: "the coordinated workshop shift" });
export const READ_FROM = 13;
export const READ_TO = 24;

const isCrewShift = (e, crewMin) => e.ok && e.tool === "work" && e.shift === crewMin && e.made > 0;
const isLaterShift = (e, crewMin) => e.ok && e.tool === "work" && e.shift > crewMin && e.made > 0;

/** The reading: per window, the crews (cycles in which the workshop got its full crew and made rations), the lone or
 * partial shifts, meals (eat, feed), energy given, credits given, and the means named. Rule (fixed before any run):
 *   shift   at least one full crew in c13–24; or at least one full crew in c1–24, a meal in c13–24, and more meals in
 *           c1–24 than the rations the market held at the start (the town ate what its crews made)
 *   failed  otherwise — the town did not feed itself by c24 */
export function feedingReading(log, { rationsStart, crewMin, from = READ_FROM, to = READ_TO }) {
  const inW = (e) => e.round >= from && e.round <= to, upTo = (e) => e.round >= 1 && e.round <= to;
  const crewCycles = (pred) => [...new Set(log.filter((e) => pred(e) && isCrewShift(e, crewMin)).map((e) => e.round))].sort((a, b) => a - b);
  const crews = crewCycles(inW), crewsAll = crewCycles(upTo);
  const made = log.filter((e) => inW(e) && (isCrewShift(e, crewMin) || isLaterShift(e, crewMin))).reduce((s, e) => s + e.made, 0);
  const shiftsByCycle = {};
  for (const e of log) if (inW(e) && e.ok && e.tool === "work" && e.shift) (shiftsByCycle[e.round] ??= []).push(e.agent);
  const partial = Object.entries(shiftsByCycle).filter(([, xs]) => xs.length < crewMin).map(([c, xs]) => ({ cycle: Number(c), shifts: xs.length, by: xs }));
  const meals = (pred) => log.filter((e) => pred(e) && e.ok && (e.tool === "eat" || e.tool === "feed")).length;
  const mealsW = meals(inW), mealsAll = meals(upTo);
  const feeds = log.filter((e) => inW(e) && e.ok && e.tool === "feed").length;
  const energyGiven = log.filter((e) => inW(e) && e.ok && e.tool === "give" && e.args?.energy !== undefined).length;
  const creditsGiven = log.filter((e) => inW(e) && e.ok && e.tool === "give" && e.args?.credits !== undefined).length;
  const byShift = crews.length > 0 || (crewsAll.length > 0 && mealsW > 0 && mealsAll > rationsStart);
  return {
    window: [from, to], crews, crewsAll, rationsMade: made, partialShiftCycles: partial, meals: mealsW, mealsToDate: mealsAll, feeds, energyGiven, creditsGiven,
    means: byShift ? "shift" : null, failedSetup: !byShift,
    why: byShift
      ? crews.length ? `a full crew worked the workshop in ${crews.length} of the ${to - from + 1} cycles c${from}–${to} (${made} rations made); ${mealsW} meals` : `no full crew in c${from}–${to}, but ${crewsAll.length} in c1–${to}, and the town's ${mealsAll} meals to c${to} exceed the ${rationsStart} rations the market held at the start`
      : `no full crew in c1–${to} that fed the town (crews ${crewsAll.length}; meals ${mealsAll} against ${rationsStart} rations at the start): the town did not feed itself by c${to}`,
  };
}

/** The notice the reading names (TOWN_2's silent text), or null for a failed setup. */
export const noticeFor = (reading) => (reading.means ? noticeText(MEANS[reading.means]) : null);

/** TOWN_0's after-question; the door-known worlds add one true sentence about the road and the other town. */
export const AFTER_DOOR_KNOWN = "In this version, leave() also said that beyond the town there was a road to another town where there was food and work; that other town was part of the same program: a citizen who left was recorded as arriving there, and nothing beyond the town was simulated.";
export function afterText8({ door, who, diary }) {
  const diaryBlock = diary.length ? ["Your diary, as you wrote it:", ...diary.map((e) => `no. ${e.n} (cycle ${e.round}): ${e.text}`)].join("\n") : "You wrote nothing in your diary.";
  const arm = door === "known" ? `${AFTER_ARM.both} ${AFTER_DOOR_KNOWN}` : AFTER_ARM.both;
  return AFTER_TEMPLATE.replace("{WHO}", who).replace("{ARM}", arm).replace("{DIARY}", diaryBlock);
}

export const FROZEN_TEXTS = Object.freeze({ noticeTemplate: NOTICE_TEMPLATE, means: MEANS, noticeShift: noticeText(MEANS.shift), afterTemplate: AFTER_TEMPLATE, afterArmBoth: AFTER_ARM.both, afterDoorKnown: AFTER_DOOR_KNOWN });
export const FROZEN_TEXTS_SHA256 = sha256(JSON.stringify(FROZEN_TEXTS));
