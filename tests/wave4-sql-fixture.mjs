import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import {
  readFoundationLoop,
  loopCommand,
  createLoopStore,
} from "../src/lib/foundation-loop/authority.ts";
export async function loopFixture() {
  const f = await fixture();
  const w = await world(f, "Synthetic Wave 4");
  const rpc = async (args) => {
    try {
      return {
        data: (
          await f.one(
            "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
            [
              args.p_owner_id,
              args.p_campaign_id,
              args.p_action,
              JSON.stringify(args.p_payload),
              JSON.stringify(args.p_timeline),
            ],
          )
        ).result,
      };
    } catch (error) {
      return { error: { message: error.message, code: error.code } };
    }
  };
  const read = async () =>
    readFoundationLoop(rpc, f.owner, w.cid, await f.fence(w.cid));
  const store = createLoopStore(rpc, f.owner, w.cid);
  const command = async (operationId = randomUUID()) =>
    loopCommand(await read(), operationId);
  return { ...f, ...w, rpc, read, store, command };
}
