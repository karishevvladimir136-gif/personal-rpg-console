"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Dices, HelpCircle, Image as ImageIcon, Send, Sparkles, Users } from "lucide-react";
import type { CampaignSnapshot, Entity, Scene } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { LiveTurnView } from "@/lib/gameplay/live-turn-client";
import type { PublicAdventure } from "@/lib/adventures/contracts";
import { isUnresolved } from "@/lib/gameplay/client-state";
import { frameFor } from "@/lib/visual-frame/pictures";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { liveChanges, livePlayerMoment, liveTurnPhase, type LivePhase } from "@/lib/ui/live-turn-view";
import { characterViewModel } from "@/lib/character-view-model";
import {
  currentPlace,
  currentSession,
  statLabel,
  heroOf,
  inCombat,
  journalOf,
  partyOf,
  questsOf,
  resourcesOf,
  detectAddressee,
  orderChanges,
} from "@/lib/ui/campaign-view";
import { useGameplayRuntime } from "../gameplay-runtime";
import { GameplayComposer } from "../gameplay-composer";
import { GameplayTurn } from "../gameplay-turn";
import { GameplayCombat } from "../gameplay-combat";
import { GameplayRest } from "../gameplay-actions";
import { CombatReadiness } from "../combat-readiness";
import { SessionMemoryPanel, SessionPendingCompanion } from "../session-memory";
import { currentFrameTurnId, FramesPanel, usePictures } from "./live-frames";
import { SessionEnd } from "./session-end";
import { useSessionMemory } from "../session-memory-runtime";
import {
  createGameViewModel,
  GameSessionControls,
  ResumeEditor,
  SceneEditor,
  Transcript,
} from "../persistent-game";
import { useChrome, useDmSettings, useShellClock, type CampaignScreenId } from "./shell";
import {
  Art,
  Avatar,
  Gauge,
  Panel,
  Pips,
  registry as r,
  ThinBar,
  useCopy,
  type Copy,
} from "./primitives";
import g from "./game.module.css";

export type GamePreview = {
  play: PlaySnapshot;
  live?: LiveTurnView | null;
  playerMoment?: boolean;
  adventure?: PublicAdventure | null;
  diceOpen?: boolean;
  asideOpen?: boolean;
};

/** "Role · Level 6 · tier" from the reviewed sheet, through the existing view model. */
export function heroSummary(data: CampaignSnapshot, hero: Entity, c: Copy) {
  const model = characterViewModel(data, hero);
  return [model.sheet.role, model.level !== null ? c.t("Level {level}", { level: model.level }) : null, model.sheet.tier]
    .filter(Boolean).join(" · ");
}
/** What describes this hero (polish group 6): the best skills in words, conditions when there are any,
 * and numbers only when the ruleset has real ones (never «Skill 0 · Атака 0»). */
export function heroLine(data: CampaignSnapshot, hero: Entity, c: Copy) {
  const model = characterViewModel(data, hero);
  const skills = quickRolls(hero).filter((roll) => roll.bonus !== "✦").slice(0, 3).map((roll) => roll.label.toLocaleLowerCase());
  const conditions = model.conditions.slice(0, 3);
  const numbers = model.derivedStats.filter(([, value]) => value !== 0).slice(0, 3).map(([key, value]) => `${c.label(statLabel(key))} ${value}`);
  return [...skills, ...conditions, ...(skills.length ? [] : numbers)].join(" · ");
}

/** Skills and spells exactly as the character's sheet lists them; absent when the sheet has none. */
export function quickRolls(hero: Entity | null) {
  const sheet = hero?.character_sheet;
  if (!sheet) return [];
  const skills = sheet.skills.map((line) => {
    const match = /^(.*?)\s*([+−-]\s*\d+)$/u.exec(line.trim());
    return { label: (match?.[1] ?? line).trim(), bonus: match ? match[2].replace(/\s/g, "") : "" };
  });
  return [...skills.slice(0, 8), ...sheet.spells.slice(0, 4).map((label) => ({ label, bonus: "✦" }))];
}


export function RegistryGame({ data, preview }: { data: CampaignSnapshot; preview?: GamePreview }) {
  const c = useCopy();
  const chrome = useChrome();
  const runtime = useGameplayRuntime(!!preview);
  const play = preview?.play ?? runtime.play;
  useShellClock(play?.worldMinutes);
  // Polish group 6: the addressee is read from the text («@Тамсин», «Тамсин, …»); «Миру» overrides it for this draft.
  const [draft, setDraft] = useState("");
  const [toWorld, setToWorld] = useState(false);
  // The same input-mode state the earlier game screen kept ("game" or out-of-character).
  const [inputMode, setInputMode] = useState<"game" | "ooc">("game");
  const ooc = inputMode === "ooc";
  const setOoc = (next: boolean | ((value: boolean) => boolean)) =>
    setInputMode((current) => ((typeof next === "function" ? next(current === "ooc") : next) ? "ooc" : "game"));
  const [diceOpen, setDiceOpen] = useState(preview?.diceOpen ?? false);
  const [asideOpen, setAsideOpen] = useState(preview?.asideOpen ?? false);
  const [nonce, setNonce] = useState(0);
  // The streamed turn in flight, from the composer's own stream (one EventSource).
  const [liveView, setLiveView] = useState<LiveTurnView | null>(null);
  const [inserted, setInserted] = useState("");
  const [resume, setResume] = useState(false);
  const [sceneEditor, setSceneEditor] = useState<Scene | "new" | null>(null);
  const view = createGameViewModel(data, play);
  const hero = heroOf(data, play);
  const party = partyOf(data, play);
  const present = party.filter((row) => row.present);
  const quests = questsOf(data);
  const journal = journalOf(data);
  const session = currentSession(data);
  const dmSettings = useDmSettings(data.campaign.id);
  const place = currentPlace(data);
  const combat = inCombat(play);
  const detected = combat || toWorld || ooc ? null : detectAddressee(draft, present.map((row) => row.entity));
  const talkTo = detected?.id ?? null;
  const mode = ooc ? "ooc" : "game";
  const resolveSend = (text: string) => {
    const who = combat || toWorld ? null : detectAddressee(text, present.map((row) => row.entity));
    return who ? { mode: "companion" as const, companionId: who.id } : { mode: "game" as const, companionId: null };
  };
  const busy = !!play?.turns.some(isUnresolved);
  const latestTurn = play?.turns.filter((turn) => (mode === "game" ? turn.mode === "game" || turn.mode === "companion" : turn.mode === mode)).at(-1) ?? null;
  const href = (screen: CampaignScreenId) =>
    chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const insert = (text: string) => {
    if (preview) { setInserted(text); return; }
    if (busy) return;
    if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode, companionId: null, timeline: data.timeline, text }))
      setNonce((value) => value + 1);
  };
  const rolls = quickRolls(hero);
  const { resources, money } = hero ? resourcesOf(hero) : { resources: [], money: [] };
  const opening = mode === "game" && view.showOpening && (
    <article className={g.opening}>{view.story || c("История готова начаться. Здесь появится первая сцена.", "Your story is ready to begin. The opening scene will appear here.")}</article>
  );
  const live = preview ? preview.live ?? null : liveView;
  const pictures = usePictures();
  const frameTurnId = currentFrameTurnId(play, live);
  const stageFrame = pictures && frameTurnId ? frameFor(pictures.board, frameTurnId).picture : null;
  const stageFrameUrl = stageFrame && pictures ? pictures.urlFor(stageFrame) : null;
  const phase: LivePhase | null = live ? liveTurnPhase(live, play?.turns ?? []) : null;
  // A saved turn keeps its accepted changes on screen until the next turn starts.
  const liveIsLatest = !!live && (phase === "streaming" || latestTurn?.id === live.operationId);
  // The committed turn's record is the truth of what changed (polish item 19):
  // once saved, its chips replace the provisional ones of the stream.
  const savedView: LiveTurnView | null = latestTurn?.status === "committed" && latestTurn.changes?.length
    ? { operationId: latestTurn.id, text: "", changes: latestTurn.changes.map((change) => ({ name: change.tool, ok: true, summary: change.summary, ...(change.action ? { action: change.action } : {}) })), status: "committed" }
    : null;
  // «⚡ думал глубже · 28 с» (polish item 13): one quiet mark when the saved turn ran above the range's base.
  const deeper = latestTurn?.status === "committed" && latestTurn.stats?.effort && dmSettings?.depth && latestTurn.stats.effort !== dmSettings.depth.min
    ? c(`⚡ думал глубже · ${Math.max(1, Math.round((latestTurn.stats.firstWordMs ?? latestTurn.stats.firstTextMs ?? latestTurn.stats.latencyMs) / 1000))} с`,
      `⚡ thought deeper · ${Math.max(1, Math.round((latestTurn.stats.firstWordMs ?? latestTurn.stats.firstTextMs ?? latestTurn.stats.latencyMs) / 1000))} s`)
    : null;
  const liveBlock = live && phase === "streaming" && liveIsLatest ? <LiveBlock view={live} phase="streaming" />
    : live && phase === "saved" && liveIsLatest && (!savedView || savedView.operationId !== live.operationId) ? <LiveBlock view={live} phase="saved" deeper={deeper} />
    : savedView && (!live || phase === "saved" || !liveIsLatest) ? <LiveBlock view={savedView} phase="saved" deeper={deeper} /> : null;
  const showMoment = preview?.playerMoment || (!!live && phase === "saved" && liveIsLatest && livePlayerMoment(live)) ||
    (latestTurn?.status === "committed" && latestTurn.playerMoment === true);
  // The moment is named (polish): the accepted roll's reason, from the record or the stream.
  const momentReason = latestTurn?.status === "committed" && latestTurn.playerMoment ? latestTurn.playerMomentReason ?? null : live?.moment?.reason ?? null;
  const moment = showMoment ? (
    <div className={g.moment} role="status">
      <Sparkles size={26} color="var(--brass-hi)" aria-hidden="true" />
      <div>
        <div className={g.momentTitle}>{c("Твой момент", "Your moment")}</div>
        <span className={r.small}>{momentReason
          ? c(`${momentReason} · получилось — опиши, как ты это делаешь. Результат броска уже принят, твои слова станут каноном.`, `${momentReason} · success — describe how you do it. The roll stands; your words become canon.`)
          : c("Ведущий отдал тебе кульминацию: опиши, как ты это делаешь. Результат броска уже принят — твои слова станут каноном.", "The DM hands you the climax: describe how you do it. The roll stands; your words become canon.")}</span>
      </div>
    </div>
  ) : null;
  const loopRuntime = !dmSettings || dmSettings.runtime === "dm-loop-v1";
  // An ended session (polish item 11): the digest takes the composer's place until the next session opens.
  const memory = useSessionMemory();
  const boundary = memory.snapshot?.currentBoundary;
  const sessionClosed = !preview && loopRuntime && !!session && (session.status === "closed" ||
    (boundary?.sessionId === session.id && boundary.state !== "continued"));
  const tools = (
    <div className={g.toolsRow} role="group" aria-label={c("Инструменты хода", "Turn tools")}>
      <button type="button" className={diceOpen ? r.iconBtnOn : r.iconBtn} aria-pressed={diceOpen} aria-controls="registry-dice-tray" aria-label={c("Кубы", "Dice")}
        title={c("Кубы: быстрые проверки по листу", "Dice: quick checks from the sheet")} onClick={() => setDiceOpen((open) => !open)}>
        <Dices size={18} aria-hidden="true" />
      </button>
      <button type="button" className={ooc ? r.iconBtnOn : r.iconBtn} aria-pressed={ooc} aria-label={c("Вопрос ведущему", "Ask the DM")}
        title={c("Вопрос ведущему вне истории", "A question to the DM outside the story")} onClick={() => setOoc((value) => !value)}>
        <HelpCircle size={18} aria-hidden="true" />
      </button>
      <button type="button" className={r.iconBtn} disabled={!!preview || !pictures || !frameTurnId || pictures.board.settings.frames === "off"}
        aria-label={c("Кадр сцены", "Scene frame")} title={c("Нарисовать или перерисовать кадр этой сцены", "Draw or redraw the frame of this scene")}
        onClick={() => {
          // Polish group 5: the button acts on the Stage V frames panel (draw or redraw the current frame).
          if (pictures && frameTurnId) void pictures.send("pictures.frame", { operationId: frameTurnId, trigger: "redraw" }).catch(() => {});
          document.getElementById("registry-frames")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}>
        <ImageIcon size={18} aria-hidden="true" />
      </button>
    </div>
  );
  // Who will answer: a small chip when the text names a companion (polish group 6), never a permanent row.
  const addresseeChip = detected ? (
    <p className={g.addressee} role="status">
      <span>{c(`Ответит ${detected.name}`, `${detected.name} will answer`)}</span>
      <span className={r.muted}>{c("— это сцена в мире: идёт время, спутник запомнит сказанное.", "— a scene in the world: time passes and the companion remembers.")}</span>
      <button type="button" className={r.chipButton} onClick={() => setToWorld(true)}>{c("Говорю миру", "I speak to the world")}</button>
    </p>
  ) : toWorld && !combat && detectAddressee(draft, present.map((row) => row.entity)) ? (
    <p className={g.addressee} role="status">
      <span>{c("Говоришь миру и ведущему.", "You speak to the world and the DM.")}</span>
      <button type="button" className={r.chipButton} onClick={() => setToWorld(false)}>{c("Обращаюсь к спутнику", "I address the companion")}</button>
    </p>
  ) : null;
  const feed = preview ? (
    <PreviewFeed data={data} play={preview.play} liveBlock={liveBlock} opening={opening} moment={moment} tools={tools}
      inserted={inserted} heroName={hero?.name ?? null} mode={mode} />
  ) : (
    <>
      {runtime.loading && <p role="status" className={r.muted}>{c("Загружаю сохранённые ходы…", "Loading saved turns…")}</p>}
      {runtime.error && <p role="alert" className={r.error}>{runtime.error}</p>}
      {play?.startupPending && (
        <div role="status" className={r.later}>
          <span>{c("Перед первым ходом закончи вступление приключения и настройку ведущего.", "Finish the adventure opening and DM setup before the first action.")}</span>
          <Link className={r.btn} href={href("adventures")}>{c("Проверить вступление", "Review Adventure opening")}</Link>
        </div>
      )}
      {play && !play.startupPending && sessionClosed && (
        <>
          <div className="gameplay-turns" role="log" aria-label={c("Сохранённые ходы", "Saved turns")}>
            {play.turns.filter((turn) => turn.mode === "game").slice(-3).map((turn) => (
              <div key={turn.id} className="session-saved-turn">
                <GameplayTurn turn={turn} busy onCommand={() => {}} onSaved={async () => {}} />
              </div>
            ))}
          </div>
          <SessionEnd sessionId={session?.id ?? null} />
        </>
      )}
      {play && !play.startupPending && !sessionClosed && (
        <>
          <SessionPendingCompanion play={play} onSaved={runtime.afterMutation} />
          <GameplayComposer
            key={`${mode}:${talkTo ?? ""}:${nonce}`}
            play={play}
            mode={mode}
            companionId={talkTo}
            onSaved={runtime.afterMutation}
            followLatest
            historyIntro={opening}
            beforeInput={<>{liveBlock}{moment}{addresseeChip}</>}
            inputTools={tools}
            onLiveView={setLiveView}
            onDraftText={setDraft}
            resolveSend={resolveSend}
            showLiveView={false}
          />
        </>
      )}
    </>
  );
  return (
    <div className={g.game}>
      <div className={g.column}>
        <section className={g.scene} aria-label={c("Сцена", "Scene")}>
          {stageFrameUrl ? (
            // The live frame takes the header's place once it is ready (polish group 6, STAGE_V §7.2).
            // eslint-disable-next-line @next/next/no-img-element
            <img className={g.sceneImage} src={stageFrameUrl} alt={c("Кадр этого хода", "Frame of this turn")} />
          ) : place ? <Art subject={{ kind: "location", id: place.id }} name={place.name} className={g.sceneImage} position="center 40%" />
            : <div className={`${r.blankArt} ${g.sceneBlank}`} aria-hidden="true" />}
          <div className={g.sceneCaption}>
            <div className={r.stack} style={{ gap: 2 }}>
              <span className={g.sceneTitle}>{place?.name ?? view.scene?.title ?? c("Новая глава", "A new chapter")}</span>
              <span className={g.sceneSub}>{[session?.title, view.scene?.title !== place?.name ? view.scene?.title : null].filter(Boolean).join(" · ")}</span>
            </div>
            <button type="button" className={`${r.btnGhost} ${g.asideToggle}`} aria-expanded={asideOpen} aria-controls="registry-game-aside" onClick={() => setAsideOpen((open) => !open)}>
              <Users size={18} aria-hidden="true" />{c("Герой и партия", "Hero & party")}
            </button>
          </div>
        </section>
        {/* Stage V: the frame of the current turn, drawn while the DM writes; past frames stay with their turns. */}
        <FramesPanel data={data} play={play} live={live} stage chronicleHref={chrome?.href?.("chronicle" as CampaignScreenId) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/chronicle`} />
        {diceOpen && (
          <section id="registry-dice-tray" className={g.tray} aria-label={c("Лоток с кубами", "Dice tray")}>
            <span className={r.eyebrow}>{c("Быстрые броски", "Quick rolls")}</span>
            {rolls.length ? (
              <div className={g.quick}>
                {rolls.map((roll) => (
                  <button key={roll.label} type="button" className={g.quickButton} disabled={busy}
                    onClick={() => insert(c(`Хочу проверку: ${roll.label}${roll.bonus && roll.bonus !== "✦" ? ` (${roll.bonus})` : ""}.`, `I'd like a check: ${roll.label}${roll.bonus && roll.bonus !== "✦" ? ` (${roll.bonus})` : ""}.`))}>
                    <span>{roll.label}</span><span>{roll.bonus}</span>
                  </button>
                ))}
                <button type="button" className={g.quickButton} disabled={busy} onClick={() => insert(c("Бросаю: ", "I roll: "))}>
                  <span>{c("Своя формула", "Custom formula")}</span><span>…</span>
                </button>
              </div>
            ) : <p className={r.empty}>{c("В листе героя пока нет навыков для быстрых бросков.", "The hero's sheet has no skills for quick rolls yet.")}</p>}
            <span className={r.note}>{c("Кубы бросает сервер, ведущий решает, нужна ли проверка. Кнопка только подсказывает текст хода.", "The server rolls; the DM decides whether a check is needed. These buttons only suggest the text of your turn.")}</span>
          </section>
        )}
        <article className={g.feed} aria-label={c("Ход", "Turn")}>
          {feed}
        </article>
        {!preview && play && !play.startupPending && combat && (
          <section className={g.media} aria-label={c("Бой", "Combat")}>
            <GameplayCombat play={play} onSaved={runtime.afterMutation} manualControls={false} />
          </section>
        )}
        {!preview && play && !play.startupPending && (
          <details className={g.more} open={combat || play.turns.some((turn) => turn.mode === "mechanic" && isUnresolved(turn)) || undefined}>
            <summary>{c("Ещё · бой, отдых, сессия, записи и правки", "More · combat, rest, session, records and corrections")}</summary>
            <div className={r.stack}>
              {play.rulesetId === "world-logic-v1" && <CombatReadiness campaignId={data.campaign.id} runtimeRevision={play.revision} onSaved={runtime.afterMutation} />}
              {!combat && (play.turns.some((turn) => turn.mode === "mechanic") || play.rulesetId !== "world-logic-v1") && (
                <GameplayCombat play={play} onSaved={runtime.afterMutation} manualControls={false} />
              )}
              {play.turns.some((turn) => turn.mode === "mechanic") && (
                <GameplayComposer play={play} mode="mechanic" onSaved={runtime.afterMutation} historyOnly />
              )}
              {play.rulesetId !== "world-logic-v1" && <GameplayRest play={play} onSaved={runtime.afterMutation} />}
              <GameSessionControls sessionId={session?.id ?? null} />
              {loopRuntime ? <SessionEnd sessionId={session?.id ?? null} /> : (
                <details className={r.stack}>
                  <summary>{c("Закончить сессию", "End the session")}</summary>
                  <SessionMemoryPanel sessionId={session?.id ?? null} />
                </details>
              )}
              <div className={r.row}>
                <button type="button" className={r.btnGhost} onClick={() => setResume(true)}>{c("Правка точки продолжения", "Edit the resume point")}</button>
                {session && <button type="button" className={r.btnGhost} onClick={() => setSceneEditor("new")}>{c("Добавить запись в стенограмму", "Add a transcript record")}</button>}
                <Link className={r.btnGhost} href={href("sessions")}>{c("Сессии", "Sessions")}</Link>
                <Link className={r.btnGhost} href={href("camp")}>{c("Лагерь и отдых", "Camp and rest")}</Link>
                <Link className={r.btnGhost} href={`${href("journal")}?tab=Notes&compose=note`}>{c("Записать заметку", "Take note")}</Link>
                <Link className={r.btnGhost} href={`${href("journal")}?tab=Evidence`}>{c("Что я знаю?", "What do I know?")}</Link>
              </div>
              {session && <Transcript data={data} session={session} onEdit={setSceneEditor} />}
              {(play.rulesetId !== "world-logic-v1" || play.configuration) && (
                <details>
                  <summary>{c.t("Manual encounter controls")}</summary>
                  <GameplayCombat play={play} onSaved={runtime.afterMutation} />
                </details>
              )}
            </div>
          </details>
        )}
        {resume && <ResumeEditor data={data} onClose={() => setResume(false)} />}
        {sceneEditor && session && <SceneEditor scene={sceneEditor === "new" ? undefined : sceneEditor} sessionId={session.id} onClose={() => setSceneEditor(null)} />}
      </div>
      <aside id="registry-game-aside" className={g.aside} data-open={asideOpen ? "true" : "false"} aria-label={c("Герой, партия и цели", "Hero, party and goals")}>
        <Panel label={c("Герой", "Hero")}>
          {hero ? (
            <div className={r.stack}>
              <div className={g.heroHead}>
                <span className={g.heroPortrait}><Art subject={{ kind: "entity", id: hero.id }} name={hero.name} position="center 25%" /></span>
                <div>
                  <div className={g.heroName}>{hero.name}</div>
                  {heroSummary(data, hero, c) && <div className={`${r.small} ${r.muted}`}>{heroSummary(data, hero, c)}</div>}
                  {heroLine(data, hero, c) && <div className={r.small} style={{ color: "var(--brass)" }}>{heroLine(data, hero, c)}</div>}
                </div>
              </div>
              {hero.hp !== null && <Gauge label={c("Хиты", "Hit points")} value={hero.hp} max={hero.max_hp} />}
              {(resources.length > 0 || money.length > 0) && (
                <dl className={g.resources}>
                  {resources.slice(0, 6).map((resource) => (
                    <div key={resource.key} className={r.resRow}>
                      <dt>{c.label(resource.label)}</dt>
                      <dd>{resource.max ? <Pips left={resource.value} max={resource.max} label={c.label(resource.label)} /> : resource.value}</dd>
                    </div>
                  ))}
                  {money.map((row) => (
                    <div key={row.key} className={r.resRow}><dt>{c.label(row.label)}</dt><dd>{row.value}</dd></div>
                  ))}
                </dl>
              )}
              <div className={r.row}>
                <Link className={r.btnGhost} href={href("character")}>{c("Лист персонажа", "Character sheet")}</Link>
                <Link className={r.btnGhost} href={href("journal")}>{c("Журнал", "Journal")}</Link>
              </div>
            </div>
          ) : <p className={r.empty}>{c("Героя пока нет.", "No hero yet.")}</p>}
        </Panel>
        {quests.goal && (
          <Panel eyebrow={c("Цель", "Goal")}>
            <div className={r.stack} style={{ gap: 6 }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.3 }}>{quests.goal.title}</span>
              {quests.goal.description && <span className={`${r.small} ${r.muted}`}>{quests.goal.description}</span>}
              <Link className={r.small} href={href("journal")} style={{ color: "var(--brass)" }}>{c("Открыть журнал заданий", "Open the quest journal")}</Link>
            </div>
          </Panel>
        )}
        <Panel eyebrow={c("Партия", "Party")} action={<Link className={r.small} href={href("party")} style={{ color: "var(--brass)" }}>{c("все", "all")}</Link>}>
          {present.length ? present.map(({ entity }) => (
            <Link key={entity.id} className={g.member} href={href("party")}>
              <Avatar subject={{ kind: "entity", id: entity.id }} name={entity.name} small />
              <div className={r.stack} style={{ gap: 4 }}>
                <div className={g.memberTop}><span>{entity.name}</span>{entity.hp !== null && <span>{entity.max_hp ? `${entity.hp} / ${entity.max_hp}` : entity.hp}</span>}</div>
                {entity.hp !== null && entity.max_hp ? <ThinBar value={entity.hp} max={entity.max_hp} label={c(`Хиты: ${entity.name}`, `HP: ${entity.name}`)} /> : null}
              </div>
            </Link>
          )) : <p className={r.empty}>{c("Рядом никого из спутников.", "No companions nearby.")}</p>}
        </Panel>
        {(journal.debts.length > 0 || journal.promises.length > 0) && (
          <Panel eyebrow={c("Долги и обещания", "Debts and promises")}>
            <ul className={r.stack} style={{ listStyle: "none", margin: 0, padding: 0, gap: 6 }}>
              {[...journal.debts, ...journal.promises].slice(0, 6).map((entry) => (
                <li key={entry.quest.id} className={r.row} style={{ gap: 6 }}>
                  <span className={r.chip}>{entry.kind === "debt" ? c("долг", "debt") : c("обещание", "promise")}</span>
                  <span>{entry.quest.title}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
        {journal.threads.length > 0 && (
          <Panel eyebrow={c("Зацепки", "Leads")}>
            <ul className={r.stack} style={{ listStyle: "none", margin: 0, padding: 0, gap: 6 }}>
              {journal.threads.slice(0, 6).map((entry) => (
                <li key={entry.quest.id}>{entry.quest.title}</li>
              ))}
            </ul>
            <Link className={r.small} href={href("journal")} style={{ color: "var(--brass)" }}>{c("Журнал", "Journal")}</Link>
          </Panel>
        )}
      </aside>
    </div>
  );
}

/** Synthetic preview of the feed: saved turns, the provisional turn and a composer that sends nothing. */
function PreviewFeed({ data, play, liveBlock, opening, moment, tools, inserted, heroName, mode }: {
  data: CampaignSnapshot; play: PlaySnapshot; liveBlock: ReactNode; opening: ReactNode; moment: ReactNode; tools: ReactNode;
  inserted: string; heroName: string | null; mode: string;
}) {
  const c = useCopy();
  void data;
  return (
    <>
      <div className="gameplay-turns" role="log" aria-label={c("Сохранённые ходы", "Saved turns")}>
        {opening}
        {play.turns.filter((turn) => turn.mode === "game").map((turn) => (
          <div key={turn.id} className="session-saved-turn">
            <GameplayTurn turn={turn} busy onCommand={() => {}} onSaved={async () => {}} />
          </div>
        ))}
      </div>
      {liveBlock}
      {moment}
      <form onSubmit={(event) => event.preventDefault()} aria-label={c("Ход игрока", "Your turn")}>
        <label className="field">
          <span>{mode === "ooc" ? c("Вопрос вне игры", "Out-of-game question") : c("Твой ход", "Your turn")}</span>
          <textarea rows={3} readOnly value={inserted} placeholder={c(`Что делает ${heroName ?? "герой"}?`, `What does ${heroName ?? "the hero"} do?`)} />
        </label>
        <div className="button-group">
          <button type="submit" className={r.btnMain} disabled><Send size={18} aria-hidden="true" />{c("Отправить", "Send")}</button>
          <span className={r.note}>{c("Предпросмотр: ход не отправляется.", "Preview: nothing is sent.")}</span>
        </div>
        {tools}
      </form>
    </>
  );
}

/** The streamed turn: the text as the DM writes it (the turn's own «Ведущий думает…» line is the only
 * indicator before the first word), then the accepted changes of the saved turn, folded (polish group 6). */
function LiveBlock({ view, phase, deeper = null }: { view: LiveTurnView; phase: LivePhase; deeper?: string | null }) {
  const c = useCopy();
  const changes = orderChanges(liveChanges(view));
  if (phase === "saved" && !changes.length && !deeper) return null;
  return (
    <div className="gameplay-live-turn" role="status" aria-live="polite">
      {phase === "streaming" && view.text && <div className="prose">{view.text}<span className={g.caret} aria-hidden="true" /></div>}
      {phase === "saved" && (
        <details key={view.operationId} className={g.changes}>
          <summary>
            <span>{c(`Изменения за ход · ${changes.length}`, `Changes this turn · ${changes.length}`)}</span>
            {deeper && <span className={r.muted}>{deeper}</span>}
          </summary>
          {changes.length > 0 && (
            <ul className="gameplay-live-changes">
              {changes.map((change, index) => <li key={index}>{change.summary}</li>)}
            </ul>
          )}
        </details>
      )}
    </div>
  );
}
