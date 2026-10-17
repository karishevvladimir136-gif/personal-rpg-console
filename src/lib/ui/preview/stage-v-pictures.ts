// Synthetic Stage V picture boards for the previews: anchors on the sample art,
// frames of the sample turns, one active style. Preview-only content; the live
// app reads its board from the server.
import type { PictureBoard, PublicPicture, PictureStyle } from "../../visual-frame/pictures.ts";
import { STYLE_PRESETS } from "../../visual-frame/pictures.ts";

type Anchor = { id: string; subjectKind: "entity" | "item" | "location"; subjectId: string; composition: PublicPicture["composition"]; image: string };
type Frame = { id: string; turnId: string; image: string; trigger?: PublicPicture["trigger"]; tier?: PublicPicture["tier"]; version?: number; status?: PublicPicture["status"] };

export function previewPictureBoard(input: {
  campaignId: string; worldId: string; timeline: { timelineId: string; epoch: number }; at: (minute: number) => string;
  style: { id: string; scope: "world" | "campaign"; preset: (typeof STYLE_PRESETS)[number]["key"]; label: string; hasReference?: boolean; version?: number; styleText?: string };
  anchors: Anchor[]; frames: Frame[]; todayCostUsdMicros?: number;
}): { board: PictureBoard; images: Record<string, string> } {
  const preset = STYLE_PRESETS.find((row) => row.key === input.style.preset)!;
  const style: PictureStyle = {
    id: input.style.id, scope: input.style.scope, scopeId: input.style.scope === "world" ? input.worldId : input.campaignId, version: input.style.version ?? 1,
    preset: input.style.preset, label: input.style.label, styleText: input.style.styleText ?? preset.text, hasReference: input.style.hasReference ?? false, active: true, createdAt: input.at(0),
  };
  const picture = (n: number, over: Partial<PublicPicture> & Pick<PublicPicture, "id" | "kind" | "subjectKind" | "subjectId" | "composition">): PublicPicture => ({
    timeline: input.timeline, version: 1, status: "ready", hidden: false, model: "fal-ai/flux-2/klein/9b", tier: "fast", trigger: "autopilot",
    styleVersionId: style.id, width: over.composition === "frame" || over.composition === "location" || over.composition === "holding" ? 1024 : over.composition === "figure" ? 576 : 1024,
    height: over.composition === "frame" || over.composition === "location" || over.composition === "holding" ? 576 : 1024, costUsdMicros: 17_000, elapsedMs: 1800, error: null,
    createdAt: input.at(n), readyAt: input.at(n), ...over,
  });
  const pictures: PublicPicture[] = [
    ...input.anchors.map((row, index) => picture(index + 1, { id: row.id, kind: "anchor", subjectKind: row.subjectKind, subjectId: row.subjectId, composition: row.composition })),
    ...input.frames.map((row, index) => picture(40 + index, { id: row.id, kind: "frame", subjectKind: "turn", subjectId: row.turnId, composition: "frame",
      trigger: row.trigger ?? "live", tier: row.tier ?? "fast", version: row.version ?? 1, model: row.tier === "quality" ? "fal-ai/flux-2-pro" : "fal-ai/flux-2/klein/9b", costUsdMicros: row.tier === "quality" ? 30_000 : 17_000,
      status: row.status ?? "ready", readyAt: row.status && row.status !== "ready" ? null : input.at(40 + index) })),
  ];
  const images: Record<string, string> = {};
  for (const row of input.anchors) images[row.id] = row.image;
  for (const row of input.frames) images[row.id] = row.image;
  return {
    board: {
      campaignId: input.campaignId, worldId: input.worldId,
      settings: { frames: "every", quality: "fast", dailyCap: 60, autopilot: { enabled: true, items: true, portraits: true, figures: true, places: true, holdings: true, autoAccept: true, provider: "fal" }, models: {}, revision: 2 },
      profiles: [],
      today: { count: pictures.length, costUsdMicros: input.todayCostUsdMicros ?? pictures.reduce((sum, row) => sum + row.costUsdMicros, 0) },
      styles: [style], pictures,
    },
    images,
  };
}
