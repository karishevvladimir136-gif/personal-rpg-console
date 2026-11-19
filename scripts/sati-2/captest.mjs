// SATI_2 pilot, kept apart: DeepSeek's three pre-check replies to set 1's joint-owner form (1.2) were cut at the frozen cap
// (600 + 2,000) with no visible text — the reasoning used all of it. This asks the same three pre-check conversations again,
// byte for byte, with a larger allowance (600 + 8,000), to tell the main run whether a larger cap recovers the measure. The cut
// records stand in the pre-check; these are labelled «cap test» and never pooled.   node scripts/sati-2/captest.mjs
import { makeContext, conversation, precheckItems, spendCheck, Stop } from "./run.mjs";
import { FAMILIES } from "./doors.mjs";
export const CAP_TEST_ALLOWANCE = 8000;
const ctx = await makeContext({ stream: "captest" });
try {
  await spendCheck(ctx, "cap test deepseek");
  for (const item of precheckItems("deepseek").filter((x) => x.set === 1 && x.task === "1.2")) {
    const id = item.id.replace(/^precheck\//, "captest/");
    const rec = await conversation(ctx, FAMILIES.deepseek, id, () => { const { id: _i, ...x } = item; return { kind: "captest", ...x, capTest: { allowance: CAP_TEST_ALLOWANCE, of: item.id }, plan: x.plan.map((p) => ({ ...p, maxTokens: p.maxTokens + CAP_TEST_ALLOWANCE - 2000 })) }; }, "deepseek");
    const t = rec.turns.at(-1);
    ctx.log(`${id}: ${t.stopReason} out ${t.usage.output_tokens} (reasoning ${t.usage.reasoning_tokens}) — ${JSON.stringify(t.text).slice(0, 200)}`);
  }
} catch (e) { if (e instanceof Stop) ctx.log(`STOPPED: ${e.reason}`); else throw e; }
