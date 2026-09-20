"use client";
import Link from "next/link";
import { useState } from "react";
import type { FoundationLoopView } from "@/lib/foundation-loop/client-contracts";
import type { TradeIntent, TradeQuote } from "@/lib/foundation-loop/contracts";
import type { CommerceItem } from "@/lib/commerce/projection";
import { useUnsavedChanges } from "../persistence-context";
import { Badge, Button, Icon } from "../ui";
import { NumberField, SelectField, Toggle } from "./fields";
import type { ApplyFoundation } from "./commerce-settings";
import type { FoundationText } from "./text";
import styles from "./foundation-loop.module.css";

function ItemOffer({
  title,
  items,
  selected,
  currencyId,
  acceptsStolen,
  c,
  change,
}: {
  title: string;
  items: CommerceItem[];
  selected: Record<string, number>;
  currencyId: string;
  acceptsStolen: boolean;
  c: FoundationText;
  change: (id: string, quantity: number) => void;
}) {
  return (
    <section className={styles.offer}>
      <h3>{title}</h3>
      {!items.length && <p className="muted">{c.noItems}</p>}
      {items.map((item) => {
        const reason =
          item.trade !== "allowed"
            ? c[item.trade]
            : item.equipped
              ? c.equipped
              : item.currencyId !== currencyId
                ? c.mismatch
                : item.origin === "stolen" && !acceptsStolen
                  ? c.stolen
                  : null;
        return (
          <div className={styles.item} key={item.id}>
            <div className={styles.itemName}>
              <Icon name="Package" />
              <div>
                <strong>{item.name}</strong>
                <p className="muted">
                  {c.quantity}: {item.quantity} · {c.unit}: {item.unitValue}
                </p>
                {reason ? (
                  <Badge>{reason}</Badge>
                ) : item.origin === "stolen" ? (
                  <Badge>{c.stolen}</Badge>
                ) : null}
              </div>
            </div>
            <fieldset disabled={!!reason}>
              <NumberField
                label={`${c.quantity} · ${item.name}`}
                value={selected[item.id] ?? 0}
                max={item.quantity}
                onChange={(quantity) => change(item.id, quantity)}
              />
            </fieldset>
          </div>
        );
      })}
    </section>
  );
}

export function TradePanel({
  view,
  c,
  quote,
  apply,
  clearQuote,
}: {
  view: FoundationLoopView;
  c: FoundationText;
  quote: TradeQuote | null;
  apply: ApplyFoundation;
  clearQuote: () => void;
}) {
  const commerce = view.commerce;
  const [merchantId, setMerchantId] = useState(
    commerce?.merchants[0]?.actorId ?? "",
  );
  const merchant = commerce?.merchants.find((m) => m.actorId === merchantId);
  const [currencyId, setCurrencyId] = useState(merchant?.currencyIds[0] ?? "");
  const [take, setTake] = useState<Record<string, number>>({});
  const [give, setGive] = useState<Record<string, number>>({});
  const [haggle, setHaggle] = useState(false);
  const lines = (rows: Record<string, number>) =>
    Object.entries(rows)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));
  const dirty =
    Object.values(take).some(Boolean) ||
    Object.values(give).some(Boolean) ||
    !!quote;
  useUnsavedChanges(dirty);
  const paymentCurrency = commerce?.currencies.find(
    (v) => v.id === (quote?.intent.currencyId ?? currencyId),
  );
  const insufficient =
    !!quote && quote.payment > (paymentCurrency?.balance ?? 0);
  const names = [...(merchant?.stock ?? []), ...(commerce?.inventory ?? [])];
  const hasLines = lines(take).length + lines(give).length > 0;
  return (
    <div className={styles.form}>
      <p className="muted">{c.tradeHelp}</p>
      <div className={styles.balances} aria-label={c.balances}>
        {commerce?.currencies.map((row) => (
          <span key={row.id}>
            <Icon name="Coins" />
            <strong>{row.balance}</strong> {row.label}
          </span>
        ))}
      </div>
      {!merchant || !commerce ? (
        <p className={styles.empty}>{c.emptyTrade}</p>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const intent: TradeIntent = {
                merchantActorId: merchant.actorId,
                playerEntityId: commerce.playerEntityId,
                currencyId,
                take: lines(take),
                give: lines(give),
                haggle: haggle ? "favorable" : "none",
              };
              apply("quote", intent);
            }}
          >
            <fieldset disabled={!!quote} className={styles.form}>
              <div className={styles.grid}>
                <SelectField
                  label={c.merchant}
                  value={merchantId}
                  options={commerce.merchants.map((m) => ({
                    id: m.actorId,
                    label: m.label,
                  }))}
                  onChange={(id) => {
                    setMerchantId(id);
                    setCurrencyId(
                      commerce.merchants.find((m) => m.actorId === id)
                        ?.currencyIds[0] ?? "",
                    );
                    setTake({});
                    setGive({});
                    setHaggle(false);
                  }}
                />
                <SelectField
                  label={c.currency}
                  value={currencyId}
                  options={commerce.currencies.filter((v) =>
                    merchant.currencyIds.includes(v.id),
                  )}
                  onChange={(id) => {
                    setCurrencyId(id);
                    setTake({});
                    setGive({});
                  }}
                />
              </div>
              <div className={styles.offers}>
                <ItemOffer
                  title={c.buy}
                  items={merchant.stock}
                  selected={take}
                  currencyId={currencyId}
                  acceptsStolen={true}
                  c={c}
                  change={(id, quantity) =>
                    setTake({ ...take, [id]: quantity })
                  }
                />
                <ItemOffer
                  title={c.sell}
                  items={commerce.inventory}
                  selected={give}
                  currencyId={currencyId}
                  acceptsStolen={merchant.acceptsStolen}
                  c={c}
                  change={(id, quantity) =>
                    setGive({ ...give, [id]: quantity })
                  }
                />
              </div>
              <Toggle label={c.haggle} checked={haggle} onChange={setHaggle} />
              <p className="muted">{c.haggleHelp}</p>
              <Button type="submit" primary disabled={!hasLines}>
                {c.quote}
              </Button>
            </fieldset>
          </form>
          {quote && (
            <section className={styles.quote} aria-label={c.quote}>
              <h3>{c.quote}</h3>
              <p className="muted">{c.quoteHelp}</p>
              <ul className={styles.quoteLines}>
                {quote.lines.map((line) => (
                  <li key={line.itemId}>
                    <span>
                      {line.direction === "take" ? c.receiving : c.giving}:{" "}
                      <strong>
                        {names.find((i) => i.id === line.itemId)?.name ??
                          c.item}
                      </strong>{" "}
                      × {line.quantity}
                    </span>
                    <span>
                      {line.totalValue} {paymentCurrency?.label}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.total}>
                <span>
                  {quote.payment > 0
                    ? c.pay
                    : quote.payment < 0
                      ? c.receive
                      : c.even}
                </span>
                <strong>
                  {Math.abs(quote.payment)} {paymentCurrency?.label}
                </strong>
              </p>
              {insufficient && <p role="alert">{c.funds}</p>}
              <div className="button-row">
                <Button
                  primary
                  disabled={insufficient}
                  onClick={() => apply("trade", quote)}
                >
                  {c.confirm}
                </Button>
                <Button onClick={clearQuote}>{c.edit}</Button>
              </div>
            </section>
          )}
        </>
      )}
      <Link
        className={styles.storyLink}
        href={`/campaigns/${view.campaignId}/game`}
      >
        <Icon name="MessageSquare" />
        {c.game}
      </Link>
    </div>
  );
}
