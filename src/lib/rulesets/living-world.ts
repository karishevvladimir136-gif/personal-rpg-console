import { stableGameplayId } from "../gameplay/dice.ts";
import type { MechanicsResolution } from "../gameplay/server-contracts.ts";
import {
  ensure,
  integer,
  list,
  literal,
  nullable,
  object,
  text,
  unique,
  uuid,
} from "../world-library/validation.ts";
import type {
  LivingWorldProposal,
  WorldLogicInput,
} from "./world-logic-contracts.ts";

const categories = [
  "tavern",
  "inn",
  "blacksmith",
  "brothel",
  "bathhouse",
  "stable",
  "market_stall",
  "street",
  "alley",
  "shop",
] as const;
const uncertainties = [
  "resolved",
  "missing_evidence",
  "contradiction",
  "unsupported",
] as const;

export function parseLivingWorldProposal(value: unknown): LivingWorldProposal {
  const v = object(value, [
    "schemaVersion",
    "actorId",
    "input",
    "uncertainty",
    "circumstanceRefs",
    "evidenceIndexes",
    "kind",
    "anchorLocationId",
    "destinationId",
    "name",
    "category",
    "vicinity",
  ]);
  ensure(v.schemaVersion === 3);
  ensure(v.destinationId === null);
  const name = nullable(v.name, (raw) => text(raw, 120));
  if (name !== null)
    ensure(/^[\p{L}\p{N}][\p{L}\p{N} .'\-]{0,119}$/u.test(name));
  return {
    schemaVersion: 3,
    actorId: uuid(v.actorId),
    input: text(v.input, 12000),
    uncertainty: literal(v.uncertainty, uncertainties),
    circumstanceRefs: unique(
      list(v.circumstanceRefs, (raw) => text(raw, 100), 4),
    ),
    evidenceIndexes: unique(
      list(v.evidenceIndexes, (raw) => integer(raw, 0, 31), 4),
    ),
    kind: literal(v.kind, ["location.establish"] as const),
    anchorLocationId: nullable(v.anchorLocationId, uuid),
    destinationId: null,
    name,
    category: nullable(v.category, (raw) => literal(raw, categories)),
    vicinity: nullable(v.vicinity, (raw) =>
      literal(raw, ["nearby", "same_street"] as const),
    ),
  };
}

export function livingWorldLocationId(operationId: string): string {
  return stableGameplayId(operationId, "living-world:location");
}

export function livingWorldDescription(
  language: string,
  category: NonNullable<LivingWorldProposal["category"]>,
  vicinity: NonNullable<LivingWorldProposal["vicinity"]>,
  anchorName: string,
): string {
  const english = category.replaceAll("_", " ");
  if (language === "ru") {
    const russian: Record<(typeof categories)[number], string> = {
      tavern: "таверна",
      inn: "постоялый двор",
      blacksmith: "кузница",
      brothel: "бордель",
      bathhouse: "баня",
      stable: "конюшня",
      market_stall: "рыночная лавка",
      street: "улица",
      alley: "переулок",
      shop: "магазин",
    };
    return `Обычное общественное место (${russian[category]}) ${vicinity === "same_street" ? "на той же улице, что и" : "рядом с"} ${anchorName}.`;
  }
  return `An ordinary public ${english} ${vicinity === "same_street" ? "on the same street as" : "near"} ${anchorName}.`;
}

export function resolveLivingWorld(
  input: WorldLogicInput,
  proposal: LivingWorldProposal,
  circumstances: readonly { id: string }[],
  controlledActorIds: readonly string[],
):
  | { status: "paused"; reason: "uncertainty" | "unsupported" }
  | {
      status: "mundane";
      proposal: LivingWorldProposal;
      resolution: MechanicsResolution;
    } {
  ensure(
    proposal.input === input.input.input &&
      controlledActorIds.includes(proposal.actorId),
  );
  ensure(proposal.evidenceIndexes.length === 0);
  ensure(
    proposal.circumstanceRefs.every((ref) =>
      circumstances.some((c) => c.id === ref),
    ),
  );
  const current = input.source.snapshot.publicState.current_location_id;
  ensure(current !== null && proposal.anchorLocationId === current);
  ensure(
    proposal.circumstanceRefs.length === 1 &&
      proposal.circumstanceRefs[0] === `location:${current}`,
  );
  if (proposal.uncertainty !== "resolved") {
    ensure(
      proposal.name === null &&
        proposal.category === null &&
        proposal.vicinity === null &&
        proposal.destinationId === null,
    );
    return {
      status: "paused",
      reason:
        proposal.uncertainty === "unsupported" ? "unsupported" : "uncertainty",
    };
  }
  const anchor = input.source.snapshot.locations.find(
    (row) =>
      row.id === current && row.campaign_id === input.snapshot.campaignId,
  );
  ensure(anchor && ["known", "visited"].includes(anchor.status));
  const language = input.source.snapshot.campaign.language;
  const resolution: MechanicsResolution = {
    changes: [],
    worldMinutes: input.snapshot.worldMinutes,
    configuration: input.source.runtime.configuration,
    outcomes: [],
  };
  ensure(
    proposal.name !== null &&
      proposal.category !== null &&
      proposal.vicinity !== null,
  );
  ensure(
    !input.source.snapshot.locations.some(
      (row) =>
        row.campaign_id === input.snapshot.campaignId &&
        row.name.toLocaleLowerCase() === proposal.name!.toLocaleLowerCase(),
    ),
  );
  const description = livingWorldDescription(
    language,
    proposal.category,
    proposal.vicinity,
    anchor.name,
  );
  const id = livingWorldLocationId(input.command.operationId);
  resolution.changes.push({
    family: "locations",
    id,
    expectedRevision: null,
    values: { name: proposal.name, description, status: "known" },
  });
  resolution.outcomes.push({
    kind: "living.location.established",
    entityIds: [proposal.actorId],
    itemIds: [],
    text: `${proposal.name}. ${description}`,
  });
  return { status: "mundane", proposal, resolution };
}
