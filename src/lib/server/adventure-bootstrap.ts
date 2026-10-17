import "server-only";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { requireOwner } from "./auth";
import { authorizeCampaign } from "./campaign-authorization";
import { PersistenceError } from "./errors";
import { createBootstrapService } from "../adventures/bootstrap-service.ts";
import { createBootstrapProvider } from "./adventure-bootstrap-provider.ts";
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
    (ticket) =>
      createBootstrapProvider(
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
      // Polish group 7: the opening is written by the campaign's own DM when that DM is an
      // OpenAI model (the bootstrap contract pins OpenAI models only); otherwise the app default.
      let dmTurn: import("../production/contracts.ts").ModelSelection | null = null;
      if (cid && command.action === "opening.propose") {
        try { dmTurn = (await readDmSettings(cid)).dmTurn; } catch { dmTurn = null; }
      }
      return resolveExecutionProfile({
        task: "world.compose",
        profileId: randomUUID(),
        campaignPolicy: policy,
        globalDefault: dmTurn?.providerId === "openai" ? dmTurn : applicationModelSelection(process.env),
      });
    },
  ).perform(command);
}
