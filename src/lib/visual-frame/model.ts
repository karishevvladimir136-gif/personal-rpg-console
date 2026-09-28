import type {
  Asset,
  CampaignSnapshot,
  DocumentRecord,
  MutationInput,
} from "../persistence/contracts.ts";
import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence, sameTimeline } from "../saves/fence.ts";

export const VISUAL_FRAME_PREFIX = "RPG_VISUAL_FRAME_V0\n";
export const MOCK_ASSET_PREFIX = "RPG_VISUAL_FRAME_ASSET_V0\n";
export type MockArt = "landscape" | "portrait" | "object" | "abstract";
export type VisualSubject = {
  kind: "entity" | "location" | "item" | "style";
  id: string;
};
export type VisualReference = {
  schema: 1;
  kind: "reference";
  campaign_id: string;
  subject: VisualSubject;
  sourceRevision: number;
  label: string;
  appearance: string;
  outfit: string;
  guidance: string;
  art: MockArt;
  imageAssetId: string | null;
  imageAssetRevision: number | null;
  approval: "draft" | "approved" | "invalidated";
};
export type FrameBasis = {
  timeline: TimelineFence;
  scene: { id: string; revision: number; title: string; body: string };
  references: { documentId: string; versionId: string }[];
};
export type VisualFrame = {
  schema: 1;
  kind: "frame";
  campaign_id: string;
  provider: "MOCK";
  model: "local-placeholder-v0";
  status: "queued" | "completed" | "failed" | "cancelled";
  composition: "wide" | "portrait" | "location" | "item";
  basis: FrameBasis;
  prompt: string;
  art: MockArt;
  resultAssetId: string | null;
};
export type VisualMetadata = VisualReference | VisualFrame;
export class VisualFrameError extends Error {
  code: "validation" | "conflict" | "not_found";
  constructor(code: VisualFrameError["code"]) {
    super(code);
    this.code = code;
  }
}
const fail = (code: VisualFrameError["code"] = "validation"): never => {
  throw new VisualFrameError(code);
};
const uuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length <= max;
const integer = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;
function keys(
  value: unknown,
  names: string[],
): value is Record<string, unknown> {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === names.length &&
    names.every((name) => Object.hasOwn(value, name)),
  );
}
const arts = ["landscape", "portrait", "object", "abstract"];
export function isVisualFrameDocument(
  record: Pick<DocumentRecord, "body">,
): boolean {
  return record.body.startsWith(VISUAL_FRAME_PREFIX.trimEnd());
}
export function serializeVisualMetadata(value: VisualMetadata): string {
  return VISUAL_FRAME_PREFIX + JSON.stringify(value);
}
export function parseVisualMetadata(
  record: Pick<DocumentRecord, "body">,
): VisualMetadata | null {
  if (!isVisualFrameDocument(record) || record.body.length > 60000) return null;
  try {
    const v = JSON.parse(record.body.slice(VISUAL_FRAME_PREFIX.length));
    if (v.schema !== 1 || !uuid(v.campaign_id)) return null;
    if (v.kind === "reference") {
      if (
        !keys(v, [
          "schema",
          "kind",
          "campaign_id",
          "subject",
          "sourceRevision",
          "label",
          "appearance",
          "outfit",
          "guidance",
          "art",
          "imageAssetId",
          "imageAssetRevision",
          "approval",
        ]) ||
        !keys(v.subject, ["kind", "id"]) ||
        !["entity", "location", "item", "style"].includes(
          String(v.subject.kind),
        ) ||
        !uuid(v.subject.id) ||
        !integer(v.sourceRevision) ||
        !text(v.label, 200) ||
        !v.label.trim() ||
        !text(v.appearance, 1600) ||
        !text(v.outfit, 800) ||
        !text(v.guidance, 1200) ||
        !arts.includes(String(v.art)) ||
        !["draft", "approved", "invalidated"].includes(String(v.approval)) ||
        !(
          (v.imageAssetId === null && v.imageAssetRevision === null) ||
          (uuid(v.imageAssetId) && integer(v.imageAssetRevision))
        )
      )
        return null;
      return v as VisualReference;
    }
    if (
      v.kind !== "frame" ||
      !keys(v, [
        "schema",
        "kind",
        "campaign_id",
        "provider",
        "model",
        "status",
        "composition",
        "basis",
        "prompt",
        "art",
        "resultAssetId",
      ]) ||
      v.provider !== "MOCK" ||
      v.model !== "local-placeholder-v0" ||
      !["queued", "completed", "failed", "cancelled"].includes(
        String(v.status),
      ) ||
      !["wide", "portrait", "location", "item"].includes(
        String(v.composition),
      ) ||
      !text(v.prompt, 30000) ||
      !arts.includes(String(v.art)) ||
      !keys(v.basis, ["timeline", "scene", "references"]) ||
      !isTimelineFence(v.basis.timeline) ||
      !keys(v.basis.scene, ["id", "revision", "title", "body"]) ||
      !uuid(v.basis.scene.id) ||
      !integer(v.basis.scene.revision) ||
      !text(v.basis.scene.title, 200) ||
      !text(v.basis.scene.body, 6000) ||
      !Array.isArray(v.basis.references) ||
      v.basis.references.length > 8 ||
      v.basis.references.some(
        (r) =>
          !keys(r, ["documentId", "versionId"]) ||
          !uuid(r.documentId) ||
          !uuid(r.versionId),
      ) ||
      new Set(v.basis.references.map((r) => r.documentId)).size !==
        v.basis.references.length ||
      !(v.status === "completed"
        ? uuid(v.resultAssetId)
        : v.resultAssetId === null)
    )
      return null;
    return v as VisualFrame;
  } catch {
    return null;
  }
}
export function visualSubjects(snapshot: CampaignSnapshot) {
  const cid = snapshot.campaign.id;
  return [
    ...snapshot.entities
      .filter((r) => r.campaign_id === cid)
      .map((r) => ({
        subject: { kind: "entity" as const, id: r.id },
        label: r.name,
        revision: r.revision,
      })),
    ...snapshot.locations
      .filter((r) => r.campaign_id === cid)
      .map((r) => ({
        subject: { kind: "location" as const, id: r.id },
        label: r.name,
        revision: r.revision,
      })),
    ...snapshot.items
      .filter((r) => r.campaign_id === cid)
      .map((r) => ({
        subject: { kind: "item" as const, id: r.id },
        label: r.name,
        revision: r.revision,
      })),
    {
      subject: { kind: "style" as const, id: cid },
      label: snapshot.campaign.title,
      revision: 0,
    },
  ];
}
export function newVisualReference(
  snapshot: CampaignSnapshot,
  subject: VisualSubject,
): VisualReference {
  const source = visualSubjects(snapshot).find(
    (r) => r.subject.kind === subject.kind && r.subject.id === subject.id,
  );
  if (!source) return fail("not_found");
  return {
    schema: 1,
    kind: "reference",
    campaign_id: snapshot.campaign.id,
    subject,
    sourceRevision: source.revision,
    label: source.label,
    appearance: "",
    outfit: "",
    guidance: "",
    art:
      subject.kind === "location"
        ? "landscape"
        : subject.kind === "item"
          ? "object"
          : subject.kind === "entity"
            ? "portrait"
            : "abstract",
    imageAssetId: null,
    imageAssetRevision: null,
    approval: "draft",
  };
}
export function referenceIsCurrent(
  snapshot: CampaignSnapshot,
  reference: VisualReference,
): boolean {
  const source = visualSubjects(snapshot).find(
    (r) =>
      r.subject.kind === reference.subject.kind &&
      r.subject.id === reference.subject.id,
  );
  return (
    reference.campaign_id === snapshot.campaign.id &&
    source?.revision === reference.sourceRevision &&
    (!reference.imageAssetId ||
      snapshot.assets.some(
        (a) =>
          a.campaign_id === reference.campaign_id &&
          a.id === reference.imageAssetId &&
          a.revision === reference.imageAssetRevision &&
          a.kind === "image",
      ))
  );
}
export function visualDocuments(snapshot: CampaignSnapshot) {
  return snapshot.documents
    .filter(
      (r) => r.campaign_id === snapshot.campaign.id && r.status === "reference",
    )
    .flatMap((record) => {
      const value = parseVisualMetadata(record);
      return value && value.campaign_id === snapshot.campaign.id
        ? [{ record, value }]
        : [];
    });
}
export function buildFrame(
  snapshot: CampaignSnapshot,
  sceneId: string,
  referenceIds: string[],
  composition: VisualFrame["composition"],
): VisualFrame {
  if (
    !isTimelineFence(snapshot.timeline) ||
    referenceIds.length > 8 ||
    new Set(referenceIds).size !== referenceIds.length
  )
    return fail();
  const scene = snapshot.scenes.find(
    (r) =>
      r.campaign_id === snapshot.campaign.id &&
      r.id === sceneId &&
      r.role === "narration",
  );
  if (!scene) return fail("not_found");
  if (scene.body.length > 6000) return fail();
  const references = referenceIds.map((id) => {
    const entry = visualDocuments(snapshot).find((r) => r.record.id === id);
    if (
      !entry ||
      entry.value.kind !== "reference" ||
      entry.value.approval !== "approved" ||
      !referenceIsCurrent(snapshot, entry.value)
    )
      return fail("conflict");
    return { record: entry.record, reference: entry.value };
  });
  const prompt = [
    "MOCK preview only. Render no new events or hidden details.",
    `Composition: ${composition}.`,
    `Public scene: ${scene.title}\n${scene.body}`,
    ...references.map(
      ({ reference: r }) =>
        `Owner-approved public visual reference: ${r.label}\nAppearance: ${r.appearance}\nOutfit/variant: ${r.outfit}\nVisual guidance: ${r.guidance}`,
    ),
  ].join("\n\n");
  if (prompt.length > 30000) return fail();
  return {
    schema: 1,
    kind: "frame",
    campaign_id: snapshot.campaign.id,
    provider: "MOCK",
    model: "local-placeholder-v0",
    status: "queued",
    composition,
    basis: {
      timeline: snapshot.timeline,
      scene: {
        id: scene.id,
        revision: scene.revision,
        title: scene.title,
        body: scene.body,
      },
      references: references.map((r) => ({
        documentId: r.record.id,
        versionId: r.record.current_version_id,
      })),
    },
    prompt,
    art:
      composition === "portrait"
        ? "portrait"
        : composition === "item"
          ? "object"
          : "landscape",
    resultAssetId: null,
  };
}
export function frameIsCurrent(
  snapshot: CampaignSnapshot,
  frame: VisualFrame,
): boolean {
  try {
    if (!sameTimeline(snapshot.timeline, frame.basis.timeline)) return false;
    const rebuilt = buildFrame(
      snapshot,
      frame.basis.scene.id,
      frame.basis.references.map((r) => r.documentId),
      frame.composition,
    );
    return (
      JSON.stringify(rebuilt.basis) === JSON.stringify(frame.basis) &&
      rebuilt.prompt === frame.prompt &&
      rebuilt.art === frame.art
    );
  } catch {
    return false;
  }
}
export function visualDocumentMutation(
  snapshot: CampaignSnapshot,
  value: VisualMetadata,
  record?: DocumentRecord,
): Extract<MutationInput, { operation: "document.save" }> {
  if (
    value.campaign_id !== snapshot.campaign.id ||
    (record && record.campaign_id !== snapshot.campaign.id)
  )
    return fail();
  return {
    operation: "document.save",
    campaignId: snapshot.campaign.id,
    timeline: snapshot.timeline,
    correctionScope: "campaign",
    expectedRevision: record?.revision ?? 0,
    payload: {
      ...(record ? { id: record.id } : {}),
      title:
        value.kind === "reference"
          ? `Visual reference: ${value.label}`.slice(0, 200)
          : `MOCK FRAME: ${value.basis.scene.title}`.slice(0, 200),
      status: "reference",
      body: serializeVisualMetadata(value),
    },
  };
}
export function mockAssetMutation(
  snapshot: CampaignSnapshot,
  record: DocumentRecord,
  frame: VisualFrame,
): Extract<MutationInput, { operation: "asset.save" }> {
  return {
    operation: "asset.save",
    campaignId: snapshot.campaign.id,
    timeline: snapshot.timeline,
    expectedRevision: 0,
    payload: {
      title: `MOCK FRAME: ${frame.basis.scene.title}`.slice(0, 200),
      kind: "image",
      storage_path: null,
      description:
        MOCK_ASSET_PREFIX +
        JSON.stringify({
          campaign_id: snapshot.campaign.id,
          job_document_id: record.id,
          job_version_id: record.current_version_id,
          scene_id: frame.basis.scene.id,
          scene_revision: frame.basis.scene.revision,
          provider: "MOCK",
          model: "local-placeholder-v0",
          art: frame.art,
        }),
    },
  };
}
export function mockArtForAsset(
  asset: Pick<Asset, "description" | "kind" | "storage_path">,
): MockArt | null {
  if (
    asset.kind !== "image" ||
    asset.storage_path !== null ||
    !asset.description.startsWith(MOCK_ASSET_PREFIX)
  )
    return null;
  try {
    const data = JSON.parse(asset.description.slice(MOCK_ASSET_PREFIX.length));
    return data.provider === "MOCK" &&
      data.model === "local-placeholder-v0" &&
      arts.includes(data.art)
      ? data.art
      : null;
  } catch {
    return null;
  }
}
function identical(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
/** Public snapshot-only preflight. Persistence still owns optimistic revision, timeline and receipt authority. */
export function validateVisualMutation(
  snapshot: CampaignSnapshot,
  input: MutationInput,
): void {
  if (
    !("campaignId" in input) ||
    input.campaignId !== snapshot.campaign.id ||
    !sameTimeline(snapshot.timeline, input.timeline)
  )
    return fail("conflict");
  if (input.operation === "asset.save") {
    if (
      input.expectedRevision !== 0 ||
      input.payload.id ||
      input.payload.storage_path !== null ||
      input.payload.kind !== "image"
    )
      return fail();
    let metadata: Record<string, unknown>;
    try {
      metadata = JSON.parse(
        input.payload.description.slice(MOCK_ASSET_PREFIX.length),
      );
    } catch {
      return fail();
    }
    const entry = visualDocuments(snapshot).find(
      (r) => r.record.id === metadata.job_document_id,
    );
    if (
      !entry ||
      entry.value.kind !== "frame" ||
      entry.value.status !== "queued" ||
      !frameIsCurrent(snapshot, entry.value)
    )
      return fail("conflict");
    if (
      !identical(mockAssetMutation(snapshot, entry.record, entry.value), input)
    )
      return fail();
    return;
  }
  if (
    input.operation !== "document.save" ||
    input.correctionScope !== "campaign" ||
    input.payload.status !== "reference"
  )
    return fail();
  const value = parseVisualMetadata(input.payload);
  if (!value || value.campaign_id !== snapshot.campaign.id) return fail();
  const old = input.payload.id
    ? snapshot.documents.find(
        (r) =>
          r.campaign_id === snapshot.campaign.id && r.id === input.payload.id,
      )
    : undefined;
  const previous = old ? parseVisualMetadata(old) : null;
  if (
    input.payload.id &&
    (!old ||
      !previous ||
      old.status !== "reference" ||
      old.id === snapshot.dmGuideDocumentId)
  )
    return fail("not_found");
  if (input.expectedRevision !== (old?.revision ?? 0)) return fail("conflict");
  if (value.kind === "reference") {
    if (!referenceIsCurrent(snapshot, value)) return fail("conflict");
    if (
      previous &&
      (previous.kind !== "reference" ||
        !identical(previous.subject, value.subject))
    )
      return fail();
    if (value.approval === "approved") {
      if (
        !previous ||
        previous.kind !== "reference" ||
        !identical({ ...previous, approval: "approved" }, value)
      )
        return fail();
    }
  } else if (!old) {
    if (
      !identical(
        buildFrame(
          snapshot,
          value.basis.scene.id,
          value.basis.references.map((r) => r.documentId),
          value.composition,
        ),
        value,
      )
    )
      return fail();
  } else {
    if (
      !previous ||
      previous.kind !== "frame" ||
      previous.status !== "queued" ||
      !["completed", "failed", "cancelled"].includes(value.status) ||
      !identical(
        {
          ...previous,
          status: value.status,
          resultAssetId: value.resultAssetId,
        },
        value,
      )
    )
      return fail();
    if (value.status === "completed") {
      if (!frameIsCurrent(snapshot, value)) return fail("conflict");
      const asset = snapshot.assets.find(
        (a) =>
          a.id === value.resultAssetId &&
          a.campaign_id === snapshot.campaign.id,
      );
      if (
        !asset ||
        !identical(
          asset.description,
          mockAssetMutation(snapshot, old, previous).payload.description,
        )
      )
        return fail();
    }
  }
  if (!identical(visualDocumentMutation(snapshot, value, old), input))
    return fail();
}
