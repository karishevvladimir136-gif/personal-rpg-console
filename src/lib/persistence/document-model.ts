import type {
  DocumentRecord,
  DocumentVersion,
  MutationInput,
} from "./contracts.ts";

export type DocumentDraft = {
  id?: string;
  title: string;
  status: DocumentRecord["status"];
  body: string;
  expectedRevision: number;
};

export function documentDraft(record?: DocumentRecord): DocumentDraft {
  return record
    ? {
        id: record.id,
        title: record.title,
        status: record.status,
        body: record.body,
        expectedRevision: record.revision,
      }
    : { title: "", status: "canon", body: "", expectedRevision: 0 };
}

export function documentSave(
  campaignId: string,
  draft: DocumentDraft,
): MutationInput {
  return {
    operation: "document.save",
    campaignId,
    expectedRevision: draft.expectedRevision,
    payload: {
      ...(draft.id ? { id: draft.id } : {}),
      title: draft.title,
      status: draft.status,
      body: draft.body,
    },
  };
}

export function documentRestore(
  campaignId: string,
  current: DocumentRecord,
  version: DocumentVersion,
): MutationInput {
  if (
    current.campaign_id !== campaignId ||
    version.campaign_id !== campaignId ||
    version.document_id !== current.id
  )
    throw new Error("This version does not belong to this campaign document.");
  return {
    operation: "document.restore",
    campaignId,
    expectedRevision: current.revision,
    payload: { id: current.id, versionId: version.id },
  };
}

export function isDocumentDirty(draft: DocumentDraft, baseline: DocumentDraft) {
  return (
    draft.title !== baseline.title ||
    draft.status !== baseline.status ||
    draft.body !== baseline.body
  );
}

// Only called after the owner explicitly compares a conflict and chooses to keep
// their draft. This prepares a later Save; it does not overwrite anything.
export function rebaseDocumentDraft(
  draft: DocumentDraft,
  current: DocumentRecord,
): DocumentDraft {
  if (draft.id !== current.id) throw new Error("This is a different document.");
  return { ...draft, expectedRevision: current.revision };
}
