import type { ExecutionProfile } from "../production/contracts.ts";
import type { ProviderResult } from "../gameplay/server-contracts.ts";
import type { CompilerJobBody, PackBody, TypedRecord } from "./types.ts";

// Model-local keys are resolved into application IDs only after validation.
// The model has no fields for approval, Canon, visibility, knowledge or tools.
export type CompilerCandidate = {
  key: string;
  subjectKey: string;
  kind:
    | "description"
    | "premise"
    | "relationship"
    | "geography"
    | "timeline"
    | "rule";
  predicate: string;
  text: string;
  basis: "quote" | "inference" | "assumption";
  epistemic: "fact" | "rumor" | "lie" | "hypothesis" | "intention" | "unknown";
  evidenceIndexes: number[];
  uncertainty: string | null;
  objectKey: string | null;
  position: string | null;
};
export type CompilerProposal = {
  schemaVersion: 1;
  title: string;
  entities: {
    key: string;
    name: string;
    kind: PackBody["entities"][number]["kind"];
    aliases: string[];
    evidenceIndexes: number[];
  }[];
  candidates: CompilerCandidate[];
  contradictions: { key: string; candidateKeys: string[] }[];
  unknowns: { key: string; question: string; entityKey: string | null }[];
  coverage: {
    sourceVersionId: string;
    evidenceIndexes: number[];
    gaps: string[];
  }[];
};
export type AssistedCompilerInput = {
  operationId: string;
  job: CompilerJobBody;
  sources: TypedRecord<"source">[];
  basePack: TypedRecord<"pack"> | null;
};
export type AssistedCompiler = {
  resolveProfile(): ExecutionProfile;
  compile(
    input: AssistedCompilerInput,
  ): Promise<ProviderResult<CompilerProposal>>;
};
