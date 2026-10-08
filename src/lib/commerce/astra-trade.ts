import { isDeepStrictEqual } from "node:util";
import type { LoopContext, TradeQuote } from "../foundation-loop/contracts.ts";
import type { AstraSettlementIntent } from "../gameplay/astra-settlement.ts";
import { createTradeQuote } from "./trade.ts";
import { parseTradeQuote, requireCommerce } from "./validation.ts";

/** The post-takeover Trade surface admits only an existing, public, mundane
 * stock purchase. The old quote remains a price and revision fence, while the
 * Astra settlement planner and SQL guard own the actual Item/currency changes. */
export function astraRecordedPurchase(context: LoopContext, raw: unknown): {
  quote: TradeQuote;
  intent: Extract<AstraSettlementIntent,{kind:"mundane_purchase"}>;
  itemName: string;
  literal: string;
} {
  const quote = parseTradeQuote(raw);
  requireCommerce(isDeepStrictEqual(quote,
    createTradeQuote(context,quote.command,quote.intent)),"conflict");
  requireCommerce(quote.intent.take.length === 1 &&
    quote.intent.give.length === 0 && quote.intent.haggle === "none" &&
    quote.lines.length === 1 && quote.lines[0].direction === "take" &&
    quote.payment >= 1 && quote.payment <= 20,"unavailable");
  const item = context.snapshot.items.find((row) =>
    row.id === quote.intent.take[0].itemId);
  const merchant = context.state.merchants.find((row) =>
    row.actorId === quote.intent.merchantActorId);
  const currency = context.state.currencies.find((row) =>
    row.id === quote.intent.currencyId);
  requireCommerce(!!item && !!merchant && !!currency &&
    item.owner_entity_id === merchant.entityId &&
    ["food","supply","misc"].includes(item.category) &&
    item.mechanics.trim() === "" &&
    /^[a-z]+(?: [a-z]+)*$/.test(currency.label.trim().toLowerCase()),
    "unavailable");
  const intent = {
    kind:"mundane_purchase" as const,
    sellerId:merchant.entityId,
    recipientId:quote.intent.playerEntityId,
    itemId:item.id,
    quantity:quote.intent.take[0].quantity,
    currencyName:currency.label.trim().toLowerCase(),
    price:quote.payment,
  };
  return {quote,intent,itemName:item.name,literal:astraPurchaseLiteral(context,quote)};
}

export function astraPurchaseLiteral(context: LoopContext, quote: TradeQuote): string {
  const item=context.snapshot.items.find((row)=>row.id===quote.intent.take[0]?.itemId);
  const currency=context.state.currencies.find((row)=>row.id===quote.intent.currencyId);
  requireCommerce(!!item && !!currency && quote.intent.take.length===1 &&
    quote.intent.give.length===0 && quote.intent.haggle==="none","conflict");
  return `Buy ${quote.intent.take[0].quantity} ${item.name} for ${quote.payment} ${
    currency.label.trim().toLowerCase()}.`;
}
