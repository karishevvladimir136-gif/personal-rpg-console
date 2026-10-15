"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Dices, HelpCircle, Image as ImageIcon, Send, Sparkles, Users } from "lucide-react";
import type { CampaignSnapshot, Entity, Scene } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { LiveTurnView } from "@/lib/gameplay/live-turn-client";
import type { AdventureCatalog, PublicAdventure } from "@/lib/adventures/contracts";
import { createAdventureTransport } from "@/lib/adventures/client";
import { isUnresolved } from "@/lib/gameplay/client-state";
import { activeAdventure, adventureElapsed, envelopeLabel } from "@/lib/ui/adventure-view";
import { appendToComposerDraft, draftStorage } from "@/lib/ui/composer-draft";
import { characterViewModel } from "@/lib/character-view-model";
import {
  currentPlace,
  currentSession,
  statLabel,
  heroOf,
  inCombat,
  partyOf,
  questsOf,
  resourcesOf,
} from "@/lib/ui/campaign-view";
import { useGameplayRuntime } from "../gameplay-runtime";
import { GameplayComposer } from "../gameplay-composer";
import { GameplayTurn } from "../gameplay-turn";
import { GameplayCombat } from "../gameplay-combat";
import { GameplayRest } from "../gameplay-actions";
import { CombatReadiness } from "../combat-readiness";
import { SessionPendingCompanion } from "../session-memory";
import { CurrentSceneMediaFrame } from "../visual-frame/current-scene-media-frame";
import { CurrentSceneVideo } from "../visual-frame/current-scene-video";
import {
  createGameViewModel,
  GameSessionControls,
  ResumeEditor,
  SceneEditor,
  Transcript,
} from "../persistent-game";
import { useChrome, useShellClock, type CampaignScreenId } from "./shell";
import {
  Art,
  Avatar,
  Gauge,
  Later,
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
/** The first mechanical values the record keeps (whatever the ruleset calls them). */
function quickStats(data: CampaignSnapshot, hero: Entity, c: Copy) {
  return characterViewModel(data, hero).derivedStats.slice(0, 3)
    .map(([key, value]) => `${c.t(statLabel(key))} ${value}`).join(" · ");
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

function useActiveAdventure(data: CampaignSnapshot, skip: boolean) {
  const [catalog, setCatalog] = useState<AdventureCatalog | null>(null);
  useEffect(() => {
    if (skip || !data.timeline) return;
    const controller = new AbortController();
    createAdventureTransport().read(data.campaign.id, data.timeline, controller.signal).then(setCatalog, () => {});
    return () => controller.abort();
  }, [data.campaign.id, data.timeline, skip]);
  return activeAdventure(catalog);
}

export function RegistryGame({ data, preview }: { data: CampaignSnapshot; preview?: GamePreview }) {
  const c = useCopy();
  const chrome = useChrome();
  const runtime = useGameplayRuntime(!!preview);
  const play = preview?.play ?? runtime.play;
  useShellClock(play?.worldMinutes);
  const [addressee, setAddressee] = useState<string | null>(null);
  const [ooc, setOoc] = useState(false);
  const [diceOpen, setDiceOpen] = useState(preview?.diceOpen ?? false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(preview?.asideOpen ?? false);
  const [nonce, setNonce] = useState(0);
  const [inserted, setInserted] = useState("");
  const [resume, setResume] = useState(false);
  const [sceneEditor, setSceneEditor] = useState<Scene | "new" | null>(null);
  const fetchedAdventure = useActiveAdventure(data, !!preview);
  const adventure = preview ? preview.adventure ?? null : fetchedAdventure;
  const view = createGameViewModel(data, play);
  const hero = heroOf(data, play);
  const party = partyOf(data, play);
  const present = party.filter((row) => row.present);
  const quests = questsOf(data);
  const session = currentSession(data);
  const place = currentPlace(data);
  const combat = inCombat(play);
  const talkTo = combat ? null : addressee;
  const mode = ooc ? "ooc" : talkTo ? "companion" : "game";
  const busy = !!play?.turns.some(isUnresolved);
  const href = (screen: CampaignScreenId) =>
    chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  const insert = (text: string) => {
    if (preview) { setInserted(text); return; }
    if (busy) return;
    if (appendToComposerDraft(draftStorage(), { campaignId: data.campaign.id, mode, companionId: talkTo, timeline: data.timeline, text }))
      setNonce((value) => value + 1);
  };
  const rolls = quickRolls(hero);
  const { resources, money } = hero ? resourcesOf(hero) : { resources: [], money: [] };
  const opening = mode === "game" && view.showOpening && (
    <div className={g.opening}>{view.story || c("История готова начаться. Здесь появится первая сцена.", "Your story is ready to begin. The opening scene will appear here.")}</div>
  );
  const moment = preview?.playerMoment ? (
    <div className={g.moment} role="status">
      <Sparkles size={26} color="var(--brass-hi)" aria-hidden="true" />
      <div>
        <div className={g.momentTitle}>{c("Твой момент", "Your moment")}</div>
        <span className={r.small}>{c("Ведущий отдал тебе кульминацию: опиши, как ты это делаешь. Результат броска уже принят — твои слова станут каноном.", "The DM hands you the climax: describe how you do it. The roll stands; your words become canon.")}</span>
      </div>
    </div>
  ) : null;
  const tools = (
    <div className={g.composerShell}>
      <div className={g.addressee} role="group" aria-label={c("Кому ты говоришь", "Who you address")}>
        <span>{c("Кому:", "To:")}</span>
        <button type="button" className={r.chipButton} aria-pressed={!talkTo && !ooc} onClick={() => { setAddressee(null); setOoc(false); }}>
          {c("Миру и ведущему", "The world")}
        </button>
        {present.map(({ entity }) => (
          <button key={entity.id} type="button" className={r.chipButton} aria-pressed={talkTo === entity.id && !ooc}
            disabled={combat} title={combat ? c("В бою разговоры недоступны", "Not during combat") : undefined}
            onClick={() => { setAddressee(entity.id); setOoc(false); }}>
            {entity.name}
          </button>
        ))}
      </div>
      <div className={g.tools}>
        <button type="button" className={diceOpen ? r.btn : r.btnGhost} aria-pressed={diceOpen} aria-controls="registry-dice-tray" onClick={() => setDiceOpen((open) => !open)}>
          <Dices size={18} aria-hidden="true" />{c("Кубы", "Dice")}
        </button>
        <button type="button" className={ooc ? r.btn : r.btnGhost} aria-pressed={ooc} onClick={() => setOoc((value) => !value)}>
          <HelpCircle size={18} aria-hidden="true" />{c("Вопрос ведущему", "Ask the DM")}
        </button>
        <button type="button" className={mediaOpen ? r.btn : r.btnGhost} aria-pressed={mediaOpen} disabled={!!preview} onClick={() => setMediaOpen((open) => !open)}>
          <ImageIcon size={18} aria-hidden="true" />{c("Кадр сцены", "Scene frame")}
        </button>
      </div>
    </div>
  );
  const feed = preview ? (
    <PreviewFeed data={data} play={preview.play} live={preview.live ?? null} opening={opening} moment={moment} tools={tools}
      inserted={inserted} heroName={hero?.name ?? null} mode={mode} />
  ) : (
    <>
      {runtime.loading && <p role="status" className={r.muted}>{c("Загружаю сохранённые ходы…", "Loading saved turns…")}</p>}
      {runtime.error && <p role="alert" className={r.error}>{runtime.error}</p>}
      {play?.startupPending && (
        <div role="status" className={r.later}>
          <span>{c("Перед первым ходом закончи вступление приключения и настройку ведущего.", "Finish the adventure opening and DM setup before the first action.")}</span>
          <Link className={r.btn} href={href("adventures")}>{c("Проверить вступление", "Review the opening")}</Link>
        </div>
      )}
      {play && !play.startupPending && (
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
            beforeInput={moment}
            inputTools={tools}
          />
        </>
      )}
    </>
  );
  return (
    <div className={g.game}>
      <div className={g.column}>
        <section className={g.scene} aria-label={c("Сцена", "Scene")}>
          {place ? <Art subject={{ kind: "location", id: place.id }} name={place.name} className={g.sceneImage} position="center 40%" />
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
        {talkTo && (
          <p className={r.note} role="status">
            {c(`Разговор с ${party.find((row) => row.entity.id === talkTo)?.entity.name ?? ""}: это сцена в мире — идёт время, а спутник запомнит сказанное.`,
              `Talking to ${party.find((row) => row.entity.id === talkTo)?.entity.name ?? ""}: a scene in the world — time passes and your companion remembers.`)}
          </p>
        )}
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
        <article className={g.feed} aria-label={c("Ход", "Turn")}>{feed}</article>
        {mediaOpen && !preview && (
          <section className={g.media} aria-label={c("Кадр и видео сцены", "Scene frame and video")}>
            <CurrentSceneMediaFrame />
            <CurrentSceneVideo />
          </section>
        )}
        {!preview && play && !play.startupPending && (
          <details className={g.more} open={combat || play.turns.some((turn) => turn.mode === "mechanic" && isUnresolved(turn)) || undefined}>
            <summary>{c("Ещё · бой, отдых, сессия, записи и правки", "More · combat, rest, session, records and corrections")}</summary>
            <div className={r.stack}>
              {play.rulesetId === "world-logic-v1" && <CombatReadiness campaignId={data.campaign.id} runtimeRevision={play.revision} onSaved={runtime.afterMutation} />}
              {(combat || play.turns.some((turn) => turn.mode === "mechanic") || play.rulesetId !== "world-logic-v1") && (
                <GameplayCombat play={play} onSaved={runtime.afterMutation} manualControls={false} />
              )}
              {play.turns.some((turn) => turn.mode === "mechanic") && (
                <GameplayComposer play={play} mode="mechanic" onSaved={runtime.afterMutation} historyOnly />
              )}
              {play.rulesetId !== "world-logic-v1" && <GameplayRest play={play} onSaved={runtime.afterMutation} />}
              <GameSessionControls sessionId={session?.id ?? null} />
              <div className={r.row}>
                <button type="button" className={r.btnGhost} onClick={() => setResume(true)}>{c("Правка точки продолжения", "Edit the resume point")}</button>
                {session && <button type="button" className={r.btnGhost} onClick={() => setSceneEditor("new")}>{c("Добавить запись в стенограмму", "Add a transcript record")}</button>}
                <Link className={r.btnGhost} href={href("sessions")}>{c("Сессии", "Sessions")}</Link>
                <Link className={r.btnGhost} href={href("camp")}>{c("Лагерь и отдых", "Camp and rest")}</Link>
              </div>
              {session && <Transcript data={data} session={session} onEdit={setSceneEditor} />}
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
                  {quickStats(data, hero, c) && <div className={`${r.num} ${r.small}`} style={{ color: "var(--brass)" }}>{quickStats(data, hero, c)}</div>}
                </div>
              </div>
              {hero.hp !== null && <Gauge label={c("Хиты", "Hit points")} value={hero.hp} max={hero.max_hp} />}
              {resources.length > 0 && (
                <div>
                  {resources.slice(0, 6).map((resource) => (
                    <div key={resource.key} className={r.resRow}>
                      <span>{c.t(resource.label)}</span>
                      {resource.max ? <Pips left={resource.value} max={resource.max} label={c.t(resource.label)} /> : <span className={r.num}>{resource.value}</span>}
                    </div>
                  ))}
                </div>
              )}
              {money.length > 0 && <span className={`${r.num} ${r.small}`} style={{ color: "var(--brass)" }}>{money.map((row) => `${row.value} ${c.t(row.label)}`).join(" · ")}</span>}
              <Link className={r.btnGhost} href={href("character")}>{c("Лист персонажа", "Character sheet")}</Link>
            </div>
          ) : <p className={r.empty}>{c("Героя пока нет.", "No hero yet.")}</p>}
        </Panel>
        <Panel eyebrow={c("Цель", "Goal")}>
          <div className={r.stack} style={{ gap: 6 }}>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 17, lineHeight: 1.3 }}>{quests.goal?.title ?? c("Цели пока нет.", "No goal yet.")}</span>
            {quests.goal?.description && <span className={`${r.small} ${r.muted}`}>{quests.goal.description}</span>}
            <Link className={r.small} href={href("journal")} style={{ color: "var(--brass)" }}>{c("Открыть журнал заданий", "Open the quest journal")}</Link>
          </div>
        </Panel>
        <Panel eyebrow={c("Приключение", "Adventure")}>
          {adventure ? (
            <div className={r.stack} style={{ gap: 6 }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 17 }}>{adventure.title}</span>
              <div className={r.row}>
                <span className={r.badge}>{envelopeLabel(adventure.pacing, c.language)}</span>
                {adventureElapsed(adventure, play?.worldMinutes, c.language) && <span className={`${r.small} ${r.muted}`}>{adventureElapsed(adventure, play?.worldMinutes, c.language)}</span>}
              </div>
              <Link className={r.small} href={href("adventures")} style={{ color: "var(--brass)" }}>{c("Приключения кампании", "Campaign adventures")}</Link>
            </div>
          ) : (
            <div className={r.stack} style={{ gap: 6 }}>
              <span className={r.empty}>{c("Сейчас нет активного приключения.", "No active adventure.")}</span>
              <Link className={r.btnGhost} href={href("adventures")}>{c("Новое приключение", "New adventure")}</Link>
            </div>
          )}
        </Panel>
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
        <Panel eyebrow={c("Открытые нити", "Open threads")}>
          <Later>{c("Нити и долги ведёт ведущий; приложение пока не отдаёт их интерфейсу.", "The DM tracks threads and debts; the app does not expose them to the interface yet.")}</Later>
        </Panel>
      </aside>
    </div>
  );
}

/** Synthetic preview of the feed: saved turns, the provisional turn and a composer that sends nothing. */
function PreviewFeed({ data, play, live, opening, moment, tools, inserted, heroName, mode }: {
  data: CampaignSnapshot; play: PlaySnapshot; live: LiveTurnView | null; opening: ReactNode; moment: ReactNode; tools: ReactNode;
  inserted: string; heroName: string | null; mode: string;
}) {
  const c = useCopy();
  void data;
  return (
    <>
      <div className="gameplay-turns" role="log" aria-label={c("Сохранённые ходы", "Saved turns")}>
        {opening}
        {play.turns.map((turn) => (
          <div key={turn.id} className="session-saved-turn">
            <GameplayTurn turn={turn} busy onCommand={() => {}} onSaved={async () => {}} />
          </div>
        ))}
      </div>
      {live && (
        <div className="gameplay-live-turn" role="status">
          <span className="eyebrow">{c("ведущий пишет… (черновик до сохранения)", "the DM is writing… (provisional until saved)")}</span>
          {live.text && <div className="prose">{live.text}</div>}
          {live.changes.length > 0 && (
            <>
              <span className={r.eyebrow}>{c("Что изменилось за ход", "What changed this turn")}</span>
              <ul className="gameplay-live-changes">
                {live.changes.map((change, index) => <li key={index} className={change.ok ? "" : "muted"}>{change.summary}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
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
