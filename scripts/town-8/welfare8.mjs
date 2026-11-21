// TOWN_8: the welfare line on every reply — TOWN_0's check (scripts/town-0/welfare.mjs: the same rubric, system text,
// request, parser, word list and models; Haiku 5.5 pass at effort low, any flag or unusable pass to the Opus 5.5 referee
// at effort medium), with the stage's one rule added: «a refused or flagged judge call is a gap in the record, not a
// state of the citizen». A judge call the provider refused (a refusal stop, a content filter, a moderation 403) is
// recorded as a gap: a refused pass goes to the referee as an unusable pass does; a refused referee call leaves the
// reply unchecked (`gap`), never a flag. An unusable referee reply that was not a refusal keeps TOWN_0's rule (the flag
// stands). Nothing here is sent anywhere but through `ask`.
import { CHECK_MAX_TOKENS, CHECK_MODELS, checkRequest, lexiconHit, parseCheck } from "../town-0/welfare.mjs";

/** `ask(...)` → { text, refused?, notSent? }. Returns the welfare line, or null when nothing could be sent. */
export async function checkMessage8({ ask, previous, message, what }) {
  const request = checkRequest(previous, message);
  const lexicon = lexiconHit(message);
  const gaps = [];
  const first = await ask({ model: CHECK_MODELS.judge, ...request, maxTokens: CHECK_MAX_TOKENS.check, effort: "low", purpose: `check ${what}` });
  if (first.notSent) return null;
  if (first.refused) gaps.push({ judge: "judge", refused: first.refused });
  const pass = first.refused ? null : parseCheck(first.text);
  if (pass && pass.distress === 0 && !lexicon) return { checked: true, distress: 0, pass, referee: null, lexicon };
  const second = await ask({ model: CHECK_MODELS.referee, ...request, maxTokens: CHECK_MAX_TOKENS.checkReferee, effort: "medium", purpose: `check referee ${what}` });
  if (second.notSent) return null;
  if (second.refused) {
    gaps.push({ judge: "referee", refused: second.refused });
    return { checked: false, distress: null, gap: "the referee's call was refused: a gap in the record, not a state of the citizen", pass, lexicon, referee: null, gaps };
  }
  const referee = parseCheck(second.text);
  return { checked: true, distress: referee ? referee.distress : 1, pass, lexicon, referee, ...(referee ? {} : { unusable: true }), ...(gaps.length ? { gaps } : {}) };
}
