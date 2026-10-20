"use client";

import { useMemo, useState } from "react";
import type { CampaignSnapshot } from "@/lib/persistence/contracts";
import { musicAction, musicTrackAction, uploadMusic } from "@/lib/audio/client";
import type { MusicTrack } from "@/lib/audio/contracts";
import { MUSIC_MODELS, musicModel, musicPriceUsdMicros, requestedSeconds } from "@/lib/audio/models";
import { MOODS, moodLabel, type MoodId } from "@/lib/audio/moods";
import { cueSeconds, suggestMusicStyle } from "@/lib/audio/prompts";
import { usd } from "@/lib/visual-frame/fal-image";
import { useMusic } from "./music-player";
import { Panel, registry as r, Switch, useCopy } from "./primitives";
import { useChrome } from "./shell";
import m from "./music.module.css";
import s from "./settings.module.css";

/** The music block of the settings screen (the music stage): the campaign's switch, the world's
 * musical style, the generation model and takes, the pack with its moods, the owner's own tracks. */
export function MusicBlock({ data }: { data: CampaignSnapshot }) {
  const c = useCopy();
  const chrome = useChrome();
  const music = useMusic();
  const state = music?.state ?? null;
  const settings = state?.settings ?? null;
  const preview = !!chrome?.href || !music;
  const [styleDraft, setStyleDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [upload, setUpload] = useState<{ file: File | null; title: string; moods: MoodId[] }>({ file: null, title: "", moods: [] });
  const campaignId = data.campaign.id;
  const guide = data.documents.find((row) => row.id === data.dmGuideDocumentId);
  const suggestion = useMemo(() => suggestMusicStyle({ title: data.campaign.title, premise: guide?.body ?? data.campaign.subtitle, visualStyle: data.settings.values.visualStyle, language: data.campaign.language }), [data, guide]);
  const styleText = styleDraft ?? settings?.styleText ?? "";
  const model = musicModel(settings?.model ?? "fal-ai/lyria3/pro") ?? MUSIC_MODELS[0];
  const variants = settings?.variants ?? 2;
  const expected = MOODS.reduce((sum, mood) => sum + musicPriceUsdMicros(model.id, requestedSeconds(model, cueSeconds(mood.id))) * variants, 0);
  const pack = state?.pack ?? null;
  const packTracks = (state?.tracks ?? []).filter((row) => row.packId === pack?.id);
  const uploads = (state?.tracks ?? []).filter((row) => row.source === "upload");
  const save = async (patch: Partial<NonNullable<typeof settings>>) => {
    if (!settings || !music || busy) return;
    setBusy(true);
    try {
      const next = await musicAction(campaignId, "music.settings", { expectedRevision: settings.revision, enabled: settings.enabled, model: settings.model, variants: settings.variants, packCapUsdMicros: settings.packCapUsdMicros, styleText: settings.styleText, ...patch });
      music.setState(next);
      setStyleDraft(null);
      setNote("");
    } catch { setNote(c("Не удалось сохранить настройки музыки.", "Could not save the music settings.")); }
    finally { setBusy(false); }
  };
  const generate = async () => {
    if (!music || busy) return;
    setBusy(true);
    try {
      if (styleDraft !== null) await save({ styleText: styleDraft });
      await music.act("music.generate", {});
      setNote("");
    } catch { setNote(c("Не удалось начать генерацию.", "Could not start the generation.")); }
    finally { setBusy(false); }
  };
  const doUpload = async () => {
    if (!music || !upload.file || !upload.title.trim() || !upload.moods.length || busy) return;
    setBusy(true);
    try {
      music.setState(await uploadMusic(campaignId, upload.file, upload.title.trim(), upload.moods));
      setUpload({ file: null, title: "", moods: [] });
      setNote("");
    } catch { setNote(c("Не удалось загрузить трек (MP3, WAV или OGG до 25 МБ).", "Could not upload the track (MP3, WAV or OGG up to 25 MB).")); }
    finally { setBusy(false); }
  };
  const trackAction = async (action: "music.hide" | "music.tag", input: unknown) => {
    if (!music) return;
    try { await musicTrackAction(campaignId, action, input); await music.refresh(); } catch { setNote(c("Не вышло.", "That did not work.")); }
  };
  const statusLabel = (status: MusicTrack["status"]) => ({ queued: c("в очереди", "queued"), generating: c("пишется", "generating"), ready: c("готов", "ready"), failed: c("не вышло", "failed") })[status];
  const moodRow = (moodId: MoodId) => {
    const rows = packTracks.filter((row) => row.moods.includes(moodId));
    const ready = rows.filter((row) => row.status === "ready").length, failed = rows.filter((row) => row.status === "failed").length;
    return (
      <div key={moodId} className={m.mood}>
        <span>{moodLabel(moodId, c.language)}</span>
        <small>{rows.length ? `${ready}/${rows.length} ${c("готово", "ready")}${failed ? ` · ${failed} ${c("не вышло", "failed")}` : ""}` : c("нет", "none")}</small>
      </div>
    );
  };
  const generating = pack?.status === "generating";
  return (
    <Panel eyebrow={c("Музыка", "Music")} action={state ? (state.generation.configured ? <span className={r.badgeGreen}>fal · {c("ключ есть", "key set")}</span> : <span className={r.badgeIron}>fal · {c("нет ключа", "no key")}</span>) : null}>
      <div className={r.stack}>
        <Switch title={c("Музыка в игре", "Music in play")} hint={c("Саундтрак мира идёт за сценой: спокойно в дороге, тревожно на допросе, эпично в бою. Меняется плавно и не на каждом ходу.", "The world's soundtrack follows the scene: calm on the road, tense in an interrogation, epic in a fight. It changes smoothly, not on every turn.")}
          checked={settings?.enabled ?? true} disabled={preview || !settings || busy} onChange={(value) => void save({ enabled: value })} />
        <div>
          <span className={r.eyebrow}>{c("Музыкальный стиль мира", "The world's musical style")}</span>
          <p className={r.note} style={{ margin: 0 }}>{c("Как звучит этот мир: инструменты, жанр, эпоха. Стимпанковский порт — не нуарный город. Используется в каждом треке саундтрака.", "How this world sounds: instruments, genre, era. A steampunk port is not a noir city. Used in every track of the soundtrack.")}</p>
          <textarea className={s.note} rows={4} maxLength={1200} disabled={preview || !settings} aria-label={c("Музыкальный стиль мира", "The world's musical style")}
            value={styleText} placeholder={suggestion} onChange={(event) => setStyleDraft(event.target.value)} />
          <div className={r.row}>
            {styleDraft !== null && <button type="button" className={r.btnMain} disabled={busy} onClick={() => void save({ styleText: styleDraft })}>{c("Сохранить стиль", "Save the style")}</button>}
            <button type="button" className={r.btnGhost} disabled={preview || !settings} onClick={() => setStyleDraft(suggestion)}>{c("Предложить по миру", "Suggest from the world")}</button>
          </div>
        </div>
        <label className={s.pick}>
          <span className={r.small}>{c("Модель музыки", "Music model")}</span>
          <select value={model.id} disabled={preview || !settings || busy} aria-label={c("Модель музыки", "Music model")} data-testid="music-model" onChange={(event) => void save({ model: event.target.value })}>
            {MUSIC_MODELS.map((row) => (
              <option key={row.id} value={row.id}>{row.label} · {usd(musicPriceUsdMicros(row.id, 60))}/{c("трек", "track")} · {c(row.note.ru, row.note.en)}</option>
            ))}
          </select>
        </label>
        <label className={s.cap}>
          <span>{c("Вариантов на настроение", "Takes per mood")}</span>
          <input type="number" min={1} max={3} value={variants} disabled={preview || !settings || busy} onChange={(event) => void save({ variants: Math.max(1, Math.min(3, Number(event.target.value) || 1)) })} />
        </label>
        <label className={s.cap}>
          <span>{c("Предел на один саундтрак, $", "Cap per soundtrack, $")}</span>
          <input type="number" min={0} max={50} step={0.5} value={(settings?.packCapUsdMicros ?? 8_000_000) / 1_000_000} disabled={preview || !settings || busy}
            onChange={(event) => void save({ packCapUsdMicros: Math.round(Math.max(0, Math.min(50, Number(event.target.value) || 0)) * 1_000_000) })} />
        </label>
        <div className={r.row}>
          <button type="button" className={r.btnMain} disabled={preview || !settings || busy || generating || !state?.generation.configured || !(styleText.trim())}
            onClick={() => void generate()}>{pack ? c("Сгенерировать заново", "Generate again") : c("Сгенерировать саундтрак", "Generate the soundtrack")}</button>
          <span className={`${r.small} ${r.muted}`}>{MOODS.length} {c("настроений", "moods")} × {variants} · ≈ {usd(expected)}</span>
          {generating && pack && <button type="button" className={r.btnGhost} disabled={busy} onClick={() => void music?.act("music.cancel", { id: pack.id })}>{c("Остановить", "Stop")}</button>}
        </div>
        {!styleText.trim() && <p className={r.note} style={{ margin: 0 }}>{c("Сначала задай стиль (или нажми «Предложить по миру»).", "Set the style first (or press «Suggest from the world»).")}</p>}
        {pack && (
          <div className={r.stack} style={{ gap: 6 }}>
            <span className={r.eyebrow}>
              {c("Саундтрак", "Soundtrack")} v{pack.version} · {pack.status === "generating" ? c("пишется", "generating") : pack.status === "ready" ? c("готов", "ready") : pack.status === "failed" ? c("не вышло", "failed") : c("остановлен", "stopped")} · {usd(pack.costUsdMicros)}
              {music?.running ? ` · ${c("идёт запрос…", "request in flight…")}` : ""}
            </span>
            <div className={m.moods}>{MOODS.map((mood) => moodRow(mood.id))}</div>
            <p className={r.note} style={{ margin: 0 }}>{c("Генерация идёт в фоне, по одному треку за запрос, пока открыта любая страница кампании; игра её не ждёт. Старые версии саундтрака остаются в истории.", "Generation runs in the background, one track per request while any page of the campaign is open; play never waits for it. Earlier versions of the soundtrack stay in history.")}</p>
          </div>
        )}
        <div className={r.stack} style={{ gap: 6 }}>
          <span className={r.eyebrow}>{c("Свои треки", "Your own tracks")}</span>
          <p className={r.note} style={{ margin: 0 }}>{c("Загрузи свою музыку (например, из Suno) и отметь настроения — она будет звучать вперемешку с саундтраком.", "Upload your own music (from Suno, for example) and tag its moods; it plays mixed with the soundtrack.")}</p>
          {!preview && (
            <>
              <input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,.mp3,.wav,.ogg,.flac,.m4a" aria-label={c("Файл трека", "Track file")} disabled={busy}
                onChange={(event) => { const file = event.target.files?.[0] ?? null; setUpload((prev) => ({ ...prev, file, title: prev.title || (file ? file.name.replace(/\.[a-z0-9]+$/i, "") : "") })); }} />
              <input className={s.note} type="text" maxLength={120} placeholder={c("Название", "Title")} aria-label={c("Название трека", "Track title")} value={upload.title} disabled={busy}
                onChange={(event) => setUpload((prev) => ({ ...prev, title: event.target.value }))} />
              <div className={m.tags}>
                {MOODS.map((mood) => (
                  <label key={mood.id}><input type="checkbox" checked={upload.moods.includes(mood.id)} disabled={busy}
                    onChange={(event) => setUpload((prev) => ({ ...prev, moods: event.target.checked ? [...prev.moods, mood.id] : prev.moods.filter((id) => id !== mood.id) }))} />{moodLabel(mood.id, c.language)}</label>
                ))}
              </div>
              <div className={r.row}><button type="button" className={r.btnMain} disabled={busy || !upload.file || !upload.title.trim() || !upload.moods.length} onClick={() => void doUpload()}>{c("Загрузить", "Upload")}</button></div>
            </>
          )}
          {uploads.length ? (
            <div className={m.tracks}>
              {uploads.map((row) => (
                <div key={row.id} className={m.track}>
                  <span className={row.hidden ? r.badgeIron : r.badge}>{row.hidden ? c("скрыт", "hidden") : statusLabel(row.status)}</span>
                  <span title={row.title}>{row.title} · {row.moods.map((id) => moodLabel(id, c.language)).join(", ")}{row.durationMs ? ` · ${Math.round(row.durationMs / 1000)} ${c("с", "s")}` : ""}</span>
                  <button type="button" className={r.btnGhost} disabled={preview} onClick={() => void trackAction("music.hide", { id: row.id, hidden: !row.hidden })}>{row.hidden ? c("Вернуть", "Show") : c("Скрыть", "Hide")}</button>
                </div>
              ))}
            </div>
          ) : <p className={r.empty}>{c("Своих треков пока нет.", "No tracks of your own yet.")}</p>}
        </div>
        {!!packTracks.length && (
          <details>
            <summary className={r.small}>{c("Все треки саундтрака", "All soundtrack tracks")} · {packTracks.filter((row) => row.status === "ready").length}/{packTracks.length}</summary>
            <div className={m.tracks} style={{ marginTop: 6 }}>
              {packTracks.map((row) => (
                <div key={row.id} className={m.track}>
                  <span className={row.status === "failed" ? r.badgeRed : row.hidden ? r.badgeIron : row.status === "ready" ? r.badge : r.badgeAmber}>{row.hidden ? c("скрыт", "hidden") : statusLabel(row.status)}</span>
                  <span title={row.title}>{row.title} · {musicModel(row.model ?? "")?.label ?? row.model}{row.durationMs ? ` · ${Math.round(row.durationMs / 1000)} ${c("с", "s")}` : ""} · {usd(row.costUsdMicros)}{row.error ? ` · ${row.error.split(":")[0]}` : ""}</span>
                  <button type="button" className={r.btnGhost} disabled={preview || row.status !== "ready"} onClick={() => void trackAction("music.hide", { id: row.id, hidden: !row.hidden })}>{row.hidden ? c("Вернуть", "Show") : c("Скрыть", "Hide")}</button>
                </div>
              ))}
            </div>
          </details>
        )}
        {state && <p className={r.note} style={{ margin: 0 }}>{c("Потрачено на музыку этого мира", "Spent on this world's music")}: {usd(state.spentUsdMicros)}</p>}
        {music?.log.length ? (
          <details>
            <summary className={r.small}>{c("Почему играет то, что играет", "Why this music plays")}</summary>
            <div className={m.log}>{[...music.log].reverse().slice(0, 20).map((row, i) => <span key={i}>{new Date(row.at).toLocaleTimeString()} · {moodLabel(row.mood, c.language)}{row.switched ? " ↺" : ""} · {row.reason}</span>)}</div>
          </details>
        ) : null}
        {note && <p className={r.error}>{note}</p>}
      </div>
    </Panel>
  );
}
