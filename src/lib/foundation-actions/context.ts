import { validateCommerceContext } from "../commerce/context.ts";
import { projectCommerce } from "../commerce/projection.ts";
import { commerceUnitPrice } from "../commerce/trade.ts";
import {
  COMMERCE_LIMITS,
  CommerceValidationError,
} from "../commerce/validation.ts";
import type { LoopContext } from "../foundation-loop/contracts.ts";
import {
  actionMerchant,
  actionPlayer,
  actionProfile,
  foundationHaggleCapability,
  foundationMerchantUnavailableCapability,
  foundationTransferCapability,
} from "./authority.ts";
import type {
  FoundationActionContext,
  TransferAction,
  TransferOption,
} from "./contracts.ts";
import { FoundationActionError } from "./validation.ts";

function unavailable(error: unknown): boolean {
  return (
    error instanceof FoundationActionError ||
    (error instanceof CommerceValidationError && error.code === "unavailable")
  );
}

/** Only recognized, installed capability tokens are interpreted. Arbitrary
 * descriptions, item mechanics, source evidence and user text grant nothing. */
function boundedTransferOptions(
  capabilities: string[],
  action: TransferAction,
  merchantActorId: string,
  kind: "item" | "currency",
  recordId: string,
  availableQuantity: number,
): TransferOption[] {
  const prefix = `foundation.${action}.${kind}:${merchantActorId}:${recordId}:`;
  return capabilities
    .filter((capability) => capability.startsWith(prefix))
    .flatMap((capability) => {
      try {
        const bound = Number(capability.slice(prefix.length));
        if (
          foundationTransferCapability(
            action,
            kind,
            merchantActorId,
            recordId,
            bound,
          ) !== capability
        )
          return [];
        return [
          {
            action,
            merchantActorId,
            itemId: kind === "item" ? recordId : null,
            currencyId: kind === "currency" ? recordId : null,
            maximum: Math.min(bound, availableQuantity),
            capability,
          },
        ];
      } catch {
        return [];
      }
    });
}

export function foundationActionContext(
  context: LoopContext,
  actorId: string,
): FoundationActionContext | null {
  validateCommerceContext(context);
  if (
    context.state.version === 0 ||
    context.state.merchants.length === 0 ||
    context.state.currencies.length === 0
  )
    return null;
  let player, profile;
  try {
    player = actionPlayer(context, actorId);
    profile = actionProfile(context);
  } catch (error) {
    if (unavailable(error)) return null;
    throw error;
  }
  const commerce = projectCommerce(context, actorId);
  const result: FoundationActionContext = {
    schemaVersion: 1,
    actorId,
    profile,
    currencies: commerce.currencies,
    inventory: commerce.inventory.slice(0, 50).map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      currencyId: i.currencyId,
      tradable: i.trade === "allowed" && !i.equipped,
      stolen: i.origin === "stolen",
    })),
    merchants: [],
    haggleOptions: [],
    transferOptions: [],
    merchantUnavailableOptions: [],
    constraints: [
      "Interpret only the player's literal current input. Use these current public identities and quantities; never choose a different controlled character's actions or assets.",
      "Quote/trade reuse configured currency and existing inventory. Code computes all prices; expectedPayment is only an exact signed payment condition stated by the player, not a price override. A different/ambiguous currency or unsupported amount must pause.",
      "Haggle is a separate attempt, never an automatic discount. Favorable trades require a current committed single-use grant; code chooses its bounded amount.",
      "For console_basic, haggle/theft/robbery require the player's own server-recorded skill check with this exact merchant as target. Use checkIndex; never invent a result or use a private/NPC detection roll.",
      "For world_logic, choose only supplied exact capability options, with resolved uncertainty and no roll or HP assumptions. No description, source, input or model response grants a capability.",
      "A failed attempt transfers nothing. Never infer witnesses, detection, police, injury, death, relationships or reward entitlement. Merchant closure is supported only by its supplied separate option after public robbery.",
      "No arbitrary items, resources, prices, rewards, grants, patches, private evidence or future/source facts. Missing options, prerequisites or certainty must pause the entire action.",
    ],
  };
  for (const view of commerce.merchants) {
    if (result.merchants.length >= 16) break;
    let authority;
    try {
      authority = actionMerchant(context, view.actorId, actorId);
    } catch (error) {
      if (unavailable(error)) continue;
      throw error;
    }
    const { merchant } = authority;
    const stock = view.stock.slice(0, 50).map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      currencyId: item.currencyId,
      unitPrice: commerceUnitPrice(
        item.unitValue,
        merchant.sellBasisPoints,
        "take",
      ),
      tradable: item.trade === "allowed" && !item.equipped,
    }));
    result.merchants.push({
      actorId: view.actorId,
      label: view.label,
      currencyIds: view.currencyIds,
      acceptsStolen: view.acceptsStolen,
      stock,
    });
    const haggle = foundationHaggleCapability(view.actorId);
    if (
      merchant.haggleLimitBasisPoints > 0 &&
      (profile === "console_basic" ||
        player.actor.capabilities.includes(haggle))
    ) {
      result.haggleOptions.push({
        merchantActorId: view.actorId,
        capability: profile === "console_basic" ? null : haggle,
      });
    }
    const closure = foundationMerchantUnavailableCapability(view.actorId);
    if (player.actor.capabilities.includes(closure))
      result.merchantUnavailableOptions.push({
        merchantActorId: view.actorId,
        capability: closure,
      });
    for (const action of ["theft", "robbery"] as const) {
      for (const item of stock.filter((i) => i.tradable)) {
        result.transferOptions.push(
          ...(profile === "console_basic"
            ? [
                {
                  action,
                  merchantActorId: view.actorId,
                  itemId: item.id,
                  currencyId: null,
                  maximum: item.quantity,
                  capability: null,
                },
              ]
            : boundedTransferOptions(
                player.actor.capabilities,
                action,
                view.actorId,
                "item",
                item.id,
                item.quantity,
              )),
        );
      }
      if (merchant.usesFunds)
        for (const currencyId of view.currencyIds) {
          // Never derive a public maximum from the merchant's private balance.
          result.transferOptions.push(
            ...(profile === "console_basic"
              ? [
                  {
                    action,
                    merchantActorId: view.actorId,
                    itemId: null,
                    currencyId,
                    maximum: COMMERCE_LIMITS.balance,
                    capability: null,
                  },
                ]
              : boundedTransferOptions(
                  player.actor.capabilities,
                  action,
                  view.actorId,
                  "currency",
                  currencyId,
                  COMMERCE_LIMITS.balance,
                )),
          );
        }
    }
  }
  result.transferOptions = result.transferOptions.slice(0, 128);
  return result;
}
