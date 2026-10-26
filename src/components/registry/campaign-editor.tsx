"use client";

// FIX_S4 item 6: «Редактор кампании · для владельца» left the game screen — the play screen keeps the story, the
// action box and the four buttons. The editor lives on «Ещё → Для владельца» (next to the price of turns and «Что
// видит ведущий»), moved here from game-screen.tsx with its tools and explanations unchanged.
import Link from "next/link";
import { useState } from "react";
import type { CampaignSnapshot, Scene } from "@/lib/persistence/contracts";
import type { PlaySnapshot } from "@/lib/gameplay/contracts";
import { currentSession, inCombat } from "@/lib/ui/campaign-view";
import { GameplayComposer } from "../gameplay-composer";
import { GameplayCombat } from "../gameplay-combat";
import { GameplayRest } from "../gameplay-actions";
import { CombatReadiness } from "../combat-readiness";
import { SessionMemoryPanel } from "../session-memory";
import { GameSessionControls, ResumeEditor, SceneEditor, Transcript } from "../persistent-game";
import { useChrome, useDmSettings, type CampaignScreenId } from "./shell";
import { registry as r, useCopy } from "./primitives";
import g from "./game.module.css";

export function CampaignEditor({ data, play, onSaved }: { data: CampaignSnapshot; play: PlaySnapshot; onSaved: () => Promise<void> }) {
  const c = useCopy();
  const chrome = useChrome();
  const dmSettings = useDmSettings(data.campaign.id);
  const [resume, setResume] = useState(false);
  const [sceneEditor, setSceneEditor] = useState<Scene | "new" | null>(null);
  const session = currentSession(data);
  const combat = inCombat(play);
  const loopRuntime = !dmSettings || dmSettings.runtime === "dm-loop-v1";
  const href = (screen: CampaignScreenId) =>
    chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(data.campaign.id)}/${screen}`;
  return (
    <>
      {/* Item 57: the owner's editor opens only when the owner opens it (never forced open by a fight or a poll). */}
      <details className={g.more} data-testid="campaign-editor">
        <summary>{c("Редактор кампании · для владельца", "Campaign editor · for the owner")}</summary>
        <div className={r.stack}>
          <span className={r.note}>{c("Инструменты правки записей. В обычной игре они не нужны: ведущий ведёт всё сам. Каждый подписан — когда он может пригодиться.", "Tools for correcting the records. Ordinary play does not need them: the DM keeps everything. Each one says when it may be useful.")}</span>
          {play.rulesetId === "world-logic-v1" && (
            <div className={r.stack}>
              <span className={`${r.small} ${r.muted}`}>{c("Боевая готовность: утвердить боевые числа героя, если их не было при создании.", "Combat readiness: approve the hero's combat numbers if creation had none.")}</span>
              <CombatReadiness campaignId={data.campaign.id} runtimeRevision={play.revision} onSaved={onSaved} />
            </div>
          )}
          {!combat && (play.turns.some((turn) => turn.mode === "mechanic") || play.rulesetId !== "world-logic-v1") && (
            <div className={r.stack}>
              <span className={`${r.small} ${r.muted}`}>{c("Бой по правилам: ручной учёт, если ведущий ошибся в раунде.", "Combat by the rules: manual bookkeeping when the DM got a round wrong.")}</span>
              <GameplayCombat play={play} onSaved={onSaved} manualControls={false} />
            </div>
          )}
          {play.turns.some((turn) => turn.mode === "mechanic") && (
            <div className={r.stack}>
              <span className={`${r.small} ${r.muted}`}>{c("Механические ходы: история прямых команд правилам.", "Mechanic turns: the history of direct rule commands.")}</span>
              <GameplayComposer play={play} mode="mechanic" onSaved={onSaved} historyOnly />
            </div>
          )}
          {play.rulesetId !== "world-logic-v1" && (
            <div className={r.stack}>
              <span className={`${r.small} ${r.muted}`}>{c("Отдых по правилам: прямое восстановление, если лагерь не подошёл.", "Rest by the rules: a direct recovery when the camp did not fit.")}</span>
              <GameplayRest play={play} onSaved={onSaved} />
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
              {/* Item 57: the session's records stay folded — opening the editor never unfolds the whole story. */}
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
              <GameplayCombat play={play} onSaved={onSaved} />
            </details>
          )}
        </div>
      </details>
      {resume && <ResumeEditor data={data} onClose={() => setResume(false)} />}
      {sceneEditor && session && <SceneEditor scene={sceneEditor === "new" ? undefined : sceneEditor} sessionId={session.id} onClose={() => setSceneEditor(null)} />}
    </>
  );
}
