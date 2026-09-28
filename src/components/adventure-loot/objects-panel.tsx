"use client";
import { useId, useRef, useState } from "react";
import type {
  OwnerLootObject,
  OwnerLootView,
  OwnerObjectInput,
} from "../../lib/adventure-loot/owner-contracts";
import {
  buildCreateOwnerObjectInput,
  buildEditOwnerObjectInput,
  ownerAccessOptions,
  OwnerObjectFormError,
  type AppearanceDraft,
  type CreationDraft,
} from "../../lib/adventure-loot/owner-form";
type Language = "en" | "ru";
const copy = {
  en: {
    title: "Objects in the scene",
    intro:
      "Record an object around existing stock, or correct what is already known.",
    create: "Record an object",
    empty: "No objects are known here.",
    edit: "Correct this object",
    label: "Object name",
    storage: "Existing stock",
    location: "Location",
    owner: "Owner",
    access: "Access",
    portable: "Can it be moved?",
    unknown: "Unknown",
    yes: "Portable",
    no: "Fixed in place",
    capability: "Established capability",
    choose: "Choose an available option",
    lockDc: "Lock difficulty (optional)",
    forceDc: "Force difficulty (optional)",
    save: "Save correction",
    recorded: "Contents already recorded",
    unspecified: "Contents not established",
    warning:
      "Creative methods need approved mechanics. Unsupported methods pause for review.",
    stockNote:
      "This form uses existing stock. Contents and quantities stay as recorded.",
    noChoices:
      "An owned storage, a known location, and an established capability are needed to record an object.",
    labels: {
      open: "Open",
      closed: "Closed",
      locked: "Locked",
      sealed: "Sealed",
      jammed: "Jammed",
      broken: "Broken",
    },
    errors: {
      label: "Enter an object name of 1–200 characters.",
      choices:
        "Choose established stock, its owner, a location and a capability.",
      dc: "Optional difficulties must be whole numbers from 1 to 40.",
    },
    failed:
      "The change could not be saved. Refresh the scene and review the details.",
    saved: "Object details saved.",
  },
  ru: {
    title: "Объекты в сцене",
    intro:
      "Создайте описание объекта для существующих запасов или исправьте уже известные факты.",
    create: "Записать объект",
    empty: "Здесь пока нет известных объектов.",
    edit: "Исправить объект",
    label: "Название объекта",
    storage: "Существующие запасы",
    location: "Место",
    owner: "Владелец",
    access: "Доступ",
    portable: "Можно переместить?",
    unknown: "Неизвестно",
    yes: "Переносной",
    no: "Закреплён",
    capability: "Подтверждённая способность",
    choose: "Выберите доступный вариант",
    lockDc: "Сложность замка (необязательно)",
    forceDc: "Сложность взлома силой (необязательно)",
    save: "Сохранить исправление",
    recorded: "Содержимое уже записано",
    unspecified: "Содержимое не установлено",
    warning:
      "Творческие способы требуют утверждённых механик. Неподдерживаемый способ приостанавливается для проверки.",
    stockNote:
      "Форма использует уже записанные предметы и хранилища. Она не придумывает содержимое и количество.",
    noChoices:
      "Для записи объекта нужны хранилище с владельцем, известное место и подтверждённая способность.",
    labels: {
      open: "Открыт",
      closed: "Закрыт",
      locked: "Под замком",
      sealed: "Запечатан",
      jammed: "Заклинило",
      broken: "Сломан",
    },
    errors: {
      label: "Введите название от 1 до 200 символов.",
      choices:
        "Выберите существующие запасы, их владельца, место и способность.",
      dc: "Сложность должна быть целым числом от 1 до 40 или остаться пустой.",
    },
    failed:
      "Не удалось сохранить изменение. Обновите сцену и проверьте данные.",
    saved: "Данные объекта сохранены.",
  },
};
type Text = typeof copy.en | typeof copy.ru;
type Save = (input: OwnerObjectInput) => Promise<void> | void;
const fieldClass =
  "w-full min-w-0 rounded-lg border border-[#514536] bg-[#101111] px-3 py-2 text-sm text-[#e8dfcd] focus:outline-none focus:ring-2 focus:ring-[#bfa06a]";
const buttonClass =
  "rounded-lg border border-[#8c7148] bg-[#30291e] px-4 py-2 text-sm text-[#ecd7aa] transition hover:bg-[#443825] disabled:cursor-not-allowed disabled:opacity-40";
function AppearanceFields({
  draft,
  onChange,
  c,
}: {
  draft: AppearanceDraft;
  onChange: (draft: AppearanceDraft) => void;
  c: Text;
}) {
  return (
    <>
      <label className="grid gap-2 text-sm text-[#c4b8a3]">
        <span>{c.label}</span>
        <input
          className={fieldClass}
          required
          maxLength={200}
          value={draft.label}
          onChange={(event) =>
            onChange({ ...draft, label: event.target.value })
          }
        />
      </label>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-[#c4b8a3]">
          <span>{c.access}</span>
          <select
            className={fieldClass}
            value={draft.access}
            onChange={(event) =>
              onChange({
                ...draft,
                access: event.target.value as AppearanceDraft["access"],
              })
            }
          >
            {ownerAccessOptions.map((access) => (
              <option key={access} value={access}>
                {c.labels[access]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-[#c4b8a3]">
          <span>{c.portable}</span>
          <select
            className={fieldClass}
            value={
              draft.portable === null
                ? "unknown"
                : draft.portable
                  ? "yes"
                  : "no"
            }
            onChange={(event) =>
              onChange({
                ...draft,
                portable:
                  event.target.value === "unknown"
                    ? null
                    : event.target.value === "yes",
              })
            }
          >
            <option value="unknown">{c.unknown}</option>
            <option value="yes">{c.yes}</option>
            <option value="no">{c.no}</option>
          </select>
        </label>
      </div>
    </>
  );
}
function useSave(c: Text, onSave: Save) {
  const lock = useRef(false),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  async function save(make: () => OwnerObjectInput) {
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setMessage("");
    try {
      await onSave(make());
      setMessage(c.saved);
    } catch (error) {
      setMessage(
        error instanceof OwnerObjectFormError ? c.errors[error.code] : c.failed,
      );
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return { saving, message, save };
}
function EditObject({
  object,
  c,
  busy,
  onSave,
}: {
  object: OwnerLootObject;
  c: Text;
  busy: boolean;
  onSave: Save;
}) {
  const [draft, setDraft] = useState<AppearanceDraft>({
    label: object.label,
    access: object.access,
    portable: object.portable,
  });
  const { saving, message, save } = useSave(c, onSave);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) void save(() => buildEditOwnerObjectInput(object, draft));
      }}
    >
      <fieldset
        disabled={busy || saving}
        className="grid min-w-0 gap-4 border-0 p-0"
      >
        <AppearanceFields draft={draft} onChange={setDraft} c={c} />
        <button className={buttonClass} type="submit">
          {c.save}
        </button>
      </fieldset>
      {message && (
        <p role="status" className="mt-3 text-sm text-[#d9c7a3]">
          {message}
        </p>
      )}
    </form>
  );
}
function CreateObject({
  data,
  c,
  busy,
  onSave,
}: {
  data: OwnerLootView;
  c: Text;
  busy: boolean;
  onSave: Save;
}) {
  const storages = data.choices.storages.filter(
    (storage) =>
      storage.entityId &&
      data.choices.entities.some((entity) => entity.id === storage.entityId),
  );
  const [draft, setDraft] = useState<CreationDraft>({
    storageId: storages[0]?.id ?? "",
    ownerEntityId: storages[0]?.entityId ?? "",
    locationId: data.choices.locations[0]?.id ?? "",
    capability: data.choices.capabilities[0] ?? "",
    label: "",
    access: "closed",
    portable: null,
    lockDc: "",
    forceDc: "",
  });
  const { saving, message, save } = useSave(c, onSave);
  const available =
    storages.length > 0 &&
    data.choices.locations.length > 0 &&
    data.choices.capabilities.length > 0;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy && available)
          void save(() => buildCreateOwnerObjectInput(draft, data.choices));
      }}
    >
      <p className="mb-4 max-w-2xl text-sm leading-relaxed text-[#a99e8a]">
        {c.stockNote}
      </p>
      {!available && (
        <p className="mb-4 text-sm text-[#d4b986]">{c.noChoices}</p>
      )}
      <fieldset
        disabled={busy || saving || !available}
        className="grid min-w-0 gap-4 border-0 p-0"
      >
        <AppearanceFields
          draft={draft}
          onChange={(appearance) => setDraft({ ...draft, ...appearance })}
          c={c}
        />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-[#c4b8a3]">
            <span>{c.storage}</span>
            <select
              className={fieldClass}
              required
              value={draft.storageId}
              onChange={(event) => {
                const storage = storages.find(
                  (storage) => storage.id === event.target.value,
                );
                setDraft({
                  ...draft,
                  storageId: event.target.value,
                  ownerEntityId: storage?.entityId ?? "",
                });
              }}
            >
              <option value="">{c.choose}</option>
              {storages.map((storage) => (
                <option key={storage.id} value={storage.id}>
                  {storage.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#c4b8a3]">
            <span>{c.location}</span>
            <select
              className={fieldClass}
              required
              value={draft.locationId}
              onChange={(event) =>
                setDraft({ ...draft, locationId: event.target.value })
              }
            >
              <option value="">{c.choose}</option>
              {data.choices.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#c4b8a3]">
            <span>{c.owner}</span>
            <select
              className={fieldClass}
              required
              value={draft.ownerEntityId}
              onChange={(event) =>
                setDraft({ ...draft, ownerEntityId: event.target.value })
              }
            >
              <option value="">{c.choose}</option>
              {data.choices.entities
                .filter(
                  (entity) =>
                    entity.id ===
                    storages.find((storage) => storage.id === draft.storageId)
                      ?.entityId,
                )
                .map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#c4b8a3]">
            <span>{c.capability}</span>
            <select
              className={fieldClass}
              required
              value={draft.capability}
              onChange={(event) =>
                setDraft({ ...draft, capability: event.target.value })
              }
            >
              <option value="">{c.choose}</option>
              {data.choices.capabilities.map((capability) => (
                <option key={capability} value={capability}>
                  {capability}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#c4b8a3]">
            <span>{c.lockDc}</span>
            <input
              className={fieldClass}
              type="number"
              min={1}
              max={40}
              step={1}
              value={draft.lockDc}
              onChange={(event) =>
                setDraft({ ...draft, lockDc: event.target.value })
              }
            />
          </label>
          <label className="grid gap-2 text-sm text-[#c4b8a3]">
            <span>{c.forceDc}</span>
            <input
              className={fieldClass}
              type="number"
              min={1}
              max={40}
              step={1}
              value={draft.forceDc}
              onChange={(event) =>
                setDraft({ ...draft, forceDc: event.target.value })
              }
            />
          </label>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-[#b6a887]">
          {c.warning}
        </p>
        <button className={buttonClass} type="submit">
          {c.create}
        </button>
      </fieldset>
      {message && (
        <p role="status" className="mt-3 text-sm text-[#d9c7a3]">
          {message}
        </p>
      )}
    </form>
  );
}
export function AdventureLootObjectsPanel({
  language,
  data,
  busy,
  onSave,
}: {
  language: Language;
  data: OwnerLootView;
  busy: boolean;
  onSave: Save;
}) {
  const c = copy[language],
    headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="min-w-0 rounded-xl border border-[#514536] bg-[#171817] p-4 text-[#e8dfcd] md:p-6"
    >
      <header className="mb-6">
        <h2 id={headingId} className="font-serif text-xl text-[#dfc392]">
          {c.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#b1a590]">
          {c.intro}
        </p>
      </header>
      <div className="grid gap-3">
        {data.objects.length === 0 && (
          <p className="text-sm text-[#a99e8a]">{c.empty}</p>
        )}
        {data.objects.map((object) => (
          <details
            key={object.id + ":" + object.revision}
            className="min-w-0 rounded-lg border border-[#40392e] bg-[#111312] p-4"
          >
            <summary className="cursor-pointer text-[#ddc291]">
              <span className="break-words font-serif">{object.label}</span>
              <span className="ml-3 text-xs text-[#a99e8a]">
                {c.labels[object.access]} ·{" "}
                {object.contentsEstablished ? c.recorded : c.unspecified}
              </span>
            </summary>
            <div className="mt-5">
              <h3 className="mb-4 text-sm text-[#c4b8a3]">{c.edit}</h3>
              <EditObject object={object} c={c} busy={busy} onSave={onSave} />
            </div>
          </details>
        ))}
      </div>
      <details className="mt-5 min-w-0 rounded-lg border border-[#57452e] p-4">
        <summary className="cursor-pointer font-serif text-[#dfc392]">
          {c.create}
        </summary>
        <div className="mt-5">
          <CreateObject data={data} c={c} busy={busy} onSave={onSave} />
        </div>
      </details>
    </section>
  );
}
