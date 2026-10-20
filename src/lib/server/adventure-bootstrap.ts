import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { requireOwner } from "./auth";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { createBootstrapService } from "../adventures/bootstrap-service.ts";
import { createBootstrapProvider } from "./adventure-bootstrap-provider.ts";
import { createHeroDraftProvider } from "./hero-draft-provider.ts";
import { HERO_DRAFT_DM } from "../adventures/hero-draft-request.ts";
import { resolveExecutionProfile } from "../model-runtime/registry.ts";
import { applicationModelSelection } from "../model-runtime/defaults.ts";
import { executionProviderOptions } from "./model-runtime/profiles.ts";
import type { BootstrapCommand } from "../adventures/bootstrap-contracts.ts";
import { astraFirstCreationReviewReady } from "../adventures/astra-startup-review.ts";
import { readDmSettings } from "./dm-settings";
export async function performBootstrap(command: BootstrapCommand) {
  const campaignId =
    command.action === "creation.propose" ||
    command.action === "creation.commit"
      ? null
      : command.action === "opening.propose"
        ? command.input.input.campaignId
        : command.input.campaignId;
  const { user } = campaignId
    ? await authorizeCampaign(campaignId)
    : await requireOwner();
  if (user.id !== process.env.RPG_OWNER_USER_ID)
    throw new PersistenceError("forbidden");
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new PersistenceError("not_configured");
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const rpc = async (action: string, cid: string | null, payload: unknown) => {
    const result = await client.rpc("rpg_bootstrap", {
      p_owner_id: user.id,
      p_campaign_id: cid,
      p_action: action,
      p_payload: payload,
    });
    if (result.error)
      throw new PersistenceError(
        result.error.message?.includes("rpg_conflict")
          ? "conflict"
          : result.error.message?.includes("rpg_forbidden")
            ? "forbidden"
            : result.error.message?.includes("rpg_validation")
              ? "validation"
              : "unavailable",
      );
    return result.data;
  };
  if (process.env.RPG_ASTRA_PRIMARY_P1 === "1" &&
    command.action === "creation.commit" &&
    !astraFirstCreationReviewReady(command.input.review)) {
    // A configuration change cannot invalidate an exact already-committed
    // creation receipt after an uncertain client response. New narrative v2
    // commits remain blocked before proposal inspection or provider work.
    const replay = await rpc("creation_replay_status", null, command.input);
    if ((replay as { approved?: unknown })?.approved !== true)
      throw new PersistenceError("validation");
  }
  return await createBootstrapService(
    rpc,
    // Fix run F (item 20): the hero is built by the campaign's DM in one pass (schema 3); the opening keeps its path.
    (ticket) =>
      ticket.kind === "creation"
        ? createHeroDraftProvider()(ticket)
        : createBootstrapProvider(
            executionProviderOptions(ticket.profile, "world.compose"),
          )(ticket),
    async (cid) => {
      const policy = cid
        ? (
            (await rpc(
              "policy",
              cid,
              {},
            )) as import("../production/contracts.ts").FoundationSnapshot
          ).executionPolicy
        : null;
      // Polish 2 §5 (after polish group 7): the opening is written by the campaign's own DM,
      // whichever provider serves it — the DM's choice outranks the policy's primary here; the
      // app default only when the campaign has no DM choice yet.
      let dmTurn: import("../production/contracts.ts").ModelSelection | null = null;
      if (cid && command.action === "opening.propose") {
        // Polish 3 §2: on a split campaign the opening is written by the campaign's writer model.
        try { const settings = await readDmSettings(cid); dmTurn = settings.split?.writer ?? settings.dmTurn; } catch { dmTurn = null; }
      }
      // Fix run F (item 20): a new hero is drafted by the DM a new campaign gets (the wizard's default, Claude Opus
      // 5.5 at high), not by the app's background OpenAI model.
      const creationDm = !cid && command.action === "creation.propose" ? { ...HERO_DRAFT_DM } : null;
      return resolveExecutionProfile({
        task: "world.compose",
        profileId: randomUUID(),
        campaignPolicy: dmTurn || creationDm ? null : policy,
        globalDefault: dmTurn ?? creationDm ?? applicationModelSelection(process.env),
      });
    },
  ).perform(command);
}
