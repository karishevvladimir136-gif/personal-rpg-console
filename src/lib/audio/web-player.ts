// The browser player of the soundtrack on the Web Audio API: decoded tracks on
// gain nodes, a crossfade between moods, a self-crossfaded loop a few seconds
// before a track's end (no endpoint loops natively: the seam becomes an overlap),
// ducking under a video's own sound, and nothing before the first user gesture
// (browsers refuse autoplay; the context is created and resumed on a click).
// Everything that decides *what* plays lives in player-engine.ts / mood-select.ts.
import { FADE, loopPoint } from "./player-engine.ts";

type Layer = { trackId: string; gain: GainNode; sources: AudioBufferSourceNode[]; timers: number[]; stopped: boolean };
/** Independent channels: the music, the place's sound and the weather, each with its own gain and crossfades. */
export type Channel = "music" | "place" | "weather";
export const CHANNELS: readonly Channel[] = ["music", "place", "weather"];
type ChannelState = { gain: GainNode | null; target: number; layers: Layer[] };

/** Where a decoded track effectively ends: the last 50 ms window still within 24 dB of the track's
 * loudest windows (models fade out; a loop seam placed inside the fade is a dip). */
export function effectiveEnd(buffer: { length: number; sampleRate: number; numberOfChannels: number; getChannelData: (c: number) => Float32Array }) {
  const window = Math.max(1, Math.floor(buffer.sampleRate * 0.05));
  const windows = Math.floor(buffer.length / window);
  if (windows < 4) return buffer.length / buffer.sampleRate;
  const channel = buffer.getChannelData(0);
  const rms: number[] = [];
  for (let w = 0; w < windows; w += 1) {
    let sum = 0;
    for (let i = w * window; i < (w + 1) * window; i += 1) sum += channel[i] * channel[i];
    rms.push(Math.sqrt(sum / window));
  }
  const sorted = [...rms].sort((a, b) => b - a);
  const loud = sorted[Math.floor(sorted.length * 0.1)] || sorted[0] || 0;
  const floor = loud / 16; // −24 dB
  let last = windows - 1;
  while (last > 0 && rms[last] < floor) last -= 1;
  return Math.min(buffer.length / buffer.sampleRate, ((last + 1) * window) / buffer.sampleRate);
}

/** A make-up gain for quiet files (the sound-effects model delivers ambiences at −40 to −65 LUFS): the gain that
 * brings the track's RMS to the target, between ×0.5 and ×40, from the same window scan as `effectiveEnd`. */
export function makeupGain(buffer: { length: number; sampleRate: number; getChannelData: (c: number) => Float32Array }, targetRms = 0.08) {
  const channel = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(buffer.length / 20000));
  let sum = 0, n = 0;
  for (let i = 0; i < buffer.length; i += step) { sum += channel[i] * channel[i]; n += 1; }
  const rms = Math.sqrt(sum / Math.max(1, n));
  if (!Number.isFinite(rms) || rms <= 0) return 1;
  return Math.max(0.5, Math.min(40, targetRms / rms));
}

export class WebMusicPlayer {
  private context: AudioContext | null = null;
  private duckGain: GainNode | null = null;
  private channels: Record<Channel, ChannelState> = { music: { gain: null, target: 0.5, layers: [] }, place: { gain: null, target: 0.4, layers: [] }, weather: { gain: null, target: 0.4, layers: [] } };
  private buffers = new Map<string, AudioBuffer>();
  private pending = new Map<string, Promise<AudioBuffer>>();
  private ducked = false;
  private listeners = new Set<(channel: Channel, trackId: string | null) => void>();
  private readonly fetchTrack: (trackId: string) => Promise<ArrayBuffer>;
  constructor(fetchTrack: (trackId: string) => Promise<ArrayBuffer>) {
    this.fetchTrack = fetchTrack;
  }

  /** Called whenever a channel's playing track changes (the React side keeps «now playing» from this). */
  subscribe(listener: (channel: Channel, trackId: string | null) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  private notify(channel: Channel) {
    const current = this.current(channel);
    for (const listener of this.listeners) listener(channel, current);
  }
  get unlocked() {
    return this.context !== null && this.context.state === "running";
  }
  current(channel: Channel = "music") {
    return this.channels[channel].layers.find((layer) => !layer.stopped)?.trackId ?? null;
  }

  /** Must be called from a user gesture: creates the context the first time and resumes it. */
  async unlock() {
    if (typeof window === "undefined") return false;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return false;
    if (!this.context) {
      this.context = new Ctx();
      this.duckGain = this.context.createGain();
      this.duckGain.gain.value = 1;
      this.duckGain.connect(this.context.destination);
      for (const name of CHANNELS) {
        const gain = this.context.createGain();
        gain.gain.value = this.channels[name].target;
        gain.connect(this.duckGain);
        this.channels[name].gain = gain;
      }
    }
    if (this.context.state !== "running") {
      try { await this.context.resume(); } catch { /* still locked: the next gesture tries again */ }
    }
    return this.context.state === "running";
  }

  setGain(target: number, channel: Channel = "music") {
    const state = this.channels[channel];
    state.target = target;
    if (this.context && state.gain) state.gain.gain.setTargetAtTime(target, this.context.currentTime, 0.1);
  }
  duck(on: boolean) {
    if (this.ducked === on) return;
    this.ducked = on;
    if (this.context && this.duckGain) this.duckGain.gain.setTargetAtTime(on ? FADE.duckGain : 1, this.context.currentTime, FADE.duckSeconds / 3);
  }

  private async buffer(trackId: string) {
    const cached = this.buffers.get(trackId);
    if (cached) return cached;
    const inFlight = this.pending.get(trackId);
    if (inFlight) return inFlight;
    const promise = (async () => {
      const bytes = await this.fetchTrack(trackId);
      const decoded = await this.context!.decodeAudioData(bytes.slice(0));
      // At most three decoded tracks stay in memory (phones): the oldest goes.
      if (this.buffers.size >= 5) {
        const playing = new Set(CHANNELS.flatMap((name) => this.channels[name].layers.filter((layer) => !layer.stopped).map((layer) => layer.trackId)));
        for (const key of this.buffers.keys()) if (!playing.has(key)) { this.buffers.delete(key); break; }
      }
      this.buffers.set(trackId, decoded);
      return decoded;
    })();
    this.pending.set(trackId, promise);
    try { return await promise; } finally { this.pending.delete(trackId); }
  }

  /** Crossfade a channel to a track; a second call for the same track does nothing. Resolves once it plays. */
  async play(trackId: string, channel: Channel = "music") {
    const state = this.channels[channel];
    if (!this.context || !state.gain) return false;
    if (this.current(channel) === trackId) return true;
    const buffer = await this.buffer(trackId);
    if (!this.context || this.current(channel) === trackId) return true;
    const now = this.context.currentTime;
    for (const layer of state.layers) this.fadeOut(channel, layer, FADE.switchSeconds);
    const gain = this.context.createGain();
    // Ambient channels get a make-up gain (quiet effect files); the music keeps its own level.
    const level = channel === "music" ? 1 : makeupGain(buffer);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(level, now + FADE.switchSeconds);
    gain.connect(state.gain);
    const layer: Layer = { trackId, gain, sources: [], timers: [], stopped: false };
    state.layers.push(layer);
    this.loop(layer, buffer, now);
    this.notify(channel);
    return true;
  }

  /** One pass of the buffer, and the next pass scheduled `overlap` seconds before its effective end
   * with a short crossfade between the two: the loop seam. */
  private loop(layer: Layer, buffer: AudioBuffer, at: number) {
    if (!this.context || layer.stopped) return;
    const end = effectiveEnd(buffer);
    const { at: next, overlap } = loopPoint(end);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const pass = this.context.createGain();
    pass.gain.setValueAtTime(0.0001, at);
    pass.gain.exponentialRampToValueAtTime(1, at + Math.min(overlap, 1.5));
    pass.gain.setValueAtTime(1, at + next);
    pass.gain.exponentialRampToValueAtTime(0.0001, at + next + overlap);
    source.connect(pass).connect(layer.gain);
    source.start(at, 0);
    source.stop(at + next + overlap + 0.05);
    layer.sources.push(source);
    source.onended = () => { layer.sources = layer.sources.filter((s) => s !== source); };
    const delay = Math.max(0, (at + next - this.context.currentTime) * 1000 - 250);
    const timer = window.setTimeout(() => { if (!layer.stopped) this.loop(layer, buffer, at + next); }, delay);
    layer.timers.push(timer);
  }

  private fadeOut(channel: Channel, layer: Layer, seconds: number) {
    if (layer.stopped || !this.context) return;
    layer.stopped = true;
    for (const timer of layer.timers) window.clearTimeout(timer);
    const now = this.context.currentTime;
    layer.gain.gain.cancelScheduledValues(now);
    layer.gain.gain.setValueAtTime(Math.max(0.0001, layer.gain.gain.value), now);
    layer.gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    for (const source of layer.sources) { try { source.stop(now + seconds + 0.05); } catch { /* already stopped */ } }
    window.setTimeout(() => { layer.gain.disconnect(); this.channels[channel].layers = this.channels[channel].layers.filter((l) => l !== layer); }, seconds * 1000 + 200);
  }

  stop(channel: Channel = "music", seconds = 1.5) {
    const had = this.current(channel) !== null;
    for (const layer of this.channels[channel].layers) this.fadeOut(channel, layer, seconds);
    if (had) this.notify(channel);
  }
  stopAll(seconds = 1.5) {
    for (const name of CHANNELS) this.stop(name, seconds);
  }

  /** Pre-decode a track so a later switch starts without a fetch. */
  async warm(trackId: string) {
    if (this.context) { try { await this.buffer(trackId); } catch { /* the switch will fetch again */ } }
  }
}
