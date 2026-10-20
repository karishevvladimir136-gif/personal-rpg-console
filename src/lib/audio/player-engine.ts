// The player's decisions without the browser: which track plays for a mood (own
// uploads mix with the pack, no take twice in a row), pin, skip, volume, mute,
// off, and the crossfade plan with overlap for loop seams. The DOM part
// (`music-player.tsx`) only executes what this returns. Pure.
import { MOOD_FALLBACKS } from "./mood-select.ts";
import type { MoodId } from "./moods.ts";
import type { AmbientId } from "./ambient.ts";

export type PlayableTrack = {
  id: string;
  /** Moods of a music track; place kinds and weathers of an ambient track. */
  moods: string[];
  source: "generated" | "upload";
  title: string;
  seconds: number | null;
  hidden: boolean;
};

export type PlayerPrefs = {
  enabled: boolean;
  volume: number; // 0..1
  muted: boolean;
  /** The ambient layer on this device and its own volume. */
  ambient: boolean;
  ambientVolume: number;
};
export const DEFAULT_PREFS: PlayerPrefs = { enabled: true, volume: 0.5, muted: false, ambient: true, ambientVolume: 0.4 };

export function clampVolume(value: unknown) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0.5;
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}

/** The tracks that may play for a mood: the mood's own, else the nearest stand-in mood's. */
export function tracksForMood(tracks: PlayableTrack[], moodId: MoodId): { tracks: PlayableTrack[]; moodUsed: MoodId | null } {
  const live = tracks.filter((row) => !row.hidden);
  const own = live.filter((row) => row.moods.includes(moodId));
  if (own.length) return { tracks: own, moodUsed: moodId };
  for (const fallback of MOOD_FALLBACKS[moodId]) {
    const rows = live.filter((row) => row.moods.includes(fallback));
    if (rows.length) return { tracks: rows, moodUsed: fallback };
  }
  return { tracks: [], moodUsed: null };
}

/** The next track for a mood: not the one just played when there is a choice; `random` in [0,1). */
export function pickTrack(tracks: PlayableTrack[], moodId: MoodId, lastTrackId: string | null, random = Math.random): { track: PlayableTrack | null; moodUsed: MoodId | null } {
  const { tracks: rows, moodUsed } = tracksForMood(tracks, moodId);
  if (!rows.length) return { track: null, moodUsed: null };
  const fresh = rows.length > 1 ? rows.filter((row) => row.id !== lastTrackId) : rows;
  return { track: fresh[Math.floor(random() * fresh.length) % fresh.length] ?? rows[0], moodUsed };
}

/** An ambient loop for a place kind or a weather: the kind's own takes, no take twice in a row. */
export function pickAmbientTrack(tracks: PlayableTrack[], id: AmbientId, lastTrackId: string | null, random = Math.random): PlayableTrack | null {
  const rows = tracks.filter((row) => !row.hidden && row.moods.includes(id));
  if (!rows.length) return null;
  const fresh = rows.length > 1 ? rows.filter((row) => row.id !== lastTrackId) : rows;
  return fresh[Math.floor(random() * fresh.length) % fresh.length] ?? rows[0];
}

/** Crossfade and loop timing (seconds). A loop restarts the same buffer `overlap` seconds before its end
 * with a fade-in, while the running one fades out: the seam becomes a crossfade. */
export const FADE = { switchSeconds: 4, loopOverlapSeconds: 3, duckSeconds: 0.6, duckGain: 0.2, ambientUnderMusic: 0.6 } as const;

/** When to schedule the loop of a track of `seconds` length: never inside a very short clip. */
export function loopPoint(seconds: number) {
  const overlap = Math.min(FADE.loopOverlapSeconds, Math.max(0.5, seconds / 4));
  return { at: Math.max(1, seconds - overlap), overlap };
}

/** The gain the music should sit at, from the preferences and whether a video with sound is playing. */
export function targetGain(prefs: PlayerPrefs, ducked: boolean) {
  if (!prefs.enabled || prefs.muted) return 0;
  return clampVolume(prefs.volume) * (ducked ? FADE.duckGain : 1);
}
/** The gain of the ambient layer: its own volume, lower under playing music, ducked under video like the music. */
export function ambientGain(prefs: PlayerPrefs, musicPlaying: boolean, ducked: boolean) {
  if (!prefs.ambient || prefs.muted) return 0;
  return clampVolume(prefs.ambientVolume) * (musicPlaying ? FADE.ambientUnderMusic : 1) * (ducked ? FADE.duckGain : 1);
}
