"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "./language-context";
import { useCampaignData, useUnsavedChanges } from "./persistence-context";
import { Badge, Button, Icon, Meter, Modal, Panel } from "./ui";
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
  equipmentForRecord,
  itemCorrectionIssue,
  itemIcon,
  numberOrNull,
  RecordValidationError,
  storageKindLabels,
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
            attempt.current = createMutationAttempt(
              attempt.current,
              build(draft),
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
              <Button primary type="submit">
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
        const hp = numberOrNull(draft.hp),
          maxHp = numberOrNull(draft.max_hp);
        if (hp !== null && maxHp !== null && hp > maxHp)
          throw new RecordValidationError(
            "Current HP cannot exceed maximum HP.",
          );
        const payload: EntityInput & { id?: string } = {
          id: entity?.id,
          name: draft.name,
          kind: draft.kind,
          details: draft.details,
          hp,
          max_hp: maxHp,
          stats: draft.stats,
          resources: draft.resources,
          conditions: draft.conditions
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
          equipment_slots: draft.slots.map((slot) => ({
            ...slot,
            accepts: slot.accepts
              .split(",")
              .map((category) => category.trim())
              .filter(Boolean),
          })),
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
              step="any"
              onChange={(hp) => setDraft({ ...draft, hp })}
            />
            <RecordField
              label={t("Maximum HP")}
              value={draft.max_hp}
              type="number"
              min={0}
              step="any"
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
    kind: storage?.kind || "player",
    entity_id: storage?.entity_id || null,
  };
  return (
    <RecordEditor
      title={storage ? "Edit storage record" : "Add storage record"}
      initial={initial}
      onClose={onClose}
      build={(payload) => ({
        operation: "storage.save",
        campaignId,
        expectedRevision: storage?.revision || 0,
        payload: { ...payload, id: storage?.id },
      })}
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
            onChange={(kind) =>
              setDraft({ ...draft, kind: kind as Storage["kind"] })
            }
          />
          <RecordSelect
            label={t("Storage belongs to")}
            value={draft.entity_id || ""}
            empty
            options={(data?.entities || []).map((row) => ({
              value: row.id,
              label: row.name,
            }))}
            onChange={(entity_id) =>
              setDraft({ ...draft, entity_id: entity_id || null })
            }
          />
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
              .filter((row) => row.equipment_slots.length)
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

function ItemDetails({
  item,
  onClose,
  onEdit,
}: {
  item: Item;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t } = useLanguage();
  const { data } = useCampaignData();
  return (
    <Modal title={item.name} onClose={onClose}>
      <div className="item-hero">
        <Icon name={itemIcon(item.category)} size={52} />
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
          <dt>{t("Recorded owner")}</dt>
          <dd>
            {data?.entities.find((row) => row.id === item.owner_entity_id)
              ?.name || t("None selected")}
          </dd>
        </div>
        <div>
          <dt>{t("Recorded storage")}</dt>
          <dd>
            {data?.storages.find((row) => row.id === item.storage_id)?.name}
          </dd>
        </div>
        <div>
          <dt>{t("Recorded equipped character")}</dt>
          <dd>
            {data?.entities.find((row) => row.id === item.equipped_entity_id)
              ?.name || t("None selected")}
          </dd>
        </div>
      </dl>
      <Button primary onClick={onEdit}>
        {t("Correct item record")}
      </Button>
      <p className="muted">
        {t(
          "Use, transfer, rest, cooking and combat are unavailable until gameplay rules are connected.",
        )}
      </p>
    </Modal>
  );
}

function RecordDoll({
  entity,
  items,
  onSelect,
}: {
  entity: Entity;
  items: Item[];
  onSelect: (item: Item) => void;
}) {
  const { t } = useLanguage();
  const equipped = equipmentForRecord(entity, items);
  return (
    <section
      className="shared-doll"
      style={
        entity.equipment_slots.length
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
      <div className="doll-caption">
        <h2>{entity.name}</h2>
        <small>{t("Recorded equipment")}</small>
      </div>
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

function EntityCollection({
  data,
  players,
}: {
  data: CampaignSnapshot;
  players: boolean;
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
      <RecordHeading
        title={players ? "Character & Inventory" : "Party & known people"}
        description="Public records for this campaign. Manual corrections are separate from gameplay."
        action={
          <Button primary onClick={() => setEditor("new")}>
            {t(players ? "Add player character" : "Add companion or known NPC")}
          </Button>
        }
      />
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
          <RecordSelect
            label={t("Inspect public record")}
            value={selected.id}
            options={rows.map((row) => ({
              value: row.id,
              label: `${row.name} · ${t(entityKindLabels[row.kind])}`,
            }))}
            onChange={setSelectedId}
          />
          <div className="storage-layout with-doll">
            <RecordDoll
              entity={selected}
              items={data.items}
              onSelect={setItem}
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
                    selected.max_hp ? (selected.hp / selected.max_hp) * 100 : 0
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
              <Button disabled>{t("Talk")}</Button>
              <p className="muted">
                {t(
                  "Companion responses and gameplay actions are not connected in Phase 1.",
                )}
              </p>
            </Panel>
          </div>
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

export function PersistentCharacter() {
  return (
    <RecordBoundary>
      {(data) => (
        <EntityCollection key={data.campaign.id} data={data} players />
      )}
    </RecordBoundary>
  );
}
export function PersistentParty() {
  return (
    <RecordBoundary>
      {(data) => (
        <EntityCollection key={data.campaign.id} data={data} players={false} />
      )}
    </RecordBoundary>
  );
}

function InventoryRecords({ data }: { data: CampaignSnapshot }) {
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
    data.storages.find((row) => row.id === storageId) || data.storages[0];
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
        description="One shared record of possessions, storage and equipment for this campaign."
        action={
          <Button primary disabled={!storage} onClick={() => setEditor("new")}>
            {t("Add item record")}
          </Button>
        }
      />
      <Panel
        className="visual-inventory-panel"
        title={t("Storage records")}
        action={
          <Button onClick={() => setStorageEditor("new")}>
            {t("Add storage record")}
          </Button>
        }
      >
        {!storage ? (
          <p className="empty-state">
            {t("Create storage before adding items.")}
          </p>
        ) : (
          <>
            <RecordSelect
              label={t("Inspect storage")}
              value={storage.id}
              options={data.storages.map((row) => ({
                value: row.id,
                label: `${row.name} · ${t(storageKindLabels[row.kind])}`,
              }))}
              onChange={setStorageId}
            />
            <Button onClick={() => setStorageEditor(storage)}>
              {t("Edit storage record")}
            </Button>
            <div className="form-grid">
              <RecordField
                label={t("Search items")}
                value={search}
                onChange={setSearch}
              />
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
            </div>
            <PersistentItemGrid items={items} onSelect={setSelected} />
          </>
        )}
        <p className="muted">
          {t(
            "Camp and cargo records are inspectable. Gameplay withdrawals, transfers and access checks remain unavailable.",
          )}
        </p>
      </Panel>
      {currentItem && (
        <ItemDetails
          item={currentItem}
          onClose={() => setSelected(null)}
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

export function PersistentInventory() {
  return (
    <RecordBoundary>
      {(data) => <InventoryRecords key={data.campaign.id} data={data} />}
    </RecordBoundary>
  );
}
