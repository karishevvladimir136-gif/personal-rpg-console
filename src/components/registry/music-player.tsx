"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CloudRain, Music, Pin, PinOff, SkipForward, Volume2, VolumeX } from "lucide-react";
import { loadMusicState, loadSceneSignal, musicAction, musicTrackUrl } from "@/lib/audio/client";
import type { MusicState, MusicTrack, SceneSignalView } from "@/lib/audio/contracts";
import { chooseMood, initialMoodState, stepMood, type MoodState } from "@/lib/audio/mood-select";
import { ambientLabel, chooseAmbient, initialAmbientState, stepAmbient, type AmbientId, type AmbientState } from "@/lib/audio/ambient";
import { isMoodId, moodLabel, type MoodId } from "@/lib/audio/moods";
import { ambientGain, clampVolume, DEFAULT_PREFS, pickAmbientTrack, pickTrack, targetGain, type PlayableTrack, type PlayerPrefs } from "@/lib/audio/player-engine";
import { WebMusicPlayer, type Channel } from "@/lib/audio/web-player";
import { registry as r, useCopy } from "./primitives";
import { useChrome, type CampaignScreenId } from "./shell";
import m from "./music.module.css";
import { moodReasonText, trackTitle } from "@/lib/audio/words";

// The music stage on the client: one provider per campaign in the shell. It keeps the
// soundtrack state, the device preferences (volume, mute, off), polls the public scene
// signal between turns, chooses the mood with hysteresis, drives the Web Audio player and
// pumps a generating pack one track at a time. Nothing plays before the first click.

export type NowPlaying = { track: MusicTrack; mood: MoodId; moodUsed: MoodId; reason: string; since: number };
/** The ambient layer's state as shown: the place's sound and the weather, each with its track when one plays. */
export type AmbientNow = { place: AmbientId | null; weather: AmbientId | null; placeTrack: MusicTrack | null; weatherTrack: MusicTrack | null; reason: string };
export type MoodLogEntry = { at: number; turnId: string | null; mood: MoodId; switched: boolean; reason: string };

type MusicContextValue = {
  state: MusicState | null;
  error: string;
  prefs: PlayerPrefs;
  setPrefs: (patch: Partial<PlayerPrefs>) => void;
  unlocked: boolean;
  unlock: () => Promise<void>;
  now: NowPlaying | null;
  ambientNow: AmbientNow;
  mood: MoodId | null;
  pinned: string | null;
  pin: (trackId: string | null) => void;
  skip: () => void;
  log: MoodLogEntry[];
  refresh: () => Promise<void>;
  act: (action: "music.generate" | "music.cancel", input?: unknown) => Promise<void>;
  setState: (state: MusicState) => void;
  running: boolean;
};
const MusicContext = createContext<MusicContextValue | null>(null);
export const useMusic = () => useContext(MusicContext);

// ---- device preferences: a tiny external store over localStorage ----
const prefsKey = (campaignId: string) => `rpg-music:${campaignId}`;
const prefsCache = new Map<string, PlayerPrefs>();
const prefsListeners = new Set<() => void>();
function readPrefs(campaignId: string): PlayerPrefs {
  const cached = prefsCache.get(campaignId);
  if (cached) return cached;
  let value: PlayerPrefs = DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(prefsKey(campaignId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlayerPrefs>;
      value = { enabled: parsed.enabled !== false, volume: clampVolume(parsed.volume), muted: parsed.muted === true, ambient: parsed.ambient !== false, ambientVolume: clampVolume(parsed.ambientVolume ?? DEFAULT_PREFS.ambientVolume) };
    }
  } catch { /* private mode: the defaults */ }
  prefsCache.set(campaignId, value);
  return value;
}
function writePrefs(campaignId: string, next: PlayerPrefs) {
  prefsCache.set(campaignId, next);
  try { window.localStorage.setItem(prefsKey(campaignId), JSON.stringify(next)); } catch { /* private mode */ }
  for (const listener of prefsListeners) listener();
}
const subscribePrefs = (listener: () => void) => { prefsListeners.add(listener); return () => { prefsListeners.delete(listener); }; };

export function playable(state: MusicState | null, layer: "music" | "ambient" = "music"): PlayableTrack[] {
  return (state?.tracks ?? []).filter((row) => row.status === "ready" && row.layer === layer).map((row) => ({ id: row.id, moods: row.moods, source: row.source, title: row.title, seconds: row.durationMs === null ? null : row.durationMs / 1000, hidden: row.hidden }));
}
const noAmbient = (): AmbientNow => ({ place: null, weather: null, placeTrack: null, weatherTrack: null, reason: "" });

export function MusicProvider({ campaignId, children }: { campaignId: string; children: ReactNode }) {
  const [state, setStateRaw] = useState<MusicState | null>(null);
  const [error, setError] = useState("");
  const prefs = useSyncExternalStore(subscribePrefs, () => readPrefs(campaignId), () => DEFAULT_PREFS);
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [ambientNow, setAmbientNow] = useState<AmbientNow>(noAmbient);
  const ambientState = useRef<AmbientState>(initialAmbientState());
  const ambientRef = useRef<AmbientNow>(noAmbient());
  const [pinned, setPinned] = useState<string | null>(null);
  const [log, setLog] = useState<MoodLogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [mood, setMood] = useState<MoodId | null>(null);
  const moodState = useRef<MoodState>(initialMoodState());
  const stateRef = useRef<MusicState | null>(null);
  const nowRef = useRef<NowPlaying | null>(null);
  const moodRef = useRef<MoodId | null>(null);
  const pinnedRef = useRef<string | null>(null);
  const runningRef = useRef(false);
  const turnPending = useRef(false);
  const player = useMemo(() => new WebMusicPlayer(async (trackId) => {
    const response = await fetch(musicTrackUrl(campaignId, trackId), { credentials: "same-origin" });
    if (!response.ok) throw new Error(`track ${response.status}`);
    return response.arrayBuffer();
  }), [campaignId]);

  // The campaign's own switch («музыка выкл» in the settings) and the device switch both silence it.
  const enabled = prefs.enabled && (state?.settings.enabled ?? true);
  const ambientOn = prefs.ambient && (state?.settings.ambient ?? true);
  const enabledRef = useRef(enabled);
  const ambientOnRef = useRef(ambientOn);
  useEffect(() => { enabledRef.current = enabled; ambientOnRef.current = ambientOn; }, [enabled, ambientOn]);

  const setPrefs = useCallback((patch: Partial<PlayerPrefs>) => {
    writePrefs(campaignId, { ...prefs, ...patch, volume: clampVolume(patch.volume ?? prefs.volume) });
  }, [campaignId, prefs]);

  // The pump: a generating pack advances one paid track per request while a page of the campaign is open.
  const pump = useCallback((current: MusicState | null) => {
    const hasQueued = (value: MusicState | null) => value?.pack?.status === "generating" && value.tracks.some((row) => row.packId === value.pack?.id && row.status === "queued");
    if (!hasQueued(current) || runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    (async () => {
      let latest = current;
      try {
        while (hasQueued(latest)) {
          latest = await musicAction(campaignId, "music.run");
          stateRef.current = latest;
          setStateRaw(latest);
        }
        setError("");
      } catch { setError("run"); }
      finally { runningRef.current = false; setRunning(false); }
    })();
  }, [campaignId]);

  const setState = useCallback((next: MusicState) => { stateRef.current = next; setStateRaw(next); pump(next); }, [pump]);
  const refresh = useCallback(async () => {
    try { setState(await loadMusicState(campaignId)); setError(""); }
    catch { setError("state"); }
  }, [campaignId, setState]);
  useEffect(() => {
    let live = true;
    loadMusicState(campaignId).then((next) => { if (live) { setState(next); setError(""); } }, () => { if (live) setError("state"); });
    return () => { live = false; };
  }, [campaignId, setState]);

  // What plays for a mood: the pinned track, else a take of the mood (a stand-in mood when the pack lacks one).
  const sync = useCallback(() => {
    const current = stateRef.current;
    const tracks = playable(current);
    const wantedMood = moodRef.current;
    if (!player.unlocked || !enabledRef.current) { player.stop("music"); return; }
    const pinnedTrack = pinnedRef.current ? tracks.find((row) => row.id === pinnedRef.current && !row.hidden) ?? null : null;
    const pick = pinnedTrack ? { track: pinnedTrack, moodUsed: pinnedTrack.moods.find(isMoodId) ?? wantedMood } : wantedMood ? pickTrack(tracks, wantedMood, nowRef.current?.track.id ?? null) : { track: null, moodUsed: null };
    if (!pick.track) { player.stop("music"); return; }
    if (nowRef.current?.track.id === pick.track.id) return;
    const track = current?.tracks.find((row) => row.id === pick.track!.id);
    if (!track) return;
    const chosen = pick.track.id;
    const entry: NowPlaying = { track, mood: wantedMood ?? pick.moodUsed!, moodUsed: pick.moodUsed!, reason: pinnedTrack ? "pinned" : "", since: Date.now() };
    nowRef.current = entry;
    void player.play(chosen, "music").then((ok) => { if (!ok && nowRef.current?.track.id === chosen) nowRef.current = null; }).catch(() => { if (nowRef.current?.track.id === chosen) nowRef.current = null; });
  }, [player]);

  // The ambient layer: the place's sound and the weather on their own channels, lower under playing music.
  const syncAmbient = useCallback(() => {
    const current = stateRef.current;
    const tracks = playable(current, "ambient");
    const wanted = ambientState.current;
    if (!player.unlocked || !ambientOnRef.current) { player.stop("place"); player.stop("weather"); return; }
    for (const [channel, id, key] of [["place", wanted.place, "placeTrack"], ["weather", wanted.weather, "weatherTrack"]] as const) {
      const last = ambientRef.current[key];
      const pick = id ? pickAmbientTrack(tracks, id, null) : null;
      if (!pick) { if (last) { ambientRef.current = { ...ambientRef.current, [key]: null }; } player.stop(channel as Channel, 3); continue; }
      if (last?.id === pick.id) continue;
      const track = current?.tracks.find((row) => row.id === pick.id) ?? null;
      ambientRef.current = { ...ambientRef.current, [key]: track };
      void player.play(pick.id, channel as Channel).catch(() => {});
    }
  }, [player]);

  // «Now playing» follows the player (an external system): set in its subscription, never in an effect body.
  useEffect(() => player.subscribe((channel, trackId) => {
    if (channel === "music") {
      if (trackId === null) { nowRef.current = null; setNow(null); return; }
      const entry = nowRef.current && nowRef.current.track.id === trackId ? nowRef.current : null;
      setNow(entry);
      return;
    }
    const key = channel === "place" ? "placeTrack" : "weatherTrack";
    const track = trackId === null ? null : ambientRef.current[key]?.id === trackId ? ambientRef.current[key] : null;
    ambientRef.current = { ...ambientRef.current, [key]: track };
    setAmbientNow({ ...ambientRef.current });
  }), [player]);

  // The first gesture anywhere unlocks the audio context (browsers forbid autoplay).
  const unlock = useCallback(async () => {
    const ok = await player.unlock();
    setUnlocked(ok);
    if (ok) { sync(); syncAmbient(); }
  }, [player, sync, syncAmbient]);
  useEffect(() => {
    if (unlocked || !enabled) return;
    const handler = () => { void unlock(); };
    window.addEventListener("pointerdown", handler, { once: true, passive: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => { window.removeEventListener("pointerdown", handler); window.removeEventListener("keydown", handler); };
  }, [unlocked, enabled, unlock]);

  // Ducking: a playing video with sound anywhere on the page lowers the music.
  useEffect(() => {
    const videos = new Set<HTMLMediaElement>();
    const update = () => player.duck([...videos].some((v) => !v.paused && !v.ended && !v.muted && v.volume > 0));
    const on = (event: Event) => { const target = event.target; if (target instanceof HTMLVideoElement) { if (event.type === "play" || event.type === "playing") videos.add(target); update(); } };
    for (const type of ["play", "playing", "pause", "ended", "volumechange", "emptied"]) document.addEventListener(type, on, true);
    return () => { for (const type of ["play", "playing", "pause", "ended", "volumechange", "emptied"]) document.removeEventListener(type, on, true); };
  }, [player]);

  useEffect(() => {
    player.setGain(targetGain(prefs, false), "music");
    const level = ambientGain(prefs, !!now && enabled, false);
    player.setGain(level, "place");
    player.setGain(level, "weather");
  }, [player, prefs, now, enabled]);
  useEffect(() => { sync(); }, [sync, enabled, state, mood, pinned, unlocked]);
  useEffect(() => { syncAmbient(); }, [syncAmbient, ambientOn, state, ambientNow.place, ambientNow.weather, unlocked]);

  // A signal becomes a choice; the reducer decides whether to switch (hysteresis).
  const applySignal = useCallback((signal: SceneSignalView) => {
    turnPending.current = signal.turnPending;
    const choice = chooseMood(signal);
    const isNewTurn = signal.turnId !== moodState.current.lastTurnId;
    const step = stepMood({ ...moodState.current, lastTurnId: signal.turnId }, choice, Date.now());
    moodState.current = step.state;
    if (step.switched || isNewTurn) setLog((prev) => [...prev.slice(-49), { at: Date.now(), turnId: signal.turnId, mood: step.mood!, switched: step.switched, reason: step.reason }]);
    if (step.mood !== moodRef.current) { moodRef.current = step.mood; setMood(step.mood); }
    if (nowRef.current) nowRef.current.reason = step.reason;
    // The ambient layer: the place's sound from the public place, the weather from the public text.
    const ambient = chooseAmbient(signal);
    const nextAmbient = stepAmbient(ambientState.current, ambient);
    const changed = nextAmbient.place !== ambientState.current.place || nextAmbient.weather !== ambientState.current.weather;
    ambientState.current = nextAmbient;
    ambientRef.current = { ...ambientRef.current, place: nextAmbient.place, weather: nextAmbient.weather, reason: ambient.reason };
    if (changed || ambientRef.current.reason !== ambient.reason) setAmbientNow({ ...ambientRef.current });
  }, []);

  // The scene signal: polled between turns (faster while a turn is in flight), at once after a commit.
  useEffect(() => {
    if (!enabled) return;
    let live = true, timer = 0;
    const poll = async () => {
      if (!live) return;
      if (document.visibilityState === "visible") {
        try { const next = await loadSceneSignal(campaignId); if (live) applySignal(next); } catch { /* the previous signal holds */ }
      }
      if (live) timer = window.setTimeout(poll, turnPending.current ? 3000 : 8000);
    };
    void poll();
    const changed = () => { window.clearTimeout(timer); void poll(); };
    window.addEventListener("rpg-gameplay-changed", changed);
    window.addEventListener("focus", changed);
    return () => { live = false; window.clearTimeout(timer); window.removeEventListener("rpg-gameplay-changed", changed); window.removeEventListener("focus", changed); };
  }, [campaignId, enabled, applySignal]);

  const pin = useCallback((trackId: string | null) => { pinnedRef.current = trackId; setPinned(trackId); }, []);
  const skip = useCallback(() => {
    const wantedMood = moodRef.current;
    if (!wantedMood) return;
    pin(null);
    const pick = pickTrack(playable(stateRef.current), wantedMood, nowRef.current?.track.id ?? null);
    const track = pick.track ? stateRef.current?.tracks.find((row) => row.id === pick.track!.id) : null;
    if (!track || track.id === nowRef.current?.track.id) return;
    nowRef.current = { track, mood: wantedMood, moodUsed: pick.moodUsed!, reason: "skipped by hand", since: Date.now() };
    void player.play(track.id).catch(() => {});
  }, [pin, player]);

  const act = useCallback(async (action: "music.generate" | "music.cancel", input: unknown = {}) => {
    try { setState(await musicAction(campaignId, action, input)); setError(""); }
    catch { setError(action); }
  }, [campaignId, setState]);

  const value = useMemo<MusicContextValue>(() => ({ state, error, prefs, setPrefs, unlocked, unlock, now, ambientNow, mood, pinned, pin, skip, log, refresh, act, setState, running }),
    [state, error, prefs, setPrefs, unlocked, unlock, now, ambientNow, mood, pinned, pin, skip, log, refresh, act, setState, running]);
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

/** The shell's control: one button with the mood, a popover with volume, mute, off, pin, skip. */
export function MusicControl({ campaignId, compact = false }: { campaignId: string; compact?: boolean }) {
  const c = useCopy();
  const chrome = useChrome();
  const music = useMusic();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const href = (screen: CampaignScreenId) => chrome?.href?.(screen) ?? `/campaigns/${encodeURIComponent(campaignId)}/${screen}`;
  const prefs = music?.prefs ?? DEFAULT_PREFS;
  const enabled = prefs.enabled && (music?.state?.settings.enabled ?? true);
  const playing = enabled && !!music?.now;
  const silent = !enabled || prefs.muted;
  // Fix S3-pre 2.4: the track's title and the mood's reason in the campaign's words (stored and logged in English).
  const title = music?.now ? `${trackTitle(music.now.track.title, c.language)} · ${moodLabel(music.now.moodUsed, c.language)}` : enabled ? c("Музыка", "Music") : c("Музыка выключена", "Music off");
  const hasTracks = (music?.state?.tracks ?? []).some((row) => row.status === "ready" && !row.hidden);
  const reason = music?.now ? (music.pinned ? c("закреплено", "pinned") : moodReasonText(music.log.at(-1)?.reason ?? "", c.language)) : "";
  return (
    <div className={m.wrap} ref={wrap} data-testid="music-control">
      <button type="button" className={open ? r.iconBtnOn : r.iconBtn} aria-label={title} title={title} aria-expanded={open} aria-haspopup="dialog"
        onClick={() => { setOpen((v) => !v); if (music && !music.unlocked) void music.unlock(); }}>
        {silent ? <VolumeX size={20} strokeWidth={1.6} aria-hidden="true" /> : <Music size={20} strokeWidth={1.6} aria-hidden="true" />}
      </button>
      {open && (
        <div className={m.popover} role="dialog" aria-label={c("Музыка", "Music")}>
          <div className={m.now}>
            <span className={r.eyebrow}>{c("Сейчас играет", "Now playing")}<i className={playing ? m.dotOn : m.dot} aria-hidden="true" /></span>
            <b>{music?.now ? trackTitle(music.now.track.title, c.language) : hasTracks ? (enabled ? c("тишина", "silence") : c("выключено", "off")) : c("саундтрака ещё нет", "no soundtrack yet")}</b>
            <span className={m.reason}>
              {music?.now ? `${moodLabel(music.now.mood, c.language)}${music.now.moodUsed !== music.now.mood ? ` → ${moodLabel(music.now.moodUsed, c.language)}` : ""}` : null}
              {reason ? ` · ${reason}` : ""}
            </span>
            {music && !music.unlocked && enabled && <span className={m.locked}>{c("Браузер ждёт первого нажатия — музыка начнётся после клика.", "The browser waits for the first click; the music starts after it.")}</span>}
          </div>
          <div className={m.row}>
            <button type="button" className={r.iconBtn} aria-label={prefs.muted ? c("Включить звук", "Unmute") : c("Без звука", "Mute")} aria-pressed={prefs.muted} disabled={!music}
              onClick={() => music?.setPrefs({ muted: !prefs.muted })}>{prefs.muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}</button>
            <input className={m.slider} type="range" min={0} max={100} value={Math.round(prefs.volume * 100)} aria-label={c("Громкость", "Volume")} disabled={!music}
              onChange={(event) => music?.setPrefs({ volume: Number(event.target.value) / 100, muted: false })} />
            <span className={r.num}>{Math.round(prefs.volume * 100)}</span>
          </div>
          <div className={m.tools}>
            <button type="button" aria-pressed={!prefs.enabled} disabled={!music} onClick={() => music?.setPrefs({ enabled: !prefs.enabled })}>{prefs.enabled ? c("Музыка выкл", "Music off") : c("Музыка вкл", "Music on")}</button>
            <button type="button" disabled={!music?.now} onClick={() => music?.skip()}><SkipForward size={16} aria-hidden="true" />{c("Дальше", "Skip")}</button>
            <button type="button" aria-pressed={!!music?.pinned} disabled={!music?.now} onClick={() => music?.pin(music.pinned ? null : music.now?.track.id ?? null)}>
              {music?.pinned ? <PinOff size={16} aria-hidden="true" /> : <Pin size={16} aria-hidden="true" />}{music?.pinned ? c("Открепить", "Unpin") : c("Закрепить", "Pin")}
            </button>
          </div>
          <div className={m.row}>
            <button type="button" className={prefs.ambient ? r.iconBtnOn : r.iconBtn} aria-label={prefs.ambient ? c("Выключить звуки места", "Ambient off") : c("Включить звуки места", "Ambient on")} aria-pressed={prefs.ambient} disabled={!music}
              onClick={() => music?.setPrefs({ ambient: !prefs.ambient })}><CloudRain size={18} aria-hidden="true" /></button>
            <input className={m.slider} type="range" min={0} max={100} value={Math.round(prefs.ambientVolume * 100)} aria-label={c("Громкость звуков места", "Ambient volume")} disabled={!music || !prefs.ambient}
              onChange={(event) => music?.setPrefs({ ambientVolume: Number(event.target.value) / 100 })} />
            <span className={r.num}>{Math.round(prefs.ambientVolume * 100)}</span>
          </div>
          <span className={m.reason}>
            {c("Звуки места", "Ambient")}: {music?.ambientNow.placeTrack ? ambientLabel(music.ambientNow.placeTrack.moods[0] as AmbientId, c.language) : music?.ambientNow.place ? `${ambientLabel(music.ambientNow.place, c.language)} (${c("нет записи", "no loop")})` : c("тишина", "silence")}
            {music?.ambientNow.weather ? ` · ${ambientLabel(music.ambientNow.weather, c.language)}${music.ambientNow.weatherTrack ? "" : ` (${c("нет записи", "no loop")})`}` : ""}
          </span>
          {!compact && <Link className={r.small} href={href("settings")} onClick={() => setOpen(false)}>{c("Саундтрак мира и свои треки — в настройках", "The world's soundtrack and your own tracks — in the settings")}</Link>}
        </div>
      )}
    </div>
  );
}
