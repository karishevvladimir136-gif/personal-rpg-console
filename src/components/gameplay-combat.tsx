"use client";

import { useState } from "react";
import type {
  EncounterOutcome,
  MechanicChoice,
  PlaySnapshot,
} from "@/lib/gameplay/contracts";
import { useLanguage } from "./language-context";
import { useCampaignData } from "./persistence-context";
import { Badge, Panel } from "./ui";
import { RecordSelect } from "./persistent-records";
import { GameplayMechanicAction } from "./gameplay-actions";

const actionLabels = {
  attack: "Attack",
  defend: "Defend",
  move: "Move",
  "end-turn": "End Turn",
  intercept: "Intercept",
  item: "Item",
};
const outcomeLabels: Record<EncounterOutcome, string> = {
  victory: "Victory",
  escape: "Escape",
  surrender: "Surrender",
  negotiation: "Negotiation",
  "objective-completion": "Objective completed",
};
export function GameplayCombat({
  play,
  onSaved,
}: {
  play: PlaySnapshot;
  onSaved: () => Promise<void>;
}) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const [selected, setSelected] = useState<string[]>([]);
  const [actorId, setActor] = useState("");
  const [targetId, setTarget] = useState("");
  const [itemId, setItem] = useState("");
  const [action, setAction] =
    useState<Extract<MechanicChoice, { kind: "encounter.action" }>["action"]>(
      "attack",
    );
  const [position, setPosition] = useState<"nearby" | "far" | "cover">(
    "nearby",
  );
  const [outcome, setOutcome] = useState<EncounterOutcome>("escape");
  if (!data) return null;
  const encounter = play.encounters.find((row) => row.status === "active");
  const participants = play.participants
    .filter((row) => row.encounter_id === encounter?.id)
    .sort((a, b) => a.turn_order - b.turn_order);
  const available = data.entities.filter(
    (row) =>
      play.configuration?.presentEntityIds.includes(row.id) && row.hp !== null,
  );
  const actor =
    available.find((row) => row.id === actorId) ??
    available.find((row) =>
      participants.some(
        (participant) =>
          participant.entity_id === row.id &&
          participant.public_resources.active === true,
      ),
    ) ??
    available[0];
  return (
    <Panel
      className="visual-inventory-panel gameplay-combat"
      title={t(encounter ? "Combat" : "Encounters")}
    >
      {!encounter ? (
        <details>
          <summary>{t("Start an encounter")}</summary>
          <fieldset className="gameplay-listeners">
            <legend>{t("Participants")}</legend>
            {available.map((row) => (
              <label key={row.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(row.id)}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, row.id]
                        : selected.filter((id) => id !== row.id),
                    )
                  }
                />
                {row.name}
              </label>
            ))}
          </fieldset>
          <GameplayMechanicAction
            play={play}
            choice={{ kind: "encounter.start", participantIds: selected }}
            label={t("Start encounter")}
            disabled={selected.length < 2}
            onSaved={onSaved}
          />
        </details>
      ) : (
        <>
          {encounter.settings_revision !== data.settings.revision && (
            <p className="muted">
              {t(
                "This encounter keeps its starting damage and defeat rules. New settings apply to the next encounter.",
              )}
            </p>
          )}
          <p>{t("Round {number}", { number: encounter.round })}</p>
          <p>{encounter.public_summary}</p>
          <ol className="gameplay-initiative">
            {participants.map((row) => (
              <li
                key={row.id}
                className={row.public_resources.active === true ? "active" : ""}
              >
                <strong>{row.public_name}</strong>
                {row.public_resources.active === true && (
                  <Badge>{t("Active turn")}</Badge>
                )}
                {row.public_resources.withdrawn === true && (
                  <Badge>{t("Withdrawn")}</Badge>
                )}
                <span>
                  {t(
                    row.public_position.position === "far"
                      ? "Far Away"
                      : row.public_position.position === "cover"
                        ? "In Cover"
                        : "Nearby",
                  )}
                </span>
                <small>
                  {t("Action {action} · Move {move} · Reaction {reaction}", {
                    action:
                      typeof row.public_resources.action === "number"
                        ? row.public_resources.action
                        : 0,
                    move:
                      typeof row.public_resources.move === "number"
                        ? row.public_resources.move
                        : 0,
                    reaction:
                      typeof row.public_resources.reaction === "number"
                        ? row.public_resources.reaction
                        : 0,
                  })}
                </small>
              </li>
            ))}
          </ol>
          <RecordSelect
            label={t("Acting character")}
            value={actor?.id ?? ""}
            options={available
              .filter((row) =>
                participants.some(
                  (participant) => participant.entity_id === row.id,
                ),
              )
              .map((row) => ({ value: row.id, label: row.name }))}
            onChange={setActor}
            empty
          />
          <RecordSelect
            label={t("Action")}
            value={action}
            options={Object.entries(actionLabels).map(([value, label]) => ({
              value,
              label: t(label),
            }))}
            onChange={(value) => setAction(value as typeof action)}
          />
          <RecordSelect
            label={t("Target")}
            value={targetId}
            options={participants
              .filter((row) => row.entity_id !== null)
              .map((row) => ({
                value: row.entity_id!,
                label: row.public_name,
              }))}
            onChange={setTarget}
            empty
          />
          {(action === "attack" || action === "item") && (
            <RecordSelect
              label={t("Item")}
              value={itemId}
              options={data.items
                .filter((row) => row.quantity > 0)
                .map((row) => ({ value: row.id, label: row.name }))}
              onChange={setItem}
              empty
            />
          )}
          {action === "move" && (
            <RecordSelect
              label={t("Position")}
              value={position}
              options={[
                { value: "nearby", label: t("Nearby") },
                { value: "far", label: t("Far Away") },
                { value: "cover", label: t("In Cover") },
              ]}
              onChange={(value) => setPosition(value as typeof position)}
            />
          )}
          {actor && (
            <GameplayMechanicAction
              play={play}
              choice={{
                kind: "encounter.action",
                actorId: actor.id,
                action,
                targetId: targetId || null,
                itemId: itemId || null,
                position: action === "move" ? position : null,
              }}
              label={t("Confirm encounter action")}
              onSaved={onSaved}
            >
              <p>
                {t(actionLabels[action])} · {actor.name}
              </p>
              <p>
                {t(
                  "The server enforces the current turn, target, action budget and any required roll.",
                )}
              </p>
            </GameplayMechanicAction>
          )}
          <details>
            <summary>{t("End encounter")}</summary>
            <RecordSelect
              label={t("Outcome")}
              value={outcome}
              options={Object.entries(outcomeLabels).map(([value, label]) => ({
                value,
                label: t(label),
              }))}
              onChange={(value) => setOutcome(value as EncounterOutcome)}
            />
            <GameplayMechanicAction
              play={play}
              choice={{ kind: "encounter.end", outcome }}
              label={t("Confirm encounter ending")}
              onSaved={onSaved}
            />
          </details>
        </>
      )}
    </Panel>
  );
}
