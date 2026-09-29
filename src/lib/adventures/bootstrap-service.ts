import type {
  BootstrapCommand,
  BootstrapDraft,
  CreationInput,
  CreationProposal,
  OpeningProposal,
  StartCommand,
} from "./bootstrap-contracts.ts";
import type { ProviderResult } from "../gameplay/server-contracts.ts";
import type { ExecutionProfile } from "../production/contracts.ts";
import {
  parseCreationInput,
  parseCreationProposal,
  parseCreationReview,
  parseOpeningProposal,
  parseOpeningReview,
  parseBootstrapCommand,
} from "./bootstrap-validation.ts";
import {
  parseWorld,
  parseAdventureCatalog,
  parseAdventureCommand,
} from "./validation.ts";
import { validateExecutionProfile } from "../model-runtime/registry.ts";
import {
  ensure,
  integer,
  object,
  text,
  uuid,
} from "../foundation-loop/fields.ts";
import { matchesCompilerModel } from "../world-library/assisted-parser.ts";

export type BootstrapTicket = {
  kind: "creation" | "opening";
  input: CreationInput | StartCommand;
  world: import("./contracts.ts").PublicWorld;
  profile: ExecutionProfile;
  context: Record<string, unknown>;
};
export type BootstrapRpc = (
  action: string,
  campaignId: string | null,
  payload: unknown,
) => Promise<unknown>;
export type BootstrapProvider = (
  ticket: BootstrapTicket,
) => Promise<ProviderResult<CreationProposal | OpeningProposal>>;
function ticket(value: unknown): BootstrapTicket {
  const v = object(value, ["kind", "input", "world", "profile", "context"]);
  ensure(v.kind === "creation" || v.kind === "opening");
  const input =
    v.kind === "creation"
      ? parseCreationInput(v.input)
      : parseAdventureCommand(v.input);
  ensure(
    v.kind === "creation" || ("action" in input && input.action === "start"),
  );
  ensure(
    v.context && typeof v.context === "object" && !Array.isArray(v.context),
  );
  return {
    kind: v.kind,
    input: input as CreationInput | StartCommand,
    world: parseWorld(v.world),
    profile: validateExecutionProfile(v.profile, "world.compose"),
    context: v.context as Record<string, unknown>,
  };
}
function projection(t: BootstrapTicket, result: unknown): BootstrapDraft {
  const r = result as ProviderResult<unknown>;
  ensure(r && r.usage && typeof r.usage.model === "string");
  ensure(matchesCompilerModel(r.usage.model, t.profile.modelId));
  const usage = {
    model: text(r.usage.model, 100),
    inputTokens: integer(r.usage.inputTokens),
    outputTokens: integer(r.usage.outputTokens),
    latencyMs: integer(r.usage.latencyMs),
  };
  return t.kind === "creation"
    ? {
        kind: "creation",
        draftId: (t.input as CreationInput).requestId,
        input: t.input as CreationInput,
        proposal: parseCreationProposal(r.output, t.input as CreationInput),
        usage,
      }
    : {
        kind: "opening",
        draftId: (t.input as StartCommand).input.requestId,
        command: t.input as StartCommand,
        proposal: parseOpeningProposal(r.output),
        usage,
      };
}
/** Reuses immutable Library/World command receipts. Reservation wins once; an
 * incomplete dispatch can be inspected but can never silently generate again. */
export function createBootstrapService(
  rpc: BootstrapRpc,
  provider: BootstrapProvider,
  resolveProfile: (campaignId: string | null) => Promise<ExecutionProfile>,
) {
  return {
    async perform(value: BootstrapCommand): Promise<unknown> {
      const command = parseBootstrapCommand(value);
      if (
        command.action === "creation.propose" ||
        command.action === "opening.propose"
      ) {
        const creation = command.action === "creation.propose";
        const input = command.input as CreationInput | StartCommand;
        const campaignId = creation
          ? null
          : (input as StartCommand).input.campaignId;
        const kind = creation ? "creation" : "opening";
        // SQL preserves the original pin on an exact repeated request, even if
        // the configured model has subsequently changed.
        const recovered = await rpc(`${kind}.recover`, campaignId, { input });
        const reserved = (recovered ??
          (await rpc(`${kind}.reserve`, campaignId, {
            input,
            profile: await resolveProfile(campaignId),
          }))) as {
          ticket: unknown;
          dispatch: boolean;
          result: unknown | null;
        };
        const pinned = ticket(reserved.ticket);
        if (reserved.result !== null)
          return projection(pinned, reserved.result);
        ensure(reserved.dispatch, "unavailable");
        const draftId = creation
          ? (input as CreationInput).requestId
          : (input as StartCommand).input.requestId;
        try {
          const result = await provider(pinned);
          const draft = projection(pinned, result);
          await rpc(`${kind}.result`, campaignId, { draftId, result });
          return draft;
        } catch {
          // A failed/lost request is evidence, never permission for a retry.
          await rpc(`${kind}.failure`, campaignId, { draftId }).catch(
            () => undefined,
          );
          throw new Error(
            "Bootstrap request unavailable. Inspect the original attempt or explicitly prepare a new proposal.",
          );
        }
      }
      const creation = command.action === "creation.commit";
      const campaignId = creation
        ? null
        : (
            command.input as Extract<
              BootstrapCommand,
              { action: "opening.commit" }
            >["input"]
          ).campaignId;
      const kind = creation ? "creation" : "opening";
      const saved = (await rpc(`${kind}.inspect`, campaignId, {
        draftId: command.input.draftId,
      })) as { ticket: unknown; result: unknown };
      const pinned = ticket(saved.ticket),
        draft = projection(pinned, saved.result);
      if (draft.kind === "creation")
        parseCreationReview(command.input.review, draft.proposal);
      else parseOpeningReview(command.input.review, draft.proposal);
      const result = await rpc(`${kind}.commit`, campaignId, command.input);
      if (creation) {
        const r = object(result, ["requestId", "campaignId", "heroId"]);
        ensure(r.requestId === command.input.requestId);
        return {
          requestId: uuid(r.requestId),
          campaignId: uuid(r.campaignId),
          heroId: uuid(r.heroId),
        };
      }
      const r = object(result, ["requestId", "snapshot"]);
      ensure(r.requestId === command.input.requestId);
      return {
        requestId: uuid(r.requestId),
        snapshot: parseAdventureCatalog(r.snapshot, campaignId!),
      };
    },
  };
}
