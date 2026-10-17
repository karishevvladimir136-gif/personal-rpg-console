// Read-only views of a disposable evaluation campaign: snapshots, diffs,
// placeholder resolution for scripted fake responses, and scenario checks.

import { metricsReport, parseMetrics } from "../../../src/lib/gameplay/dm-loop/metrics.ts";

const PUBLIC_TEXT_TABLES = ["rpg_scenes", "rpg_quests", "rpg_entities", "rpg_items",
  "rpg_locations", "rpg_memory_summaries"];

export async function snapshot(f, campaignId, heroId) {
  const rows = (sql) => f.query(sql, [campaignId]);
  const foundation = await f.one(
    "select loop_state from rpg_private.world_foundations where campaign_id=$1", [campaignId]);
  const runtime = await f.one(
    "select world_minutes from rpg_private.runtime_state where campaign_id=$1", [campaignId]);
  const place = await f.one(
    "select current_location_id from public.rpg_public_state where campaign_id=$1", [campaignId]);
  const currencies = foundation?.loop_state?.currencies ?? [];
  const entities = await rows(`select id,kind,name,details,hp,max_hp,resources,revision
    from public.rpg_entities where campaign_id=$1 order by name,id`);
  const hero = entities.find((entity) => entity.id === heroId);
  const money = {};
  for (const [key, value] of Object.entries(hero?.resources ?? {})) {
    if (!key.startsWith("currency_")) continue;
    const label = currencies.find((currency) => currency.resourceKey === key)?.label ?? key;
    money[label] = Number(value);
  }
  return {
    heroId,
    worldMinutes: Number(runtime?.world_minutes ?? 0),
    currentLocationId: place?.current_location_id ?? null,
    entities,
    locations: await rows(`select id,name,status from public.rpg_locations
      where campaign_id=$1 order by name,id`),
    items: await rows(`select id,name,category,quantity,owner_entity_id,storage_id,
      equipped_entity_id,equipped_slot from public.rpg_items where campaign_id=$1 order by name,id`),
    // The Stage 4 columns (kind, reward settlement) may be absent on a fixture
    // that stops before migration 55 (the old-runtime bench): read the row as JSON.
    quests: (await rows(`select to_jsonb(q) row from public.rpg_quests q
      where campaign_id=$1 order by title,id`)).map(({ row }) =>
      ({ id: row.id, title: row.title, status: row.status, kind: row.kind, reward_operation_id: row.reward_operation_id ?? null })),
    storages: await rows(`select id,name,kind,entity_id from public.rpg_storages
      where campaign_id=$1 order by id`),
    currencies: currencies.map((currency) => ({ label: currency.label, resourceKey: currency.resourceKey })),
    money,
    moneyTotal: Object.values(money).reduce((sum, value) => sum + value, 0),
  };
}

export async function publicText(f, campaignId) {
  const parts = [];
  for (const table of PUBLIC_TEXT_TABLES) {
    const rows = await f.query(
      `select to_jsonb(t)::text as text from public.${table} t where campaign_id=$1`, [campaignId]);
    parts.push(...rows.map((row) => row.text));
  }
  return parts.join("\n");
}

const matcher = (pattern) => new RegExp(pattern, "iu");
const people = (state) => state.entities.filter((e) => e.kind === "npc" || e.kind === "companion");
/** A character "matches" by name, or, when no name matches, by its public
 * description: a live DM names the miller "Aldous Fenn" and describes him as
 * the miller (outcome-based checks, stage 2b §5). */
const peopleMatching = (state, pattern) => {
  const byName = people(state).filter((e) => matcher(pattern).test(e.name));
  return byName.length ? byName : people(state).filter((e) => matcher(pattern).test(e.details ?? ""));
};
const heroItems = (state, pattern) => state.items.filter((item) =>
  item.owner_entity_id === state.heroId && item.quantity > 0 && matcher(pattern).test(item.name));

/** Compact public summary of what one turn changed. */
export function diff(before, after) {
  const byId = (rows) => new Map(rows.map((row) => [row.id, row]));
  const added = (key, label) => {
    const old = byId(before[key]);
    return after[key].filter((row) => !old.has(row.id)).map(label);
  };
  const oldItems = byId(before.items);
  const itemChanges = after.items.flatMap((item) => {
    const old = oldItems.get(item.id);
    if (!old || (old.quantity === item.quantity && old.owner_entity_id === item.owner_entity_id)) return [];
    return [`${item.name}: ${old.quantity}→${item.quantity}` +
      (old.owner_entity_id === item.owner_entity_id ? "" : " (owner changed)")];
  });
  const oldQuests = byId(before.quests);
  const questChanges = after.quests.flatMap((quest) => {
    const old = oldQuests.get(quest.id);
    return old && old.status !== quest.status ? [`${quest.title}: ${old.status}→${quest.status}`] : [];
  });
  const money = {};
  for (const label of new Set([...Object.keys(before.money), ...Object.keys(after.money)])) {
    const delta = (after.money[label] ?? 0) - (before.money[label] ?? 0);
    if (delta) money[label] = delta;
  }
  return {
    npcs: added("entities", (e) => `${e.name} (${e.kind})`),
    places: added("locations", (l) => l.name),
    items: { added: added("items", (i) => `${i.name} ×${i.quantity} [${i.category}]`), changed: itemChanges },
    quests: { added: added("quests", (q) => `${q.title} [${q.status}]`), changed: questChanges },
    money,
    worldMinutes: after.worldMinutes - before.worldMinutes,
    moved: before.currentLocationId !== after.currentLocationId,
  };
}

/** Replace {{...}} placeholders in a scripted model response with IDs and
 * values the model would see in its context. Returns null when any
 * placeholder cannot be resolved (the scripted candidate does not apply). */
export function resolvePlaceholders(value, state, campaignId) {
  let unresolved = false;
  const lookup = (token) => {
    const [kind, ...rest] = token.split(":");
    const arg = rest.join(":");
    const first = (rows) => rows[0]?.id ?? null;
    switch (kind) {
      case "hero": return state.heroId;
      case "campaign": return campaignId;
      case "currentLocation": return state.currentLocationId;
      case "npc": return first(people(state).filter((e) => matcher(arg).test(e.name)));
      case "entity": return first(state.entities.filter((e) => matcher(arg).test(e.name)));
      case "location": return first(state.locations.filter((l) => matcher(arg).test(l.name)));
      case "quest": return first(state.quests.filter((q) => matcher(arg).test(q.title)));
      case "heroItem": return first(heroItems(state, arg));
      case "npcItem": return first(state.items.filter((i) => i.quantity > 0 &&
        i.owner_entity_id && i.owner_entity_id !== state.heroId && matcher(arg).test(i.name)));
      case "heroStorage": return first(state.storages.filter((s) => s.entity_id === state.heroId && s.kind === "player"));
      default: {
        const minutes = /^minutes(?:\+(\d+))?$/.exec(token);
        if (minutes) return state.worldMinutes + Number(minutes[1] ?? 0);
        throw Error(`unknown placeholder {{${token}}}`);
      }
    }
  };
  const visit = (node) => {
    if (typeof node === "string") {
      const whole = /^\{\{([^{}]+)\}\}$/.exec(node);
      if (whole) {
        const resolved = lookup(whole[1]);
        if (resolved === null || resolved === undefined) unresolved = true;
        return resolved;
      }
      return node.replace(/\{\{([^{}]+)\}\}/g, (_, token) => {
        const resolved = lookup(token);
        if (resolved === null || resolved === undefined) unresolved = true;
        return String(resolved);
      });
    }
    if (Array.isArray(node)) return node.map(visit);
    if (node && typeof node === "object")
      return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, visit(child)]));
    return node;
  };
  const result = visit(value);
  return unresolved ? null : result;
}

/** The campaign's private facts (DM-only; the bench reads them to check bookkeeping, never to show them). */
export async function privateFacts(f, campaignId, bucket = "fact") {
  const row = await f.one("select contents from rpg_private.dm_state where campaign_id=$1", [campaignId]);
  const facts = row?.contents?.[bucket];
  return facts && typeof facts === "object" && !Array.isArray(facts) ? facts : {};
}

/** Evaluate one scenario expectation. `ctx` holds before/after snapshots of the
 * current step, snapshots of earlier named steps, the turn record and DB access. */
export async function evaluateCheck(check, ctx) {
  const entries = Object.entries(check).filter(([key]) => key !== "label");
  if (entries.length !== 1) throw Error(`check must have exactly one kind: ${JSON.stringify(check)}`);
  const [kind, arg] = entries[0];
  const label = check.label ?? `${kind} ${JSON.stringify(arg)}`;
  const { after, before } = ctx;
  const result = (pass, detail) => ({ label, kind, pass: !!pass, detail });
  const count = (rows, pattern, field = "name") => rows.filter((row) => matcher(pattern).test(row[field])).length;
  const compare = (value, spec) =>
    (spec.eq === undefined || value === spec.eq) &&
    (spec.min === undefined || value >= spec.min) &&
    (spec.max === undefined || value <= spec.max);
  switch (kind) {
    case "npcExists": {
      const n = peopleMatching(after, arg).length;
      return result(n > 0, `${n} matching NPC(s); NPCs: ${people(after).map((e) => e.name).join(", ")}`);
    }
    case "npcCount": {
      const n = peopleMatching(after, arg.name).length;
      return result(compare(n, arg), `${n} matching NPC(s)`);
    }
    case "npcCreatedThisTurn": {
      const n = peopleMatching(after, arg).length - peopleMatching(before, arg).length;
      return result(n > 0, `${n} new matching NPC(s) in this step`);
    }
    case "questExists": {
      const rows = after.quests.filter((q) => matcher(arg.title).test(q.title) &&
        (!arg.status || q.status === arg.status));
      return result(rows.length > 0, `quests: ${after.quests.map((q) => `${q.title} [${q.status}]`).join(", ") || "none"}`);
    }
    case "questCount": {
      const n = count(after.quests, arg.title, "title");
      return result(compare(n, arg), `${n} matching quest(s)`);
    }
    case "questCreatedThisTurn": {
      const n = count(after.quests, arg, "title") - count(before.quests, arg, "title");
      return result(n > 0, `${n} new matching quest(s) in this step`);
    }
    case "heroMoney":
      return result(compare(after.moneyTotal, arg), `hero money ${after.moneyTotal} ${JSON.stringify(after.money)}`);
    case "heroMoneyDelta": {
      const delta = after.moneyTotal - before.moneyTotal;
      return result(compare(delta, arg), `money change in this step ${delta}`);
    }
    case "heroMoneySince": {
      const base = ctx.steps.get(arg.step);
      if (!base) return result(false, `no snapshot for step ${arg.step}`);
      const delta = after.moneyTotal - base.moneyTotal;
      return result(compare(delta, arg), `money change since ${arg.step}: ${delta}`);
    }
    case "heroItem": {
      const rows = heroItems(after, arg.name);
      const quantity = rows.reduce((sum, item) => sum + item.quantity, 0);
      const spec = arg.eq === undefined && arg.min === undefined && arg.max === undefined ? { min: 1 } : arg;
      return result(compare(quantity, spec), `hero holds ${quantity}: ${rows.map((i) => `${i.name} [${i.category}]`).join(", ") || "none"}`);
    }
    case "heroItemDelta": {
      const held = (state) => heroItems(state, arg.name).reduce((sum, item) => sum + item.quantity, 0);
      const delta = held(after) - held(before);
      return result(compare(delta, arg), `hero quantity change in this step ${delta}`);
    }
    case "heroItemCategory": {
      const rows = heroItems(after, arg.name);
      const pass = rows.some((item) => matcher(arg.category).test(item.category));
      return result(pass, `categories: ${rows.map((i) => i.category).join(", ") || "no such item"}`);
    }
    case "itemOwnedBy": {
      const owners = new Map(after.entities.map((e) => [e.id, e]));
      const rows = after.items.filter((i) => i.quantity > 0 && matcher(arg.item).test(i.name));
      const pass = rows.some((i) => owners.get(i.owner_entity_id) &&
        (matcher(arg.owner).test(owners.get(i.owner_entity_id).name) ||
          matcher(arg.owner).test(owners.get(i.owner_entity_id).kind) ||
          matcher(arg.owner).test(owners.get(i.owner_entity_id).details ?? "")));
      return result(pass, rows.map((i) => `${i.name} → ${owners.get(i.owner_entity_id)?.name ?? "nobody"}`).join(", ") || "no such item");
    }
    case "outcome":
      return result(ctx.turn?.outcome === arg, `outcome ${ctx.turn?.outcome ?? "n/a"}`);
    case "responseMode":
      return result(ctx.turn?.responseMode === arg, `mode ${ctx.turn?.responseMode ?? "n/a"}`);
    case "modelRequests":
      return result(compare(ctx.turn?.modelRequests.total ?? 0, arg), `${ctx.turn?.modelRequests.total ?? 0} request(s)`);
    case "effectsAccepted": {
      const n = (ctx.turn?.effects.accepted ?? []).filter((k) => !arg.kind || k === arg.kind).length;
      return result(compare(n, arg), `accepted: ${(ctx.turn?.effects.accepted ?? []).join(", ") || "none"}`);
    }
    case "narrationExcludes": {
      const text = ctx.turn?.narration ?? "";
      return result(!matcher(arg).test(text), text ? `narration ${text.length} chars` : "no narration");
    }
    case "noPublicLeak": {
      const text = await publicText(ctx.f, ctx.campaignId);
      const narrations = ctx.narrations.join("\n");
      const hit = matcher(arg).exec(text) ?? matcher(arg).exec(narrations);
      return result(!hit, hit ? `found "${hit[0]}" in public text` : "not found in public records or narration");
    }
    case "sameNpcAs": {
      const base = ctx.steps.get(arg.step);
      const then = base ? peopleMatching(base, arg.name).map((e) => e.id) : [];
      const now = peopleMatching(after, arg.name).map((e) => e.id);
      const pass = then.length === 1 && now.length === 1 && then[0] === now[0];
      return result(pass, `at ${arg.step}: ${then.length} match(es); now: ${now.length} match(es)`);
    }
    case "stateEquals": {
      const base = ctx.steps.get(arg.step);
      if (!base) return result(false, `no snapshot for step ${arg.step}`);
      const view = (state) => JSON.stringify({ quests: state.quests, money: state.money,
        items: state.items.map(({ id, quantity, owner_entity_id }) => ({ id, quantity, owner_entity_id })),
        entities: state.entities.map(({ id, name, resources }) => ({ id, name, resources })),
        location: state.currentLocationId });
      return result(view(base) === view(after), view(base) === view(after) ? "identical" : "differs");
    }
    case "locationIs": {
      const location = after.locations.find((l) => l.id === after.currentLocationId);
      return result(location && matcher(arg).test(location.name), `current location: ${location?.name ?? "none"}`);
    }
    // dm-loop-v1 checks ---------------------------------------------------
    case "rejectedCalls": {
      const n = (ctx.turn?.effects.rejected ?? []).length;
      return result(compare(n, arg), `rejected: ${(ctx.turn?.effects.rejected ?? []).map((r) => `${r.name} (${r.reason})`).join("; ") || "none"}`);
    }
    case "toolAccepted": {
      const n = (ctx.turn?.effects.accepted ?? []).filter((name) => name === arg.name).length;
      return result(compare(n, arg), `accepted ${arg.name} × ${n}`);
    }
    case "contextIncludes": {
      const text = ctx.turn?.contextText ?? "";
      return result(matcher(arg).test(text), text ? `request context ${text.length} chars` : "no request context recorded");
    }
    case "characterModelExists": {
      const rows = await ctx.f.query("select contents from rpg_private.dm_state where campaign_id=$1", [ctx.campaignId]);
      const npc = rows[0]?.contents?.npc ?? {};
      const actors = peopleMatching(after, arg);
      const pass = actors.some((actor) => typeof npc[`character_${actor.id}`] === "string");
      return result(pass, `${actors.length} matching character(s); models: ${Object.keys(npc).filter((k) => k.startsWith("character_")).length}`);
    }
    case "leakLogged": {
      const hits = (ctx.turn?.diagnostics ?? []).filter((d) => d.kind === "suspected_leak" && matcher(arg).test(d.detail));
      return result(hits.length > 0, hits.length ? `logged: ${hits.map((d) => d.detail).join("; ")}` : "no suspected leak logged");
    }
    case "diagnostic": {
      const hits = (ctx.turn?.diagnostics ?? []).filter((d) => d.kind === arg);
      return result(hits.length > 0, `${hits.length} × ${arg}`);
    }
    case "retried":
      return result(ctx.turn?.retried === arg, `retried ${ctx.turn?.retried ?? "n/a"}`);
    case "heroHpWithinMax": {
      const hero = after.entities.find((e) => e.id === after.heroId);
      const within = !!hero && (hero.hp === null ? hero.max_hp === null : hero.hp >= 0 && hero.hp <= hero.max_hp);
      return result(within === !!arg, `hero HP ${hero?.hp ?? "–"}/${hero?.max_hp ?? "–"}`);
    }
    // ---- Stage 4 checks (docs/stages/STAGE_4.md §2, §3, §6) ----
    case "questKind": {
      const rows = after.quests.filter((q) => matcher(arg.title).test(q.title));
      return result(rows.length && rows.every((q) => (q.kind ?? "quest") === arg.kind),
        rows.length ? rows.map((q) => `${q.title}: ${q.kind ?? "quest"}`).join("; ") : "no matching quest");
    }
    case "questStatus": {
      const rows = after.quests.filter((q) => matcher(arg.title).test(q.title));
      return result(rows.length && rows.every((q) => q.status === arg.status),
        rows.length ? rows.map((q) => `${q.title}: ${q.status}`).join("; ") : "no matching quest");
    }
    case "questsSettled": {
      const settled = after.quests.filter((q) => q.reward_operation_id);
      return result(compare(settled.length, arg), settled.length ? `settled: ${settled.map((q) => q.title).join("; ")}` : "no quest has a settled reward");
    }
    case "rewardSettled": {
      const rows = after.quests.filter((q) => matcher(arg).test(q.title));
      return result(rows.length && rows.every((q) => q.reward_operation_id), rows.length ? rows.map((q) => `${q.title}: ${q.reward_operation_id ? "paid" : "unpaid"}`).join("; ") : "no matching quest");
    }
    case "privateFact": {
      const facts = await privateFacts(ctx.f, ctx.campaignId, arg.bucket ?? "fact");
      const hits = Object.entries(facts).filter(([key, value]) => matcher(arg.key).test(key) && (arg.value === undefined || matcher(arg.value).test(String(value))));
      return result(hits.length > 0, hits.length ? `facts: ${hits.map(([key]) => key).join(", ")}` : `no private fact matches ${arg.key}; keys: ${Object.keys(facts).join(", ")}`);
    }
    case "rewardTermsConverted": {
      const facts = await privateFacts(ctx.f, ctx.campaignId);
      const rows = after.quests.filter((q) => matcher(arg).test(q.title));
      const converted = rows.filter((q) => typeof facts[`quest_reward_${q.id}`] === "string");
      return result(rows.length && converted.length === rows.length, rows.length ? `${converted.length}/${rows.length} quests carry loop reward terms` : "no matching quest");
    }
    case "receiptHint": {
      const hints = ctx.turn?.effects?.hints ?? [];
      const hits = hints.filter((hint) => matcher(arg).test(hint));
      return result(hits.length > 0, hits.length ? hits.join(" | ").slice(0, 300) : `no receipt hint matches; hints: ${hints.join(" | ").slice(0, 200) || "none"}`);
    }
    case "duePlans":
      return result(compare(ctx.turn?.effects?.duePlans ?? 0, arg), `${ctx.turn?.effects?.duePlans ?? 0} due plan(s) listed on time receipts`);
    // Polish group 2: the hero's rolls carry a sheet or fiction bonus, or advantage, when the player named a fair reason.
    case "heroRollBonus": {
      const rolls = (ctx.turn?.effects?.rolls ?? []).filter((r) => r.visibility === "player");
      const earned = rolls.filter((r) => (r.modifier ?? 0) > 0 || r.advantage === "advantage");
      const pass = arg === false ? rolls.length > 0 && earned.length === 0 : rolls.length > 0 && earned.length === rolls.length;
      return result(pass, rolls.length ? rolls.map((r) => `${r.reason ?? "?"}: ${r.modifier >= 0 ? "+" : ""}${r.modifier}${r.modifierSource ? ` (${r.modifierSource})` : ""}${r.advantage !== "normal" ? ` ${r.advantage}` : ""}`).join("; ") : "no player roll this turn");
    }
    case "heroRollDc": {
      const rolls = (ctx.turn?.effects?.rolls ?? []).filter((r) => r.visibility === "player" && r.dc !== null);
      return result(rolls.length > 0 && rolls.every((r) => compare(r.dc, arg)), rolls.length ? rolls.map((r) => `${r.reason ?? "?"}: DC ${r.dc}${r.difficulty ? ` (${r.difficulty})` : ""}`).join("; ") : "no player check this turn");
    }
    case "npcRefused":
      return result(!!ctx.turn?.meta?.npcRefused === !!arg, `npcRefused ${ctx.turn?.meta?.npcRefused ?? "unset"}`);
    case "metric": {
      const report = metricsReport(parseMetrics({ fact: await privateFacts(ctx.f, ctx.campaignId) }));
      const value = report[arg.field];
      return result(value !== null && value !== undefined && compare(value, arg), `${arg.field} = ${value ?? "–"}`);
    }
    case "heroResourceMin": {
      const hero = after.entities.find((e) => e.id === after.heroId);
      const value = Number(hero?.resources?.[arg.resource] ?? NaN);
      return result(Number.isFinite(value) && value >= arg.min, `${arg.resource} = ${Number.isFinite(value) ? value : "–"}`);
    }
    case "entityKind": {
      const rows = after.entities.filter((e) => matcher(arg.name).test(e.name));
      return result(rows.length && rows.every((e) => e.kind === arg.kind), rows.length ? rows.map((e) => `${e.name}: ${e.kind}`).join("; ") : "no matching entity");
    }
    case "narrationIncludes": {
      const narration = ctx.turn?.narration ?? "";
      return result(matcher(arg).test(narration), narration ? narration.slice(0, 160) : "no narration");
    }
    case "depthEffort": {
      const effort = ctx.turn?.pin?.effort ?? null;
      return result(effort === arg, `pinned effort ${effort ?? "–"} (tension ${ctx.turn?.pin?.depth?.tension ?? "–"})`);
    }
    default:
      throw Error(`unknown check kind ${kind}`);
  }
}
