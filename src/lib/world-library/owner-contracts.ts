import type { PackBody, SourceBody, CompilerJobBody } from "./types.ts";

// These DTOs belong exclusively to the authenticated owner's authoring workspace.
// They must never be joined to a public campaign response.
export type OwnerSourceSummary = {
  id: string;
  versionId: string;
  version: number;
  title: string;
  format: SourceBody["format"];
  visibility: SourceBody["visibility"];
  knowledge: "source" | "future_source";
  digest: string;
  provenance?: Omit<NonNullable<SourceBody["provenance"]>, "authoredBy">;
};
export type OwnerPackSummary = {
  id: string;
  versionId: string;
  version: number;
  title: string;
  status: PackBody["status"];
  sourceVersionIds: string[];
};
export type OwnerJobSummary = {
  id: string;
  versionId: string;
  version: number;
  packId: string;
  status: CompilerJobBody["status"];
  maxUnits: number;
  checkpoints: CompilerJobBody["checkpoints"];
  errorCode: CompilerJobBody["errorCode"];
  mode?: "assisted";
  executionProfile?: NonNullable<
    CompilerJobBody["assistance"]
  >["executionProfile"];
  refinement?: NonNullable<CompilerJobBody["assistance"]>["refinement"];
  requestPending?: boolean;
};
export type OwnerLibraryIndex = {
  sources: OwnerSourceSummary[];
  packs: OwnerPackSummary[];
  jobs: OwnerJobSummary[];
};
export type OwnerSourceDetail = OwnerSourceSummary & {
  text: string | null;
  author: string | null;
  history: OwnerSourceSummary[];
};
export type OwnerPackDetail = OwnerPackSummary & {
  body: PackBody;
  history: OwnerPackSummary[];
  evidence: {
    claimId: string;
    sourceTitle: string;
    sourceVersionId: string;
    locator: string;
    digest: string;
    excerpt: string;
  }[];
};
export type OwnerLibraryResult = {
  kind: "source" | "pack" | "compiler_job";
  id: string;
  versionId: string;
};

// All changes carry a stable operation ID; edits also pin their immutable predecessor.
export type OwnerSourceInput = {
  action: "source.save";
  operationId: string;
  sourceId: string | null;
  expectedVersionId: string | null;
  title: string;
  format: "txt" | "md";
  text: string;
  author: string | null;
  visibility: "public" | "private";
  knowledge: "source" | "future_source";
};
export type OwnerCompileInput = {
  action: "compiler.start";
  operationId: string;
  sourcePriority: string[];
  maxUnits: number;
  mode?: "deterministic" | "assisted";
};
export type OwnerDescribeInput = {
  action: "source.describe";
  operationId: string;
  sourceId: string | null;
  expectedVersionId: string | null;
  title: string;
  text: string;
  language: "en" | "ru";
  visibility: "public" | "private";
  knowledge: "source" | "future_source";
};
export type OwnerRefineInput = {
  action: "pack.refine";
  operationId: string;
  expectedVersionId: string;
  text: string;
  maxUnits: number;
};
export type OwnerCompilerRetryInput = {
  action: "compiler.retry";
  operationId: string;
  expectedVersionId: string;
};
export type OwnerCompilerStepInput = {
  action: "compiler.step";
  operationId: string;
  expectedVersionId: string;
};
export type OwnerPackEdit = Pick<
  PackBody["claims"][number],
  | "id"
  | "text"
  | "origin"
  | "epistemic"
  | "visibility"
  | "knowledge"
  | "validFrom"
  | "validUntil"
  | "knownByEntityIds"
  | "uncertainty"
>;
export type OwnerPackSaveInput = {
  action: "pack.save";
  operationId: string;
  expectedVersionId: string;
  title: string;
  claims: OwnerPackEdit[];
  resolutions: { id: string; resolution: string | null }[];
  rejectedClaimIds?: string[];
  // IDs only address existing entries; membership and references cannot change.
  entities?: Pick<
    PackBody["entities"][number],
    "id" | "name" | "kind" | "aliases"
  >[];
  unknownNotes?: { id: string; note: string | null }[];
};
export type OwnerPackApproveInput = {
  action: "pack.approve";
  operationId: string;
  expectedVersionId: string;
  reviewedConflictIds: string[];
  reviewedUnknownIds: string[];
  acknowledgeCoverage: boolean;
  canonClaimIds: string[];
};
export type OwnerLibraryCommand =
  | OwnerSourceInput
  | OwnerDescribeInput
  | OwnerRefineInput
  | OwnerCompilerRetryInput
  | OwnerCompileInput
  | OwnerCompilerStepInput
  | OwnerPackSaveInput
  | OwnerPackApproveInput;
export type OwnerLibraryDraftCommand = OwnerLibraryCommand extends infer T
  ? T extends OwnerLibraryCommand
    ? Omit<T, "operationId">
    : never
  : never;
