"use client";

import Link from "next/link";
import { sheetLines } from "@/lib/inventory/sheet";
import { useState, type ReactNode } from "react";
import { Dices, HelpCircle, Image as ImageIcon, Send, Users, Zap } from "lucide-react";
import type { CampaignSnapshot, Entity, Scene } from "@/lib/persistence/contracts";
import type { PlaySnapshot, PublicTurn } from "@/lib/gameplay/contracts";
import { withLiveCounters, type LiveTurnView } from "@/lib/gameplay/live-turn-client";
import type { LiveTrace } from "@/lib/ui/turn-timeline";
import type { PublicAdventure } from "@/lib/adventures/contracts";
import { isUnresolved } from "@/lib/gameplay/client-state";
import { frameStatusText } from "@/lib/visual-frame/pictures";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { characterViewModel } from "@/lib/character-view-model";
import { isFifthEdition } from "@/lib/live2d/battle/rules-5e";
import {
  currentPlace,
  currentSession,
  sheetPlates,
  heroOf,
  inCombat,
  journalOf,
  partyOf,
  questsOf,
  resourcesOf,
  walletOf,
} from "@/lib/ui/campaign-view";
import { useGameplayRuntime } from "../gameplay-runtime";
import { GameplayComposer } from "../gameplay-composer";
import { GameplayTurn } from "../gameplay-turn";
import { GameplayCombat } from "../gameplay-combat";
import { GameplayRest } from "../gameplay-actions";
import { CombatReadiness } from "../combat-readiness";
import { SessionMemoryPanel, SessionPendingCompanion } from "../session-memory";
import { currentFrameTurnId, FramesPanel, useOpeningFrame, usePictures } from "./live-frames";
import { SessionEnd } from "./session-end";
import { useAddressee, useTurnAftermath } from "./turn-aftermath";
import { useSessionMemory } from "../session-memory-runtime";
import {
  createGameViewModel,
  GameSessionControls,
  ResumeEditor,
  SceneEditor,
  Transcript,
} from "../persistent-game";
import { useChrome, useDmSettings, useShellClock, type CampaignScreenId } from "./shell";
import { saveDmSettings } from "@/lib/gameplay/dm-settings-client";
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
import { counterLabel } from "@/lib/inventory/model";

export type GamePreview = {
  play: PlaySnapshot;
  live?: LiveTurnView | null;
  playerMoment?: boolean;
  adventure?: PublicAdventure | null;
  diceOpen?: boolean;
  asideOpen?: boolean;
  /** Stage C: the turn being told (its record and its stream with the order of its events). */
  telling?: { turn: PublicTurn; trace: LiveTrace | null } | null;
  /** The DM option «Броски спутников» for the preview (default: the DM rolls them). */
  companionRolls?: "dm" | "player";
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
  // Fix S3-accept Г1: the sheet's plates (in 5e «КД 13 · Атака +7 · Навык +3», the server's numbers).
  const numbers = sheetPlates(data, hero, model.derivedStats).filter((plate) => plate.key !== "speed").slice(0, 3)
    .map((plate) => `${plate.translated ? plate.label : c.label(plate.label)} ${plate.value}`);
  return [...skills, ...conditions, ...(skills.length ? [] : numbers)].join(" · ");
}

/** Skills and spells exactly as the character's sheet lists them; absent when the sheet has none. */
export function quickRolls(hero: Entity | null) {
  const sheet = hero?.character_sheet ? sheetLines(hero.character_sheet) : null;
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
  // The same input-mode state the earlier game screen kept ("game" or out-of-character).
  const [inputMode, setInputMode] = useState<"game" | "ooc">("game");
  const ooc = inputMode === "ooc";
  const setOoc = (next: boolean | ((value: boolean) => boolean)) =>
    setInputMode((current) => ((typeof next === "function" ? next(current === "ooc") : next) ? "ooc" : "game"));
  const [diceOpen, setDiceOpen] = useState(preview?.diceOpen ?? false);
  // Fix run E (item 77): the frame button's answer in words.
  const [frameNote, setFrameNote] = useState<string | null>(null);
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
  // Fix S3-pre B-16 (the owner's decision): «⚡ важный ход» is back — the next turn takes the top of the depth range
  // (the server's boostNext path, stage 4 §7; removed from the screen in polish group 6).
  const [boost, setBoost] = useState<boolean | null>(null);
  const boosted = boost ?? dmSettings?.boostNext ?? false;
  const toggleBoost = async () => {
    if (!dmSettings || preview) { setBoost((value) => !(value ?? false)); return; }
    const next = !boosted;
    setBoost(next);
    try { await saveDmSettings(data.campaign.id, { expectedRevision: dmSettings.revision, runtime: dmSettings.runtime, dmTurn: dmSettings.dmTurn, boostNext: next }); }
    catch { setBoost(!next); }
  };
  const place = currentPlace(data);
  const combat = inCombat(play);
  const fifthEdition = isFifthEdition(data.settings?.values?.rulesSystem);
  // Polish group 6: the addressee is read from the text («@Тамсин», «Тамсин, …»); «Миру» overrides it for this draft
  // (shared with the 2D scene since Fix S3-accept Б4).
  const { detected, resolveSend, chip: addresseeChip, setDraft } = useAddressee({ present: present.map((row) => row.entity), combat, off: ooc });
  const talkTo = detected?.id ?? null;
  const mode = ooc ? "ooc" : "game";
  const busy = !!play?.turns.some(isUnresolved);
  const href = (screen: CampaignScreenId) =>
    chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const insert = (text: string) => {
    if (preview) { setInserted(text); return; }
    if (busy) return;
    if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode, companionId: null, timeline: data.timeline, text }))
      setNonce((value) => value + 1);
  };
  const rolls = quickRolls(hero);
  // Fix S3-accept В1: a slot the server just recorded as spent dims at once (the live turn's counter over the records).
  const liveNow = preview ? preview.live ?? null : liveView;
  const liveFresh = !!liveNow && (play?.turns.at(-1)?.id === liveNow.operationId || !play?.turns.some((turn) => turn.id === liveNow.operationId));
  const resources = hero ? resourcesOf(withLiveCounters(hero, liveFresh ? liveNow : null)).resources : [];
  // Polish group 8: the wallet always shows (0 by default, the world's currency name).
  const money = hero ? walletOf(data, hero) : [];
  const opening = mode === "game" && view.showOpening && (
    <article className={g.opening}>{view.story || c("История готова начаться. Здесь появится первая сцена.", "Your story is ready to begin. The opening scene will appear here.")}</article>
  );
  const live = preview ? preview.live ?? null : liveView;
  const pictures = usePictures();
  // Fix run after session 2 (item 29): the approved opening gets its frame — the starting place's picture.
  useOpeningFrame(data, preview ? null : play);
  // Fix run E (item 77): the button draws the frame of the last turn with narration (never a failed or out-of-game one);
  // the frame appears in that turn, in place — the page never scrolls through the campaign — and every answer but
  // «queued» is said in words.
  const frameTurnId = currentFrameTurnId(play, live);
  // The saved turn's folded changes and «Твой момент» (shared with the 2D scene since Fix S3-accept Б4).
  const { liveBlock, moment } = useTurnAftermath({ play, live, mode, dmSettings, forceMoment: !!preview?.playerMoment });
  const loopRuntime = !dmSettings || dmSettings.runtime === "dm-loop-v1";
  // Item 44: by default the DM rolls for the companions (chips in place); the option gives the player their cards.
  const companionRolls = preview?.companionRolls ?? dmSettings?.options?.companionRolls ?? "dm";
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
          if (!pictures || !frameTurnId) return;
          const turnId = frameTurnId;
          setFrameNote(null);
          void pictures.send("pictures.frame", { operationId: turnId, trigger: "redraw" }).catch(() => ({ status: "error" })).then((result) => {
            setFrameNote(frameStatusText((result as { status?: unknown } | null)?.status, c.language === "en" ? "en" : "ru"));
            document.getElementById(`turn-frame-${turnId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
        }}>
        <ImageIcon size={18} aria-hidden="true" />
      </button>
      {(dmSettings?.depth || preview) && (
        <button type="button" className={boosted ? r.iconBtnOn : r.iconBtn} aria-pressed={boosted} aria-label={c("Важный ход", "Important turn")}
          title={c("Важный ход: следующий ход ведущий обдумает на максимальной глубине", "Important turn: the DM thinks the next turn through at the top of the depth range")} onClick={() => void toggleBoost()}>
          <Zap size={18} aria-hidden="true" />
        </button>
      )}
      {frameNote && <span className={r.note} role="status">{frameNote}</span>}
    </div>
  );
  const feed = preview ? (
    <PreviewFeed play={preview.play} telling={preview.telling ?? null} companionRolls={companionRolls} liveBlock={liveBlock} opening={opening} moment={moment} tools={tools}
      inserted={inserted} heroName={hero?.name ?? null} mode={mode} />
  ) : (
    <>
      {runtime.loading && <p role="status" className={r.muted}>{c("Загружаю сохранённые ходы…", "Loading saved turns…")}</p>}
      {runtime.error && <p role="alert" className={r.error}>{c.t(runtime.error)}</p>}
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
                <GameplayTurn turn={turn} companionRolls={companionRolls} busy onCommand={() => {}} onSaved={async () => {}} />
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
            companionRolls={companionRolls}
          />
        </>
      )}
    </>
  );
  return (
    <div className={g.game}>
      <div className={g.column}>
        <section className={g.scene} aria-label={c("Сцена", "Scene")}>
          {/* Fix run E (item 77): the header shows the place; each frame lives in its own turn. */}
          {/* Item 29: while the place's picture (the opening's frame) is in work the header says so. */}
          {place ? <Art subject={{ kind: "location", id: place.id }} name={place.name} className={g.sceneImage} position="center 40%" drawingLabel={c("кадр сцены рисуется…", "drawing the scene…")} />
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
        <FramesPanel data={data} play={play} live={live} stage chronicleHref={chrome?.href?.("pictures" as CampaignScreenId) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/pictures`} />
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
          <section className={g.playerActions} aria-label={c("Действия игрока", "Player actions")}>
            <div className={r.row}>
              <Link className={r.btnGhost} href={href("camp")}>{c("Лагерь и отдых", "Camp and rest")}</Link>
              <Link className={r.btnGhost} href={`${href("journal")}?tab=Notes&compose=note`}>{c("Записать заметку", "Take note")}</Link>
              <Link className={r.btnGhost} href={`${href("journal")}?tab=Evidence`}>{c("Что я знаю?", "What do I know?")}</Link>
              {/* Item 30: the quietest of the four, last in the row. */}
              {loopRuntime && <SessionEnd sessionId={session?.id ?? null} compact />}
            </div>
            <span className={r.note}>{c(
              "«Лагерь» — отдых и лечение. «Заметка» — твоя запись в журнал. «Что я знаю?» — улики и факты, которые герой уже узнал. «Закончить сессию» — ведущий подведёт итог главы и покажет, что тем временем случилось.",
              "“Camp” — rest and healing. “Note” — your own journal entry. “What do I know?” — the clues and facts the hero has learned. “End the session” — the DM sums up the chapter and shows what happened meanwhile.")}</span>
          </section>
        )}
        {!preview && play && !play.startupPending && (
          // Item 57: the owner's editor opens only when the owner opens it (never forced open by a fight or a poll).
          <details className={g.more}>
            <summary>{c("Редактор кампании · для владельца", "Campaign editor · for the owner")}</summary>
            <div className={r.stack}>
              <span className={r.note}>{c("Инструменты правки записей. В обычной игре они не нужны: ведущий ведёт всё сам. Каждый подписан — когда он может пригодиться.", "Tools for correcting the records. Ordinary play does not need them: the DM keeps everything. Each one says when it may be useful.")}</span>
              <Link className={r.btnGhost} href={href("owner")}>{c("Цена ходов и что видит ведущий", "The price of turns and what the DM sees")}</Link>
              {play.rulesetId === "world-logic-v1" && (
                <div className={r.stack}>
                  <span className={`${r.small} ${r.muted}`}>{c("Боевая готовность: утвердить боевые числа героя, если их не было при создании.", "Combat readiness: approve the hero's combat numbers if creation had none.")}</span>
                  <CombatReadiness campaignId={data.campaign.id} runtimeRevision={play.revision} onSaved={runtime.afterMutation} />
                </div>
              )}
              {!combat && (play.turns.some((turn) => turn.mode === "mechanic") || play.rulesetId !== "world-logic-v1") && (
                <div className={r.stack}>
                  <span className={`${r.small} ${r.muted}`}>{c("Бой по правилам: ручной учёт, если ведущий ошибся в раунде.", "Combat by the rules: manual bookkeeping when the DM got a round wrong.")}</span>
                  <GameplayCombat play={play} onSaved={runtime.afterMutation} manualControls={false} />
                </div>
              )}
              {play.turns.some((turn) => turn.mode === "mechanic") && (
                <div className={r.stack}>
                  <span className={`${r.small} ${r.muted}`}>{c("Механические ходы: история прямых команд правилам.", "Mechanic turns: the history of direct rule commands.")}</span>
                  <GameplayComposer play={play} mode="mechanic" onSaved={runtime.afterMutation} historyOnly />
                </div>
              )}
              {play.rulesetId !== "world-logic-v1" && (
                <div className={r.stack}>
                  <span className={`${r.small} ${r.muted}`}>{c("Отдых по правилам: прямое восстановление, если лагерь не подошёл.", "Rest by the rules: a direct recovery when the camp did not fit.")}</span>
                  <GameplayRest play={play} onSaved={runtime.afterMutation} />
                </div>
              )}
              <div className={r.stack}>
                <span className={`${r.small} ${r.muted}`}>{c("Сессия как запись: открыть или закрыть её вручную, если итог не нужен.", "The session as a record: open or close it by hand when no digest is wanted.")}</span>
                <GameSessionControls sessionId={session?.id ?? null} />
              </div>
              {!loopRuntime && (
                <details className={r.stack}>
                  <summary>{c("Закончить сессию (прежний ход)", "End the session (previous runtime)")}</summary>
                  <SessionMemoryPanel sessionId={session?.id ?? null} />
                </details>
              )}
              <div className={r.stack}>
                <span className={`${r.small} ${r.muted}`}>{c("Правка записей: точка продолжения — откуда ведущий продолжит; запись в стенограмму — сцена, которую ты добавляешь сам; «Сессии» — список всех сессий.", "Record corrections: the resume point — where the DM continues from; a transcript record — a scene you add yourself; “Sessions” — the list of all sessions.")}</span>
                <div className={r.row}>
                  <button type="button" className={r.btnGhost} onClick={() => setResume(true)}>{c("Правка точки продолжения", "Edit the resume point")}</button>
                  {session && <button type="button" className={r.btnGhost} onClick={() => setSceneEditor("new")}>{c("Добавить запись в стенограмму", "Add a transcript record")}</button>}
                  <Link className={r.btnGhost} href={href("sessions")}>{c("Сессии", "Sessions")}</Link>
                </div>
              </div>
              {session && (
                <div className={r.stack}>
                  <span className={`${r.small} ${r.muted}`}>{c("Стенограмма: записи этой сессии; каждую можно исправить, историю ходов это не меняет.", "Transcript: this session's records; each can be corrected without changing the turn history.")}</span>
                  {/* Item 57: the session's records stay folded — opening the editor never unfolds the whole story under the play screen. */}
                  <details className={g.transcript}>
                    <summary>{c("Открыть стенограмму сессии", "Open the session transcript")}</summary>
                    <Transcript data={data} session={session} onEdit={setSceneEditor} />
                  </details>
                </div>
              )}
              {(play.rulesetId !== "world-logic-v1" || play.configuration) && (
                <details>
                  <summary>{c.t("Manual encounter controls")}</summary>
                  <span className={`${r.small} ${r.muted}`}>{c("Ручное управление столкновением: начать или закончить бой без ведущего.", "Manual encounter controls: start or end a fight without the DM.")}</span>
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
              {/* Fix S3 item 3: whether the 5e module counts the hero's armour class, saves and attacks; switched on «Правила и кости». */}
              <div className={r.chips}>
                <Link className={r.chip} href={`${href("settings")}#rules-and-dice`} data-testid="rules-5e-chip"
                  title={c("Переключается в «Настройки → Правила и кости»", "Switched in «Settings → Rules and dice»")}>
                  {fifthEdition ? c("5e-модуль: включён", "5e module: on") : c("5e-модуль: выключен", "5e module: off")}
                </Link>
              </div>
              {hero.hp !== null && <Gauge label={c("Хиты", "Hit points")} value={hero.hp} max={hero.max_hp} />}
              {(resources.length > 0 || money.length > 0) && (
                <dl className={g.resources}>
                  {resources.slice(0, 6).map((resource) => (
                    <div key={resource.key} className={r.resRow}>
                      {/* Fix S3-pre 2.4 (items 32, 52): the counter's own name in the campaign language, as the character screen shows it. */}
                      <dt>{hero ? counterLabel(hero, resource.key, c.language) : c.label(resource.label)}</dt>
                      <dd>{resource.max ? <Pips left={resource.value} max={resource.max} label={hero ? counterLabel(hero, resource.key, c.language) : c.label(resource.label)} /> : resource.value}</dd>
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

/** Synthetic preview of the feed: saved turns, the turn being told and a composer that sends nothing. */
function PreviewFeed({ play, telling, companionRolls, liveBlock, opening, moment, tools, inserted, heroName, mode }: {
  play: PlaySnapshot; telling: { turn: PublicTurn; trace: LiveTrace | null } | null; companionRolls: "dm" | "player";
  liveBlock: ReactNode; opening: ReactNode; moment: ReactNode; tools: ReactNode;
  inserted: string; heroName: string | null; mode: string;
}) {
  const c = useCopy();
  const turns = [...play.turns.filter((turn) => turn.mode === "game" && turn.id !== telling?.turn.id), ...(telling ? [telling.turn] : [])];
  return (
    // The composer's look (four lines, the story's size); not pinned, so a full-page shot shows it where it ends.
    <div className="gameplay-channel" data-preview="true">
      <div className="gameplay-turns" role="log" aria-label={c("Сохранённые ходы", "Saved turns")}>
        {opening}
        {turns.map((turn) => (
          <div key={turn.id} className="session-saved-turn">
            <GameplayTurn turn={turn} live={turn.id === telling?.turn.id ? telling.trace : null} companionRolls={companionRolls}
              busy={false} onCommand={() => {}} onSaved={async () => {}} />
          </div>
        ))}
      </div>
      {liveBlock}
      {moment}
      <form onSubmit={(event) => event.preventDefault()} aria-label={c("Ход игрока", "Your turn")}>
        <label className="field">
          <span>{mode === "ooc" ? c("Вопрос вне игры", "Out-of-game question") : c("Твой ход", "Your turn")}</span>
          <textarea rows={4} readOnly value={inserted} placeholder={c(`Что делает ${heroName ?? "герой"}?`, `What does ${heroName ?? "the hero"} do?`)} />
        </label>
        <div className="button-group gameplay-send-row">
          <button type="submit" className={r.btnMain} disabled><Send size={18} aria-hidden="true" />{c("Отправить", "Send")}</button>
          {tools}
          <span className={r.note}>{c("Предпросмотр: ход не отправляется.", "Preview: nothing is sent.")}</span>
        </div>
      </form>
    </div>
  );
}
