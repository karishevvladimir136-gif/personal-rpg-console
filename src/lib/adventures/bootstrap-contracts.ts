import type { AdventureCommand, NewHeroResult } from "./contracts.ts";

// Browser-safe authoring data. No identifiers, state patches or knowledge grants
// belong in model proposals. The existing server authorities materialize review.
export type BootstrapQuestion = { question: string; consequential: boolean };
export type CreationFact = { text: string; quote: string };
export type CreationPossession = {
  name: string;
  description: string;
  quantity: number | null;
  quote: string;
};
export type CreationResource = {
  key: string;
  label: string;
  amount: number | null;
  quote: string;
};
export type CreationProposal = {
  schemaVersion: 1;
  capabilities: CreationFact[];
  limitations: CreationFact[];
  possessions: CreationPossession[];
  resources: CreationResource[];
  questions: BootstrapQuestion[];
};
export type CreationInput = {
  requestId: string;
  worldId: string;
  worldVersion: number;
  title: string;
  language: "en" | "ru";
  name: string;
  description: string;
};
export type CreationReview = {
  name: string;
  description: string;
  capabilities: string[];
  limitations: string[];
  possessions: Omit<CreationPossession, "quote">[];
  resources: Omit<CreationResource, "quote">[];
  answers: (string | null)[];
};
export type OpeningActor = {
  name: string;
  description: string;
  capabilities: string[];
  limitations: string[];
};
export type OpeningProposal = {
  schemaVersion: 1;
  location: { name: string | null; description: string | null };
  situation: string | null;
  narration: string | null;
  actors: OpeningActor[];
  questions: BootstrapQuestion[];
};
export type OpeningReview = Omit<
  OpeningProposal,
  "schemaVersion" | "questions"
> & {
  answers: (string | null)[];
  publicOpeningConfirmed: boolean;
};
export type StartCommand = Extract<AdventureCommand, { action: "start" }>;
export type BootstrapCommand =
  | { action: "creation.propose"; input: CreationInput }
  | {
      action: "creation.commit";
      input: { requestId: string; draftId: string; review: CreationReview };
    }
  | { action: "opening.propose"; input: StartCommand }
  | {
      action: "opening.commit";
      input: {
        requestId: string;
        campaignId: string;
        draftId: string;
        review: OpeningReview;
      };
    };
export type BootstrapUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
};
export type CreationDraft = {
  kind: "creation";
  draftId: string;
  input: CreationInput;
  proposal: CreationProposal;
  usage: BootstrapUsage;
};
export type OpeningDraft = {
  kind: "opening";
  draftId: string;
  command: StartCommand;
  proposal: OpeningProposal;
  usage: BootstrapUsage;
};
export type BootstrapDraft = CreationDraft | OpeningDraft;
export type BootstrapTransport = {
  proposeCharacter(input: CreationInput): Promise<CreationDraft>;
  createCharacter(
    input: Extract<BootstrapCommand, { action: "creation.commit" }>["input"],
  ): Promise<NewHeroResult>;
  proposeOpening(command: StartCommand): Promise<OpeningDraft>;
  startOpening(
    input: Extract<BootstrapCommand, { action: "opening.commit" }>["input"],
  ): Promise<import("./contracts.ts").AdventureResult>;
};
