// Persona memory 1: the embedding half of recall. The default embedder is local and free — words and their character
// trigrams hashed into a fixed vector (Russian endings share trigrams, so «журнал» and «журналом» land close) — so the
// store runs with no network and no key. An OpenAI embedder is optional (`PERSONA_MEMORY_EMBEDDINGS=openai`, server-side
// key); its vectors are cached by the store per model and per content, so an episode is embedded once.
import { normalize, words } from "./text.ts";

export type Embedder = { model: string; embed(texts: string[]): Promise<number[][]> };

const fnv1a = (text: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
  return hash >>> 0;
};

export function localVector(text: string, dim = 512): number[] {
  const vector = new Array<number>(dim).fill(0);
  const add = (feature: string, weight: number) => {
    const hash = fnv1a(feature);
    vector[hash % dim] += hash & 0x80000000 ? -weight : weight;
  };
  for (const word of words(normalize(text))) {
    add(`w:${word}`, 1);
    const padded = `#${word}#`;
    for (let i = 0; i + 3 <= padded.length; i++) add(`t:${padded.slice(i, i + 3)}`, 0.5);
  }
  const norm = Math.hypot(...vector);
  return norm ? vector.map((value) => value / norm) : vector;
}

export function localEmbedder(dim = 512): Embedder {
  return { model: `local-hash-${dim}-v1`, embed: async (texts) => texts.map((text) => localVector(text, dim)) };
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

type Fetcher = typeof fetch;
/** OpenAI embeddings (server-side key only). The key is sent to the provider and nowhere else; errors never echo it. */
export function openAIEmbedder(options: { apiKey: string; model?: string; fetcher?: Fetcher }): Embedder {
  const model = options.model ?? "text-embedding-3-small";
  return {
    model: `openai:${model}`,
    async embed(texts) {
      if (!texts.length) return [];
      const response = await (options.fetcher ?? fetch)("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: { authorization: `Bearer ${options.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ model, input: texts.map((text) => text.slice(0, 24_000)) }),
        signal: AbortSignal.timeout(30_000),
      });
      const value = (await response.json().catch(() => null)) as { data?: { index: number; embedding: number[] }[] } | null;
      if (!response.ok || !value?.data) throw new Error(`embeddings: HTTP ${response.status}`);
      return value.data.sort((a, b) => a.index - b.index).map((row) => row.embedding);
    },
  };
}
