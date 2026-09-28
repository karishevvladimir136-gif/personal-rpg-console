"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLanguage } from "./language-context";
import {
  useCampaignData,
  useCampaignDraftScope,
  TimelineDraftNotice,
  useUnsavedChanges,
} from "./persistence-context";
import { Badge, Button, Modal, Panel } from "./ui";
import {
  createMutationAttempt,
  loadVersions,
  readJson,
  ClientPersistenceError,
} from "@/lib/persistence/client";
import type {
  CampaignSnapshot,
  DocumentRecord,
  DocumentVersion,
  Mutation,
  MutationInput,
  MutationResult,
} from "@/lib/persistence/contracts";
import {
  buildFrame,
  frameIsCurrent,
  mockArtForAsset,
  mockAssetMutation,
  newVisualReference,
  parseVisualMetadata,
  referenceIsCurrent,
  visualDocumentMutation,
  visualDocuments,
  visualSubjects,
} from "@/lib/visual-frame/model";
import type {
  VisualFrame,
  VisualMetadata,
  VisualReference,
} from "@/lib/visual-frame/model";
import { MockVisualArt } from "./visual-frame/mock-art";

function useVisualWords() {
  const { language } = useLanguage();
  return (en: string, ru: string) => (language === "ru" ? ru : en);
}
export type VisualFrameTransport = {
  save: (input: Mutation) => Promise<MutationResult>;
  history: (
    campaignId: string,
    documentId: string,
  ) => Promise<DocumentVersion[]>;
};
const defaultTransport: VisualFrameTransport = {
  save: async (input) =>
    readJson<MutationResult>("/api/visual-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  history: loadVersions,
};
const VisualFrameTransportContext =
  createContext<VisualFrameTransport>(defaultTransport);
function useVisualFrameTransport() {
  return useContext(VisualFrameTransportContext);
}
function Field({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        rows={3}
        value={value}
        maxLength={max}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function ReferenceEditor({
  snapshot,
  initial,
  record,
  onClose,
}: {
  snapshot: CampaignSnapshot;
  initial: VisualReference;
  record?: DocumentRecord;
  onClose: () => void;
}) {
  const w = useVisualWords();
  const transport = useVisualFrameTransport();
  const { refresh } = useCampaignData();
  const scope = useCampaignDraftScope();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<DocumentVersion[] | null>(null);
  const attempt = useRef<Mutation | null>(null);
  const lock = useRef(false);
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  useUnsavedChanges(dirty);
  const subjects = visualSubjects(snapshot);
  const update = (patch: Partial<VisualReference>) =>
    setDraft({ ...draft, ...patch, approval: "draft" });
  const failure = (cause: unknown) =>
    setError(
      cause instanceof ClientPersistenceError && cause.code === "conflict"
        ? w(
            "The source or timeline changed. Your draft is preserved. Close and compare the latest reference before saving.",
            "Источник или линия времени изменились. Черновик сохранён. Закройте окно и сравните новую версию перед сохранением.",
          )
        : w(
            "The save could not be confirmed. Keep your draft and retry.",
            "Сохранение не подтверждено. Черновик сохранён — повторите попытку.",
          ),
    );
  async function save() {
    if (lock.current || scope.stale) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      attempt.current = createMutationAttempt(
        attempt.current,
        scope.bind(visualDocumentMutation(snapshot, draft, record), "campaign"),
      );
      await transport.save(attempt.current);
      await refresh();
      onClose();
    } catch (cause) {
      failure(cause);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function close() {
    if (
      !lock.current &&
      (!dirty ||
        window.confirm(
          w(
            "Discard these unsaved visual edits?",
            "Отменить несохранённые изменения внешности?",
          ),
        ))
    )
      onClose();
  }
  return (
    <Modal title={w("Visual reference", "Визуальный образец")} onClose={close}>
      <p className="muted">
        {w(
          "Only public appearance and visual direction belong here. Saving creates an immutable reference version; it can invalidate World Lab source bases. These campaign-wide notes are not rewound by Save/Load. They never change character or world mechanics.",
          "Здесь только открытая внешность и визуальные указания. Сохранение создаёт неизменяемую версию и может сделать основу World Lab устаревшей. Заметки общие для кампании и не откатываются загрузкой сохранения. Механика персонажей и мира не меняется.",
        )}
      </p>
      <TimelineDraftNotice stale={scope.stale} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {!record ? (
          <label className="field">
            <span>{w("Public subject", "Открытый объект")}</span>
            <select
              value={`${draft.subject.kind}:${draft.subject.id}`}
              onChange={(event) => {
                const source = subjects.find(
                  (r) =>
                    `${r.subject.kind}:${r.subject.id}` === event.target.value,
                );
                if (source)
                  setDraft({
                    ...newVisualReference(snapshot, source.subject),
                    imageAssetId: draft.imageAssetId,
                    imageAssetRevision: draft.imageAssetRevision,
                  });
              }}
            >
              {subjects.map((r) => (
                <option
                  key={`${r.subject.kind}:${r.subject.id}`}
                  value={`${r.subject.kind}:${r.subject.id}`}
                >
                  {r.label} ·{" "}
                  {w(
                    {
                      entity: "Character / vehicle / mount",
                      location: "Location",
                      item: "Item",
                      style: "Campaign style",
                    }[r.subject.kind],
                    {
                      entity: "Персонаж / транспорт / ездовое животное",
                      location: "Место",
                      item: "Предмет",
                      style: "Стиль кампании",
                    }[r.subject.kind],
                  )}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <h3>{draft.label}</h3>
        )}
        <Field
          label={w("Stable appearance", "Постоянная внешность")}
          value={draft.appearance}
          max={1600}
          onChange={(appearance) => update({ appearance })}
        />
        <Field
          label={w(
            "Outfit / injury / location variant",
            "Одежда / травмы / вариант места",
          )}
          value={draft.outfit}
          max={800}
          onChange={(outfit) => update({ outfit })}
        />
        <Field
          label={w("Public visual guidance", "Открытые визуальные указания")}
          value={draft.guidance}
          max={1200}
          onChange={(guidance) => update({ guidance })}
        />
        <label className="field">
          <span>
            {w(
              "Existing Gallery image (optional)",
              "Изображение из галереи (необязательно)",
            )}
          </span>
          <select
            value={draft.imageAssetId ?? ""}
            onChange={(event) => {
              const asset = snapshot.assets.find(
                (a) =>
                  a.campaign_id === snapshot.campaign.id &&
                  a.id === event.target.value &&
                  a.kind === "image",
              );
              update({
                imageAssetId: asset?.id ?? null,
                imageAssetRevision: asset?.revision ?? null,
              });
            }}
          >
            <option value="">
              {w("Text guidance only", "Только текстовые указания")}
            </option>
            {snapshot.assets
              .filter(
                (a) =>
                  a.campaign_id === snapshot.campaign.id && a.kind === "image",
              )
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
          </select>
        </label>
        <p className="muted">
          {w(
            "Changed or copied guidance becomes a draft. Approve it after reviewing the saved version.",
            "Изменённые или скопированные указания становятся черновиком. Утвердите их после проверки сохранённой версии.",
          )}
        </p>
        {error && <p role="alert">{error}</p>}
        <Button primary type="submit" disabled={busy || scope.stale}>
          {w("Save visual guidance", "Сохранить визуальные указания")}
        </Button>
      </form>
      {record && (
        <Button
          disabled={busy}
          onClick={() => {
            void transport
              .history(snapshot.campaign.id, record.id)
              .then(setHistory)
              .catch(failure);
          }}
        >
          {w("Review version history", "История версий")}
        </Button>
      )}
      {history?.map((version) => {
        const old = parseVisualMetadata(version);
        if (
          !old ||
          old.kind !== "reference" ||
          old.campaign_id !== snapshot.campaign.id ||
          old.subject.kind !== initial.subject.kind ||
          old.subject.id !== initial.subject.id
        )
          return null;
        return (
          <div className="mt-4 border-t border-[#604b30] pt-3" key={version.id}>
            <h4>
              {w("Version", "Версия")} {version.version} ·{" "}
              {new Date(version.created_at).toLocaleString()}
            </h4>
            <p className="whitespace-pre-wrap break-words">{old.appearance}</p>
            <p className="whitespace-pre-wrap break-words">{old.outfit}</p>
            <p className="whitespace-pre-wrap break-words">{old.guidance}</p>
            <Button
              disabled={busy}
              onClick={() =>
                update({
                  appearance: old.appearance,
                  outfit: old.outfit,
                  guidance: old.guidance,
                })
              }
            >
              {w(
                "Copy guidance into a new draft",
                "Скопировать указания в новый черновик",
              )}
            </Button>
          </div>
        );
      })}
    </Modal>
  );
}

export function PersistentVisualFrame({
  transport,
}: { transport?: VisualFrameTransport } = {}) {
  return (
    <VisualFrameTransportContext.Provider value={transport ?? defaultTransport}>
      <VisualFramePanel />
    </VisualFrameTransportContext.Provider>
  );
}
function VisualFramePanel() {
  const w = useVisualWords();
  const transport = useVisualFrameTransport();
  const { data, refresh } = useCampaignData();
  const [editor, setEditor] = useState<{
    initial: VisualReference;
    record?: DocumentRecord;
    snapshot: CampaignSnapshot;
  } | null>(null);
  const [sceneId, setSceneId] = useState("");
  const [referenceIds, setReferenceIds] = useState<string[]>([]);
  const [composition, setComposition] =
    useState<VisualFrame["composition"]>("wide");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inspected, setInspected] = useState<VisualFrame | null>(null);
  const [history, setHistory] = useState<{
    record: DocumentRecord;
    rows: DocumentVersion[];
  } | null>(null);
  const attempts = useRef(new Map<string, Mutation>());
  const activeAttemptKeys = useRef<Set<string> | null>(null);
  const lock = useRef(false);
  // Timeline changes discard only unsaved frame selections; no background generation runs.
  const selectionFence = useRef(data?.timeline);
  useEffect(() => {
    if (
      selectionFence.current?.epoch !== data?.timeline?.epoch ||
      selectionFence.current?.timelineId !== data?.timeline?.timelineId
    ) {
      selectionFence.current = data?.timeline;
      setReferenceIds([]);
      setSceneId("");
      setInspected(null);
    }
  }, [data?.timeline]);
  if (!data) return null;
  const snapshot = data;
  const entries = visualDocuments(snapshot);
  const references = entries.filter(
    (e): e is { record: DocumentRecord; value: VisualReference } =>
      e.value.kind === "reference",
  );
  const frames = entries.filter(
    (e): e is { record: DocumentRecord; value: VisualFrame } =>
      e.value.kind === "frame",
  );
  const eligible = references.filter(
    (e) =>
      e.value.approval === "approved" && referenceIsCurrent(snapshot, e.value),
  );
  const scenes = snapshot.scenes
    .filter(
      (s) => s.campaign_id === snapshot.campaign.id && s.role === "narration",
    )
    .sort((a, b) => b.sequence - a.sequence);
  const currentScene =
    scenes.find((s) => s.id === sceneId) ??
    scenes.find((s) => s.id === snapshot.publicState.current_scene_id) ??
    scenes[0];
  const selected = referenceIds.filter((id) =>
    eligible.some((e) => e.record.id === id),
  );
  let proposal: VisualFrame | null = null;
  try {
    if (currentScene)
      proposal = buildFrame(snapshot, currentScene.id, selected, composition);
  } catch {
    /* Bounded unsupported or stale source stays unavailable. */
  }
  const duplicate =
    proposal &&
    frames.some(
      (e) =>
        e.value.status === "queued" &&
        frameIsCurrent(snapshot, e.value) &&
        e.value.prompt === proposal?.prompt,
    );
  const failure = (cause: unknown) =>
    setError(
      cause instanceof ClientPersistenceError && cause.code === "conflict"
        ? w(
            "The source or timeline changed. Refresh and review the current reference. Existing history is preserved.",
            "Источник или линия времени изменились. Обновите и проверьте текущий образец. История сохранена.",
          )
        : w(
            "The operation could not be confirmed. Retry explicitly; text gameplay remains available.",
            "Операция не подтверждена. Повторите явно; текстовая игра остаётся доступной.",
          ),
    );
  async function save(key: string, input: MutationInput, requestId?: string) {
    const attempt = requestId
      ? ({ ...input, requestId } as Mutation)
      : createMutationAttempt(attempts.current.get(key) ?? null, input);
    attempts.current.set(key, attempt);
    activeAttemptKeys.current?.add(key);
    return transport.save(attempt);
  }
  async function act(work: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    const usedKeys = new Set<string>();
    activeAttemptKeys.current = usedKeys;
    setBusy(true);
    setError("");
    try {
      await work();
      await refresh();
      // Only a fully confirmed UI action retires its retry identity.
      for (const key of usedKeys) attempts.current.delete(key);
    } catch (cause) {
      failure(cause);
    } finally {
      activeAttemptKeys.current = null;
      lock.current = false;
      setBusy(false);
    }
  }
  async function finish(record: DocumentRecord, frame: VisualFrame) {
    const result = await save(
      `asset:${record.id}`,
      mockAssetMutation(snapshot, record, frame),
      record.id,
    );
    // Preserve the original fence. Server preflight verifies the asset; an explicit retry replays the same receipt.
    await save(
      `complete:${record.id}`,
      visualDocumentMutation(
        snapshot,
        { ...frame, status: "completed", resultAssetId: result.id },
        record,
      ),
      result.id,
    );
  }
  const status = (value: VisualReference["approval"] | VisualFrame["status"]) =>
    w(
      {
        draft: "Draft",
        approved: "Approved visual reference",
        invalidated: "Invalidated",
        queued: "Queued",
        completed: "Completed",
        failed: "Failed",
        cancelled: "Cancelled",
      }[value],
      {
        draft: "Черновик",
        approved: "Утверждённый визуальный образец",
        invalidated: "Отозван",
        queued: "В очереди",
        completed: "Готово",
        failed: "Ошибка",
        cancelled: "Отменено",
      }[value],
    );
  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {w("CAMPAIGN VISUALS · MOCK V0", "ОБРАЗЫ КАМПАНИИ · MOCK V0")}
          </p>
          <h1>{w("Visual Bible & FRAME", "Визуальная библия и FRAME")}</h1>
          <p>
            {w(
              "Keep a recognizable visual identity, then compose a public scene.",
              "Сохраните узнаваемый визуальный образ и составьте открытую сцену.",
            )}
          </p>
        </div>
      </div>
      <p className="rounded-lg border border-[#765b36] bg-[#201e1a] p-4">
        {w(
          "MOCK only · $0 provider spend. Local schematic art demonstrates the request lifecycle; it does not depict your campaign. No image provider is connected. Text gameplay continues independently.",
          "Только MOCK · расходы на провайдеров $0. Локальная схема показывает жизненный цикл запроса; это не изображение вашей кампании. Провайдер изображений не подключён. Текстовая игра работает независимо.",
        )}
      </p>
      {error && <p role="alert">{error}</p>}
      <Panel title={w("Capture a public scene", "Запечатлеть открытую сцену")}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="field">
            <span>{w("Public narration", "Открытая сцена")}</span>
            <select
              value={currentScene?.id ?? ""}
              onChange={(e) => setSceneId(e.target.value)}
            >
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sequence}. {s.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{w("Composition", "Композиция")}</span>
            <select
              value={composition}
              onChange={(e) =>
                setComposition(e.target.value as VisualFrame["composition"])
              }
            >
              <option value="wide">{w("Wide shot", "Общий план")}</option>
              <option value="portrait">{w("Portrait", "Портрет")}</option>
              <option value="location">{w("Location", "Место")}</option>
              <option value="item">{w("Item", "Предмет")}</option>
            </select>
          </label>
        </div>
        {currentScene ? (
          <p className="max-h-52 overflow-auto whitespace-pre-wrap break-words border-l-2 border-[#997748] pl-4">
            {currentScene.body}
          </p>
        ) : (
          <p>
            {w(
              "A public narration scene is needed before FRAME can be requested.",
              "Для запроса FRAME нужна открытая сцена с повествованием.",
            )}
          </p>
        )}
        <fieldset className="my-4">
          <legend>
            {w(
              "Include reviewed references visible in this scene (up to 8)",
              "Добавить проверенные образцы, видимые в этой сцене (до 8)",
            )}
          </legend>
          <p className="muted">
            {w(
              "Select only appearances the player already knows in this scene. Unselected characters, items and hidden facts are not added automatically.",
              "Выберите только образы, уже известные игроку в этой сцене. Остальные персонажи, предметы и скрытые факты не добавляются автоматически.",
            )}
          </p>
          {eligible.map((e) => (
            <label
              key={e.record.id}
              className="mr-4 inline-flex items-center gap-2 py-2"
            >
              <input
                type="checkbox"
                checked={selected.includes(e.record.id)}
                disabled={
                  busy ||
                  (!selected.includes(e.record.id) && selected.length >= 8)
                }
                onChange={(event) =>
                  setReferenceIds(
                    event.target.checked
                      ? [...selected, e.record.id]
                      : selected.filter((id) => id !== e.record.id),
                  )
                }
              />
              {e.value.label}
              {e.value.outfit && ` · ${e.value.outfit.slice(0, 50)}`}
            </label>
          ))}
        </fieldset>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!proposal || busy}
            onClick={() => setInspected(proposal)}
          >
            {w("Inspect public brief", "Проверить открытое описание")}
          </Button>
          <Button
            primary
            disabled={!proposal || busy || Boolean(duplicate)}
            onClick={() => {
              if (proposal)
                void act(async () => {
                  await save(
                    "request",
                    visualDocumentMutation(snapshot, proposal),
                  );
                });
            }}
          >
            {w("FRAME · queue mock preview", "FRAME · создать запрос MOCK")}
          </Button>
        </div>
        {duplicate && (
          <p role="status">
            {w(
              "An equivalent request is already queued below.",
              "Такой запрос уже есть в очереди ниже.",
            )}
          </p>
        )}
        {currentScene && currentScene.body.length > 6000 && (
          <p>
            {w(
              "This scene exceeds the V0 brief limit. No request was created.",
              "Сцена превышает лимит описания V0. Запрос не создан.",
            )}
          </p>
        )}
      </Panel>
      <Panel
        title={w("Reviewed visual identity", "Проверенные визуальные образы")}
      >
        <p className="muted">
          {w(
            "Visual Canon is an approved appearance reference. It grants no story, equipment or world authority. Alternate outfits and location variants can have separate references.",
            "Визуальный канон — утверждённый образец внешности. Он не меняет сюжет, снаряжение или мир. Для другой одежды и вариантов места можно создать отдельные образцы.",
          )}
        </p>
        <Button
          primary
          disabled={busy}
          onClick={() =>
            setEditor({
              initial: newVisualReference(
                snapshot,
                visualSubjects(snapshot)[0].subject,
              ),
              snapshot,
            })
          }
        >
          {w(
            "Add reference / alternate outfit",
            "Добавить образец / вариант одежды",
          )}
        </Button>
        {!references.length && (
          <p className="muted">
            {w(
              "No reviewed references yet. Start with a character, known place, item or campaign style.",
              "Проверенных образцов пока нет. Начните с персонажа, известного места, предмета или стиля кампании.",
            )}
          </p>
        )}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {references.map(({ record, value }) => {
            const current = referenceIsCurrent(snapshot, value);
            const subjectExists = visualSubjects(snapshot).some(
              (r) =>
                r.subject.kind === value.subject.kind &&
                r.subject.id === value.subject.id,
            );
            const art = snapshot.assets.find(
              (a) =>
                a.id === value.imageAssetId &&
                a.campaign_id === snapshot.campaign.id,
            );
            return (
              <article
                key={record.id}
                className="min-w-0 rounded-lg border border-[#604b30] bg-[#171b1d] p-4"
              >
                <h3>{value.label}</h3>
                <Badge>
                  {current
                    ? status(value.approval)
                    : w(
                        "Source changed · approval unavailable",
                        "Источник изменён · утверждение недоступно",
                      )}
                </Badge>
                {art && mockArtForAsset(art) ? (
                  <div className="my-3">
                    <MockVisualArt
                      art={mockArtForAsset(art)!}
                      label={w(
                        "Mock reference placeholder",
                        "Схема образца MOCK",
                      )}
                    />
                  </div>
                ) : art ? (
                  <p>
                    {w(
                      "Linked Gallery image:",
                      "Связанное изображение галереи:",
                    )}{" "}
                    {art.title}
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap break-words">
                  {value.appearance}
                </p>
                <p className="whitespace-pre-wrap break-words">
                  {value.outfit}
                </p>
                <p className="muted whitespace-pre-wrap break-words">
                  {value.guidance}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={busy}
                    onClick={() => {
                      if (!subjectExists) return;
                      const source = newVisualReference(
                        snapshot,
                        value.subject,
                      );
                      setEditor({
                        initial: {
                          ...value,
                          sourceRevision: source.sourceRevision,
                          label: source.label,
                          approval: "draft",
                          ...(!current
                            ? { imageAssetId: null, imageAssetRevision: null }
                            : {}),
                        },
                        record,
                        snapshot,
                      });
                    }}
                  >
                    {w("Correct / history", "Исправить / история")}
                  </Button>
                  <Button
                    disabled={busy || !current || value.approval === "approved"}
                    onClick={() => {
                      void act(async () => {
                        await save(
                          `approve:${record.id}`,
                          visualDocumentMutation(
                            snapshot,
                            { ...value, approval: "approved" },
                            record,
                          ),
                        );
                      });
                    }}
                  >
                    {w(
                      "Set as Canon visual reference",
                      "Утвердить визуальный канон",
                    )}
                  </Button>
                  <Button
                    disabled={
                      busy || !current || value.approval === "invalidated"
                    }
                    onClick={() => {
                      void act(async () => {
                        await save(
                          `invalidate:${record.id}`,
                          visualDocumentMutation(
                            snapshot,
                            { ...value, approval: "invalidated" },
                            record,
                          ),
                        );
                      });
                    }}
                  >
                    {w("Invalidate approval", "Отозвать утверждение")}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
      <Panel
        title={w(
          "FRAME requests & visual history",
          "Запросы FRAME и история изображений",
        )}
      >
        {!frames.length && (
          <p className="muted">
            {w(
              "No frame requests yet. Queued requests persist when you leave this screen; nothing runs automatically.",
              "Запросов ещё нет. Очередь сохраняется при выходе с экрана; ничего не запускается автоматически.",
            )}
          </p>
        )}
        <div className="space-y-5">
          {frames
            .slice()
            .reverse()
            .map(({ record, value }) => {
              const current = frameIsCurrent(snapshot, value);
              const asset = snapshot.assets.find(
                (a) =>
                  a.campaign_id === snapshot.campaign.id &&
                  a.id === value.resultAssetId,
              );
              return (
                <article
                  key={record.id}
                  className="min-w-0 rounded-lg border border-[#604b30] bg-[#171b1d] p-4"
                >
                  <h3>{value.basis.scene.title}</h3>
                  <Badge>
                    {w("MOCK · ", "ОБРАЗЕЦ · ")}
                    {status(value.status)}
                  </Badge>
                  {!current && (
                    <p className="muted">
                      {w(
                        "Historical / source changed. Review current state before reusing this image; it cannot finish against an old basis.",
                        "Исторический / источник изменён. Проверьте текущую ситуацию перед использованием; запрос со старой основой не завершится.",
                      )}
                    </p>
                  )}
                  {value.status === "completed" &&
                    asset &&
                    mockArtForAsset(asset) && (
                      <div className="my-3 max-w-3xl">
                        <MockVisualArt
                          art={mockArtForAsset(asset)!}
                          label={w(
                            "Completed mock frame schematic",
                            "Схема готового кадра MOCK",
                          )}
                        />
                      </div>
                    )}
                  {value.status === "completed" && !asset && (
                    <p>
                      {w(
                        "The original result is unavailable in this active timeline. Request history remains.",
                        "Исходный результат недоступен в активной линии времени. История запроса сохранена.",
                      )}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button disabled={busy} onClick={() => setInspected(value)}>
                      {w("Inspect brief", "Проверить описание")}
                    </Button>
                    <Button
                      disabled={busy}
                      onClick={() => {
                        void transport
                          .history(snapshot.campaign.id, record.id)
                          .then((rows) => setHistory({ record, rows }))
                          .catch(failure);
                      }}
                    >
                      {w("History", "История")}
                    </Button>
                    {value.status === "queued" && (
                      <>
                        <Button
                          primary
                          disabled={busy || !current}
                          onClick={() => {
                            void act(() => finish(record, value));
                          }}
                        >
                          {w("Complete mock preview", "Завершить превью MOCK")}
                        </Button>
                        <Button
                          disabled={busy}
                          onClick={() => {
                            void act(async () => {
                              await save(
                                `cancel:${record.id}`,
                                visualDocumentMutation(
                                  snapshot,
                                  { ...value, status: "cancelled" },
                                  record,
                                ),
                              );
                            });
                          }}
                        >
                          {w("Cancel", "Отменить")}
                        </Button>
                        <Button
                          disabled={busy}
                          onClick={() => {
                            void act(async () => {
                              await save(
                                `fail:${record.id}`,
                                visualDocumentMutation(
                                  snapshot,
                                  { ...value, status: "failed" },
                                  record,
                                ),
                              );
                            });
                          }}
                        >
                          {w("Test mock failure", "Проверить ошибку MOCK")}
                        </Button>
                      </>
                    )}
                    {value.status === "completed" && asset && (
                      <Button
                        disabled={busy}
                        onClick={() =>
                          setEditor({
                            snapshot,
                            initial: {
                              ...newVisualReference(
                                snapshot,
                                visualSubjects(snapshot)[0].subject,
                              ),
                              imageAssetId: asset.id,
                              imageAssetRevision: asset.revision,
                            },
                          })
                        }
                      >
                        {w(
                          "Use result as a visual reference draft",
                          "Использовать результат как черновик образца",
                        )}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
        </div>
      </Panel>
      {editor && (
        <ReferenceEditor
          key={`${editor.record?.id ?? "new"}:${editor.snapshot.timeline?.epoch}`}
          {...editor}
          onClose={() => setEditor(null)}
        />
      )}
      {inspected && (
        <Modal
          title={w("Public visual brief · MOCK", "Открытое описание · MOCK")}
          onClose={() => setInspected(null)}
        >
          <p className="muted">
            {w(
              "Prepared deterministically from the selected public scene and approved references. No text model or image provider was called.",
              "Составлено из выбранной открытой сцены и утверждённых образцов. Текстовая модель и провайдер изображений не вызывались.",
            )}
          </p>
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words text-sm">
            {inspected.prompt}
          </pre>
        </Modal>
      )}
      {history && (
        <Modal
          title={w("Immutable FRAME history", "Неизменяемая история FRAME")}
          onClose={() => setHistory(null)}
        >
          <p className="muted">
            {w(
              "Previous requests and results are retained. Failed or cancelled requests require a new explicit request; history is never replaced.",
              "Предыдущие запросы и результаты сохраняются. После ошибки или отмены создайте новый явный запрос; история не заменяется.",
            )}
          </p>
          {history.rows.map((version) => {
            const old: VisualMetadata | null = parseVisualMetadata(version);
            return old?.kind === "frame" &&
              old.campaign_id === snapshot.campaign.id ? (
              <div
                key={version.id}
                className="my-4 border-t border-[#604b30] pt-3"
              >
                <p>
                  {w("Version", "Версия")} {version.version}
                  {w(" · MOCK · ", " · ОБРАЗЕЦ · ")}
                  {status(old.status)}
                </p>
                <p>{old.basis.scene.title}</p>
                <p className="whitespace-pre-wrap break-words text-sm">
                  {old.prompt}
                </p>
              </div>
            ) : null;
          })}
        </Modal>
      )}
    </div>
  );
}
