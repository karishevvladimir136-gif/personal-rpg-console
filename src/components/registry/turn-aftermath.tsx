"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Entity } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import type { LiveTurnView } from "@/lib/gameplay/live-turn-client";
import type { DmSettings } from "@/lib/gameplay/dm-settings-client";
import { liveChanges, livePlayerMoment, liveTurnPhase, type LivePhase } from "@/lib/ui/live-turn-view";
import { detectAddressee, orderChanges } from "@/lib/ui/campaign-view";
import { registry as r, useCopy } from "./primitives";
import g from "./game.module.css";

// What follows the DM's answer before the action box: the saved turn's changes, folded, «Твой момент», and who
// will answer. One piece for both screens that send a turn — «Игра» and, since Fix S3-accept Б4, the 2D scene
// (moved here from game-screen.tsx unchanged).

/** Polish group 6: the addressee is read from the draft («@Тамсин», «Тамсин, …») among the people present and decides
 * the turn's mode at send time; «Говорю миру» overrides it for this draft. `off`: an out-of-game question. */
export function useAddressee<T extends Pick<Entity, "id" | "name">>({ present, combat, off = false }: { present: T[]; combat: boolean; off?: boolean }) {
  const c = useCopy();
  const [draft, setDraft] = useState("");
  const [toWorld, setToWorld] = useState(false);
  const detected = combat || toWorld || off ? null : detectAddressee(draft, present);
  const resolveSend = (text: string) => {
    const who = combat || toWorld ? null : detectAddressee(text, present);
    return who ? { mode: "companion" as const, companionId: who.id } : { mode: "game" as const, companionId: null };
  };
  // Who will answer: a small chip when the text names a companion (polish group 6), never a permanent row.
  const chip = detected ? (
    <p className={g.addressee} role="status">
      <span>{c(`Ответит ${detected.name}`, `${detected.name} will answer`)}</span>
      <span className={r.muted}>{c("— это сцена в мире: идёт время, спутник запомнит сказанное.", "— a scene in the world: time passes and the companion remembers.")}</span>
      <button type="button" className={r.chipButton} onClick={() => setToWorld(true)}>{c("Говорю миру", "I speak to the world")}</button>
    </p>
  ) : toWorld && !combat && detectAddressee(draft, present) ? (
    <p className={g.addressee} role="status">
      <span>{c("Говоришь миру и ведущему.", "You speak to the world and the DM.")}</span>
      <button type="button" className={r.chipButton} onClick={() => setToWorld(false)}>{c("Обращаюсь к спутнику", "I address the companion")}</button>
    </p>
  ) : null;
  return { detected, resolveSend, chip, setDraft };
}

export function useTurnAftermath({ play, live, mode, dmSettings, forceMoment = false }: {
  play: PlaySnapshot | null; live: LiveTurnView | null; mode: "game" | "ooc"; dmSettings: DmSettings | null; forceMoment?: boolean;
}) {
  const c = useCopy();
  const latestTurn = play?.turns.filter((turn) => (mode === "game" ? turn.mode === "game" || turn.mode === "companion" : turn.mode === mode)).at(-1) ?? null;
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
  // Stage C: the streaming turn is told inside the turn itself (text, rolls in place, the named pause);
  // after the save, its accepted changes fold here.
  const liveBlock = live && phase === "streaming" && liveIsLatest ? null
    : live && phase === "saved" && liveIsLatest && (!savedView || savedView.operationId !== live.operationId) ? <LiveBlock view={live} phase="saved" deeper={deeper} />
    : savedView && (!live || phase === "saved" || !liveIsLatest) ? <LiveBlock view={savedView} phase="saved" deeper={deeper} /> : null;
  const showMoment = forceMoment || (!!live && phase === "saved" && liveIsLatest && livePlayerMoment(live)) ||
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
  return { liveBlock, moment };
}

/** The saved turn's accepted changes, folded (polish group 6). The rolls are not repeated here: they stand in
 * the turn, in the place where the story asked for them (stage C); the turn tells its own text and pause. */
function LiveBlock({ view, phase, deeper = null }: { view: LiveTurnView; phase: LivePhase; deeper?: string | null }) {
  const c = useCopy();
  const changes = orderChanges(liveChanges(view)).filter((change) => change.name !== "roll");
  if (phase !== "saved" || (!changes.length && !deeper)) return null;
  return (
    <div className="gameplay-live-turn" role="status" aria-live="polite">
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
