import { planLootAction } from "../adventure-loot/planning.ts";
import { readLootObject } from "../adventure-loot/state.ts";
import {
  currencyBalance,
  validateCommerceContext,
  validateCommerceFence,
} from "../commerce/context.ts";
import {
  HAGGLE_EVENT_KIND,
  type HaggleGrantPayload,
} from "../commerce/haggle.ts";
import { createTradeQuote, executeTradeQuote } from "../commerce/trade.ts";
import { validatedItemTransfer } from "../commerce/transfer.ts";
import {
  COMMERCE_LIMITS,
  integer,
  parseCommerceDefinitions,
} from "../commerce/validation.ts";
import type {
  LoopContext,
  LoopPlan,
  TradeQuote,
} from "../foundation-loop/contracts.ts";
import type { FoundationCommand } from "../production/contracts.ts";
import {
  actionMerchant,
  actionSucceeded,
  requireCapability,
  validateActionAuthorization,
} from "./authority.ts";
import { foundationActionContext } from "./context.ts";
import type {
  FoundationActionAuthorization,
  FoundationActionContext,
  FoundationActionProposal,
  TransferOption,
} from "./contracts.ts";
import { parseFoundationActionProposal, requireAction } from "./validation.ts";

function freshPlan(context: LoopContext): LoopPlan {
  const state = structuredClone(context.state);
  state.version = integer(state.version + 1, 1);
  return {
    state,
    world: structuredClone(context.world),
    changes: [],
    events: [],
  };
}

function quoteResult(context: LoopContext, quote: TradeQuote): LoopPlan {
  const russian = context.snapshot.campaign.language === "ru";
  const currency = context.state.currencies.find(
    (c) => c.id === quote.intent.currencyId,
  )!;
  const lines = quote.lines.map((line) => ({
    itemId: line.itemId,
    name: context.snapshot.items.find((item) => item.id === line.itemId)!.name,
    direction: line.direction,
    quantity: line.quantity,
    unitValue: line.unitValue,
    totalValue: line.totalValue,
  }));
  const paymentText =
    quote.payment > 0
      ? russian
        ? `Вы платите: ${quote.payment} ${currency.label}.`
        : `You pay: ${quote.payment} ${currency.label}.`
      : quote.payment < 0
        ? russian
          ? `Вы получаете: ${-quote.payment} ${currency.label}.`
          : `You receive: ${-quote.payment} ${currency.label}.`
        : russian
          ? "Обмен без доплаты."
          : "No currency payment is needed.";
  return {
    state: structuredClone(context.state),
    world: structuredClone(context.world),
    changes: [],
    events: [
      {
        kind: "commerce.quote",
        visibility: "public",
        text: [
          ...lines.map(
            (line) =>
              `${line.quantity} × ${line.name}: ${line.totalValue} ${currency.label}.`,
          ),
          paymentText,
        ].join("\n"),
        actorIds: [quote.intent.playerEntityId, quote.intent.merchantActorId],
        threadIds: [],
        payload: {
          schemaVersion: 1,
          quoteId: quote.id,
          merchantActorId: quote.intent.merchantActorId,
          playerEntityId: quote.intent.playerEntityId,
          currencyId: quote.intent.currencyId,
          payment: quote.payment,
          modifierBasisPoints: quote.modifierBasisPoints,
          lines,
        },
      },
    ],
  };
}

function transferOption(
  options: FoundationActionContext,
  authorization: FoundationActionAuthorization,
  proposal: Extract<FoundationActionProposal, { action: "theft" | "robbery" }>,
  itemId: string | null,
  currencyId: string | null,
  quantity: number,
): TransferOption {
  const option = options.transferOptions.find(
    (candidate) =>
      candidate.action === proposal.action &&
      candidate.merchantActorId === proposal.merchantActorId &&
      candidate.itemId === itemId &&
      candidate.currencyId === currencyId &&
      quantity <= candidate.maximum &&
      (candidate.capability === null ||
        authorization.capabilities.includes(candidate.capability)),
  );
  requireAction(option);
  return option;
}

/** Internal normal Game planner, not a shop/theft endpoint. The turn service
 * resolves its own authorization first, validates/recomputes this whole plan at
 * the fenced atomic commit, and replays an exact committed operation before
 * calling again. It must never commit only a prefix of changes or events. */
export function planFoundationAction(
  context: LoopContext,
  rawCommand: FoundationCommand,
  rawProposal: unknown,
  authorization: FoundationActionAuthorization,
): LoopPlan {
  validateCommerceContext(context);
  const command = validateCommerceFence(context, rawCommand);
  const proposal = parseFoundationActionProposal(rawProposal);
  if (proposal.action === "loot") {
    requireAction(
      proposal.input === authorization.input &&
        proposal.intent.actorId === authorization.actorId &&
        (authorization.profile !== "world_logic" ||
          (authorization.outcome === "completed" &&
            authorization.uncertainty === "resolved")),
    );
    const object = readLootObject(context, proposal.intent.objectId);
    requireAction(object);
    const result = planLootAction(context, command, proposal.intent, {
      policy: object.policy,
      checks: authorization.checks,
    });
    requireAction(result.status === "planned");
    return result.plan;
  }
  const actorId =
    "intent" in proposal
      ? proposal.intent.playerEntityId
      : proposal.playerEntityId;
  const merchantId =
    "intent" in proposal
      ? proposal.intent.merchantActorId
      : proposal.merchantActorId;
  const player = validateActionAuthorization(
    context,
    authorization,
    proposal.input,
    actorId,
  );
  const { merchant, entity } = actionMerchant(context, merchantId, actorId);
  const options = foundationActionContext(context, actorId);
  requireAction(
    options && options.merchants.some((m) => m.actorId === merchantId),
  );
  if ("intent" in proposal) {
    requireAction(authorization.outcome === "completed");
    const stock = options.merchants.find(
      (m) => m.actorId === merchantId,
    )!.stock;
    requireAction(
      proposal.intent.take.every((line) =>
        stock.some((item) => item.id === line.itemId),
      ) &&
        proposal.intent.give.every((line) =>
          options.inventory.some((item) => item.id === line.itemId),
        ),
    );
    const quote = createTradeQuote(
      context,
      command,
      proposal.intent,
      proposal.action === "quote" ? "inquiry" : "transaction",
    );
    requireAction(
      proposal.expectedPayment === null ||
        proposal.expectedPayment === quote.payment,
      "conflict",
    );
    return proposal.action === "quote"
      ? quoteResult(context, quote)
      : executeTradeQuote(context, quote);
  }
  if (proposal.action === "haggle") {
    const option = options.haggleOptions.find(
      (candidate) => candidate.merchantActorId === merchantId,
    );
    requireAction(option);
    if (option.capability !== null)
      requireCapability(context, authorization, option.capability);
    const success = actionSucceeded(
      command,
      authorization,
      merchantId,
      proposal.checkIndex,
    );
    const plan = freshPlan(context);
    if (success) {
      const payload: HaggleGrantPayload = {
        schemaVersion: 1,
        merchantActorId: merchantId,
        playerEntityId: actorId,
        profile: structuredClone(context.state.profile),
        stateVersion: plan.state.version,
        merchantVersion: merchant.version,
        timeline: structuredClone(context.foundation.timeline),
        worldMinutes: context.foundation.worldMinutes,
      };
      plan.events.push({
        kind: HAGGLE_EVENT_KIND,
        visibility: "public",
        actorIds: [actorId, merchantId],
        threadIds: [],
        text:
          context.snapshot.campaign.language === "ru"
            ? "Улучшенные условия согласованы для следующего обмена."
            : "Improved terms are available for the next trade.",
        payload,
      });
    } else
      plan.events.push(
        failedAttempt(context, proposal.action, actorId, merchantId),
      );
    return plan;
  }
  for (const line of proposal.take)
    transferOption(
      options,
      authorization,
      proposal,
      line.itemId,
      null,
      line.quantity,
    );
  if (proposal.currency)
    transferOption(
      options,
      authorization,
      proposal,
      null,
      proposal.currency.currencyId,
      proposal.currency.amount,
    );
  if (proposal.merchantUnavailable) {
    const option = options.merchantUnavailableOptions.find(
      (candidate) => candidate.merchantActorId === merchantId,
    );
    requireAction(proposal.action === "robbery" && option);
    requireCapability(context, authorization, option.capability);
  }
  const success = actionSucceeded(
    command,
    authorization,
    merchantId,
    proposal.checkIndex,
  );
  const plan = freshPlan(context);
  if (success) {
    const transfers = [];
    for (const line of proposal.take) {
      const transfer = validatedItemTransfer(context, command, {
        itemId: line.itemId,
        quantity: line.quantity,
        sourceEntityId: merchant.entityId,
        destinationEntityId: player.entity.id,
        destinationStorageId: player.storage.id,
      });
      plan.changes.push(...transfer.changes);
      const policy = {
        ...transfer.itemPolicy,
        origin: "stolen" as const,
        version: transfer.split
          ? 1
          : integer(transfer.itemPolicy.version + 1, 1),
      };
      if (transfer.split) plan.state.itemPolicies.push(policy);
      else
        plan.state.itemPolicies = plan.state.itemPolicies.map((old) =>
          old.itemId === policy.itemId ? policy : old,
        );
      transfers.push({
        itemId: line.itemId,
        transferredItemId: transfer.transferredItemId,
        quantity: line.quantity,
        sourceEntityId: merchant.entityId,
        origin: "stolen",
      });
    }
    if (proposal.currency) {
      const currency = context.state.currencies.find(
        (c) => c.id === proposal.currency!.currencyId,
      );
      requireAction(
        currency &&
          merchant.usesFunds &&
          merchant.currencyIds.includes(currency.id),
      );
      const playerBalance = currencyBalance(
        player.entity,
        currency.resourceKey,
      );
      const merchantBalance = currencyBalance(entity, currency.resourceKey);
      const amount = proposal.currency.amount;
      requireAction(
        merchantBalance >= amount &&
          playerBalance + amount <= COMMERCE_LIMITS.balance,
      );
      plan.changes.push(
        {
          family: "entities",
          id: player.entity.id,
          expectedRevision: player.entity.revision,
          values: {
            resources: {
              ...player.entity.resources,
              [currency.resourceKey]: playerBalance + amount,
            },
          },
        },
        {
          family: "entities",
          id: entity.id,
          expectedRevision: entity.revision,
          values: {
            resources: {
              ...entity.resources,
              [currency.resourceKey]: merchantBalance - amount,
            },
          },
        },
      );
    }
    plan.events.push({
      kind: "foundation.action_resolved",
      visibility: "public",
      actorIds: [actorId, merchantId],
      threadIds: [],
      text:
        context.snapshot.campaign.language === "ru"
          ? "Запрошенные вещи получены. Их происхождение отмечено как кража."
          : "The requested property was taken. Its stolen origin is recorded.",
      payload: {
        schemaVersion: 1,
        action: proposal.action,
        outcome: "completed",
        merchantActorId: merchantId,
        playerEntityId: actorId,
        transfers,
        currency: proposal.currency
          ? {
              ...proposal.currency,
              origin: "stolen",
              sourceEntityId: merchant.entityId,
            }
          : null,
      },
    });
  } else
    plan.events.push(
      failedAttempt(context, proposal.action, actorId, merchantId),
    );
  if (proposal.merchantUnavailable) {
    plan.state.merchants = plan.state.merchants.map((definition) =>
      definition.actorId === merchantId
        ? {
            ...definition,
            available: false,
            version: integer(definition.version + 1, 1),
          }
        : definition,
    );
    plan.events.push({
      kind: "commerce.merchant_unavailable",
      visibility: "public",
      actorIds: [actorId, merchantId],
      threadIds: [],
      text:
        context.snapshot.campaign.language === "ru"
          ? "Торговец больше не предлагает обмен."
          : "The merchant is no longer offering trades.",
      payload: {
        schemaVersion: 1,
        merchantActorId: merchantId,
        available: false,
      },
    });
  }
  requireAction(
    new Set(plan.changes.map((change) => `${change.family}:${change.id}`))
      .size === plan.changes.length,
  );
  parseCommerceDefinitions({
    currencies: plan.state.currencies,
    itemPolicies: plan.state.itemPolicies,
    merchants: plan.state.merchants,
  });
  return plan;
}

function failedAttempt(
  context: LoopContext,
  action: "haggle" | "theft" | "robbery",
  actorId: string,
  merchantId: string,
): LoopPlan["events"][number] {
  return {
    kind: "foundation.action_resolved",
    visibility: "public",
    actorIds: [actorId, merchantId],
    threadIds: [],
    text:
      context.snapshot.campaign.language === "ru"
        ? "Попытка не удалась. Вещи и валюта не переданы."
        : "The attempt did not succeed. No items or currency changed hands.",
    payload: {
      schemaVersion: 1,
      action,
      outcome: "blocked",
      merchantActorId: merchantId,
      playerEntityId: actorId,
    },
  };
}
