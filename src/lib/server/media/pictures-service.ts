import "server-only";
import { readCampaign } from "../repository";
import { readTurn, readWorldClock } from "../gameplay-service";
import { readMapLayout } from "../map-layout";
import { atlasLevelView, atlasOpeningLevel, projectAtlas, type AtlasLevel } from "../../map/atlas-view";
import { liveTurnFinished, liveTurnLedger, subscribeLiveTurn } from "../dm/live-turns";
import { PersistenceError } from "../errors";
import { isUuid } from "../../persistence/validation";
import type { CampaignSnapshot } from "../../persistence/contracts";
import { falSubjectPrompt } from "../../visual-frame/fal-image";
import {
  activeStyle,
  anchorFor,
  capRemaining,
  compositionForEntity,
  COMPOSITIONS,
  fatePortraitPlan,
  framesOfTurn,
  maxReferencesFor,
  modelForTier,
  picturesOf,
  planAutopilot,
  profileFor,
  referencesForAnchor,
  referencesForShot,
  restylePlan,
  styleTextFor,
  type PictureBoard,
  type PictureComposition,
  type PictureSubject,
  type PictureTier,
  type PictureTrigger,
  type PublicPicture,
  type VisualProfile,
} from "../../visual-frame/pictures";
import { fallbackShot, firstParagraph, outOfGameOnly, resolveWho, shotEntityIds, storyText, type ScenePerson, type Shot, type ShotContext } from "../../visual-frame/shot";
import { compileAnchorPrompt, compileEditPrompt, compileRecordsFrame, promptFamily, timeOfDay, type BriefReference, type ReferenceRole } from "../../visual-frame/prompt-compiler";
import { applyLookChange, briefReferences, compileBriefPrompt, directPeople, relabel, type BriefRequestInput, type VisualBrief } from "../../visual-frame/brief";
import { checkFrame, correctionLine, type FrameCheckPerson } from "../../visual-frame/frame-check";
import { visualDocuments } from "../../visual-frame/model";
import { buildShot } from "./shot-model";
import { buildBrief, draftProfile } from "./brief-model";
import { boardOf, picturesContext, type PicturesContext } from "./pictures-store";
import { briefPictureRow, createPictureRow, privatePicture, reviewPictureRow, runPictureJob as runJob } from "../../visual-frame/picture-job";

// The Stage V frame engine. A turn never waits for a picture: every request
// creates a queued row, answers at once, and the paid work runs after the
// response. A shot is built only from narration the player has already
// received (the public live-turn registry or the committed public turn),
// never from the DM's context. Nothing here retries in a loop: one picture,
// one fal request, at most one softened re-submit after a content refusal.

export type Schedule = (work: () => Promise<unknown>) => void;
const detached: Schedule = (work) => {
  void work().catch((error) => console.error(JSON.stringify({ event: "picture_job_failed", message: String((error as Error)?.message ?? error).slice(0, 200) })));
};
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const log = (event: string, data: Record<string, unknown>) => console.info(JSON.stringify({ event, ...data }));

export type FrameRequestResult =
  | { status: "queued" | "existing"; picture: PublicPicture }
  | { status: "waiting" | "off" | "cap" | "no_text" | "ooc" };

/** The public text of a turn: the live registry while it streams, the committed turn after. */
async function turnText(campaignId: string, operationId: string): Promise<{ text: string; finished: boolean; changes: { name: string; ok: boolean; summary: string }[]; mode: string | null }> {
  let text = "";
  let finished = false;
  const changes: { name: string; ok: boolean; summary: string }[] = [];
  const unsubscribe = subscribeLiveTurn(operationId, (event) => {
    if (event.type === "text") text += event.text;
    else if (event.type === "tool") changes.push({ name: event.name, ok: event.ok, summary: event.summary });
    // «recording» (polish 3 §2) counts as finished text: the writer's narration is complete.
    else if (event.type === "status" && event.status !== "generating") finished = true;
  });
  unsubscribe();
  // Fix run E (item 78c): the turn's mode decides too — an out-of-game question never gets a frame.
  const turn = await readTurn(campaignId, operationId).catch((error) => { if (!text.trim()) throw error; return null; });
  if (!text.trim() && turn?.narration) return { text: turn.narration, finished: true, changes, mode: turn.mode };
  return { text, finished, changes, mode: turn?.mode ?? null };
}
/** Polish 2 §3: the whole turn's narration for the brief — the live registry followed until the
 * turn leaves «generating» (bounded), else the committed turn's text. Public text only. */
async function wholeNarration(campaignId: string, operationId: string, waitMs: number): Promise<{ text: string; complete: boolean }> {
  let text = "";
  let finished = liveTurnFinished(operationId);
  const collect = (event: Parameters<Parameters<typeof subscribeLiveTurn>[1]>[0]) => {
    if (event.type === "text") text += event.text;
    else if (event.type === "status" && event.status !== "generating") finished = true;
  };
  const unsubscribe = subscribeLiveTurn(operationId, collect);
  if (!finished && text.trim()) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, waitMs);
      const listen = subscribeLiveTurn(operationId, (event) => {
        if (event.type === "text") text += event.text;
        else if (event.type === "status" && event.status !== "generating") { finished = true; clearTimeout(timer); listen(); resolve(); }
      });
    });
  }
  unsubscribe();
  if (!text.trim() || !finished) {
    try {
      const turn = await readTurn(campaignId, operationId);
      if (turn.narration && (!text.trim() || turn.narration.length >= text.length)) return { text: turn.narration, complete: true };
    } catch { /* the live text is what there is */ }
  }
  return { text, complete: finished };
}
function paragraphFor(trigger: PictureTrigger, text: string, finished: boolean) {
  if (trigger === "key_moment") {
    const paragraphs = text.trim().split(/\n\s*\n/).map((row) => row.trim()).filter(Boolean);
    return paragraphs.length ? firstParagraph(paragraphs.at(-1)!, true) : null;
  }
  return firstParagraph(text, finished);
}
const nameMatches = (recordName: string, shotName: string) => shotEntityIds({ who: [shotName], action: "", where: "", angle: "", mood: "" }, [{ id: "x", name: recordName }]).length > 0;
/** Public appearance of a record: its details plus the owner-approved visual reference text, if any. */
function appearanceOf(snapshot: CampaignSnapshot, entityId: string) {
  const entity = snapshot.entities.find((row) => row.id === entityId);
  const reference = visualDocuments(snapshot).find(({ value }) => value.kind === "reference" && value.approval === "approved" &&
    value.subject.kind === "entity" && value.subject.id === entityId)?.value;
  const guidance = reference && reference.kind === "reference" ? [reference.appearance, reference.outfit].filter(Boolean).join(" ") : "";
  return [guidance, entity?.details ?? ""].filter(Boolean).join(" ").slice(0, 400);
}
/** Polish 2 §3: the look a prompt describes — the visual profile (and the story's changes) when one exists, else the records' appearance. */
function lookOf(board: Pick<PictureBoard, "profiles">, snapshot: CampaignSnapshot, entityId: string) {
  const profile = profileFor(board, { kind: "entity", id: entityId });
  if (!profile || !profile.look.trim()) return appearanceOf(snapshot, entityId);
  return [profile.look, profile.changes.length ? `Now: ${profile.changes.join("; ")}.` : ""].filter(Boolean).join(" ").slice(0, 1600);
}
const nameOfSubject = (snapshot: CampaignSnapshot, profile: Pick<VisualProfile, "subjectKind" | "subjectId">) =>
  profile.subjectKind === "entity" ? snapshot.entities.find((row) => row.id === profile.subjectId)?.name ?? null : snapshot.locations.find((row) => row.id === profile.subjectId)?.name ?? null;
function shotContext(snapshot: CampaignSnapshot): ShotContext {
  const hero = snapshot.entities.find((row) => row.kind === "player") ?? null;
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id) ?? null;
  return {
    heroName: hero?.name ?? null,
    names: snapshot.entities.filter((row) => row.id !== hero?.id && ["companion", "npc", "transport", "mount"].includes(row.kind)).map((row) => row.name).slice(0, 40),
    placeName: place?.name ?? null,
    language: snapshot.settings.values.language === "en" ? "en" : "ru",
    people: scenePeople(snapshot).map((row) => ({ name: row.name, role: row.role })),
  };
}
const firstSentence = (text: string) => (text.replace(/\s+/g, " ").trim().split(/(?<=[.!?…])\s+/u)[0] ?? "").slice(0, 160);
/** Fix run E (item 78a): who each known person is — the hero, then the party, then the rest; people the hero has
 * not met stay out. Public records only: the kind, the sheet's role, the first sentence of the details. */
function scenePeople(snapshot: CampaignSnapshot): ScenePerson[] {
  const rank = (kind: string) => (kind === "player" ? 0 : kind === "companion" ? 1 : 2);
  return snapshot.entities.filter((row) => ["player", "companion", "npc"].includes(row.kind) && !row.public_profile?.unmet)
    .sort((a, b) => rank(a.kind) - rank(b.kind)).slice(0, 40).map((row) => ({
      id: row.id, name: row.name, kind: row.kind,
      role: [row.kind === "player" ? "the hero" : row.kind === "companion" ? "a companion of the party" : "", row.character_sheet?.role ?? "", firstSentence(row.details)].filter(Boolean).join("; ").slice(0, 240),
    }));
}
/** Fix run E (items 78, 79): what the records give a person — worn or held (equipped), and packed away in their own
 * possessions (a thing left in camp is not on them). The frame's gear comes only from here. */
function gearOf(snapshot: CampaignSnapshot, entityId: string) {
  const own = new Set(snapshot.storages.filter((row) => row.entity_id === entityId).map((row) => row.id));
  const live = snapshot.items.filter((item) => item.quantity > 0);
  return {
    worn: live.filter((item) => item.equipped_entity_id === entityId).map((item) => item.name).slice(0, 8),
    packed: live.filter((item) => !item.equipped_entity_id && item.owner_entity_id === entityId && own.has(item.storage_id)).map((item) => item.name).slice(0, 8),
  };
}
const isDown = (entity: CampaignSnapshot["entities"][number]) => entity.hp === 0 && (entity.max_hp ?? 0) > 0;

/** A frame for one turn. `live` while the narration streams (needs the first paragraph),
 * `committed` after a reload, `key_moment` once the turn is saved (better model), `redraw` by the owner. */
export async function requestFrame(campaignId: string, value: unknown, schedule: Schedule = detached): Promise<FrameRequestResult> {
  const result = await requestFrameUnlogged(campaignId, value, schedule);
  // Fix run A5 (items 77, 83): every request's answer is in the log — frames stopped after 20:48 in
  // session 2 with the daily cap not reached and nothing said why.
  log("picture_frame_request", { campaignId, operationId: isRecord(value) ? value.operationId : null, trigger: isRecord(value) ? value.trigger : null,
    status: result.status, ...(result.status === "queued" || result.status === "existing" ? { pictureId: result.picture.id } : {}) });
  return result;
}
async function requestFrameUnlogged(campaignId: string, value: unknown, schedule: Schedule): Promise<FrameRequestResult> {
  if (!isRecord(value) || !isUuid(value.operationId) || !["live", "committed", "key_moment", "redraw"].includes(String(value.trigger)) ||
    (value.comment !== undefined && value.comment !== null && (typeof value.comment !== "string" || value.comment.length > 300)))
    throw new PersistenceError("validation");
  const operationId = value.operationId;
  const trigger = value.trigger as "live" | "committed" | "key_moment" | "redraw";
  // «Перерисовать» with a comment (polish 2 §3): one line from the owner, merged into the brief and sent as an edit.
  const comment = trigger === "redraw" && typeof value.comment === "string" && value.comment.trim() ? value.comment.trim() : null;
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const frames = board.settings.frames;
  if (trigger !== "redraw" && (frames === "off" || (frames === "key" && trigger !== "key_moment"))) return { status: "off" };
  const existing = framesOfTurn(board, operationId);
  if (trigger !== "redraw") {
    const same = existing.filter((row) => row.status !== "failed" && (trigger === "key_moment" ? row.trigger === "key_moment" : row.trigger !== "key_moment"));
    if (same.length) return { status: "existing", picture: same.at(-1)! };
  }
  if (!capRemaining(board)) return { status: "cap" };
  const { text, finished, mode } = await turnText(campaignId, operationId);
  // Fix run E (item 78c): no frame for an out-of-game turn, nor for a reply that is only an out-of-game aside;
  // an aside inside a story turn never reaches the shot.
  if (mode === "ooc" || mode === "feedback" || (finished && outOfGameOnly(text))) return { status: "ooc" };
  const paragraph = paragraphFor(trigger, storyText(text), finished);
  if (!paragraph) return { status: text.trim() ? "waiting" : "no_text" };
  const snapshot = await readCampaign(campaignId);
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  const context = shotContext(snapshot);
  const scene = scenePeople(snapshot);
  const built = await buildShot(process.env.ANTHROPIC_API_KEY ?? "", paragraph, context);
  const shot: Shot = built.shot ?? fallbackShot(paragraph, context);
  // Polish 2 (the owner's blind picks): live and committed frames on the live tier the owner chose
  // (Sunburst by default since polish 3); key moments and «Перерисовать» on the quality tier (Sunburst by default).
  const tier: PictureTier = trigger === "key_moment" || trigger === "redraw" ? "quality" : board.settings.quality;
  const model = modelForTier(tier, board.settings);
  // Fix run E (item 78a): «маг» is the hero — role words resolve to the scene's people, the hero first.
  const resolved = resolveWho(shot.who, scene);
  // Names in the shot's own text become the prompt's labels (the shot model wrote «Halvar, the grey-haired sergeant»).
  const shotLabels = [...shot.who.map((name, at) => ({ name, label: resolved[at] && snapshot.entities.find((row) => row.id === resolved[at])?.kind === "player" ? "the hero" : `person ${at + 1}` })),
    ...scene.filter((person) => !resolved.includes(person.id)).map((person) => ({ name: person.name, label: "someone" }))];
  const drawnShot: Shot = { ...shot, action: relabel(shot.action, shotLabels), where: relabel(shot.where, shotLabels), mood: relabel(shot.mood, shotLabels) };
  const entityIds = [...new Set([...resolved.filter((id): id is string => !!id), ...shotEntityIds(shot, snapshot.entities)])];
  const referenceIds = referencesForShot(board, { entityIds, locationId: snapshot.publicState.current_location_id, model });
  const place = snapshot.locations.find((row) => row.id === snapshot.publicState.current_location_id) ?? null;
  const style = activeStyle(board);
  // The prompt compiler (PICTURE_MODELS.md) writes the model's own dialect: each reference with its
  // role, the hero's full figure beside the portrait, identity locks, what the records say is worn now.
  const placeAnchor = place ? anchorFor(board, { kind: "location", id: place.id }, "location").picture : null;
  const heroId = snapshot.entities.find((row) => row.kind === "player" && entityIds.includes(row.id))?.id ?? null;
  const heroFigure = heroId ? anchorFor(board, { kind: "entity", id: heroId }, "figure").picture : null;
  // The world clock through a side-effect-free read (readPlay can start a digest); a failure leaves the time out.
  const clock = await readWorldClock(campaignId).catch(() => ({ worldMinutes: null }));
  const compiled = compileRecordsFrame({
    modelId: model, shot: drawnShot, style: styleTextFor(board, snapshot.settings.values.visualStyle), items: snapshot.items, maxReferences: maxReferencesFor(model),
    worldMinutes: clock.worldMinutes,
    people: shot.who.map((name, index) => {
      const entity = (resolved[index] ? snapshot.entities.find((row) => row.id === resolved[index]) : null) ?? snapshot.entities.find((row) => nameMatches(row.name, name)) ?? null;
      // Fix run E (items 78, 79): the default path (the director off) carries the records' gear, 0 HP, the gaze and the hands too.
      // Someone down at 0 HP has closed eyes and looks at nothing (the shot once gave a dead man «eyes open to the sky»).
      const gaze = entity && isDown(entity) ? undefined : shot.gaze?.find((row) => resolveWho([row.who], scene)[0] === entity?.id || row.who === name);
      const direction = gaze || (index === 0 && shot.hands) ? { looksAt: gaze ? relabel(gaze.looksAt, shotLabels) : "", expression: "", action: "", hands: index === 0 && shot.hands ? relabel(shot.hands, shotLabels) : null } : undefined;
      return { name, entity, appearance: entity ? lookOf(board, snapshot, entity.id) : "",
        ...(entity && ["player", "companion", "npc"].includes(entity.kind) ? { gear: gearOf(snapshot, entity.id), down: isDown(entity) } : {}), ...(direction ? { direction } : {}) };
    }),
    references: [...referenceIds, ...(heroFigure ? [heroFigure.id] : [])].map((id) => {
      const row = board.pictures.find((picture) => picture.id === id);
      return id === style?.id ? { id, role: "style" as const } : id === placeAnchor?.id ? { id, role: "place" as const }
        : { id, role: row?.composition === "figure" ? "figure" as const : row?.composition === "portrait" ? "face" as const : "person" as const, entityId: row?.subjectId ?? null };
    }),
  });
  const prompt = compiled.prompt;
  const picture = await createPictureRow(ctx, {
    id: crypto.randomUUID(), kind: "frame", subjectKind: "turn", subjectId: operationId, composition: "frame", timeline: snapshot.timeline,
    tier, trigger, model, styleVersionId: style?.id ?? null,
    shot: { ...shot, meta: { source: built.source, model: built.source === "model" ? "claude-haiku-5-5" : null, usage: built.usage, costUsdMicros: built.costUsdMicros, elapsedMs: built.elapsedMs, error: built.error, paragraphChars: paragraph.length }, ...(comment ? { comment } : {}) },
    prompt, referenceIds: compiled.referenceIds, caption: shot.caption ?? null,
  });
  log("picture_frame_queued", { campaignId, operationId, pictureId: picture.id, trigger, tier, model, references: compiled.referenceIds.length, shotSource: built.source, shotMs: built.elapsedMs });
  // The shot director runs after the response: the brief from the whole turn (waiting for the narration
  // to end on a live frame), then the paid picture. The shot above is the fallback.
  schedule(async () => {
    const directed = !board.settings.director ? { costUsdMicros: 0 } : await directFrame(ctx, picture.id, { operationId, trigger, shot, model, comment }).catch((error) => {
      log("picture_brief_failed", { campaignId, pictureId: picture.id, message: String((error as Error)?.message ?? error).slice(0, 200) });
      return { costUsdMicros: 0 };
    });
    return runPictureJob(ctx, picture.id, { extraCostUsdMicros: built.costUsdMicros + directed.costUsdMicros });
  });
  return { status: "queued", picture };
}

/** How long a live frame waits for the whole narration before the brief is written from what there is. */
const NARRATION_WAIT_MS = 150_000;

/** Polish 2 §3, the shot director: the brief of the turn (Claude Sonnet 5.5) from the whole narration, the
 * visual profiles, the records' state, the clock and the previous frame; the prompt compiled from it in
 * the model's dialect, the references the brief needs, the brief stored with the picture (private); the
 * story's changes to a look appended to the profiles. A redraw with the owner's comment becomes an edit of
 * the previous frame. Any failure leaves the shot's prompt in place. Returns the brief's cost. */
async function directFrame(ctx: PicturesContext, pictureId: string, input: { operationId: string; trigger: PictureTrigger; shot: Shot; model: string; comment: string | null }): Promise<{ costUsdMicros: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) return { costUsdMicros: 0 };
  const { operationId, trigger, comment } = input;
  const whole = await wholeNarration(ctx.campaignId, operationId, trigger === "live" ? NARRATION_WAIT_MS : 0);
  // Fix run E (item 78c): out-of-game asides never reach the brief; a reply that is only an aside gets none.
  const narration = { ...whole, text: storyText(whole.text) };
  if (!narration.text.trim() || outOfGameOnly(whole.text)) return { costUsdMicros: 0 };
  // Fresh records and board: the turn may have added people and places, the autopilot anchors.
  const [snapshot, board, clock] = await Promise.all([readCampaign(ctx.campaignId), boardOf(ctx), readWorldClock(ctx.campaignId).catch(() => ({ worldMinutes: null }))]);
  const row = await privatePicture(ctx, pictureId);
  if (row.status !== "queued") return { costUsdMicros: 0 };
  const context = shotContext(snapshot);
  const place = snapshot.locations.find((loc) => loc.id === snapshot.publicState.current_location_id) ?? null;
  const profiles: BriefRequestInput["profiles"] = board.profiles.map((profile) => {
    const name = nameOfSubject(snapshot, profile);
    return name ? { name, kind: profile.subjectKind === "entity" ? "person" as const : "place" as const, look: profile.look, changes: profile.changes } : null;
  }).filter((row): row is NonNullable<typeof row> => row !== null);
  const scene = scenePeople(snapshot);
  const state = scene.map((person) => {
    const row = snapshot.entities.find((entity) => entity.id === person.id)!;
    const gear = gearOf(snapshot, row.id);
    const conditions = row.conditions.filter(Boolean).slice(0, 4);
    const lines = [gear.worn.length ? `wears or holds ${gear.worn.join(", ")}` : "holds no weapon or tool of their own",
      gear.packed.length ? `carries packed away (not in hand) ${gear.packed.join(", ")}` : "",
      conditions.length ? `visible condition: ${conditions.join(", ")}` : "", isDown(row) ? "down at 0 hit points: unconscious, eyes closed" : ""].filter(Boolean);
    return { name: row.name, lines };
  }).slice(0, 12);
  // Continuity: the newest ready frame of an earlier turn and its brief, if one was written.
  const previousFrame = [...board.pictures].filter((p) => p.kind === "frame" && p.status === "ready" && !p.hidden && p.subjectId !== operationId && p.createdAt < row.createdAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  const previousBrief = previousFrame ? await privatePicture(ctx, previousFrame.id).then((p) => briefOf(p.shot)?.brief ?? null).catch(() => null) : null;
  const style = styleTextFor(board, snapshot.settings.values.visualStyle);
  // Polish 3 §2: on a split turn the director starts at the writer's end (the «recording» status
  // finishes the narration wait) and reads the writer's ledger for clothes, wounds and items.
  const built = await buildBrief(apiKey, {
    narration: narration.text, heroName: context.heroName, names: context.names, people: context.people, placeName: place?.name ?? null, profiles, state,
    clock: { timeOfDay: timeOfDay(clock.worldMinutes) }, previous: previousBrief, ledger: liveTurnLedger(operationId), style, comment, language: context.language,
  });
  log("picture_brief", { campaignId: ctx.campaignId, pictureId, trigger, ok: !!built.brief, ms: built.elapsedMs, costUsdMicros: built.costUsdMicros, error: built.error, narrationChars: narration.text.length, complete: narration.complete, words: built.brief ? built.brief.brief.split(/\s+/).length : 0 });
  if (!built.brief) return { costUsdMicros: built.costUsdMicros };
  const brief = built.brief;
  // The people of the brief, the hero first; identity references by role, in the fixed order.
  // Fix run E (items 78a, 79): role words resolve to the scene's people (the hero first); each person carries the
  // brief's direction (gaze, expression, action, hands) under the brief's own label, and the records' gear.
  const { people, entityIds, names } = directPeople(brief, scene, snapshot.entities, { look: (id) => lookOf(board, snapshot, id), gear: (id) => gearOf(snapshot, id) });
  const activeStyleRow = activeStyle(board);
  const placeAnchor = place ? anchorFor(board, { kind: "location", id: place.id }, "location").picture : null;
  const heroId = snapshot.entities.find((row) => row.kind === "player" && entityIds.includes(row.id))?.id ?? null;
  const heroFigure = heroId ? anchorFor(board, { kind: "entity", id: heroId }, "figure").picture : null;
  const candidateIds = [...referencesForShot(board, { entityIds, locationId: place?.id ?? null, model: input.model }), ...(heroFigure ? [heroFigure.id] : [])];
  const roles = candidateIds.map((id) => {
    const picture = board.pictures.find((p) => p.id === id);
    const role: ReferenceRole = id === activeStyleRow?.id ? "style" : id === placeAnchor?.id ? "place" : picture?.composition === "figure" ? "figure" : picture?.composition === "portrait" ? "face" : "person";
    return { id, role, entityId: picture?.subjectId ?? null };
  });
  const ordered = briefReferences(roles, people, maxReferencesFor(input.model));
  // A redraw with the owner's comment: the previous frame of this turn goes back as the only reference, the change as an edit.
  const previousOfTurn = comment ? framesOfTurn(board, operationId).filter((p) => p.status === "ready" && p.id !== pictureId).at(-1) ?? null : null;
  const edit = comment && brief.edit && previousOfTurn;
  const prompt = edit ? compileEditPrompt(brief.edit!, promptFamily(input.model)) : compileBriefPrompt({ brief, people, references: ordered, style, modelId: input.model, names });
  const referenceIds = edit ? [previousOfTurn!.id] : ordered.map((r) => r.id);
  await briefPictureRow(ctx, { id: pictureId, prompt, referenceIds, ...(brief.caption ? { caption: brief.caption } : {}), shot: {
    ...input.shot, who: brief.who.length ? brief.who : input.shot.who, brief,
    meta: { ...(isRecord(row.shot) && isRecord(row.shot.meta) ? row.shot.meta : {}), brief: { model: "claude-sonnet-5-5", usage: built.usage, costUsdMicros: built.costUsdMicros, elapsedMs: built.elapsedMs, narrationChars: narration.text.length, complete: narration.complete, edit: !!edit } },
    ...(comment ? { comment } : {}),
  } });
  log("picture_brief_applied", { campaignId: ctx.campaignId, pictureId, references: referenceIds.length, people: people.length, edit: !!edit });
  // The story changed a look: the change joins the person's or place's profile (the owner's text stays).
  // Fix run E (item 79): a temporary look (ash on the face) stays until the story removes it («no longer: …»).
  const changed = new Map<string, string[]>();
  for (const update of brief.profileUpdates) {
    const entityId = resolveWho([update.who], scene)[0];
    const location = entityId ? null : snapshot.locations.find((row) => nameMatches(row.name, update.who)) ?? null;
    const subject = entityId ? { kind: "entity" as const, id: entityId } : location ? { kind: "location" as const, id: location.id } : null;
    if (!subject) continue;
    const current = profileFor(board, subject);
    const key = `${subject.kind}:${subject.id}`;
    const next = applyLookChange(changed.get(key) ?? current?.changes ?? [], update.change);
    if (!next) continue;
    changed.set(key, next);
    await ctx.rpc("profile.save", { id: crypto.randomUUID(), subjectKind: subject.kind, subjectId: subject.id, look: current?.look ?? "", changes: next, source: "model" }).catch((error) =>
      log("profile_update_failed", { campaignId: ctx.campaignId, subject: subject.kind, message: String((error as Error)?.message ?? error).slice(0, 120) }));
  }
  return { costUsdMicros: built.costUsdMicros };
}
const briefOf = (shot: unknown): VisualBrief | null => (isRecord(shot) && isRecord(shot.brief) && typeof shot.brief.brief === "string" ? shot.brief as unknown as VisualBrief : null);

/** Polish 2 §3: the visual profile of a person or a place, drafted once by the model from the records'
 * text and the ready anchors (portrait and figure, or the place's view); saved as a model version. The
 * owner edits it on the card afterwards. */
export async function draftVisualProfile(campaignId: string, value: unknown) {
  if (!isRecord(value) || !isRecord(value.subject) || !["entity", "location"].includes(String(value.subject.kind)) || !isUuid(value.subject.id)) throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  const subject = { kind: value.subject.kind as "entity" | "location", id: value.subject.id };
  return draftProfileFor(ctx, subject, await boardOf(ctx), await readCampaign(campaignId));
}
async function draftProfileFor(ctx: PicturesContext, subject: { kind: "entity" | "location"; id: string }, board: PictureBoard, snapshot: CampaignSnapshot) {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) return { status: "not_configured" as const };
  let name = "", text = "";
  if (subject.kind === "entity") {
    const row = snapshot.entities.find((entity) => entity.id === subject.id);
    if (!row) throw new PersistenceError("not_found");
    const worn = snapshot.items.filter((item) => item.equipped_entity_id === row.id && item.quantity > 0).map((item) => item.name).slice(0, 12);
    name = row.name;
    text = [appearanceOf(snapshot, row.id), row.details, worn.length ? `Wears or carries: ${worn.join(", ")}.` : "", row.conditions.length ? `Visible condition: ${row.conditions.join(", ")}.` : ""].filter(Boolean).join("\n");
  } else {
    const row = snapshot.locations.find((location) => location.id === subject.id);
    if (!row) throw new PersistenceError("not_found");
    name = row.name;
    text = row.description;
  }
  const anchors = subject.kind === "entity"
    ? [{ picture: anchorFor(board, subject, "portrait").picture, label: "the approved portrait" }, { picture: anchorFor(board, subject, "figure").picture, label: "the approved full figure" }]
    : [{ picture: anchorFor(board, subject, "location").picture, label: "the approved view of the place" }];
  const images: { bytes: Uint8Array; contentType: string; label: string }[] = [];
  for (const anchor of anchors) {
    if (!anchor.picture) continue;
    const row = await privatePicture(ctx, anchor.picture.id).catch(() => null);
    const object = row?.storagePath ? await ctx.storage.get(row.storagePath).catch(() => null) : null;
    if (object) images.push({ bytes: object.bytes, contentType: object.contentType, label: anchor.label });
  }
  const drafted = await draftProfile(apiKey, { kind: subject.kind === "entity" ? "person" : "place", name, text, images, language: snapshot.settings.values.language === "en" ? "en" : "ru" });
  log("profile_drafted", { campaignId: ctx.campaignId, subject: subject.kind, ok: !!drafted.look, images: images.length, ms: drafted.elapsedMs, costUsdMicros: drafted.costUsdMicros, usage: drafted.usage, error: drafted.error });
  if (!drafted.look) return { status: "failed" as const, error: drafted.error };
  const current = profileFor(board, subject);
  const profile = await ctx.rpc("profile.save", { id: crypto.randomUUID(), subjectKind: subject.kind, subjectId: subject.id, look: drafted.look, changes: current?.changes ?? [], source: "model" });
  return { status: "drafted" as const, profile, costUsdMicros: drafted.costUsdMicros };
}

/** An anchor of a record: the autopilot's next picture, «Перерисовать», or a restyle. */
export async function requestAnchor(campaignId: string, value: unknown, schedule: Schedule = detached) {
  if (!isRecord(value) || !isRecord(value.subject) || !["entity", "item", "location"].includes(String(value.subject.kind)) || !isUuid(value.subject.id) ||
    !["redraw", "autopilot", "restyle", "manual"].includes(String(value.trigger)) || (value.composition !== undefined && !COMPOSITIONS.includes(value.composition as PictureComposition)))
    throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const snapshot = await readCampaign(campaignId);
  const subject = { kind: value.subject.kind, id: value.subject.id } as PictureSubject;
  // Fix run after session 2 (item 29): the opening's frame (the starting place's anchor) is asked for by the game
  // screen; a second tab asking at the same time gets the picture already in work instead of a second paid one.
  if (value.trigger === "autopilot" && subject.kind === "location" && value.composition === undefined) {
    const inWork = picturesOf(board, subject, "location").find((row) => row.status === "queued" || row.status === "generating");
    if (inWork) return { status: "queued" as const, picture: inWork };
  }
  const picture = await queueAnchor(ctx, board, snapshot, subject, value.composition as PictureComposition | undefined, value.trigger as PictureTrigger,
    value.tier === "quality" || value.tier === "fast" ? value.tier : null);
  if (!picture) return { status: "cap" as const };
  schedule(() => runPictureJob(ctx, picture.id));
  return { status: "queued" as const, picture };
}

async function queueAnchor(ctx: PicturesContext, board: PictureBoard, snapshot: CampaignSnapshot, subject: PictureSubject, composition: PictureComposition | undefined,
  trigger: PictureTrigger, tier: PictureTier | null) {
  if (!snapshot.timeline) throw new PersistenceError("conflict");
  if (!capRemaining(board)) return null;
  let name = "", description = "", chosen: PictureComposition;
  let person: { entity: CampaignSnapshot["entities"][number]; carried: string[] } | null = null;
  if (subject.kind === "entity") {
    const row = snapshot.entities.find((entity) => entity.id === subject.id);
    if (!row) throw new PersistenceError("not_found");
    const worn = snapshot.items.filter((item) => item.equipped_entity_id === row.id && item.quantity > 0).map((item) => item.name).slice(0, 12);
    name = row.name;
    description = [appearanceOf(snapshot, row.id), worn.length ? `Visible equipment: ${worn.join(", ")}.` : ""].filter(Boolean).join("\n");
    chosen = composition && ["portrait", "figure", "holding"].includes(composition) ? composition : compositionForEntity(row);
    person = { entity: row, carried: worn };
  } else if (subject.kind === "item") {
    const row = snapshot.items.find((item) => item.id === subject.id);
    if (!row) throw new PersistenceError("not_found");
    name = row.name; description = row.description; chosen = "item";
  } else {
    const row = snapshot.locations.find((location) => location.id === subject.id);
    if (!row || !["known", "visited"].includes(row.status)) throw new PersistenceError("not_found");
    name = row.name; description = row.description; chosen = composition === "atlas" ? "atlas" : "location";
  }
  // Owner's rule: best quality wherever it does not hurt the live feel — anchors are drawn on the
  // quality tier unless the caller (a fast restyle) asks for the fast one.
  const pickedTier: PictureTier = tier ?? "quality";
  const model = modelForTier(pickedTier, board.settings);
  const style = activeStyle(board);
  const referenceIds = referencesForAnchor(board, subject, chosen, model);
  const styleText = styleTextFor(board, snapshot.settings.values.visualStyle);
  // Polish 2: a person's portrait or figure goes through the prompt compiler (the model's dialect, the
  // face reference by role, the anatomy guard) with the carried items as a separate constraint; the
  // look comes from the visual profile when the owner has one.
  const prompt = chosen === "atlas"
    ? await atlasPrompt(ctx.campaignId, snapshot, subject.id, styleText, model)
    : person && (chosen === "portrait" || chosen === "figure")
    ? compileAnchorPrompt({
        person: { key: person.entity.id, label: person.entity.kind === "player" ? "the hero" : "this character", pronoun: "they", appearance: lookOf(board, snapshot, person.entity.id) || "as described in the records",
          state: person.entity.conditions.filter(Boolean).slice(0, 4).map((condition) => `visible condition: ${condition}`) },
        composition: chosen, carried: person.carried, style: styleText,
        references: referenceIds.map((id): BriefReference => (id === style?.id ? { role: "style" } : { role: "face", person: person!.entity.id })),
      }, promptFamily(model))
    : falSubjectPrompt({ composition: chosen, name, description, style: styleText }) +
      (referenceIds.length ? `\nReferences: ${style?.hasReference ? "the first reference image sets the art style" : ""}${chosen === "figure" && referenceIds.length > (style?.hasReference ? 1 : 0) ? "; a reference portrait shows this person's face: keep it" : ""}.` : "");
  const picture = await createPictureRow(ctx, {
    id: crypto.randomUUID(), kind: "anchor", subjectKind: subject.kind, subjectId: subject.id, composition: chosen, timeline: snapshot.timeline,
    tier: pickedTier, trigger, model, styleVersionId: style?.id ?? null, shot: null, prompt, referenceIds,
  });
  log("picture_anchor_queued", { campaignId: ctx.campaignId, pictureId: picture.id, subject: subject.kind, composition: chosen, trigger, tier: pickedTier, model, references: referenceIds.length });
  return picture;
}

/** Polish 2 §6: the drawn atlas — a map of the level that holds this place, in the campaign's style, the
 * places drawn where the layout puts them, no text on the picture (the app's own labels go over it). */
async function atlasPrompt(campaignId: string, snapshot: CampaignSnapshot, subjectId: string, style: string, model: string) {
  const layout = await readMapLayout(campaignId);
  const projection = projectAtlas(snapshot, layout.placements);
  const placement = projection.placements.find((row) => row.location_id === subjectId);
  const level: AtlasLevel = placement?.level === "world" ? "region" : placement?.level === "region" ? "local" : atlasOpeningLevel(projection);
  const view = atlasLevelView(projection, level, placement?.level === "world" ? subjectId : null, placement?.level === "region" ? subjectId : null);
  const subject = snapshot.locations.find((row) => row.id === subjectId);
  const named = (id: string) => snapshot.locations.find((row) => row.id === id);
  const where = (x: number, y: number) => {
    const ns = y < 0.33 ? "north" : y > 0.66 ? "south" : "";
    const ew = x < 0.33 ? "west" : x > 0.66 ? "east" : "";
    return ns && ew ? `in the ${ns}-${ew}` : ns ? `in the ${ns}` : ew ? `in the ${ew}` : "near the centre";
  };
  const pins = view.pins.map((pin) => ({ pin, location: named(pin.location_id) })).filter((row) => row.location && row.location.id !== subjectId);
  const places = pins.map(({ pin, location }) => `${location!.name} ${where(pin.x!, pin.y!)}${location!.description ? `: ${location!.description.replace(/\s+/g, " ").slice(0, 140)}` : ""}`);
  const family = promptFamily(model);
  const text = family === "flux" ? "Every surface is plain: no lettering, no labels, no compass letters, no legend." : "No text, letters, numbers, labels, a legend, a compass rose with letters or any writing anywhere on the map.";
  return [
    `A hand-drawn illustrated map of ${subject?.name ?? "the area"}, seen from above at a slight angle, as an atlas page of a story: terrain, water, streets and buildings as small drawn landmarks, aged paper and ink.`,
    subject?.description ? `The area: ${subject.description.replace(/\s+/g, " ").slice(0, 300)}` : "",
    places.length ? `Draw these places as landmarks where they are said to be (north is up): ${places.join("; ")}.` : "No separate landmarks are known yet: draw the area itself.",
    "Leave room between the landmarks; the names will be written over the picture by the app, so no written names on the map itself.",
    text,
    style.trim() ? `Art style: ${style.trim().slice(0, 800)}` : "Art style: an ink and watercolour atlas page.",
  ].filter(Boolean).join("\n").slice(0, 8000);
}

/** One autopilot step after a committed snapshot: the next anchor the plan names, if any. */
export async function autopilotStep(campaignId: string, schedule: Schedule = detached) {
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const snapshot = await readCampaign(campaignId);
  const [next] = planAutopilot(snapshot, board);
  if (!next) return { status: "idle" as const };
  const picture = await queueAnchor(ctx, board, snapshot, next.subject, next.composition, "autopilot", null);
  if (!picture) return { status: "cap" as const };
  schedule(() => runPictureJob(ctx, picture.id));
  return { status: "queued" as const, picture, label: next.name };
}

/** Fix S3-accept Е1: the portraits the chapter's «Судьбы» cards still need, in one batch — at the close (the digest) and
 * when the closed chapter is shown — each person once, within the cap; drawn one after another after the response. One
 * batch per campaign at a time, so the digest's batch and the card's ask never queue a person twice. */
const fateBatches = new Set<string>();
export async function queueFatePortraits(campaignId: string, value: unknown, schedule: Schedule = detached) {
  if (!isRecord(value) || !isUuid(value.sessionId)) throw new PersistenceError("validation");
  if (fateBatches.has(campaignId)) return { status: "busy" as const, queued: [] as PublicPicture[] };
  fateBatches.add(campaignId);
  try {
    const ctx = await picturesContext(campaignId);
    const [board, snapshot] = await Promise.all([boardOf(ctx), readCampaign(campaignId)]);
    const ending = snapshot.sessions.find((row) => row.id === value.sessionId)?.ending;
    const cards = ending && "cards" in ending && ending.form === "cards" ? ending.cards : [];
    const plan = fatePortraitPlan(board, snapshot, cards);
    const queued: PublicPicture[] = [];
    let remaining = capRemaining(board);
    for (const row of plan) {
      if (remaining <= 0) break;
      const picture = await queueAnchor(ctx, { ...board, today: { ...board.today, count: board.settings.dailyCap - remaining } }, snapshot, row.subject, "portrait", "autopilot", null);
      if (!picture) break;
      queued.push(picture);
      remaining -= 1;
    }
    log("picture_fates_queued", { campaignId, sessionId: value.sessionId, cards: cards.length, queued: queued.length });
    if (queued.length) schedule(async () => { for (const picture of queued) await runPictureJob(ctx, picture.id); });
    return { status: queued.length ? "queued" as const : "idle" as const, queued };
  } finally {
    fateBatches.delete(campaignId);
  }
}

/** After a style change: re-render the anchor set in the background, within the daily cap,
 * one picture after another; old anchors stay until the new ones are ready. */
export async function restyleCampaign(campaignId: string, value: unknown, schedule: Schedule = detached) {
  if (!isRecord(value) || (value.tier !== undefined && value.tier !== "fast" && value.tier !== "quality")) throw new PersistenceError("validation");
  const ctx = await picturesContext(campaignId);
  const board = await boardOf(ctx);
  const snapshot = await readCampaign(campaignId);
  const { plan, fastUsdMicros, qualityUsdMicros } = restylePlan(snapshot, board);
  if (value.dryRun === true) return { status: "estimate" as const, count: plan.length, fastUsdMicros, qualityUsdMicros, queued: [] as PublicPicture[] };
  const queued: PublicPicture[] = [];
  const tier = (value.tier as PictureTier | undefined) ?? "quality";
  let remaining = capRemaining(board);
  for (const row of plan) {
    if (remaining <= 0) break;
    const picture = await queueAnchor(ctx, { ...board, today: { ...board.today, count: board.settings.dailyCap - remaining } }, snapshot, row.subject, row.composition, "restyle", tier);
    if (!picture) break;
    queued.push(picture);
    remaining -= 1;
  }
  schedule(async () => {
    for (const picture of queued) await runPictureJob(ctx, picture.id);
  });
  return { status: "queued" as const, count: plan.length, fastUsdMicros, qualityUsdMicros, queued };
}

/** The paid work of one picture, with the server's keys (fal for fal models, OpenAI for GPT Image).
 * A ready anchor of a person or a place without a visual profile gets one drafted (polish 2 §3). */
export async function runPictureJob(ctx: PicturesContext, pictureId: string, options: { extraCostUsdMicros?: number } = {}) {
  const picture = await runJob(ctx, pictureId, { apiKey: process.env.FAL_KEY ?? "", openAIApiKey: process.env.OPENAI_API_KEY ?? "", extraCostUsdMicros: options.extraCostUsdMicros });
  if (picture?.status === "ready" && picture.kind === "frame") {
    const redrawId = await reviewFrame(ctx, picture.id).catch((error) => {
      log("picture_frame_check_failed", { campaignId: ctx.campaignId, pictureId, message: String((error as Error)?.message ?? error).slice(0, 200) });
      return null;
    });
    if (redrawId) await runPictureJob(ctx, redrawId);
  }
  if (picture?.status === "ready" && picture.kind === "anchor" && (picture.subjectKind === "entity" || picture.subjectKind === "location") && ["portrait", "figure", "location"].includes(picture.composition)) {
    try {
      const board = await boardOf(ctx);
      const subject = { kind: picture.subjectKind, id: picture.subjectId };
      if (!profileFor(board, subject)?.look.trim()) await draftProfileFor(ctx, subject, board, await readCampaign(ctx.campaignId));
    } catch (error) {
      log("profile_draft_failed", { campaignId: ctx.campaignId, pictureId, message: String((error as Error)?.message ?? error).slice(0, 200) });
    }
  }
  return picture;
}

/** Fix run E (items 78, 79): the vision check of a drawn frame against the records — limbs, gear the person does not
 * have, open eyes at 0 HP, and each person's gaze. A failed check queues one automatic redraw (the problems as
 * corrections; never a second, never past the daily cap) or marks the frame for the owner. Returns the redraw's id. */
async function reviewFrame(ctx: PicturesContext, pictureId: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) return null;
  const row = await privatePicture(ctx, pictureId);
  if (row.status !== "ready" || row.review || !row.storagePath) return null;
  const image = await ctx.storage.get(row.storagePath);
  if (!image) return null;
  const snapshot = await readCampaign(ctx.campaignId);
  const shot = isRecord(row.shot) ? row.shot : {};
  const brief = briefOf(row.shot);
  const scene = scenePeople(snapshot);
  const who = Array.isArray(shot.who) ? shot.who.filter((name): name is string => typeof name === "string") : [];
  const ids = [...new Set(resolveWho(who, scene).filter((id): id is string => !!id))];
  const people: FrameCheckPerson[] = ids.map((id, index) => {
    const entity = snapshot.entities.find((entity) => entity.id === id)!;
    const label = entity.kind === "player" ? "the hero" : brief?.people.find((d) => resolveWho([d.who], scene)[0] === id)?.label || `person ${index + 1}`;
    return { key: id, label, ...gearOf(snapshot, id), down: isDown(entity) };
  });
  const moment = brief?.beat || (typeof shot.action === "string" ? shot.action : "");
  const result = await checkFrame(apiKey, { image, people, moment });
  log("picture_frame_check", { campaignId: ctx.campaignId, pictureId, ok: result.verdict ? result.verdict.problems.length === 0 : null, problems: result.verdict?.problems.length ?? null,
    ms: result.elapsedMs, costUsdMicros: result.costUsdMicros, error: result.error });
  if (!result.verdict) return null;
  const problems = result.verdict.problems;
  const meta = isRecord(shot.meta) ? shot.meta : {};
  let redrawId: string | null = null;
  if (problems.length && typeof meta.autoRedrawOf !== "string" && snapshot.timeline) {
    const board = await boardOf(ctx);
    if (capRemaining(board) > 0) {
      const redraw = await createPictureRow(ctx, {
        id: crypto.randomUUID(), kind: "frame", subjectKind: "turn", subjectId: row.subjectId, composition: "frame", timeline: snapshot.timeline,
        tier: row.tier, trigger: "redraw", model: row.model, styleVersionId: row.styleVersionId,
        shot: { ...shot, meta: { ...meta, autoRedrawOf: pictureId, problems } }, prompt: `${row.prompt}\n${correctionLine(problems)}`.slice(0, 8000),
        referenceIds: row.referenceIds, caption: row.caption,
      }).catch((error) => { log("picture_auto_redraw_failed", { campaignId: ctx.campaignId, pictureId, message: String((error as Error)?.message ?? error).slice(0, 200) }); return null; });
      redrawId = redraw?.id ?? null;
      if (redrawId) log("picture_auto_redraw", { campaignId: ctx.campaignId, pictureId, redrawId, problems: problems.length });
    }
  }
  await reviewPictureRow(ctx, { id: pictureId, review: { ok: problems.length === 0, problems, redrawId, gaze: result.verdict.gaze, checkedAt: new Date().toISOString(), costUsdMicros: result.costUsdMicros } });
  return redrawId;
}
