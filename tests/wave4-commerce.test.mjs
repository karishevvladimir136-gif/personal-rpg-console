import test from "node:test";
import assert from "node:assert/strict";
import {
  CommerceValidationError,
  createTradeQuote,
  executeTradeQuote,
  parseCommerceDefinitions,
  parseCurrencyDefinition,
  parseItemPolicy,
  parseMerchantDefinition,
  parseTradeIntent,
  projectCommerce,
  commerceUnitPrice,
  validatedItemTransfer,
  findHaggleGrant,
} from "../src/lib/commerce/index.ts";
import { astraRecordedPurchase } from "../src/lib/commerce/astra-trade.ts";
import {
  fixture,
  id,
  commandFor,
  applyPlan,
  grantHaggle,
} from "./wave4-commerce-fixtures.mjs";

function rejectsWithoutMutation(f, work) {
  const before = structuredClone(f);
  assert.throws(work, CommerceValidationError);
  assert.deepEqual(f, before);
}

test("post-takeover Trade admits only an exact mundane one-item quote",()=>{
  const f=fixture();
  const stock=f.context.snapshot.items.find((item)=>item.id===id("stock"));
  stock.category="food";
  stock.mechanics="";
  f.context.state.itemPolicies.find((p)=>p.itemId===stock.id).unitValue=2;
  f.intent.take[0].quantity=1;
  const quote=createTradeQuote(f.context,f.command,f.intent);
  const purchase=astraRecordedPurchase(f.context,quote);
  assert.equal(purchase.intent.kind,"mundane_purchase");
  assert.equal(purchase.intent.itemId,stock.id);
  assert.equal(purchase.intent.price,2);
  assert.match(purchase.literal,/Buy 1 Synthetic lantern for 2 credits/);
  const before=structuredClone(f.context);
  rejectsWithoutMutation(f.context,()=>astraRecordedPurchase(f.context,
    {...quote,payment:3}));
  const sale=createTradeQuote(f.context,commandFor(f.context,"sale"),{
    ...f.intent,take:[],give:[{itemId:id("coffee"),quantity:1}]});
  rejectsWithoutMutation(f.context,()=>astraRecordedPurchase(f.context,sale));
  assert.deepEqual(f.context,before);
});

test("buy quote and one atomic plan use existing item/storage/resources and stable split identities", () => {
  const f = fixture(),
    before = structuredClone(f);
  const quote = createTradeQuote(f.context, f.command, f.intent);
  assert.equal(quote.payment, 40);
  assert.equal(quote.lines[0].unitValue, 20);
  assert.deepEqual(createTradeQuote(f.context, f.command, f.intent), quote);
  const plan = executeTradeQuote(f.context, quote);
  assert.deepEqual(executeTradeQuote(f.context, quote), plan);
  assert.deepEqual(f, before);
  assert.equal(plan.changes.length, 4);
  assert.equal(plan.state.version, 2);
  const source = plan.changes.find((c) => c.id === id("stock"));
  assert.deepEqual(source.values, { quantity: 8 });
  const split = plan.changes.find(
    (c) => c.family === "items" && c.expectedRevision === null,
  );
  assert.equal(split.values.quantity, 2);
  assert.equal(split.values.owner_entity_id, id("player"));
  assert.equal(split.values.storage_id, id("pack"));
  assert.equal(
    plan.state.itemPolicies.find((p) => p.itemId === split.id).unitValue,
    20,
  );
  assert.equal(
    plan.changes.find((c) => c.id === id("player")).values.resources.credits,
    960,
  );
  assert.equal(
    plan.changes.find((c) => c.id === id("player")).values.resources.focus,
    4,
  );
  assert.equal(
    plan.changes.find((c) => c.id === id("enemy")).values.resources.credits,
    1040,
  );
  assert.equal(plan.events[0].kind, "commerce.trade");
  assert.equal(plan.events[0].payload.lines[0].transferredItemId, split.id);
});

test("whole-stack purchase preserves canonical item identity and sell transfers ownership back", () => {
  const f = fixture();
  f.intent.take[0].quantity = 10;
  const plan = executeTradeQuote(
    f.context,
    createTradeQuote(f.context, f.command, f.intent),
  );
  assert.equal(plan.changes.filter((c) => c.family === "items").length, 1);
  assert.equal(
    plan.changes.find((c) => c.id === id("stock")).values.owner_entity_id,
    id("player"),
  );
  assert.equal(
    plan.state.itemPolicies.length,
    f.context.state.itemPolicies.length,
  );
  const after = applyPlan(f.context, f.command, plan);
  const sell = {
    ...f.intent,
    take: [],
    give: [{ itemId: id("stock"), quantity: 10 }],
  };
  const quote = createTradeQuote(after, commandFor(after, "sale"), sell);
  assert.equal(quote.payment, -100);
  const sold = executeTradeQuote(after, quote);
  assert.equal(
    sold.changes.find((c) => c.id === id("stock")).values.owner_entity_id,
    id("enemy"),
  );
});

test("barter nets trusted valuations and commits both item directions with payment together", () => {
  const f = fixture();
  f.intent.give = [{ itemId: id("coffee"), quantity: 3 }];
  const quote = createTradeQuote(f.context, f.command, f.intent);
  assert.equal(quote.payment, 10);
  const plan = executeTradeQuote(f.context, quote);
  assert.equal(plan.changes.filter((c) => c.family === "items").length, 4);
  assert.equal(
    plan.changes.find((c) => c.id === id("player")).values.resources.credits,
    990,
  );
  f.intent.give[0].quantity = 4;
  const even = executeTradeQuote(
    f.context,
    createTradeQuote(f.context, f.command, f.intent),
  );
  assert.equal(
    even.changes.some((c) => c.family === "entities"),
    false,
  );
});

test("strict definitions reject unknown fields, duplicate currency/resource/item identities, foreign currencies and unsafe math", () => {
  const f = fixture(),
    state = f.context.state;
  const definitions = {
    currencies: state.currencies,
    itemPolicies: state.itemPolicies,
    merchants: state.merchants,
  };
  assert.deepEqual(parseCommerceDefinitions(definitions), definitions);
  for (const alter of [
    (d) => {
      d.extra = true;
    },
    (d) => {
      d.currencies.push({ ...d.currencies[0] });
    },
    (d) => {
      d.currencies.push({ ...d.currencies[0], id: "other" });
    },
    (d) => {
      d.itemPolicies.push({ ...d.itemPolicies[0] });
    },
    (d) => {
      d.itemPolicies[0].currencyId = "unknown";
    },
    (d) => {
      d.merchants[0].currencyIds = ["unknown"];
    },
    (d) => {
      d.merchants[0].currencyIds.push("credits");
    },
    (d) => {
      d.merchants.push({ ...d.merchants[0] });
    },
  ]) {
    const data = structuredClone(definitions);
    alter(data);
    assert.throws(
      () => parseCommerceDefinitions(data),
      CommerceValidationError,
    );
  }
  for (const value of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(
      () => parseItemPolicy({ ...state.itemPolicies[0], unitValue: value }),
      CommerceValidationError,
    );
  }
  for (const resourceKey of [
    "__proto__",
    "constructor",
    "prototype",
    "funds.value",
    "",
    " coin",
  ]) {
    assert.throws(
      () => parseCurrencyDefinition({ ...state.currencies[0], resourceKey }),
      CommerceValidationError,
    );
  }
  for (const patch of [
    { buyBasisPoints: 10001 },
    { sellBasisPoints: 50001 },
    { haggleLimitBasisPoints: 2501 },
    { usesFunds: "yes" },
    { actorId: id("other") },
  ]) {
    assert.throws(
      () => parseMerchantDefinition({ ...state.merchants[0], ...patch }),
      CommerceValidationError,
    );
  }
});

test("integer rounding is bounded, deterministic, conservative and partition invariant", () => {
  assert.equal(commerceUnitPrice(1, 5000, "take"), 1);
  assert.equal(commerceUnitPrice(1, 5000, "give"), 0);
  assert.equal(commerceUnitPrice(37, 11234, "take"), 42);
  assert.equal(commerceUnitPrice(37, 11234, "give"), 41);
  assert.equal(commerceUnitPrice(1000000, 50000, "take"), 5000000);
  assert.throws(
    () => commerceUnitPrice(1, 1.1, "take"),
    CommerceValidationError,
  );
  const f = fixture();
  f.context.state.itemPolicies.find((p) => p.itemId === id("stock")).unitValue =
    1;
  f.context.state.merchants[0].sellBasisPoints = 11234;
  const quote = createTradeQuote(f.context, f.command, f.intent);
  assert.equal(quote.lines[0].unitValue, 2);
  assert.equal(quote.payment, 4);
});

test("quantities and client payload cannot invent payments, duplicate lines, zero trades or fractional stock", () => {
  for (const value of [-1, 0, 0.5, 1000001, NaN, Infinity, "2"]) {
    const f = fixture();
    f.intent.take[0].quantity = value;
    rejectsWithoutMutation(f, () =>
      createTradeQuote(f.context, f.command, f.intent),
    );
  }
  for (const alter of [
    (i) => {
      i.take.push({ ...i.take[0] });
    },
    (i) => {
      i.give.push({ ...i.take[0] });
    },
    (i) => {
      i.payment = 0;
    },
    (i) => {
      i.take = [];
    },
    (i) => {
      i.haggle = "free";
    },
  ]) {
    const f = fixture();
    alter(f.intent);
    assert.throws(() => parseTradeIntent(f.intent), CommerceValidationError);
  }
  const f = fixture();
  f.intent.take[0].quantity = 11;
  rejectsWithoutMutation(f, () =>
    createTradeQuote(f.context, f.command, f.intent),
  );
});

test("private stock has no identity, quantity, name, value, description or count in the safe projection", () => {
  const f = fixture(),
    before = structuredClone(f);
  const projected = projectCommerce(f.context, id("player"));
  assert.equal(projected.merchants.length, 1);
  assert.equal(projected.merchants[0].stock.length, 1);
  assert.equal(projected.inventory.length, 3);
  assert.deepEqual(projected.currencies, [
    { id: "credits", label: "Credits", balance: 1000 },
  ]);
  const serialized = JSON.stringify(projected);
  for (const marker of [
    id("private-stock"),
    "PRIVATE_STOCK",
    "9173",
    "173",
    "capacity",
    "resources",
    "policy",
    "knowledge",
    "PRIVATE_THREAD",
  ]) {
    assert.equal(serialized.includes(marker), false, marker);
  }
  assert.deepEqual(f, before);
  f.intent.take[0].itemId = id("private-stock");
  rejectsWithoutMutation(f, () =>
    createTradeQuote(f.context, f.command, f.intent),
  );
  f.context.state.itemPolicies.find(
    (p) => p.itemId === id("coffee"),
  ).visibility = "private";
  assert.equal(
    projectCommerce(f.context, id("player")).inventory.some(
      (i) => i.id === id("coffee"),
    ),
    false,
  );
});

test("unknown, absent, dead and autonomous actors cannot use player authority or expose hidden merchants", () => {
  const changes = [
    (f) => {
      f.context.world.actors[1].publicName = null;
    },
    (f) => {
      f.context.world.actors[1].locationId = id("next-location");
    },
    (f) => {
      f.context.world.actors[1].locationId = null;
    },
    (f) => {
      f.context.state.merchants[0].available = false;
    },
    (f) => {
      f.context.snapshot.entities.find((e) => e.id === id("enemy")).hp = 0;
    },
    (f) => {
      f.context.snapshot.entities.find((e) => e.id === id("enemy")).conditions =
        ["dead"];
    },
  ];
  for (const alter of changes) {
    const f = fixture();
    alter(f);
    rejectsWithoutMutation(f, () =>
      createTradeQuote(f.context, f.command, f.intent),
    );
    assert.deepEqual(projectCommerce(f.context, id("player")).merchants, []);
  }
  for (const alter of [
    (f) => {
      f.context.world.actors[0].control = "autonomous";
    },
    (f) => {
      f.intent.playerEntityId = id("enemy");
    },
    (f) => {
      f.context.world.actors[1].control = "player";
    },
    (f) => {
      f.context.snapshot.entities.find((e) => e.id === id("player")).hp = 0;
    },
    (f) => {
      f.context.world.actors = f.context.world.actors.slice(1);
    },
  ]) {
    const f = fixture();
    alter(f);
    rejectsWithoutMutation(f, () =>
      createTradeQuote(f.context, f.command, f.intent),
    );
  }
});

test("inventory scope, storage ownership, equipped/restricted/quest and stolen policies fail closed", () => {
  for (const alter of [
    (f) => {
      f.context.snapshot.items.find(
        (i) => i.id === id("stock"),
      ).owner_entity_id = id("companion");
    },
    (f) => {
      f.context.snapshot.storages.find(
        (s) => s.id === id("merchant-storage"),
      ).entity_id = id("player");
    },
    (f) => {
      f.context.snapshot.items.find((i) => i.id === id("stock")).campaign_id =
        id("foreign");
    },
    (f) => {
      f.context.snapshot.storages.find(
        (s) => s.id === id("merchant-storage"),
      ).campaign_id = id("foreign");
    },
    (f) => {
      f.context.state.itemPolicies.find((p) => p.itemId === id("stock")).trade =
        "quest";
    },
    (f) => {
      f.context.state.itemPolicies.find((p) => p.itemId === id("stock")).trade =
        "restricted";
    },
    (f) => {
      f.intent.take = [];
      f.intent.give = [{ itemId: id("weapon"), quantity: 1 }];
    },
    (f) => {
      f.intent.take = [];
      f.intent.give = [{ itemId: id("coffee"), quantity: 1 }];
      f.context.state.itemPolicies.find(
        (p) => p.itemId === id("coffee"),
      ).origin = "stolen";
    },
    (f) => {
      f.intent.currencyId = "foreign";
    },
    (f) => {
      f.context.state.currencies.push({
        id: "other",
        label: "Other",
        resourceKey: "other",
        version: 1,
      });
      f.context.state.itemPolicies.find(
        (p) => p.itemId === id("stock"),
      ).currencyId = "other";
    },
  ]) {
    const f = fixture();
    alter(f);
    rejectsWithoutMutation(f, () =>
      createTradeQuote(f.context, f.command, f.intent),
    );
  }
  const f = fixture();
  f.intent.take = [];
  f.intent.give = [{ itemId: id("coffee"), quantity: 2 }];
  f.context.state.itemPolicies.find((p) => p.itemId === id("coffee")).origin =
    "stolen";
  f.context.state.merchants[0].acceptsStolen = true;
  const plan = executeTradeQuote(
    f.context,
    createTradeQuote(f.context, f.command, f.intent),
  );
  const split = plan.changes.find((c) => c.expectedRevision === null);
  assert.equal(
    plan.state.itemPolicies.find((p) => p.itemId === split.id).origin,
    "stolen",
  );
});

test("payer funds, bounded resulting balances and capacity count all physical stock without leaking it", () => {
  for (const alter of [
    (f) => {
      f.context.snapshot.entities.find(
        (e) => e.id === id("player"),
      ).resources.credits = 39;
    },
    (f) => {
      f.context.snapshot.entities.find(
        (e) => e.id === id("player"),
      ).resources.credits = -1;
    },
    (f) => {
      f.context.snapshot.entities.find(
        (e) => e.id === id("player"),
      ).resources.credits = 1.5;
    },
    (f) => {
      f.context.snapshot.entities.find((e) => e.id === id("player")).resources =
        { focus: 1000 };
    },
    (f) => {
      f.context.snapshot.entities.find(
        (e) => e.id === id("enemy"),
      ).resources.credits = 999999;
    },
    (f) => {
      f.context.state.merchants[0].capacity = 180;
    },
    (f) => {
      f.intent.take = [];
      f.intent.give = [{ itemId: id("coffee"), quantity: 2 }];
      f.context.snapshot.entities.find(
        (e) => e.id === id("enemy"),
      ).resources.credits = 19;
    },
  ]) {
    const f = fixture();
    alter(f);
    rejectsWithoutMutation(f, () =>
      createTradeQuote(f.context, f.command, f.intent),
    );
  }
  const f = fixture();
  f.intent.take = [];
  f.intent.give = [{ itemId: id("coffee"), quantity: 2 }];
  f.context.state.merchants[0].usesFunds = false;
  f.context.snapshot.entities.find((e) => e.id === id("enemy")).resources = {};
  const plan = executeTradeQuote(
    f.context,
    createTradeQuote(f.context, f.command, f.intent),
  );
  assert.equal(
    plan.changes.some((c) => c.id === id("enemy")),
    false,
  );
  assert.equal(
    plan.changes.find((c) => c.id === id("player")).values.resources.credits,
    1020,
  );
  f.context.state.merchants[0].capacity = 184;
  rejectsWithoutMutation(f, () =>
    createTradeQuote(f.context, f.command, f.intent),
  );
});

test("quote tampering and every timeline/head/profile/price/quantity revision invalidate execution", () => {
  for (const alter of [
    (f, q) => {
      q.payment = 0;
    },
    (f, q) => {
      q.lines[0].unitValue = 0;
    },
    (f, q) => {
      q.intent.take[0].quantity = 1;
    },
    (f, q) => {
      q.modifierBasisPoints = 1000;
    },
    (f, q) => {
      q.extra = true;
    },
    (f, q) => {
      q.command.expectedRevision += 1;
    },
    (f, q) => {
      q.command.expectedRuntimeRevision += 1;
    },
    (f, q) => {
      q.command.expectedHeadId = id("other-head");
    },
    (f, q) => {
      q.command.campaignId = id("foreign");
    },
    (f, q) => {
      q.command.timeline.epoch += 1;
    },
    (f, q) => {
      q.command.timeline.timelineId = id("sibling");
    },
    (f) => {
      f.context.state.version += 1;
    },
    (f) => {
      f.context.state.merchants[0].version += 1;
    },
    (f) => {
      f.context.state.merchants[0].sellBasisPoints = 11000;
    },
    (f) => {
      f.context.state.itemPolicies.find(
        (p) => p.itemId === id("stock"),
      ).version += 1;
    },
    (f) => {
      f.context.state.itemPolicies.find(
        (p) => p.itemId === id("stock"),
      ).unitValue = 30;
    },
    (f) => {
      f.context.snapshot.items.find((i) => i.id === id("stock")).quantity -= 1;
    },
    (f) => {
      f.context.snapshot.items.find((i) => i.id === id("stock")).revision += 1;
    },
    (f) => {
      f.context.snapshot.entities.find((e) => e.id === id("enemy")).revision +=
        1;
    },
    (f) => {
      f.context.state.profile = {
        id: "world-logic-v1",
        version: 1,
        mode: "world_logic",
        validatorVersion: "world-logic-v1",
      };
    },
  ]) {
    const f = fixture(),
      quote = createTradeQuote(f.context, f.command, f.intent);
    alter(f, quote);
    rejectsWithoutMutation(f, () => executeTradeQuote(f.context, quote));
  }
});

test("two quotes cannot spend the same stock/funds and committed operation retries create nothing", () => {
  const f = fixture();
  f.intent.take[0].quantity = 6;
  const first = createTradeQuote(f.context, f.command, f.intent);
  const second = createTradeQuote(
    f.context,
    commandFor(f.context, "second-tab"),
    f.intent,
  );
  const committed = applyPlan(
    f.context,
    f.command,
    executeTradeQuote(f.context, first),
  );
  rejectsWithoutMutation(committed, () => executeTradeQuote(committed, second));
  rejectsWithoutMutation(committed, () => executeTradeQuote(committed, first));
  rejectsWithoutMutation(committed, () =>
    createTradeQuote(committed, commandFor(committed), {
      ...f.intent,
      take: [{ itemId: id("stock"), quantity: 1 }],
    }),
  );
  // Even replay with maliciously restored fences cannot bypass the receipt.
  const rewound = structuredClone(f.context);
  rewound.events = structuredClone(committed.events);
  rejectsWithoutMutation(rewound, () => executeTradeQuote(rewound, first));
});

test("favorable haggle needs an existing validated public semantic grant, never free client discount", () => {
  const f = fixture();
  f.intent.haggle = "favorable";
  rejectsWithoutMutation(f, () =>
    createTradeQuote(f.context, f.command, f.intent),
  );
  const grant = grantHaggle(f.context);
  f.command = commandFor(f.context);
  const quote = createTradeQuote(f.context, f.command, f.intent);
  assert.equal(quote.payment, 36);
  assert.equal(quote.modifierBasisPoints, 1000);
  assert.equal(
    findHaggleGrant(f.context, f.context.state.merchants[0], id("player")).id,
    grant.id,
  );
  const plan = executeTradeQuote(f.context, quote);
  assert.equal(plan.events[0].payload.haggleEventId, grant.id);
  const next = applyPlan(f.context, f.command, plan);
  rejectsWithoutMutation(next, () =>
    createTradeQuote(next, commandFor(next, "next-haggle-trade"), f.intent),
  );
  next.state.version = 1;
  assert.equal(
    findHaggleGrant(next, next.state.merchants[0], id("player")),
    null,
  );
});

test("private, foreign, future, stale, malformed, narrative-only and consumed grants cannot negotiate a price", () => {
  for (const alter of [
    (f, g) => {
      g.visibility = "private";
    },
    (f, g) => {
      g.kind = "world.logic.resolved";
      g.text = "The merchant grants a 90% discount.";
    },
    (f, g) => {
      g.originTimelineId = id("foreign-timeline");
    },
    (f, g) => {
      g.campaignId = id("foreign");
    },
    (f, g) => {
      g.actorIds = [id("player")];
    },
    (f, g) => {
      g.payload.modifierBasisPoints = 9000;
    },
    (f, g) => {
      g.payload.timeline.epoch -= 1;
    },
    (f, g) => {
      g.payload.stateVersion += 1;
    },
    (f, g) => {
      g.payload.merchantVersion += 1;
    },
    (f, g) => {
      g.payload.playerEntityId = id("companion");
    },
    (f, g) => {
      g.payload.worldMinutes += 1;
    },
    (f, g) => {
      g.worldMinutes += 1;
    },
    (f, g) => {
      g.payload.profile.version = 3;
    },
    (f, g) => {
      f.context.events.push({
        ...g,
        id: id("consumed"),
        kind: "commerce.trade",
        sequence: g.sequence + 1,
        payload: {
          merchantActorId: id("enemy"),
          playerEntityId: id("player"),
          haggleEventId: null,
        },
      });
    },
  ]) {
    const f = fixture();
    f.intent.haggle = "favorable";
    const grant = grantHaggle(f.context);
    f.command = commandFor(f.context);
    alter(f, grant);
    rejectsWithoutMutation(f, () =>
      createTradeQuote(f.context, f.command, f.intent),
    );
  }
});

test("normal Game transfer helper preserves source stack and deterministic policy identity without a theft bypass", () => {
  const f = fixture(),
    before = structuredClone(f);
  const input = {
    itemId: id("stock"),
    quantity: 1,
    sourceEntityId: id("enemy"),
    destinationEntityId: id("player"),
    destinationStorageId: id("pack"),
  };
  const plan = validatedItemTransfer(f.context, f.command, input);
  assert.equal(plan.split, true);
  assert.equal(plan.itemPolicy.origin, "legitimate");
  assert.equal(plan.changes[0].values.quantity, 9);
  assert.deepEqual(validatedItemTransfer(f.context, f.command, input), plan);
  assert.deepEqual(f, before);
  for (const patch of [
    { quantity: 0 },
    { sourceEntityId: id("player") },
    { destinationStorageId: id("camp") },
    { theft: true },
  ]) {
    rejectsWithoutMutation(f, () =>
      validatedItemTransfer(f.context, f.command, { ...input, ...patch }),
    );
  }
  f.context.snapshot.items.push({
    ...f.context.snapshot.items[0],
    id: plan.transferredItemId,
  });
  rejectsWithoutMutation(f, () =>
    validatedItemTransfer(f.context, f.command, input),
  );
});

test("profile currencies are explicit and no coins or levels are invented for a World Logic campaign", () => {
  const f = fixture();
  f.context.state.profile = f.context.foundation.ruleset = {
    id: "world-logic-v1",
    version: 1,
    mode: "world_logic",
    validatorVersion: "world-logic-v1",
  };
  const quote = createTradeQuote(f.context, f.command, f.intent);
  assert.equal(quote.profile.mode, "world_logic");
  assert.equal(quote.intent.currencyId, "credits");
  const empty = fixture();
  empty.context.state.currencies = [];
  empty.context.state.itemPolicies = [];
  empty.context.state.merchants = [];
  assert.deepEqual(projectCommerce(empty.context, id("player")).currencies, []);
  rejectsWithoutMutation(empty, () =>
    createTradeQuote(empty.context, empty.command, empty.intent),
  );
});

test("legacy disabled version zero and absent World project as empty without creating actors or earned history", () => {
  const f = fixture();
  f.context.state.version = 0;
  f.context.state.currencies = [];
  f.context.state.itemPolicies = [];
  f.context.state.merchants = [];
  f.context.world.actors = [];
  f.context.foundation.world = null;
  const before = structuredClone(f);
  assert.deepEqual(projectCommerce(f.context, id("player")), {
    schemaVersion: 1,
    playerEntityId: id("player"),
    currencies: [],
    inventory: [],
    merchants: [],
  });
  assert.deepEqual(f, before);
});
