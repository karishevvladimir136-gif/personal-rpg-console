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
/** Public owner-reviewed identity, not a second combat or spell authority. */
export type CharacterSheetV1 = {
  schemaVersion: 1;
  mode: "structured_rpg" | "narrative";
  role: string | null;
  background: string;
  level: number | null;
  tier: string | null;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  } | null;
  skills: string[];
  abilities: string[];
  limitations: string[];
  spells: string[];
};
export type CreationMechanics = {
  hp: number;
  attack: number;
  defense: number;
  skill: number;
  weaponName: string | null;
  weaponDamage: number | null;
};
type CreationProposalBase = {
  capabilities: CreationFact[];
  limitations: CreationFact[];
  possessions: CreationPossession[];
  resources: CreationResource[];
  questions: BootstrapQuestion[];
};
export type CreationProposal = CreationProposalBase &
  ({ schemaVersion: 1 } | {
    schemaVersion: 2;
    sheet: CharacterSheetV1;
    mechanics: CreationMechanics | null;
  });
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
  /** Optional for historic v1 drafts. Explicitly approved on new v2 drafts. */
  sheet?: CharacterSheetV1;
  /** Explicit owner-reviewed mechanics; absent reviews retain historical no-HP creation. */
  mechanics?: CreationMechanics;
};
// Only additional NEW visible non-player people/creatures. The existing
// protagonist is placed by authority, never recreated from this array.
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
