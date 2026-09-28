import type {
  DocumentVersion,
  Mutation,
  MutationResult,
} from "../persistence/contracts.ts";
import { loadVersions, readJson } from "../persistence/client.ts";
export type BelongingTransport = {
  save: (input: Mutation) => Promise<MutationResult>;
  history: (
    campaignId: string,
    documentId: string,
  ) => Promise<DocumentVersion[]>;
};
export const belongingTransport: BelongingTransport = {
  save: (input) =>
    readJson<MutationResult>("/api/places-belonging", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  history: loadVersions,
};
