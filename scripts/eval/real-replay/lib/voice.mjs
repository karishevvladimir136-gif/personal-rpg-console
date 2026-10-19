// Voice stage part 7: the voice variant a replay plays with — «live» (the snapshot's own mode and
// samples, as the turn had them), «off» (no voice layer, no reminder, no examples: the prompt
// before the voice stage), «layer» (the layer and the reminder, no examples), «five» and «all»
// (the layer plus the examples from a file OUTSIDE the repository, read at run time; the
// passages never enter a record or a sample — only their count does). The variant rewrites the
// isolated copy's source only; the snapshot's own samples are replaced, never kept alongside.
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { parseVoicePassages } from "../../../../src/lib/gameplay/dm-loop/voice.ts";
import { ROOT } from "./ledger.mjs";

export const VOICE_VARIANTS = ["live", "off", "layer", "five", "all"];

/** The examples file must lie outside the repository (the bank is private and the repo is public). */
export async function readExamplesFile(path) {
  const full = resolve(path);
  const inside = !relative(ROOT, full).startsWith("..") && !isAbsolute(relative(ROOT, full));
  if (inside) throw new Error(`--examples-file must point outside the repository (got ${path})`);
  const text = await readFile(full, "utf8");
  const passages = parseVoicePassages(text);
  if (!passages.length) throw new Error(`--examples-file ${path}: no passage found (passages are separated by a line ---)`);
  return { text, passages: passages.length, kinds: [...new Set(passages.map((row) => row.kind ?? ""))].length };
}

/** The copy's source for the voice variant; `examples` is the result of readExamplesFile (five/all). */
export function voiceVariant(payload, voice, examples = null, tokenCap = null) {
  if (voice === "live") return payload;
  if (!VOICE_VARIANTS.includes(voice)) throw new Error(`unknown voice variant ${voice}`);
  const copy = structuredClone(payload);
  const source = copy.source;
  delete source.voiceSamples;
  delete source.voiceLayerOff;
  source.voiceFlags = null;
  if (voice === "off") { source.voiceMode = "off"; source.voiceExamplesOn = false; source.voiceLayerOff = true; return copy; }
  if (voice === "layer") { source.voiceMode = "off"; source.voiceExamplesOn = false; return copy; }
  if (!examples) throw new Error(`--voice ${voice} needs --examples-file <path outside the repo>`);
  source.voiceSamples = examples.text;
  source.voiceMode = voice;
  source.voiceExamplesOn = true;
  if (tokenCap) source.voiceTokenCap = tokenCap;
  return copy;
}
