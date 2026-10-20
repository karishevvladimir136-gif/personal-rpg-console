// Music models on fal.ai for the world soundtracks (the music stage). Pure:
// nothing here reads the environment or logs.
//
// Endpoint IDs and request fields were confirmed on 2026-10-20 against the
// queue's own validation replies (bodies with wrong-typed fields, rejected by the
// worker before any generation and never billed): the reply names every field
// the endpoint knows and the allowed values of its enums. The fal model pages
// themselves are outside the cloud VM's network list; the prices below come from
// those pages as quoted by search results on the same day, and where a page gave
// two figures the higher one is counted so a budget guard never under-counts:
//   fal-ai/lyria3/pro                          $0.08 per track (up to ~3 min; prompt + negative_prompt only)
//   google/lyria-3.5                           $0.10 per track (full song; prompt + negative_prompt only)
//   elevenlabs/music/v2.5                      $0.60 per output minute rounded up (the base listing says $0.80: counted)
//   fal-ai/stable-audio-25/text-to-audio       $0.20 per track (seconds_total, seed, steps)
//   fal-ai/stable-audio-3/medium/text-to-audio $0.0376 per track (duration, seed, negative_prompt, output_format)
//   fal-ai/lyria2                              $0.10 per 30-second track (prompt, negative_prompt, seed)
//   fal-ai/ace-step/prompt-to-audio            $0.0002 per second on the model page; an older index says $0.005: counted

export type MusicPricing =
  | { kind: "track"; usdMicros: number }
  | { kind: "minute"; usdMicros: number }
  | { kind: "second"; usdMicros: number };

export type MusicDurationControl = "exact" | "prompt" | "fixed";

export type MusicModel = {
  id: string;
  label: string;
  vendor: string;
  pricing: MusicPricing;
  /** How the length of a track is asked for: an exact field, a hint in the prompt, or fixed by the model. */
  duration: MusicDurationControl;
  minSeconds: number;
  maxSeconds: number;
  seed: boolean;
  negativePrompt: boolean;
  /** The model has a switch that guarantees an instrumental output. */
  instrumentalSwitch: boolean;
  /** The output format the adapter asks for, when the endpoint offers one. */
  format: "mp3" | "wav" | "model";
  tier: "quality" | "draft";
  note: { ru: string; en: string };
};

export const MUSIC_MODELS: readonly MusicModel[] = [
  {
    id: "fal-ai/lyria3/pro", label: "Lyria 3 Pro", vendor: "Google",
    pricing: { kind: "track", usdMicros: 80_000 }, duration: "prompt", minSeconds: 20, maxSeconds: 180,
    seed: false, negativePrompt: false, instrumentalSwitch: false, format: "model", tier: "quality",
    note: { ru: "лучшая инструментальная музыка по рейтингам; длина — словами в запросе", en: "top of the instrumental leaderboards; the length is asked for in words" },
  },
  {
    id: "google/lyria-3.5", label: "Lyria 3.5", vendor: "Google",
    pricing: { kind: "track", usdMicros: 100_000 }, duration: "prompt", minSeconds: 20, maxSeconds: 240,
    seed: false, negativePrompt: false, instrumentalSwitch: false, format: "model", tier: "quality",
    note: { ru: "новейшая Lyria, целые композиции", en: "the newest Lyria, full compositions" },
  },
  {
    id: "elevenlabs/music/v2.5", label: "ElevenLabs Music 2.5", vendor: "ElevenLabs",
    pricing: { kind: "minute", usdMicros: 800_000 }, duration: "exact", minSeconds: 3, maxSeconds: 600,
    seed: true, negativePrompt: false, instrumentalSwitch: true, format: "mp3", tier: "quality",
    note: { ru: "точная длина и план секций; дорого — по минутам", en: "exact length and a section plan; priced per minute" },
  },
  {
    id: "fal-ai/stable-audio-25/text-to-audio", label: "Stable Audio 2.5", vendor: "Stability AI",
    pricing: { kind: "track", usdMicros: 200_000 }, duration: "exact", minSeconds: 1, maxSeconds: 190,
    seed: true, negativePrompt: false, instrumentalSwitch: false, format: "model", tier: "quality",
    note: { ru: "долгие развивающиеся текстуры, точная длина, seed", en: "long evolving textures, exact length, seeds" },
  },
  {
    id: "fal-ai/stable-audio-3/medium/text-to-audio", label: "Stable Audio 3", vendor: "Stability AI",
    pricing: { kind: "track", usdMicros: 40_000 }, duration: "exact", minSeconds: 1, maxSeconds: 360,
    seed: true, negativePrompt: true, instrumentalSwitch: false, format: "mp3", tier: "quality",
    note: { ru: "новое поколение Stable Audio, MP3 на выходе, недорого", en: "the new Stable Audio generation, MP3 output, inexpensive" },
  },
  {
    id: "fal-ai/lyria2", label: "Lyria 2", vendor: "Google",
    pricing: { kind: "track", usdMicros: 100_000 }, duration: "fixed", minSeconds: 30, maxSeconds: 30,
    seed: true, negativePrompt: true, instrumentalSwitch: false, format: "model", tier: "quality",
    note: { ru: "30-секундные фоны, seed", en: "30-second ambient beds, seeds" },
  },
  {
    id: "fal-ai/ace-step/prompt-to-audio", label: "ACE-Step", vendor: "ACE Studio",
    pricing: { kind: "second", usdMicros: 5_000 }, duration: "exact", minSeconds: 5, maxSeconds: 240,
    seed: true, negativePrompt: false, instrumentalSwitch: true, format: "model", tier: "draft",
    note: { ru: "черновики и объём, очень дёшево", en: "drafts and volume, very cheap" },
  },
] as const;

export type MusicModelId = (typeof MUSIC_MODELS)[number]["id"];
export const MUSIC_MODEL_IDS = MUSIC_MODELS.map((row) => row.id) as readonly string[];
export const DEFAULT_MUSIC_MODEL: MusicModelId = "fal-ai/lyria3/pro";

export function musicModel(id: string): MusicModel | null {
  return MUSIC_MODELS.find((row) => row.id === id) ?? null;
}

/** The list price of one track of `seconds`, counted before the call (never under-counting). */
export function musicPriceUsdMicros(modelId: string, seconds: number): number {
  const model = musicModel(modelId);
  if (!model) throw new Error(`unknown music model ${modelId}`);
  const length = Math.max(model.minSeconds, Math.min(model.maxSeconds, Math.ceil(seconds)));
  switch (model.pricing.kind) {
    case "track": return model.pricing.usdMicros;
    case "minute": return model.pricing.usdMicros * Math.max(1, Math.ceil(length / 60));
    case "second": return model.pricing.usdMicros * length;
  }
}

export type MusicRequest = {
  model: string;
  prompt: string;
  negativePrompt: string;
  /** The wanted length in seconds; the adapter clamps it to the model's range. */
  seconds: number;
  seed?: number | null;
  /** Short style words for the ElevenLabs composition plan (global styles). */
  styleWords?: string[];
};

/** The exact length a model will be asked for (fixed-length models ignore the wish). */
export function requestedSeconds(model: MusicModel, seconds: number) {
  return Math.max(model.minSeconds, Math.min(model.maxSeconds, Math.round(seconds)));
}

/** The request body of each endpoint, with only the fields the queue's validation confirmed. */
export function musicRequestBody(input: MusicRequest): Record<string, unknown> {
  const model = musicModel(input.model);
  if (!model) throw new Error(`unknown music model ${input.model}`);
  const seconds = requestedSeconds(model, input.seconds);
  const seed = model.seed && Number.isSafeInteger(input.seed) ? { seed: input.seed } : {};
  switch (model.id) {
    case "fal-ai/lyria3/pro":
    case "google/lyria-3.5":
      // The field exists, but the worker answers «Negative prompting is not supported by Lyria 3» to any value (2026-10-20).
      return { prompt: input.prompt };
    case "fal-ai/lyria2":
      return { prompt: input.prompt, negative_prompt: input.negativePrompt, ...seed };
    case "elevenlabs/music/v2.5":
      // The v2.5 plan is chunk-based (confirmed 2026-10-20: `chunks[].text`, `duration_ms`, `positive_styles` required):
      // one instrumental chunk of the exact length holds the runtime; an empty text means no lyrics.
      return {
        composition_plan: {
          positive_global_styles: [...(input.styleWords ?? []).slice(0, 12), "instrumental"],
          negative_global_styles: ["vocals", "singing", "lyrics", "spoken word"],
          chunks: [{
            text: "",
            duration_ms: seconds * 1000,
            positive_styles: [input.prompt.slice(0, 500)],
            negative_styles: ["abrupt ending", "big final cadence", "vocals"],
          }],
        },
        // `force_instrumental` is refused together with a plan (2026-10-20); an empty text chunk is instrumental.
        output_format: "mp3_44100_128",
        ...seed,
      };
    case "fal-ai/stable-audio-25/text-to-audio":
      return { prompt: input.prompt, seconds_total: seconds, ...seed };
    case "fal-ai/stable-audio-3/medium/text-to-audio":
      return { prompt: input.prompt, negative_prompt: input.negativePrompt, duration: seconds, output_format: "mp3", ...seed };
    case "fal-ai/ace-step/prompt-to-audio":
      return { prompt: input.prompt, instrumental: true, duration: seconds, ...seed };
    default:
      throw new Error(`no request body for ${model.id}`);
  }
}

export const MAX_TRACK_BYTES = 40_000_000;

export type AudioContentType = "audio/mpeg" | "audio/wav" | "audio/ogg" | "audio/flac" | "audio/mp4";
export const AUDIO_EXTENSIONS: Record<AudioContentType, string> = {
  "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg", "audio/flac": "flac", "audio/mp4": "m4a",
};

/** The audio container by its first bytes; null for anything that is not audio we play. */
export function sniffAudio(bytes: Uint8Array): AudioContentType | null {
  if (bytes.length < 12) return null;
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE") return "audio/wav";
  if (ascii(0, 4) === "OggS") return "audio/ogg";
  if (ascii(0, 4) === "fLaC") return "audio/flac";
  if (ascii(4, 8) === "ftyp") return "audio/mp4";
  if (ascii(0, 3) === "ID3") return "audio/mpeg";
  // A bare MPEG audio frame: 11 sync bits, a valid version and layer, not a reserved bitrate.
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 && (bytes[1] & 0x18) !== 0x08 && (bytes[1] & 0x06) !== 0 && (bytes[2] & 0xf0) !== 0xf0) return "audio/mpeg";
  return null;
}
