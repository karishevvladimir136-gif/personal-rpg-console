"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Panel } from "../ui";
import type {
  PreparationDraft,
  PreparationEntityEdit,
  PreparationThreadEdit,
} from "@/lib/foundation-loop/contracts";
import {
  parsePreparationDraft,
  PREPARATION_LIMITS as limits,
} from "@/lib/playable-world/draft";
import styles from "./preparation-review.module.css";

export type PreparationReviewPanelProps = {
  language: "en" | "ru";
  /** Include campaign, timeline and epoch. A changed scope discards stale local controls. */
  scopeKey: string;
  load: (signal: AbortSignal) => Promise<PreparationDraft>;
  /** Repeated operation IDs must retry the exact command/fence in the route adapter. */
  prepare: (
    draft: PreparationDraft,
    operationId: string,
  ) => Promise<PreparationDraft>;
  onDirtyChange?: (dirty: boolean) => void;
};

export function PreparationReviewPanel(props: PreparationReviewPanelProps) {
  return <PreparationReviewSession key={props.scopeKey} {...props} />;
}

function PreparationReviewSession({
  language,
  load,
  prepare,
  onDirtyChange,
}: PreparationReviewPanelProps) {
  const ru = language === "ru";
  const [draft, setDraft] = useState<PreparationDraft | null>(null);
  const [baseline, setBaseline] = useState<PreparationDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(false);
  const working = useRef(false);
  const mounted = useRef(true);
  const attempt = useRef<{
    operationId: string;
    draft: PreparationDraft;
  } | null>(null);
  const dirty =
    draft !== null && JSON.stringify(draft) !== JSON.stringify(baseline);
  const locked = busy || uncertain || review;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    onDirtyChange?.(dirty || uncertain);
  }, [dirty, uncertain, onDirtyChange]);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((value) => {
        const parsed = parsePreparationDraft(value);
        if (controller.signal.aborted) return;
        setDraft(parsed);
        setBaseline(structuredClone(parsed));
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("load");
      });
    return () => controller.abort();
  }, [load]);

  async function reload() {
    if (working.current || uncertain) return;
    working.current = true;
    setBusy(true);
    try {
      const value = parsePreparationDraft(
        await load(new AbortController().signal),
      );
      if (!mounted.current) return;
      setDraft(value);
      setBaseline(structuredClone(value));
      setReview(false);
      setError("");
      setNotice(false);
      attempt.current = null;
    } catch {
      if (mounted.current) setError("load");
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function editEntity(id: string, update: Partial<PreparationEntityEdit>) {
    if (locked) return;
    setDraft(
      (current) =>
        current && {
          ...current,
          entities: current.entities.map((row) =>
            row.packEntityId === id ? { ...row, ...update } : row,
          ),
        },
    );
    setNotice(false);
  }
  function editThread(id: string, update: Partial<PreparationThreadEdit>) {
    if (locked) return;
    setDraft(
      (current) =>
        current && {
          ...current,
          threads: current.threads.map((row) =>
            row.id === id ? { ...row, ...update } : row,
          ),
        },
    );
    setNotice(false);
  }
  async function save() {
    if (working.current || review || !draft) return;
    let valid: PreparationDraft;
    try {
      valid = parsePreparationDraft(draft);
    } catch {
      setError("fields");
      return;
    }
    if (
      !valid.entities.some((row) => row.selected) &&
      !valid.threads.some((row) => row.selected)
    )
      return;
    working.current = true;
    setBusy(true);
    setError("");
    setNotice(false);
    attempt.current ??= {
      operationId: crypto.randomUUID(),
      draft: structuredClone(valid),
    };
    try {
      const saved = parsePreparationDraft(
        await prepare(
          structuredClone(attempt.current.draft),
          attempt.current.operationId,
        ),
      );
      if (!mounted.current) return;
      setDraft(saved);
      setBaseline(structuredClone(saved));
      attempt.current = null;
      setUncertain(false);
      setNotice(true);
    } catch (cause) {
      if (!mounted.current) return;
      const code =
        cause !== null && typeof cause === "object" && "code" in cause
          ? cause.code
          : undefined;
      const known = [
        "validation",
        "scope",
        "conflict",
        "forbidden",
        "not_found",
        "unauthenticated",
      ].includes(String(code));
      setUncertain(!known);
      if (known) attempt.current = null;
      if (code === "conflict") setReview(true);
      setError(
        code === "conflict" ? "conflict" : known ? "selection" : "uncertain",
      );
    } finally {
      working.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  const splitLines = (value: string) => value.split("\n");
  const errors: Record<string, string> = ru
    ? {
        load: "Не удалось загрузить подготовку мира.",
        fields: "Проверьте названия, длину полей и повторяющиеся строки.",
        conflict:
          "Мир изменился. Загрузите актуальные записи и проверьте выбор.",
        selection:
          "Проверьте выбранные записи и связанные места. Изменение типа уже созданного персонажа или места недоступно.",
        uncertain: "Сохранение не подтверждено. Повторите тот же запрос.",
      }
    : {
        load: "World preparation could not be loaded.",
        fields: "Check the names, field lengths, and duplicate lines.",
        conflict:
          "The world changed. Reload its current records and review your selection.",
        selection:
          "Review your selected records and related places. An existing person or place cannot change its record type.",
        uncertain: "The save is unconfirmed. Retry the same request.",
      };
  const kindLabels = ru
    ? {
        npc: "Персонаж",
        group: "Группа",
        faction: "Фракция",
        location: "Место",
      }
    : { npc: "Person", group: "Group", faction: "Faction", location: "Place" };
  const selected =
    (draft?.entities.filter((row) => row.selected).length ?? 0) +
    (draft?.threads.filter((row) => row.selected).length ?? 0);

  return (
    <Panel
      title={ru ? "Подготовить мир к игре" : "Prepare the world for play"}
      className={styles.panel}
    >
      <p className={styles.intro}>
        {ru
          ? "Выберите людей, места и сюжетные линии из закреплённого пакета. Отредактируйте нужные детали. Выбранные имена и описания станут видимой частью кампании как ваша авторская настройка."
          : "Choose people, places, and story threads from the pinned Pack. Edit the details you want. Selected names and descriptions become visible campaign content as your owner-authored setup."}
      </p>
      <p className={styles.help}>
        {ru
          ? "Здесь доступен только допустимый открытый материал в точке входа. Скрытые сведения и будущие события источника исключены. Правки сохраняют происхождение и не меняют исходный Канон."
          : "This review uses eligible public material at the entry point. Hidden information and future source events are excluded. Your corrections keep their origin and leave source Canon intact."}
      </p>
      {error && (
        <p role="alert" className={styles.message}>
          {errors[error]}
        </p>
      )}
      {notice && (
        <p role="status" className={styles.message}>
          {ru
            ? "Выбранные записи мира сохранены. Игру можно продолжать."
            : "Selected world records are saved. You can continue playing."}
        </p>
      )}
      {!draft ? (
        <p role="status">{ru ? "Загрузка…" : "Loading…"}</p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {draft.entities.length === 0 && (
            <p>
              {ru
                ? "В этой точке входа нет подходящих открытых записей. Проверьте одобренный пакет и его точку входа."
                : "There are no eligible public records at this entry point. Review the approved Pack and its entry point."}
            </p>
          )}
          <div className={styles.records}>
            {draft.entities.map((entity) => {
              const existingKind = baseline?.entities.find(
                (row) =>
                  row.packEntityId === entity.packEntityId && row.selected,
              )?.kind;
              const fixedKind =
                existingKind === "npc" || existingKind === "location";
              const kinds =
                existingKind && !fixedKind
                  ? (["group", "faction"] as const)
                  : (["npc", "group", "faction", "location"] as const);
              return (
                <article className={styles.record} key={entity.packEntityId}>
                  <label className={styles.selection}>
                    <input
                      type="checkbox"
                      checked={entity.selected}
                      disabled={locked}
                      onChange={(event) =>
                        editEntity(entity.packEntityId, {
                          selected: event.target.checked,
                        })
                      }
                    />
                    <span>
                      <strong>{entity.name}</strong>
                      <small>{kindLabels[entity.kind]}</small>
                    </span>
                  </label>
                  <details open={entity.selected || undefined}>
                    <summary>
                      {ru ? "Проверить и изменить" : "Review and edit"}
                    </summary>
                    <fieldset
                      disabled={locked || !entity.selected}
                      className={styles.fields}
                    >
                      <div className={styles.columns}>
                        <label className="field">
                          {ru ? "Имя или название" : "Name"}
                          <input
                            required
                            maxLength={limits.name}
                            value={entity.name}
                            onChange={(event) =>
                              editEntity(entity.packEntityId, {
                                name: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="field">
                          {ru ? "Тип" : "Kind"}
                          <select
                            disabled={fixedKind}
                            value={entity.kind}
                            onChange={(event) =>
                              editEntity(entity.packEntityId, {
                                kind: event.target
                                  .value as PreparationEntityEdit["kind"],
                                ...(event.target.value !== "npc"
                                  ? { merchant: false }
                                  : {}),
                              })
                            }
                          >
                            {kinds.map((kind) => (
                              <option key={kind} value={kind}>
                                {kindLabels[kind]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="field">
                        {ru ? "Описание" : "Description"}
                        <textarea
                          rows={3}
                          maxLength={limits.description}
                          value={entity.description}
                          onChange={(event) =>
                            editEntity(entity.packEntityId, {
                              description: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="field">
                        {ru
                          ? "Другие имена · по одному в строке"
                          : "Aliases · one per line"}
                        <textarea
                          rows={2}
                          maxLength={(limits.alias + 1) * limits.aliases}
                          value={entity.aliases.join("\n")}
                          onChange={(event) =>
                            editEntity(entity.packEntityId, {
                              aliases: splitLines(event.target.value),
                            })
                          }
                        />
                      </label>
                      <div className={styles.columns}>
                        <label className="field">
                          {ru
                            ? "Возможности · по одной в строке"
                            : "Capabilities · one per line"}
                          <textarea
                            rows={3}
                            maxLength={
                              (limits.capability + 1) * limits.capabilities
                            }
                            value={entity.capabilities.join("\n")}
                            onChange={(event) =>
                              editEntity(entity.packEntityId, {
                                capabilities: splitLines(event.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="field">
                          {ru
                            ? "Ограничения · по одному в строке"
                            : "Limitations · one per line"}
                          <textarea
                            rows={3}
                            maxLength={
                              (limits.limitation + 1) * limits.limitations
                            }
                            value={entity.limitations.join("\n")}
                            onChange={(event) =>
                              editEntity(entity.packEntityId, {
                                limitations: splitLines(event.target.value),
                              })
                            }
                          />
                        </label>
                      </div>
                      {entity.kind === "npc" && (
                        <>
                          <label className={styles.check}>
                            <input
                              type="checkbox"
                              checked={entity.merchant}
                              onChange={(event) =>
                                editEntity(entity.packEntityId, {
                                  merchant: event.target.checked,
                                })
                              }
                            />
                            {ru
                              ? "Участвует в торговле"
                              : "Participates in trade"}
                          </label>
                          {entity.merchant && (
                            <label className="field">
                              {ru ? "Название торговца" : "Merchant label"}
                              <input
                                required
                                maxLength={limits.name}
                                value={entity.merchantLabel}
                                onChange={(event) =>
                                  editEntity(entity.packEntityId, {
                                    merchantLabel: event.target.value,
                                  })
                                }
                              />
                            </label>
                          )}
                          {entity.merchant && (
                            <p className={styles.help}>
                              {ru
                                ? "Товары берутся из обычного хранилища торговца. Товарный запас и деньги не создаются автоматически."
                                : "Stock comes from the merchant’s ordinary storage. Items and money are not created automatically."}
                            </p>
                          )}
                        </>
                      )}
                    </fieldset>
                  </details>
                </article>
              );
            })}
          </div>
          {draft.threads.length > 0 && (
            <>
              <h3>{ru ? "Сюжетные линии" : "Story threads"}</h3>
              <p className={styles.help}>
                {ru
                  ? "Выберите связанные записи выше. Цель задаёт направление развития; она не предрешает исход."
                  : "Select the related records above. A goal guides the thread; it does not determine its outcome."}
              </p>
              <div className={styles.records}>
                {draft.threads.map((thread) => (
                  <article className={styles.record} key={thread.id}>
                    <label className={styles.selection}>
                      <input
                        type="checkbox"
                        checked={thread.selected}
                        disabled={locked}
                        onChange={(event) =>
                          editThread(thread.id, {
                            selected: event.target.checked,
                          })
                        }
                      />
                      <strong>{thread.title}</strong>
                    </label>
                    <fieldset
                      disabled={locked || !thread.selected}
                      className={styles.fields}
                    >
                      <label className="field">
                        {ru ? "Название линии" : "Thread title"}
                        <input
                          required
                          maxLength={limits.title}
                          value={thread.title}
                          onChange={(event) =>
                            editThread(thread.id, { title: event.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        {ru ? "Цель" : "Goal"}
                        <textarea
                          rows={3}
                          required
                          maxLength={limits.goal}
                          value={thread.goal}
                          onChange={(event) =>
                            editThread(thread.id, { goal: event.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        {ru ? "Развитие линии" : "Thread progression"}
                        <select
                          value={thread.policy}
                          onChange={(event) =>
                            editThread(thread.id, {
                              policy: event.target
                                .value as PreparationThreadEdit["policy"],
                            })
                          }
                        >
                          <option value="surface_before_complete">
                            {ru
                              ? "Дать возможность вмешаться до завершения"
                              : "Surface an opportunity before completion"}
                          </option>
                          <option value="background">
                            {ru
                              ? "Может развиваться в фоне"
                              : "May progress in the background"}
                          </option>
                        </select>
                      </label>
                    </fieldset>
                  </article>
                ))}
              </div>
            </>
          )}
          <p className={styles.help}>
            {ru
              ? "Сохраняются только выбранные записи. Снятие флажка не удаляет уже созданную запись."
              : "Only selected records are saved. Clearing a checkbox leaves an existing record in place."}
          </p>
          <div className={styles.actions}>
            <Button
              primary
              type="submit"
              disabled={busy || review || selected === 0}
            >
              {busy
                ? ru
                  ? "Сохранение…"
                  : "Saving…"
                : uncertain
                  ? ru
                    ? "Повторить сохранение"
                    : "Retry save"
                  : ru
                    ? "Сохранить выбранное"
                    : "Save selected"}
            </Button>
            <span className={styles.help}>
              {ru ? `Выбрано: ${selected}` : `${selected} selected`}
            </span>
          </div>
        </form>
      )}
      <div className={styles.actions}>
        <Button disabled={busy || uncertain} onClick={() => void reload()}>
          {ru ? "Загрузить сохранённые записи" : "Reload saved records"}
        </Button>
      </div>
    </Panel>
  );
}
