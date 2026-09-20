"use client";
import { useState } from "react";
import type { FoundationLoopView } from "@/lib/foundation-loop/client-contracts";
import type {
  ProgressionTrack,
  RewardDefinition,
  RewardEntry,
} from "@/lib/foundation-loop/contracts";
import {
  progressionInput,
  sameValue,
  type ProgressionDraft,
} from "@/lib/foundation-loop-client";
import { useUnsavedChanges } from "../persistence-context";
import { Button } from "../ui";
import {
  NumberField,
  RowEditor,
  SelectField,
  TextField,
  Toggle,
} from "./fields";
import type { ApplyFoundation } from "./commerce-settings";
import type { FoundationText } from "./text";
import styles from "./foundation-loop.module.css";

function RewardContents({
  reward,
  view,
  tracks,
  c,
  update,
}: {
  reward: RewardDefinition;
  view: FoundationLoopView;
  tracks: ProgressionTrack[];
  c: FoundationText;
  update: (entries: RewardEntry[]) => void;
}) {
  const edit = (index: number, next: RewardEntry) =>
    update(reward.entries.map((row, i) => (i === index ? next : row)));
  return (
    <div className={styles.form}>
      {reward.entries.map((entry, index) => (
        <div key={index} className={styles.entry}>
          <div className={styles.grid}>
            {entry.kind === "progression" ? (
              <SelectField
                label={c.progressionEntry}
                value={entry.trackId}
                options={tracks}
                onChange={(trackId) => edit(index, { ...entry, trackId })}
              />
            ) : entry.kind === "currency" ? (
              <SelectField
                label={c.currencyEntry}
                value={entry.currencyId}
                options={view.owner.currencies}
                onChange={(currencyId) => edit(index, { ...entry, currencyId })}
              />
            ) : (
              <SelectField
                label={c.itemEntry}
                value={entry.itemId}
                options={view.owner.items.map((i) => ({
                  id: i.id,
                  label: i.name,
                }))}
                onChange={(itemId) => edit(index, { ...entry, itemId })}
              />
            )}
            <NumberField
              label={entry.kind === "item" ? c.quantity : c.amount}
              min={1}
              max={entry.kind === "progression" ? 1_000_000_000 : 1_000_000}
              value={entry.kind === "item" ? entry.quantity : entry.amount}
              onChange={(value) =>
                edit(
                  index,
                  entry.kind === "item"
                    ? { ...entry, quantity: value }
                    : { ...entry, amount: value },
                )
              }
            />
          </div>
          <Button
            label={`${c.remove}: ${c.entries} ${index + 1}`}
            onClick={() => update(reward.entries.filter((_, i) => i !== index))}
          >
            {c.remove}
          </Button>
        </div>
      ))}
      <div className="button-row">
        <Button
          disabled={!tracks.length || reward.entries.length >= 32}
          onClick={() =>
            update([
              ...reward.entries,
              { kind: "progression", trackId: tracks[0].id, amount: 1 },
            ])
          }
        >
          {c.add} · {c.progressionEntry}
        </Button>
        <Button
          disabled={
            !view.owner.currencies.length || reward.entries.length >= 32
          }
          onClick={() =>
            update([
              ...reward.entries,
              {
                kind: "currency",
                currencyId: view.owner.currencies[0].id,
                amount: 1,
              },
            ])
          }
        >
          {c.add} · {c.currencyEntry}
        </Button>
        <Button
          disabled={!view.owner.items.length || reward.entries.length >= 32}
          onClick={() =>
            update([
              ...reward.entries,
              { kind: "item", itemId: view.owner.items[0].id, quantity: 1 },
            ])
          }
        >
          {c.add} · {c.itemEntry}
        </Button>
      </div>
    </div>
  );
}

export function ProgressionSettings({
  view,
  c,
  apply,
}: {
  view: FoundationLoopView;
  c: FoundationText;
  apply: ApplyFoundation;
}) {
  const original = {
    progression: view.owner.progression,
    tracks: view.owner.tracks,
    rewards: view.owner.rewards,
  };
  const [draft, setDraft] = useState<ProgressionDraft>(() =>
    structuredClone(original),
  );
  const dirty = !sameValue(original, draft);
  useUnsavedChanges(dirty);
  const editTrack = (index: number, patch: Partial<ProgressionTrack>) =>
    setDraft({
      ...draft,
      tracks: draft.tracks.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    });
  const editReward = (index: number, patch: Partial<RewardDefinition>) =>
    setDraft({
      ...draft,
      rewards: draft.rewards.map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    });
  const recipients = view.owner.entities.filter(
    (e) => e.kind === "player" || e.kind === "companion" || e.kind === "npc",
  );
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        apply("progression.configure", progressionInput(view, draft));
      }}
    >
      <h3>{c.progressionSettings}</h3>
      <Toggle
        label={c.enabled}
        checked={draft.progression === "on"}
        onChange={(on) =>
          setDraft({ ...draft, progression: on ? "on" : "off" })
        }
      />
      <p className="muted">{c.offHelp}</p>
      <h4>{c.tracks}</h4>
      {draft.tracks.map((row, index) => (
        <RowEditor
          key={row.id}
          title={row.label || c.track}
          remove={{
            label: c.remove,
            action: () =>
              setDraft({
                ...draft,
                tracks: draft.tracks.filter((_, i) => i !== index),
              }),
          }}
        >
          <div className={styles.grid}>
            <TextField
              label={c.label}
              value={row.label}
              onChange={(label) => editTrack(index, { label })}
            />
            <SelectField
              label={c.kind}
              value={row.kind}
              options={[
                { id: "classic_xp", label: c.classic_xp },
                { id: "milestone", label: c.milestone },
                { id: "generic", label: c.generic },
              ]}
              onChange={(kind) =>
                editTrack(index, {
                  kind: kind as ProgressionTrack["kind"],
                  ...(kind === "milestone"
                    ? { thresholds: row.thresholds.map((_, i) => i + 1) }
                    : {}),
                })
              }
            />
          </div>
          <h4>{c.thresholds}</h4>
          {row.thresholds.map((threshold, i) => (
            <div key={i} className={styles.addRow}>
              <NumberField
                label={`${c.rank} ${i + 1} · ${c.threshold}`}
                value={threshold}
                min={row.kind === "milestone" ? i + 1 : 1}
                max={row.kind === "milestone" ? i + 1 : 1_000_000_000}
                onChange={(value) =>
                  editTrack(index, {
                    thresholds: row.thresholds.map((v, j) =>
                      i === j ? value : v,
                    ),
                  })
                }
              />
              <Button
                label={`${c.remove}: ${c.threshold} ${i + 1}`}
                onClick={() => {
                  const thresholds = row.thresholds.filter((_, j) => i !== j);
                  editTrack(index, {
                    thresholds:
                      row.kind === "milestone"
                        ? thresholds.map((_, j) => j + 1)
                        : thresholds,
                  });
                }}
              >
                {c.remove}
              </Button>
            </div>
          ))}
          <Button
            disabled={row.thresholds.length >= 100}
            onClick={() =>
              editTrack(index, {
                thresholds: [
                  ...row.thresholds,
                  (row.thresholds.at(-1) ?? 0) + 1,
                ],
              })
            }
          >
            {c.add} · {c.threshold}
          </Button>
          <h4>{c.options}</h4>
          <p className="muted">{c.capabilityHelp}</p>
          {row.choices.map((choice, i) => (
            <div key={choice.id} className={styles.entry}>
              <div className={styles.grid}>
                <TextField
                  label={c.label}
                  value={choice.label}
                  onChange={(label) =>
                    editTrack(index, {
                      choices: row.choices.map((v, j) =>
                        i === j ? { ...v, label } : v,
                      ),
                    })
                  }
                />
                <TextField
                  label={c.capability}
                  value={choice.capability}
                  maxLength={100}
                  onChange={(capability) =>
                    editTrack(index, {
                      choices: row.choices.map((v, j) =>
                        i === j ? { ...v, capability } : v,
                      ),
                    })
                  }
                />
              </div>
              <Button
                label={`${c.remove}: ${choice.label}`}
                onClick={() =>
                  editTrack(index, {
                    choices: row.choices.filter((_, j) => i !== j),
                  })
                }
              >
                {c.remove}
              </Button>
            </div>
          ))}
          <Button
            disabled={row.choices.length >= 32}
            onClick={() =>
              editTrack(index, {
                choices: [
                  ...row.choices,
                  { id: crypto.randomUUID(), label: c.choose, capability: "" },
                ],
              })
            }
          >
            {c.add} · {c.choose}
          </Button>
        </RowEditor>
      ))}
      <Button
        disabled={draft.tracks.length >= 32}
        onClick={() =>
          setDraft({
            ...draft,
            tracks: [
              ...draft.tracks,
              {
                id: crypto.randomUUID(),
                version: 1,
                label: c.track,
                kind: "generic",
                thresholds: [1],
                choices: [],
              },
            ],
          })
        }
      >
        {c.add} · {c.track}
      </Button>
      <h4>{c.packages}</h4>
      {draft.rewards.map((row, index) => (
        <RowEditor
          key={row.id}
          title={row.label || c.packages}
          remove={{
            label: c.remove,
            action: () =>
              setDraft({
                ...draft,
                rewards: draft.rewards.filter((_, i) => i !== index),
              }),
          }}
        >
          <TextField
            label={c.label}
            value={row.label}
            onChange={(label) => editReward(index, { label })}
          />
          <div className={styles.grid}>
            <SelectField
              label={c.source}
              value={`${row.source.kind}:${row.source.id}`}
              placeholder={c.select}
              options={view.owner.sources.map((s) => ({
                id: `${s.kind}:${s.id}`,
                label: s.label,
              }))}
              onChange={(value) => {
                const source = view.owner.sources.find(
                  (s) => `${s.kind}:${s.id}` === value,
                );
                if (source)
                  editReward(index, {
                    source: { kind: source.kind, id: source.id },
                  });
              }}
            />
            <SelectField
              label={c.distribution}
              value={row.distribution}
              options={[
                { id: "actor", label: c.actor },
                { id: "party_equal", label: c.party_equal },
              ]}
              onChange={(distribution) =>
                editReward(index, {
                  distribution:
                    distribution as RewardDefinition["distribution"],
                  recipientIds:
                    distribution === "actor"
                      ? row.recipientIds.slice(0, 1)
                      : row.recipientIds.filter((id) =>
                          recipients.some(
                            (entity) =>
                              entity.id === id && entity.kind !== "npc",
                          ),
                        ),
                })
              }
            />
          </div>
          <h4>{c.recipients}</h4>
          <div className={styles.checks}>
            {recipients
              .filter(
                (entity) =>
                  row.distribution === "actor" || entity.kind !== "npc",
              )
              .map((entity) => (
                <Toggle
                  key={entity.id}
                  label={entity.name}
                  checked={row.recipientIds.includes(entity.id)}
                  onChange={(checked) =>
                    editReward(index, {
                      recipientIds: checked
                        ? row.distribution === "actor"
                          ? [entity.id]
                          : [...row.recipientIds, entity.id].slice(0, 16)
                        : row.recipientIds.filter((id) => id !== entity.id),
                    })
                  }
                />
              ))}
          </div>
          <h4>{c.entries}</h4>
          <RewardContents
            reward={row}
            view={view}
            tracks={draft.tracks}
            c={c}
            update={(entries) => editReward(index, { entries })}
          />
        </RowEditor>
      ))}
      {!view.owner.sources.length && (
        <p className="muted">{c.sourceUnavailable}</p>
      )}
      <Button
        disabled={
          !view.owner.sources.length ||
          !recipients.length ||
          draft.rewards.length >= 128
        }
        onClick={() => {
          const source = view.owner.sources[0];
          setDraft({
            ...draft,
            rewards: [
              ...draft.rewards,
              {
                id: crypto.randomUUID(),
                version: 1,
                label: c.packages,
                source: { kind: source.kind, id: source.id },
                distribution: "actor",
                recipientIds: [recipients[0].id],
                entries: [],
              },
            ],
          });
        }}
      >
        {c.add} · {c.packages}
      </Button>
      <Button primary type="submit" disabled={!dirty}>
        {c.saveProgression}
      </Button>
    </form>
  );
}

export function ProgressionCorrection({
  view,
  c,
  apply,
}: {
  view: FoundationLoopView;
  c: FoundationText;
  apply: ApplyFoundation;
}) {
  const [entityId, setEntityId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [value, setValue] = useState(0);
  const [rank, setRank] = useState(0);
  const [unlocks, setUnlocks] = useState("");
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const select = (entity: string, track: string) => {
    const progress = view.progression.progress.find(
      (p) => p.entityId === entity && p.trackId === track,
    );
    setEntityId(entity);
    setTrackId(track);
    setValue(progress?.value ?? 0);
    setRank(progress?.rank ?? 0);
    setUnlocks(progress?.unlocks.join("\n") ?? "");
    setDirty(false);
  };
  const track = view.owner.tracks.find((t) => t.id === trackId);
  return (
    <details className={styles.editor}>
      <summary>{c.correction}</summary>
      <form
        className={styles.editorBody}
        onSubmit={(e) => {
          e.preventDefault();
          if (track && entityId)
            apply("progression.correct", {
              entityId,
              trackId,
              expectedTrackVersion: track.version,
              value,
              rank,
              unlocks: unlocks
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            });
        }}
      >
        <p className="muted">{c.correctionHelp}</p>
        <div className={styles.grid}>
          <SelectField
            label={c.entity}
            value={entityId}
            placeholder={c.select}
            options={view.owner.entities
              .filter((e) => e.kind === "player" || e.kind === "companion")
              .map((e) => ({ id: e.id, label: e.name }))}
            onChange={(id) => select(id, trackId)}
          />
          <SelectField
            label={c.track}
            value={trackId}
            placeholder={c.select}
            options={view.owner.tracks}
            onChange={(id) => select(entityId, id)}
          />
          <NumberField
            label={c.value}
            value={value}
            max={1_000_000_000}
            onChange={(value) => {
              setValue(value);
              setDirty(true);
            }}
          />
          <NumberField
            label={c.rank}
            value={rank}
            max={track?.thresholds.length ?? 0}
            onChange={(value) => {
              setRank(value);
              setDirty(true);
            }}
          />
        </div>
        <label className="field">
          {c.unlocks}
          <textarea
            value={unlocks}
            maxLength={8000}
            rows={3}
            onChange={(e) => {
              setUnlocks(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <Button primary type="submit" disabled={!entityId || !track}>
          {c.correct}
        </Button>
      </form>
    </details>
  );
}
