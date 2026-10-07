"use client";
import { FoundationLoopPanel } from "./foundation-loop/foundation-loop";
import { CharacterArtwork } from "./character-artwork";
import { characterDescription } from "./character-presentation";
import styles from "./playtest-game-character.module.css";
import { LiveDisclosure } from "./live-disclosure";
import { GenerateVisual } from "./visual-frame/generate-visual";
import { selectSubjectVisual } from "@/lib/visual-frame/subject-visual";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "./language-context";
import {
  useCampaignData,
  useCampaignDraftScope,
  TimelineDraftNotice,
  useUnsavedChanges,
} from "./persistence-context";
import { Badge, Button, Icon, Meter, Modal, Panel } from "./ui";
import { GameplayCompanionTalk, GameplayItemActions } from "./gameplay-actions";
import { createMutationAttempt, errorMessage } from "@/lib/persistence/client";
import type {
  CampaignSnapshot,
  Entity,
  EntityInput,
  Item,
  ItemInput,
  Mutation,
  MutationInput,
  Storage,
  StorageInput,
} from "@/lib/persistence/contracts";
import {
  entityKindLabels,
  equipmentProfileForCorrection,
  equipmentForRecord,
  itemCorrectionIssue,
  itemIcon,
  parseHitPoints,
  RecordValidationError,
  storageKindLabels,
  storageAcceptsEntity,
  storageCorrectionIssue,
} from "@/lib/persistence/record-model";

export function RecordField({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
  type = "text",
  min,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
  type?: string;
  min?: number;
  step?: string;
}) {
  const { t } = useLanguage();
  return (
    <label className="field">
      <span>{t(label)}</span>
      {multiline ? (
        <textarea
          rows={5}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type={type}
          min={min}
          step={step}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export function RecordSelect({
  label,
  value,
  onChange,
  options,
  empty = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  empty?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <label className="field">
      <span>{t(label)}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {empty && <option value="">{t("None selected")}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** One explicit owner save: retries retain identity, duplicate clicks are ignored, failed drafts remain. */
export function RecordEditor<T>({
  title,
  initial,
  build,
  onClose,
  children,
}: {
  title: string;
  initial: T;
  build: (draft: T) => MutationInput;
  onClose: () => void;
  children: (draft: T, setDraft: (draft: T) => void) => ReactNode;
}) {
  const { t } = useLanguage();
  const { mutate } = useCampaignData();
  const scope = useCampaignDraftScope();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<Mutation | null>(null);
  const submitting = useRef(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  useUnsavedChanges(dirty && !saved);
  function close() {
    if (
      !submitting.current &&
      (saved || !dirty || window.confirm(t("Discard these unsaved edits?")))
    )
      onClose();
  }
  return (
    <Modal title={t(title)} onClose={close}>
      <p className="muted">
        {t(
          "Manual owner correction. Saving changes this campaign's public records; it does not execute gameplay.",
        )}
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (submitting.current || saved) return;
          submitting.current = true;
          setBusy(true);
          setError("");
          try {
            const input = build(draft);
            attempt.current = createMutationAttempt(
              attempt.current,
              scope.bind(
                input,
                input.operation === "asset.save" ? undefined : "timeline",
              ),
            );
            await mutate(attempt.current);
            setSaved(true);
          } catch (reason) {
            setError(
              reason instanceof RecordValidationError
                ? reason.message
                : errorMessage(reason),
            );
          } finally {
            submitting.current = false;
            setBusy(false);
          }
        }}
      >
        <fieldset
          disabled={busy || saved}
          style={{ border: 0, padding: 0, minWidth: 0 }}
        >
          {children(draft, setDraft)}
          <TimelineDraftNotice stale={scope.stale} />
          {error && <p role="alert">{t(error)}</p>}
          {!saved && (
            <p className="muted">
              {t(
                "A failed save keeps your edits. Retry the same draft to avoid duplicate records. Conflicts require closing and reopening the current record.",
              )}
            </p>
          )}
          {!saved && (
            <div className="button-group">
              <Button onClick={close}>{t("Cancel")}</Button>
              <Button primary type="submit" disabled={scope.stale}>
                {t(busy ? "Saving…" : "Save owner correction")}
              </Button>
            </div>
          )}
        </fieldset>
        {busy && <p role="status">{t("Saving…")}</p>}
        {saved && (
          <>
            <p role="status">{t("Saved to this campaign.")}</p>
            <Button primary onClick={close}>
              {t("Close dialog")}
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
}

export function RecordBoundary({
  children,
}: {
  children: (data: CampaignSnapshot) => ReactNode;
}) {
  const { t } = useLanguage();
  const { data, loading, error, refresh } = useCampaignData();
  if (!data)
    return (
      <Panel className="empty-state">
        <Icon name="BookOpen" size={32} />
        <p role={error ? "alert" : "status"}>
          {t(
            error ||
              (loading
                ? "Loading campaign records…"
                : "Campaign records are unavailable."),
          )}
        </p>
        {error && (
          <Button onClick={() => void refresh().catch(() => {})}>
            {t("Retry")}
          </Button>
        )}
      </Panel>
    );
  return (
    <div className="persistent-records">
      {error && <p role="alert">{t(error)}</p>}
      {children(data)}
    </div>
  );
}

export function RecordHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{data?.campaign.title}</span>
        <h1>{t(title)}</h1>
        <p>{t(description)}</p>
      </div>
      {action}
    </div>
  );
}

function NumberRecords({
  label,
  values,
  onChange,
}: {
  label: string;
  values: Record<string, number>;
  onChange: (values: Record<string, number>) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  return (
    <fieldset style={{ minWidth: 0 }}>
      <legend>{t(label)}</legend>
      {Object.entries(values).map(([key, value]) => (
        <div className="form-grid" key={key}>
          <label className="field">
            <span>{key}</span>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(event) =>
                onChange({ ...values, [key]: Number(event.target.value) })
              }
            />
          </label>
          <Button
            label={t("Remove {name}", { name: key })}
            onClick={() =>
              onChange(
                Object.fromEntries(
                  Object.entries(values).filter(([name]) => name !== key),
                ),
              )
            }
          >
            {t("Remove")}
          </Button>
        </div>
      ))}
      <div className="form-grid">
        <RecordField
          label={t("New field name")}
          value={name}
          onChange={setName}
        />
        <Button
          disabled={!name.trim() || Object.hasOwn(values, name.trim())}
          onClick={() => {
            onChange({ ...values, [name.trim()]: 0 });
            setName("");
          }}
        >
          {t("Add field")}
        </Button>
      </div>
    </fieldset>
  );
}

function EntityEditor({
  entity,
  defaultKind,
  onClose,
}: {
  entity?: Entity;
  defaultKind: Entity["kind"];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId } = useCampaignData();
  const initial = {
    name: entity?.name || "",
    kind: entity?.kind || defaultKind,
    details: entity?.details || "",
    hp: entity?.hp?.toString() || "",
    max_hp: entity?.max_hp?.toString() || "",
    stats: entity?.stats || {},
    resources: entity?.resources || {},
    conditions: entity?.conditions.join(", ") || "",
    slots:
      entity?.equipment_slots.map((slot) => ({
        ...slot,
        accepts: slot.accepts.join(", "),
      })) || [],
  };
  return (
    <RecordEditor
      title={
        entity ? "Edit public character record" : "Add public character record"
      }
      initial={initial}
      onClose={onClose}
      build={(draft) => {
        const { hp, max_hp } = parseHitPoints(draft.hp, draft.max_hp);
        const payload: EntityInput & { id?: string } = {
          id: entity?.id,
          name: draft.name,
          kind: draft.kind,
          details: draft.details,
          hp,
          max_hp,
          stats: draft.stats,
          resources: draft.resources,
          conditions: draft.conditions
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
          equipment_slots: equipmentProfileForCorrection(
            entity,
            draft.kind,
            draft.slots.map((slot) => ({
              ...slot,
              accepts: slot.accepts
                .split(",")
                .map((category) => category.trim())
                .filter(Boolean),
            })),
          ),
        };
        return {
          operation: "entity.save",
          campaignId,
          expectedRevision: entity?.revision || 0,
          payload,
        };
      }}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Name")}
            value={draft.name}
            required
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <RecordSelect
            label={t("Record kind")}
            value={draft.kind}
            options={Object.entries(entityKindLabels).map(([value, label]) => ({
              value,
              label: t(label),
            }))}
            onChange={(kind) =>
              setDraft({ ...draft, kind: kind as Entity["kind"] })
            }
          />
          <RecordField
            label={t("Public description")}
            value={draft.details}
            multiline
            onChange={(details) => setDraft({ ...draft, details })}
          />
          <p className="muted">
            {t(
              "Leave HP blank when this rules system does not use it. Nothing is calculated or recovered automatically.",
            )}
          </p>
          <div className="form-grid">
            <RecordField
              label={t("Current HP")}
              value={draft.hp}
              type="number"
              min={0}
              step="1"
              onChange={(hp) => setDraft({ ...draft, hp })}
            />
            <RecordField
              label={t("Maximum HP")}
              value={draft.max_hp}
              type="number"
              min={0}
              step="1"
              onChange={(max_hp) => setDraft({ ...draft, max_hp })}
            />
          </div>
          <RecordField
            label={t("Public conditions, separated by commas")}
            value={draft.conditions}
            onChange={(conditions) => setDraft({ ...draft, conditions })}
          />
          <NumberRecords
            label={t("Attributes")}
            values={draft.stats}
            onChange={(stats) => setDraft({ ...draft, stats })}
          />
          <NumberRecords
            label={t("Recorded resources")}
            values={draft.resources}
            onChange={(resources) => setDraft({ ...draft, resources })}
          />
          <h3>{t("Equipment profile")}</h3>
          {draft.kind === "npc" && (
            <p className="muted">
              {t(
                "Known NPCs use their public character record. This editor does not assign an equipment profile to NPCs.",
              )}
            </p>
          )}
          <fieldset
            disabled={draft.kind === "npc"}
            style={{ border: 0, padding: 0, minWidth: 0 }}
          >
            <p className="muted">
              {t(
                "Only add slots established for this character, vehicle or mount. Categories must match item categories exactly. Empty profiles assume no anatomy.",
              )}
            </p>
            {draft.slots.map((slot, index) => (
              <fieldset key={slot.id} style={{ minWidth: 0 }}>
                <RecordField
                  label={t("Slot name")}
                  value={slot.label}
                  required
                  onChange={(label) =>
                    setDraft({
                      ...draft,
                      slots: draft.slots.map((row, at) =>
                        at === index ? { ...row, label } : row,
                      ),
                    })
                  }
                />
                <RecordField
                  label={t("Accepted item categories, separated by commas")}
                  value={slot.accepts}
                  required
                  onChange={(accepts) =>
                    setDraft({
                      ...draft,
                      slots: draft.slots.map((row, at) =>
                        at === index ? { ...row, accepts } : row,
                      ),
                    })
                  }
                />
                <Button
                  onClick={() =>
                    setDraft({
                      ...draft,
                      slots: draft.slots.filter((_, at) => at !== index),
                    })
                  }
                >
                  {t("Remove slot")}
                </Button>
              </fieldset>
            ))}
            <Button
              disabled={draft.slots.length >= 24}
              onClick={() =>
                setDraft({
                  ...draft,
                  slots: [
                    ...draft.slots,
                    { id: crypto.randomUUID(), label: "", accepts: "" },
                  ],
                })
              }
            >
              {t("Add equipment slot")}
            </Button>
          </fieldset>
        </>
      )}
    </RecordEditor>
  );
}

function StorageEditor({
  storage,
  onClose,
}: {
  storage?: Storage;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId, data } = useCampaignData();
  const initial: StorageInput = {
    name: storage?.name || "",
    kind:
      storage?.kind ||
      (data?.entities.some((row) => row.kind === "player") ? "player" : "camp"),
    entity_id: storage?.entity_id || null,
  };
  return (
    <RecordEditor
      title={storage ? "Edit storage record" : "Add storage record"}
      initial={initial}
      onClose={onClose}
      build={(payload) => {
        if (!data)
          throw new RecordValidationError("Campaign records are unavailable.");
        const issue = storageCorrectionIssue(data, payload, storage?.id);
        if (issue) throw new RecordValidationError(issue);
        return {
          operation: "storage.save",
          campaignId,
          expectedRevision: storage?.revision || 0,
          payload: { ...payload, id: storage?.id },
        };
      }}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Storage name")}
            value={draft.name}
            required
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <RecordSelect
            label={t("Storage kind")}
            value={draft.kind}
            options={Object.entries(storageKindLabels).map(
              ([value, label]) => ({ value, label: t(label) }),
            )}
            onChange={(value) => {
              const kind = value as Storage["kind"];
              const entity = data?.entities.find(
                (row) => row.id === draft.entity_id,
              );
              setDraft({
                ...draft,
                kind,
                entity_id:
                  entity && storageAcceptsEntity(kind, entity)
                    ? entity.id
                    : null,
              });
            }}
          />
          {draft.kind !== "camp" ? (
            <RecordSelect
              label={t("Storage belongs to")}
              value={draft.entity_id || ""}
              empty
              options={(data?.entities || [])
                .filter((row) => storageAcceptsEntity(draft.kind, row))
                .map((row) => ({
                  value: row.id,
                  label: row.name,
                }))}
              onChange={(entity_id) =>
                setDraft({ ...draft, entity_id: entity_id || null })
              }
            />
          ) : (
            <p className="muted">
              {t("Shared stash storage is not assigned to a character.")}
            </p>
          )}
          <p className="muted">
            {t(
              "Camp and cargo records are inspectable. Gameplay withdrawals, transfers and access checks remain unavailable.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function ItemEditor({
  item,
  storageId,
  onClose,
}: {
  item?: Item;
  storageId?: string;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { campaignId, data } = useCampaignData();
  const initial: ItemInput = {
    name: item?.name || "",
    category: item?.category || "gear",
    quantity: item?.quantity ?? 1,
    description: item?.description || "",
    mechanics: item?.mechanics || "",
    owner_entity_id: item?.owner_entity_id || null,
    storage_id: item?.storage_id || storageId || "",
    equipped_entity_id: item?.equipped_entity_id || null,
    equipped_slot: item?.equipped_slot || null,
  };
  return (
    <RecordEditor
      title={item ? "Correct item record" : "Add item record"}
      initial={initial}
      onClose={onClose}
      build={(payload) => {
        if (!data)
          throw new RecordValidationError("Campaign records are unavailable.");
        const issue = itemCorrectionIssue(data, payload, item?.id);
        if (issue) throw new RecordValidationError(issue);
        return {
          operation: "item.save",
          campaignId,
          expectedRevision: item?.revision || 0,
          payload: { ...payload, id: item?.id },
        };
      }}
    >
      {(draft, setDraft) => (
        <>
          <RecordField
            label={t("Item name")}
            value={draft.name}
            required
            onChange={(name) => setDraft({ ...draft, name })}
          />
          <div className="form-grid">
            <RecordField
              label={t("Item category")}
              value={draft.category}
              required
              onChange={(category) => setDraft({ ...draft, category })}
            />
            <RecordField
              label={t("Quantity")}
              value={draft.quantity}
              type="number"
              min={0}
              step="1"
              onChange={(quantity) =>
                setDraft({ ...draft, quantity: Number(quantity) })
              }
            />
          </div>
          <RecordField
            label={t("Description")}
            value={draft.description}
            multiline
            onChange={(description) => setDraft({ ...draft, description })}
          />
          <RecordField
            label={t("Known mechanics")}
            value={draft.mechanics}
            multiline
            onChange={(mechanics) => setDraft({ ...draft, mechanics })}
          />
          <RecordSelect
            label={t("Recorded owner")}
            value={draft.owner_entity_id || ""}
            empty
            options={(data?.entities || []).map((row) => ({
              value: row.id,
              label: row.name,
            }))}
            onChange={(owner_entity_id) =>
              setDraft({ ...draft, owner_entity_id: owner_entity_id || null })
            }
          />
          <RecordSelect
            label={t("Recorded storage")}
            value={draft.storage_id}
            empty
            options={(data?.storages || []).map((row) => ({
              value: row.id,
              label: row.name,
            }))}
            onChange={(storage_id) => setDraft({ ...draft, storage_id })}
          />
          <RecordSelect
            label={t("Recorded equipped character")}
            value={draft.equipped_entity_id || ""}
            empty
            options={(data?.entities || [])
              .filter((row) => row.kind !== "npc" && row.equipment_slots.length)
              .map((row) => ({ value: row.id, label: row.name }))}
            onChange={(equipped_entity_id) =>
              setDraft({
                ...draft,
                equipped_entity_id: equipped_entity_id || null,
                equipped_slot: null,
              })
            }
          />
          <RecordSelect
            label={t("Recorded equipment slot")}
            value={draft.equipped_slot || ""}
            empty
            options={(
              data?.entities.find((row) => row.id === draft.equipped_entity_id)
                ?.equipment_slots || []
            ).map((row) => ({ value: row.id, label: row.label }))}
            onChange={(equipped_slot) =>
              setDraft({ ...draft, equipped_slot: equipped_slot || null })
            }
          />
          <p className="muted">
            {t(
              "Ownership, storage and equipment are saved together. This corrects records; it is not a gameplay transfer, use or equip action.",
            )}
          </p>
        </>
      )}
    </RecordEditor>
  );
}

function PersistentItemGrid({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (item: Item) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <div className="item-slot-grid">
        {items.map((item) => (
          <div className="item-slot-wrap" key={item.id}>
            <button
              className="item-slot"
              onClick={() => onSelect(item)}
              aria-label={t("Inspect {name}, quantity {count}, {status}", {
                name: item.name,
                count: item.quantity,
                status: t(item.equipped_entity_id ? "Equipped" : "Stored"),
              })}
              aria-describedby={`record-${item.id}`}
            >
              <span className="slot-quantity">{`×${item.quantity}`}</span>
              <Icon name={itemIcon(item.category)} size={32} />
              <strong>{item.name}</strong>
              <small>
                {item.equipped_entity_id ? t("Equipped") : item.category}
              </small>
            </button>
            <span
              role="tooltip"
              id={`record-${item.id}`}
              className="item-tooltip"
            >
              {item.description || t("No description recorded.")}
            </span>
          </div>
        ))}
      </div>
      {!items.length && (
        <p className="empty-state">
          {t("No items match this storage and filter.")}
        </p>
      )}
    </>
  );
}

export function ItemDetails({
  item,
  onClose,
  onEdit,
  reviewOnly = false,
}: {
  item: Item;
  onClose: () => void;
  onEdit: () => void;
  reviewOnly?: boolean;
}) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const equipped = data?.entities.find(
    (row) => row.id === item.equipped_entity_id,
  );
  return (
    <Modal title={item.name} onClose={onClose}>
      <div className="item-hero">
        {data ? (
          <GenerateVisual
            subject={{ kind: "item", id: item.id }}
            className={styles.itemVisual}
            reviewOnly={reviewOnly}
          />
        ) : (
          <Icon name={itemIcon(item.category)} size={52} />
        )}
        <Badge>{item.category}</Badge>
      </div>
      <p className="prose">
        {item.description || t("No description recorded.")}
      </p>
      <Panel title={t("Known mechanics")}>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {item.mechanics || t("No mechanics recorded.")}
        </p>
      </Panel>
      <dl className="stats-list">
        <div>
          <dt>{t("Quantity")}</dt>
          <dd>{item.quantity}</dd>
        </div>
        <div>
          <dt>{t("Owner")}</dt>
          <dd>
            {data?.entities.find((row) => row.id === item.owner_entity_id)
              ?.name || t("None recorded")}
          </dd>
        </div>
        <div>
          <dt>{t("Storage")}</dt>
          <dd>
            {data?.storages.find((row) => row.id === item.storage_id)?.name ||
              t("Not recorded")}
          </dd>
        </div>
        <div>
          <dt>{t("Equipped by")}</dt>
          <dd>{equipped?.name || t("Not equipped")}</dd>
        </div>
        {equipped && (
          <div>
            <dt>{t("Equipment slot")}</dt>
            <dd>
              {equipped.equipment_slots.find(
                (slot) => slot.id === item.equipped_slot,
              )?.label || t("Not recorded")}
            </dd>
          </div>
        )}
      </dl>
      <GameplayItemActions item={item} />
      <details className={styles.itemAdvanced}>
        <summary>{t("Advanced · owner correction")}</summary>
        <Button onClick={onEdit}>{t("Correct item record")}</Button>
      </details>
    </Modal>
  );
}

function RecordDoll({
  entity,
  items,
  onSelect,
  reviewOnly = false,
}: {
  entity: Entity;
  items: Item[];
  onSelect: (item: Item) => void;
  reviewOnly?: boolean;
}) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  const equipped = equipmentForRecord(entity, items);
  const portrait = data
    ? selectSubjectVisual(data, { kind: "entity", id: entity.id })
    : null;
  return (
    <section
      className={`shared-doll ${entity.kind === "player" ? styles.characterDoll : ""}`}
      style={
        entity.kind !== "player" && entity.equipment_slots.length
          ? {
              minHeight: Math.max(
                580,
                Math.ceil(entity.equipment_slots.length / 2) * 105 + 130,
              ),
            }
          : undefined
      }
      aria-label={t("{name} equipment", { name: entity.name })}
    >
      {data && portrait?.image ? (
        <GenerateVisual
          subject={{ kind: "entity", id: entity.id }}
          className={styles.subjectPortrait}
          reviewOnly={reviewOnly}
        />
      ) : entity.kind === "player" ? (
        <CharacterArtwork />
      ) : (
        <div
          className="doll-figure"
          style={{
            display: "grid",
            placeItems: "center",
            color: "var(--bronze)",
            opacity: 0.45,
          }}
        >
          <Icon
            name={
              entity.kind === "transport"
                ? "Briefcase"
                : entity.kind === "mount"
                  ? "Shield"
                  : "UserRound"
            }
            size={130}
          />
        </div>
      )}
      <div className="doll-caption">
        {entity.kind !== "player" && <h2>{entity.name}</h2>}
        <small>
          {t(entity.kind === "player" ? "Equipped" : "Recorded equipment")}
        </small>
      </div>
      {data && !portrait?.image && (
        <GenerateVisual
          subject={{ kind: "entity", id: entity.id }}
          className={styles.subjectActions}
          showArtwork={false}
          reviewOnly={reviewOnly}
        />
      )}
      {entity.equipment_slots.length ? (
        <div className="shared-equipment-slots">
          {entity.equipment_slots.map((slot) => {
            const item = equipped.find((row) => row.equipped_slot === slot.id);
            return (
              <button
                key={slot.id}
                className="shared-equipment-slot"
                onClick={() => item && onSelect(item)}
                disabled={!item}
              >
                <Icon
                  name={item ? itemIcon(item.category) : "Package"}
                  size={24}
                />
                <span>
                  {slot.label}
                  <small>{item?.name || t("Empty")}</small>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="no-equipment-note">
          {t(
            "No equipment profile is established. No humanoid anatomy is assumed.",
          )}
        </p>
      )}
    </section>
  );
}

function PlayerSheet({
  data,
  entity,
  onSelect,
  reviewOnly = false,
}: {
  data: CampaignSnapshot;
  entity: Entity;
  onSelect: (item: Item) => void;
  reviewOnly?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div className={styles.characterLayout}>
      <section
        className={styles.characterSheet}
        aria-label={t("Character sheet")}
      >
        <div className={styles.characterIdentity}>
          <span className="eyebrow">{t("Character")}</span>
          <h1>{entity.name}</h1>
          {Object.hasOwn(entity.stats, "level") && (
            <Badge>{t("Level {level}", { level: entity.stats.level })}</Badge>
          )}
          {entity.details && (
            <p className="prose">{characterDescription(entity.details, t)}</p>
          )}
          {entity.hp !== null && (
            <Meter
              label={t("HP")}
              value={`${entity.hp}${entity.max_hp === null ? "" : ` / ${entity.max_hp}`}`}
              percent={entity.max_hp ? (entity.hp / entity.max_hp) * 100 : 0}
              color="var(--red)"
            />
          )}
          {Object.keys(entity.resources).length > 0 && (
            <dl className="stats-list">
              {Object.entries(entity.resources).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <RecordDoll entity={entity} items={data.items} onSelect={onSelect} reviewOnly={reviewOnly} />
        <div
          className={`${styles.characterIdentity} ${styles.characterDetails}`}
        >
          {Object.keys(entity.stats).some((key) => key !== "level") && (
            <LiveDisclosure
              title={t("Attributes & skills")}
              storageKey={`${data.campaign.id}:character:stats`}
              defaultOpen
            >
              <dl className="stats-list">
                {Object.entries(entity.stats)
                  .filter(([key]) => key !== "level")
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{t(key)}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
            </LiveDisclosure>
          )}
          <LiveDisclosure
            title={t("Conditions")}
            storageKey={`${data.campaign.id}:character:conditions`}
          >
            <p>{entity.conditions.join(", ") || t("None recorded")}</p>
          </LiveDisclosure>
        </div>
      </section>
      <Panel className={styles.possessions} title={t("Possessions")}>
        <PersistentItemGrid
          items={data.items.filter(
            (item) =>
              item.owner_entity_id === entity.id ||
              item.equipped_entity_id === entity.id,
          )}
          onSelect={onSelect}
        />
        <p>
          <Link
            className="text-link"
            href={`/campaigns/${data.campaign.id}/inventory`}
          >
            {t("Open shared inventory")}
          </Link>
        </p>
      </Panel>
    </div>
  );
}

function EntityCollection({
  data,
  players,
  reviewOnly = false,
}: {
  data: CampaignSnapshot;
  players: boolean;
  reviewOnly?: boolean;
}) {
  const { t } = useLanguage();
  const rows = data.entities.filter((row) =>
    players ? row.kind === "player" : row.kind !== "player",
  );
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState<Entity | "new" | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const selected = rows.find((row) => row.id === selectedId) || rows[0];
  const currentItem = data.items.find((row) => row.id === item?.id);
  return (
    <>
      {players ? (
        <header className={styles.characterHeader}>
          <p className="muted">{t("Your hero, equipment and possessions.")}</p>
          <details className={styles.secondary}>
            <summary>{t("Character corrections")}</summary>
            {selected && (
              <Button onClick={() => setEditor(selected)}>
                {t("Edit public character record")}
              </Button>
            )}
            <Button onClick={() => setEditor("new")}>
              {t("Add player character")}
            </Button>
          </details>
        </header>
      ) : (
        <RecordHeading
          title={t("Party & relationships")}
          description="The people and companions this campaign has made known."
          action={
            <details className={styles.secondary}>
              <summary>{t("Edit / Correct records")}</summary>
              <Button onClick={() => setEditor("new")}>
                {t("Add companion or known NPC")}
              </Button>
            </details>
          }
        />
      )}
      {!selected ? (
        <Panel className="empty-state">
          <Icon name="UserRound" size={38} />
          <p>
            {t(
              "No public character records yet. Add only information the player knows.",
            )}
          </p>
        </Panel>
      ) : (
        <>
          {players && rows.length > 1 && (
            <RecordSelect
              label={t("Inspect public record")}
              value={selected.id}
              options={rows.map((row) => ({
                value: row.id,
                label: `${row.name} · ${t(entityKindLabels[row.kind])}`,
              }))}
              onChange={setSelectedId}
            />
          )}
          {players ? (
            <PlayerSheet data={data} entity={selected} onSelect={setItem} reviewOnly={reviewOnly} />
          ) : (
            <>
            <div className={styles.partyCards}>
              {rows.map((row) => (
                <article className={styles.partyCard} key={row.id}>
                  <div className={styles.partyPortrait} aria-hidden="true">
                    {row.name.slice(0, 1)}
                  </div>
                  <Badge>{t(entityKindLabels[row.kind])}</Badge>
                  <h2>{row.name}</h2>
                  {row.details && <p className="prose">{row.details}</p>}
                  {row.hp !== null && (
                    <p>{t("HP")}: {row.hp}{row.max_hp === null ? "" : ` / ${row.max_hp}`}</p>
                  )}
                  <div className="button-group">
                    {row.kind === "companion" && !reviewOnly && (
                      <GameplayCompanionTalk entityId={row.id} />
                    )}
                    <Link className="text-link" href={`/campaigns/${data.campaign.id}/inventory`}>
                      {t("Inventory")}
                    </Link>
                    <Button onClick={() => setSelectedId(row.id)}>
                      {t("View details")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <LiveDisclosure
              title={t("Details for {name}", { name: selected.name })}
              storageKey={`${data.campaign.id}:party:details`}
            >
            <div className="storage-layout with-doll">
              <RecordDoll
                entity={selected}
                items={data.items}
                onSelect={setItem}
                reviewOnly={reviewOnly}
              />
              <Panel
                className="visual-inventory-panel"
                title={selected.name}
                action={
                  <Button onClick={() => setEditor(selected)}>
                    {t("Edit public character record")}
                  </Button>
                }
              >
                <Badge>{t(entityKindLabels[selected.kind])}</Badge>
                <p className="prose" style={{ whiteSpace: "pre-wrap" }}>
                  {selected.details}
                </p>
                {selected.hp !== null && (
                  <Meter
                    label={t("HP")}
                    value={`${selected.hp}${selected.max_hp === null ? "" : ` / ${selected.max_hp}`}`}
                    percent={
                      selected.max_hp
                        ? (selected.hp / selected.max_hp) * 100
                        : 0
                    }
                    color="var(--red)"
                  />
                )}
                <h3>{t("Attributes")}</h3>
                <dl className="stats-list">
                  {Object.entries(selected.stats).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <h3>{t("Recorded resources")}</h3>
                <dl className="stats-list">
                  {Object.entries(selected.resources).map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <h3>{t("Conditions")}</h3>
                <p>{selected.conditions.join(", ") || t("None recorded")}</p>
                <h3>{t("Recorded possessions")}</h3>
                <PersistentItemGrid
                  items={data.items.filter(
                    (row) =>
                      row.owner_entity_id === selected.id ||
                      row.equipped_entity_id === selected.id,
                  )}
                  onSelect={setItem}
                />
                <p>
                  <Link
                    className="text-link"
                    href={`/campaigns/${data.campaign.id}/inventory`}
                  >
                    {t("Open shared inventory")}
                  </Link>
                </p>
                {selected.kind === "companion" && !reviewOnly && (
                  <GameplayCompanionTalk entityId={selected.id} />
                )}
              </Panel>
            </div>
            </LiveDisclosure>
            </>
          )}
        </>
      )}
      {editor && (
        <EntityEditor
          key={editor === "new" ? "new" : editor.id}
          entity={editor === "new" ? undefined : editor}
          defaultKind={players ? "player" : "companion"}
          onClose={() => setEditor(null)}
        />
      )}
      {currentItem && (
        <ItemDetails
          item={currentItem}
          onClose={() => setItem(null)}
          reviewOnly={reviewOnly}
          onEdit={() => {
            setEditItem(currentItem);
            setItem(null);
          }}
        />
      )}
      {editItem && (
        <ItemEditor item={editItem} onClose={() => setEditItem(null)} />
      )}
    </>
  );
}

export function PersistentCharacter({ reviewOnly = false }: { reviewOnly?: boolean } = {}) {
  const { t } = useLanguage();
  return (
    <RecordBoundary>
      {(data) => (
        <>
          <EntityCollection key={data.campaign.id} data={data} players reviewOnly={reviewOnly} />
          {!reviewOnly && (
            <LiveDisclosure
              title={t("Abilities, progression & background")}
              storageKey={`${data.campaign.id}:character:progression`}
            >
              <FoundationLoopPanel section="progression" />
            </LiveDisclosure>
          )}
        </>
      )}
    </RecordBoundary>
  );
}
export function PersistentParty({ reviewOnly = false }: { reviewOnly?: boolean } = {}) {
  return (
    <RecordBoundary>
      {(data) => (
        <EntityCollection key={data.campaign.id} data={data} players={false} reviewOnly={reviewOnly} />
      )}
    </RecordBoundary>
  );
}

function InventoryRecords({ data, reviewOnly = false }: { data: CampaignSnapshot; reviewOnly?: boolean }) {
  const { t } = useLanguage();
  const [storageId, setStorageId] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editor, setEditor] = useState<Item | "new" | null>(null);
  const [storageEditor, setStorageEditor] = useState<Storage | "new" | null>(
    null,
  );
  const [selected, setSelected] = useState<Item | null>(null);
  const storage =
    data.storages.find((row) => row.id === storageId) ||
    data.storages.find((row) => row.kind === "player") ||
    data.storages[0];
  const storageGroup = (kind: Storage["kind"]) =>
    kind === "player"
      ? "Player"
      : kind === "companion"
        ? "Companions"
        : kind === "camp"
          ? "Camp / Shared Stash"
          : kind === "transport"
            ? "Transport & Mounts"
            : "Other storage";
  const groups = [...new Set(data.storages.map((row) => storageGroup(row.kind)))];
  const hero = data.entities.find((row) => row.kind === "player");
  const items = data.items.filter(
    (row) =>
      row.storage_id === storage?.id &&
      (!category || row.category === category) &&
      `${row.name} ${row.description}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const currentItem = data.items.find((row) => row.id === selected?.id);
  return (
    <>
      <RecordHeading
        title={t("Inventory")}
        description="Possessions, equipment and shared supplies."
      />
      <div className="tabs" role="tablist" aria-label={t("Inventory storage")}>
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            role="tab"
            aria-selected={storage ? storageGroup(storage.kind) === group : false}
            className={storage && storageGroup(storage.kind) === group ? "active" : ""}
            onClick={() => {
              const next = data.storages.find((row) => storageGroup(row.kind) === group);
              setStorageId(next?.id || "");
              setCategory("");
            }}
          >
            {t(group)}
          </button>
        ))}
      </div>
      <Panel
        className="visual-inventory-panel"
        title={storage?.name || t("Inventory")}
      >
        {!storage ? (
          <p className="empty-state">
            {t("Create storage before adding items.")}
          </p>
        ) : (
          <>
            {data.storages.filter((row) => storageGroup(row.kind) === storageGroup(storage.kind)).length > 1 && (
              <RecordSelect
                label={t("Inspect storage")}
                value={storage.id}
                options={data.storages
                  .filter((row) => storageGroup(row.kind) === storageGroup(storage.kind))
                  .map((row) => ({ value: row.id, label: row.name }))}
                onChange={setStorageId}
              />
            )}
            <RecordField
              label={t("Search items")}
              value={search}
              onChange={setSearch}
            />
            <LiveDisclosure
              title={t("Filters")}
              storageKey={`${data.campaign.id}:inventory:filters`}
            >
              <RecordSelect
                label={t("Item category filter")}
                value={category}
                empty
                options={[
                  ...new Set(
                    data.items
                      .filter((row) => row.storage_id === storage.id)
                      .map((row) => row.category),
                  ),
                ].map((value) => ({ value, label: value }))}
                onChange={setCategory}
              />
            </LiveDisclosure>
            <PersistentItemGrid items={items} onSelect={setSelected} />
          </>
        )}
      </Panel>
      {hero && (
        <LiveDisclosure
          title={t("Equipment & paper doll")}
          storageKey={`${data.campaign.id}:inventory:equipment`}
        >
          <RecordDoll entity={hero} items={data.items} onSelect={setSelected} reviewOnly={reviewOnly} />
        </LiveDisclosure>
      )}
      <LiveDisclosure
        title={t("Edit / Correct records")}
        storageKey={`${data.campaign.id}:inventory:corrections`}
      >
        <div className="button-group">
          <Button disabled={!storage} onClick={() => setEditor("new")}>
            {t("Add item record")}
          </Button>
          <Button onClick={() => setStorageEditor("new")}>
            {t("Add storage record")}
          </Button>
          {storage && <Button onClick={() => setStorageEditor(storage)}>{t("Edit storage record")}</Button>}
        </div>
      </LiveDisclosure>
      {currentItem && (
        <ItemDetails
          item={currentItem}
          onClose={() => setSelected(null)}
          reviewOnly={reviewOnly}
          onEdit={() => {
            setEditor(currentItem);
            setSelected(null);
          }}
        />
      )}
      {editor && (
        <ItemEditor
          item={editor === "new" ? undefined : editor}
          storageId={storage?.id}
          onClose={() => setEditor(null)}
        />
      )}
      {storageEditor && (
        <StorageEditor
          storage={storageEditor === "new" ? undefined : storageEditor}
          onClose={() => setStorageEditor(null)}
        />
      )}
    </>
  );
}

export function PersistentInventory({ reviewOnly = false }: { reviewOnly?: boolean } = {}) {
  const { t } = useLanguage();
  return (
    <RecordBoundary>
      {(data) => (
        <>
          <InventoryRecords key={data.campaign.id} data={data} reviewOnly={reviewOnly} />
          {!reviewOnly && (
            <LiveDisclosure
              title={t("Use, transfer & trade")}
              storageKey={`${data.campaign.id}:inventory:trade`}
            >
              <FoundationLoopPanel section="trade" />
            </LiveDisclosure>
          )}
        </>
      )}
    </RecordBoundary>
  );
}
