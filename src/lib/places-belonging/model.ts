import type {
  CampaignSnapshot,
  DocumentRecord,
  DocumentVersion,
  Location,
  Mutation,
  MutationInput,
} from "../persistence/contracts.ts";
import { isUuid, validateMutation } from "../persistence/validation.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { sameTimeline } from "../saves/client-state.ts";

export const belongingMarker =
  "Personal RPG Console · Places of Belonging · v1\n";
export const placeRoles = [
  "home",
  "camp",
  "base",
  "ship",
  "tavern",
  "other",
] as const;
export type PlaceRole = (typeof placeRoles)[number];
export type BelongingFields = {
  label: string;
  role: PlaceRole;
  belonging: string;
  returnNote: string;
  historyNote: string;
};
export type BelongingAnnotation = BelongingFields & {
  kind: "places-belonging";
  schema: 1;
  campaignId: string;
  locationId: string;
  locationRevision: number;
};
export class BelongingError extends Error {
  readonly code: "validation" | "conflict" | "not_found";
  constructor(code: "validation" | "conflict" | "not_found" = "validation") {
    super(code);
    this.code = code;
  }
}
const keys = [
  "kind",
  "schema",
  "campaignId",
  "locationId",
  "locationRevision",
  "label",
  "role",
  "belonging",
  "returnNote",
  "historyNote",
];
function bounded(
  value: unknown,
  max: number,
  required = false,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= max &&
    (!required || value.trim().length > 0)
  );
}
export function parseBelonging(body: unknown): BelongingAnnotation | null {
  if (
    typeof body !== "string" ||
    !body.startsWith(belongingMarker) ||
    body.length > 50_000
  )
    return null;
  try {
    const a = JSON.parse(body.slice(belongingMarker.length));
    if (
      !a ||
      typeof a !== "object" ||
      Array.isArray(a) ||
      Object.keys(a).length !== keys.length ||
      keys.some((key) => !Object.hasOwn(a, key))
    )
      return null;
    if (
      a.kind !== "places-belonging" ||
      a.schema !== 1 ||
      !isUuid(a.campaignId) ||
      !isUuid(a.locationId) ||
      !Number.isSafeInteger(a.locationRevision) ||
      a.locationRevision < 1 ||
      !placeRoles.includes(a.role) ||
      !bounded(a.label, 160, true) ||
      !bounded(a.belonging, 2400) ||
      !bounded(a.returnNote, 2400) ||
      !bounded(a.historyNote, 2400)
    )
      return null;
    // Construct a fresh allowlisted object; metadata cannot smuggle additional state.
    return {
      kind: "places-belonging",
      schema: 1,
      campaignId: a.campaignId,
      locationId: a.locationId,
      locationRevision: a.locationRevision,
      label: a.label,
      role: a.role,
      belonging: a.belonging,
      returnNote: a.returnNote,
      historyNote: a.historyNote,
    };
  } catch {
    return null;
  }
}
// Marker guard deliberately also recognizes malformed reserved bodies. General
// Library rendering must not display internal IDs/JSON while Home fails closed.
export function isBelongingDocument(
  document: Pick<DocumentRecord, "body">,
): boolean {
  return (
    typeof document.body === "string" &&
    document.body.startsWith(belongingMarker)
  );
}
export function encodeBelonging(annotation: BelongingAnnotation): string {
  const body = belongingMarker + JSON.stringify(annotation);
  if (!parseBelonging(body)) throw new BelongingError();
  return body;
}
export function eligibleLocations(snapshot: CampaignSnapshot): Location[] {
  return snapshot.locations.filter(
    (l) =>
      l.campaign_id === snapshot.campaign.id &&
      isUuid(l.id) &&
      Number.isSafeInteger(l.revision) &&
      l.revision > 0 &&
      (l.status === "known" || l.status === "visited"),
  );
}
export type BelongingEntry = {
  documentId: string;
  documentRevision: number;
  location: Location;
  annotation: BelongingAnnotation | null;
  needsReview: boolean;
};
export function belongingEntries(snapshot: CampaignSnapshot): BelongingEntry[] {
  const locations = eligibleLocations(snapshot);
  return snapshot.documents.flatMap((d) => {
    if (
      d.campaign_id !== snapshot.campaign.id ||
      d.status !== "reference" ||
      d.id === snapshot.dmGuideDocumentId
    )
      return [];
    const a = parseBelonging(d.body);
    if (!a || a.campaignId !== snapshot.campaign.id) return [];
    const location = locations.find((l) => l.id === a.locationId);
    if (!location) return [];
    const needsReview = location.revision !== a.locationRevision;
    return [
      {
        documentId: d.id,
        documentRevision: d.revision,
        location,
        annotation: needsReview ? null : a,
        needsReview,
      },
    ];
  });
}
export function belongingFields(a: BelongingFields): BelongingFields {
  return {
    label: a.label,
    role: a.role,
    belonging: a.belonging,
    returnNote: a.returnNote,
    historyNote: a.historyNote,
  };
}
export function emptyBelonging(location: Location): BelongingFields {
  return {
    label: location.name.slice(0, 160),
    role: "home",
    belonging: "",
    returnNote: "",
    historyNote: "",
  };
}
export function belongingSave(
  snapshot: CampaignSnapshot,
  location: Location,
  fields: BelongingFields,
  record?: Pick<DocumentRecord, "id" | "revision" | "campaign_id">,
): MutationInput {
  if (
    snapshot.campaign.id !== location.campaign_id ||
    !eligibleLocations(snapshot).some(
      (l) => l.id === location.id && l.revision === location.revision,
    )
  )
    throw new BelongingError("conflict");
  if (record && record.campaign_id !== snapshot.campaign.id)
    throw new BelongingError();
  return {
    operation: "document.save",
    campaignId: snapshot.campaign.id,
    timeline: snapshot.timeline,
    correctionScope: "campaign",
    expectedRevision: record?.revision ?? 0,
    payload: {
      ...(record ? { id: record.id } : {}),
      title: fields.label,
      status: "reference",
      body: encodeBelonging({
        kind: "places-belonging",
        schema: 1,
        campaignId: snapshot.campaign.id,
        locationId: location.id,
        locationRevision: location.revision,
        ...belongingFields(fields),
      }),
    },
  };
}
// Route preflight is an extra reference-boundary check. Persistence still owns
// authorization, idempotency, immutable versions, corrections and commit fences.
export function prepareBelongingMutation(
  value: unknown,
  snapshot: CampaignSnapshot,
): Mutation {
  let mutation: Mutation;
  try {
    mutation = validateMutation(value);
  } catch {
    throw new BelongingError();
  }
  if (
    mutation.operation !== "document.save" ||
    mutation.campaignId !== snapshot.campaign.id ||
    mutation.payload.status !== "reference" ||
    mutation.correctionScope !== "campaign" ||
    !isTimelineFence(mutation.timeline)
  )
    throw new BelongingError();
  if (!sameTimeline(mutation.timeline, snapshot.timeline))
    throw new BelongingError("conflict");
  const a = parseBelonging(mutation.payload.body);
  if (
    !a ||
    a.campaignId !== mutation.campaignId ||
    mutation.payload.title !== a.label
  )
    throw new BelongingError();
  const l = eligibleLocations(snapshot).find((row) => row.id === a.locationId);
  if (!l) throw new BelongingError("not_found");
  if (l.revision !== a.locationRevision) throw new BelongingError("conflict");
  if (mutation.payload.id) {
    const document = snapshot.documents.find(
      (d) =>
        d.id === mutation.payload.id && d.campaign_id === mutation.campaignId,
    );
    if (
      !document ||
      document.id === snapshot.dmGuideDocumentId ||
      document.status !== "reference"
    )
      throw new BelongingError("not_found");
    const existing = parseBelonging(document.body);
    if (!existing || existing.campaignId !== mutation.campaignId)
      throw new BelongingError();
  }
  return mutation;
}
export type BelongingHistoryEntry = {
  id: string;
  version: number;
  createdAt: string;
  annotation: BelongingAnnotation;
  locationName: string;
};
export function belongingHistory(
  snapshot: CampaignSnapshot,
  documentId: string,
  versions: DocumentVersion[],
): BelongingHistoryEntry[] {
  if (
    !snapshot.documents.some(
      (d) =>
        d.id === documentId &&
        d.campaign_id === snapshot.campaign.id &&
        d.status === "reference" &&
        isBelongingDocument(d),
    )
  )
    return [];
  const locations = eligibleLocations(snapshot);
  return versions
    .flatMap((v) => {
      if (
        v.document_id !== documentId ||
        v.campaign_id !== snapshot.campaign.id ||
        v.status !== "reference"
      )
        return [];
      const a = parseBelonging(v.body);
      const location =
        a && a.campaignId === snapshot.campaign.id
          ? locations.find((l) => l.id === a.locationId)
          : null;
      return a && location
        ? [
            {
              id: v.id,
              version: v.version,
              createdAt: v.created_at,
              annotation: a,
              locationName: location.name,
            },
          ]
        : [];
    })
    .sort((a, b) => b.version - a.version);
}
export function currentPlaceContext(
  snapshot: CampaignSnapshot,
  locationId: string,
) {
  const l = eligibleLocations(snapshot).find((row) => row.id === locationId);
  if (
    !l ||
    snapshot.publicState.campaign_id !== snapshot.campaign.id ||
    snapshot.publicState.current_location_id !== l.id
  )
    return null;
  const scene = snapshot.scenes.find(
    (s) =>
      s.campaign_id === snapshot.campaign.id &&
      s.id === snapshot.publicState.current_scene_id,
  );
  return {
    summary: snapshot.publicState.summary,
    scene: scene ? { title: scene.title, body: scene.body } : null,
  };
}
