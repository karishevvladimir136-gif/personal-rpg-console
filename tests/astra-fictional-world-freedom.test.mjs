import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { takenOver } from "./astra-freedom-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

const usage={model:"scripted-astra",calls:1,inputTokens:0,outputTokens:0,latencyMs:0};
const fragments=text=>({beats:[{text,requiresEffects:[]}],
  visualDescription:{text:"",requiresEffects:[]}});

function fictionContract(context){
  // Assert the authoring contract actually supplied by the production runtime,
  // rather than asserting an imported constant or claiming fake model quality.
  assert.match(context.instructions,/Structured state is authoritative, not exhaustive/);
  assert.match(context.instructions,/Do not refuse.*mundane action.*lacks a structured record/);
  assert.match(context.instructions,/Moving within it.*without changing current_location_id/);
  assert.match(context.instructions,/owner corrections outrank current structured state, then Canon, established public history/);
  assert.match(context.instructions,/Explicit absence, a destroyed place, unavailable magic.*must be respected/);
  assert.match(context.instructions,/Closed-world IDs and capabilities apply to durable HP, money\/resources, inventory/);
}

async function setup({legacy=false}={}){
  // Unlike the broader soak fixture, this fixture does NOT create a mill or
  // another destination record. It starts with the real bootstrap square only.
  const {f,hero,npc}=await takenOver(51);
  const timeline=await f.fence(f.cid);
  const rpc=async args=>{
    try{return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async args=>{
    try{return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true,
    legacy?undefined:{astraResponseContract:"unified-v1"});
  const memory=createRpcMemoryStore(f.owner,memoryRpc,timeline);
  const protectedState=()=>f.one(`select jsonb_build_object(
    'entities',(select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e where campaign_id=$1),
    'locations',(select jsonb_agg(to_jsonb(l) order by l.id) from public.rpg_locations l where campaign_id=$1),
    'items',(select jsonb_agg(to_jsonb(i) order by i.id) from public.rpg_items i where campaign_id=$1),
    'quests',(select coalesce(jsonb_agg(to_jsonb(q) order by q.id),'[]') from public.rpg_quests q where campaign_id=$1),
    'world',(select md5(world::text) from rpg_private.world_foundations where campaign_id=$1),
    'worldEvents',(select count(*) from rpg_private.world_events where campaign_id=$1),
    'trackedLocation',(select current_location_id from public.rpg_public_state where campaign_id=$1),
    'worldMinutes',(select world_minutes from rpg_private.runtime_state where campaign_id=$1)) state`,[f.cid])
    .then(row=>row.state);
  const sceneCount=()=>f.one("select count(*)::integer n from public.rpg_scenes where campaign_id=$1 and role='narration'",[f.cid]).then(row=>row.n);
  async function turn(text,narration,{inspectPlan,inspectNarrator,finalPatch}={}){
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:text,companionId:null,listenerIds:[],mechanic:null};
    let plans=0,narrators=0;
    const provider={next:async(context,request,_receipts,_checks,_caps,source)=>{
      plans++;
      fictionContract(context);
      inspectPlan?.(context,source,request);
      const final={worldMinutes:source.runtime.worldMinutes,changes:[],outcomes:[],privatePatches:[],effects:[],
        ...(source.astraResponseContract==="unified-v1"&&source.astraResponseMode!=="private-informed"
          ?{publicNarration:fragments(narration)}:{}),
        ...(finalPatch?.(source,request)??{})};
      return {usage,output:{type:"final",call:null,final}};
    },narrate:async(context)=>{
      narrators++;
      fictionContract(context);
      inspectNarrator?.(context);
      return {usage,output:{narration,visualDescription:"",clarification:null}};
    }};
    const result=await runAstraTurn(input,{store,memory,provider,
      summaries:{summarize:()=>assert.fail("No foreground summary/provider work in this fixture")}});
    return {input,result,plans,narrators};
  }
  return {f,hero,npc,store,protectedState,sceneCount,turn};
}

test("seven unrecorded mundane premises commit fiction without creating tracked people, places, possessions or jobs",async()=>{
  const s=await setup();
  try{
    const initial=await s.protectedState();
    const names=[...initial.entities,...initial.locations,...initial.items].map(row=>row.name.toLowerCase());
    for(const missing of ["mill","tavern","guard","passerby","tree","room","orchard"])
      assert.equal(names.some(name=>name.includes(missing)),false,`${missing} must actually be unrecorded`);
    assert.equal(initial.locations.length,1,"The fixture has no precreated travel destination");
    const lead="Try the miller for work; the old mill off this square sometimes needs a spare pair of hands.";
    assert.equal((await s.turn("I ask if there is ordinary work nearby.",lead)).result.status,"committed");
    const before=await s.protectedState(),scenes=await s.sceneCount();
    const cases=[
      ["i go to mill and ask miller for job","At the small mill off the square, a flour-dusted worker hears your question and asks what you can do.",lead],
      ["I step into a nearby tavern and ask what is served.","A plain local tavern opens off the square. From behind the counter comes an answer about today's soup."],
      ["I ask an unnamed guard which road is busiest.","An unnamed guard resting by the street points out the market road and returns to watching the crowd."],
      ["I greet a passerby and ask for directions.","A passerby pauses and points out the ordinary market road beyond the square."],
      ["I sit beneath an ordinary tree by the square.","Leaves shift above you as you settle beneath a roadside tree and watch the square."],
      ["I look into a quiet room opening off the square.","The quiet room holds a plain table, two chairs and the afternoon light; no one insists you do anything next."],
      ["I walk to a plausible nearby orchard within this village square's surroundings.","At the edge of the square's surroundings, a small orchard offers shade and the smell of fallen fruit."],
    ];
    for(const [input,narration,evidence] of cases){
      const turn=await s.turn(input,narration,{inspectPlan:(context)=>{
        if(evidence)assert.ok(context.input.includes(evidence),"Public lead must reach the DM");
      }});
      assert.equal(turn.result.status,"committed",input);
      assert.equal(turn.result.narration,narration);
      assert.equal(turn.plans,1);
      assert.deepEqual(await s.protectedState(),before,"Fiction does not create or mutate tracked authority");
    }
    assert.equal(await s.sceneCount(),scenes+7);
    assert.equal((await s.f.one("select count(*)::integer n from rpg_private.turns where campaign_id=$1 and input->>'mode'='game' and status='committed'",[s.f.cid])).n,8);
  }finally{await s.f.db.close();}
});

test("private-informed planning and its strict public narrator share mundane fictional freedom",async()=>{
  const s=await setup();
  try{
    const secret="FICTION_FREEDOM_PRIVATE_COGNITION_87321";
    const claim=s.store.claim;
    s.store.claim=async(...args)=>{
      const current=await claim(...args);
      if(current)current.source.privateState={fact:{scoped:{actorId:s.npc,value:secret}}};
      return current;
    };
    const npc=await s.f.one("select name from public.rpg_entities where id=$1",[s.npc]);
    const before=await s.protectedState(),scenes=await s.sceneCount();
    const narration="The organiser points toward an ordinary tavern off the square; a worker there may know of a spare room.";
    const turn=await s.turn(`I ask ${npc.name} about a nearby tavern or room.`,narration,{
      inspectPlan:(context,source)=>{
        assert.equal(source.astraResponseMode,"private-informed");
        assert.ok(context.input.includes(secret));
      },inspectNarrator:context=>{
        assert.equal(context.input.includes(secret),false);
        assert.equal(context.input.includes("scoped"),false);
        assert.equal(JSON.parse(context.input).astraPrimary.responseMode,"private-informed");
      }});
    assert.equal(turn.result.status,"committed");
    assert.equal(turn.plans,1);
    assert.equal(turn.narrators,1);
    assert.equal(turn.result.narration,narration);
    assert.deepEqual(await s.protectedState(),before);
    assert.equal(await s.sceneCount(),scenes+1);
  }finally{await s.f.db.close();}
});

test("existing unpinned Astra operations keep two-stage recovery while receiving the same fictional freedom",async()=>{
  const s=await setup({legacy:true});
  try{
    const before=await s.protectedState();
    const turn=await s.turn("I ask an unnamed guard whether a tavern is nearby.",
      "The unnamed guard points to an ordinary doorway off the square and says a tavern serves locals there.",{
        inspectPlan:(_context,source)=>assert.equal(source.astraResponseContract,undefined)});
    assert.equal(turn.result.status,"committed");
    assert.equal(turn.plans,1);
    assert.equal(turn.narrators,1);
    assert.equal((await s.f.one("select astra_response_contract,astra_response_mode from rpg_private.turns where id=$1",[turn.input.operationId])).astra_response_contract,null);
    assert.deepEqual(await s.protectedState(),before);
  }finally{await s.f.db.close();}
});

test("explicit Canon absence reaches the production model packet and is respected by the scripted response",async()=>{
  const s=await setup();
  try{
    const canon="This settlement has no mill. Grain is taken to the distant county town instead.";
    await s.f.mutation("document.save",s.f.cid,{title:"Established settlement facts",status:"canon",body:canon},0,"campaign");
    const before=await s.protectedState();
    const turn=await s.turn("I go to the mill for work.",
      "There is no mill in this settlement. The organiser can discuss other local work or tell you about the county road.",{
        inspectPlan:context=>assert.ok(context.input.includes(canon))});
    assert.equal(turn.result.status,"committed");
    assert.deepEqual(await s.protectedState(),before);
    assert.equal((await s.f.one("select body from public.rpg_documents where campaign_id=$1 and title='Established settlement facts'",[s.f.cid])).body,canon);
  }finally{await s.f.db.close();}
});

test("a destroyed mill in established public history reaches the DM rather than being silently recreated",async()=>{
  const s=await setup();
  try{
    const history="The old mill burned down last winter. Only its stone foundation remains beside the square.";
    assert.equal((await s.turn("I ask what happened to the old mill.",history)).result.status,"committed");
    const before=await s.protectedState();
    const turn=await s.turn("I go to the mill and ask the miller for work.",
      "The mill's stone foundation is all that remains. No miller is working there; the organiser may know another way to earn a meal.",{
        inspectPlan:context=>assert.ok(context.input.includes(history))});
    assert.equal(turn.result.status,"committed");
    assert.deepEqual(await s.protectedState(),before);
  }finally{await s.f.db.close();}
});

for(const kind of ["unknown-location","unknown-entity","unsupported-hp","invented-money","item-increase","magical-artifact-create"]){
  test(`fictional freedom does not authorize ${kind} durable mutations`,async()=>{
    const s=await setup();
    try{
      if(kind==="unsupported-hp")await s.f.one("update public.rpg_entities set hp=5,max_hp=10 where id=$1",[s.hero]);
      const before=await s.protectedState(),scenes=await s.sceneCount();
      const turn=await s.turn("I try a creative ordinary action.","An unauthorized mechanical completion.",{
        finalPatch:(source,input)=>{
          const hero=source.snapshot.entities.find(row=>row.id===s.hero);
          const item=source.snapshot.items[0];
          const changes={
            "unknown-location":{family:"public_state",id:input.campaignId,
              expectedRevision:source.snapshot.publicState.revision,values:{current_location_id:randomUUID()}},
            "unknown-entity":{family:"entities",id:randomUUID(),expectedRevision:1,values:{hp:1}},
            "unsupported-hp":{family:"entities",id:s.hero,expectedRevision:hero.revision,values:{hp:10}},
            "invented-money":{family:"entities",id:s.hero,expectedRevision:hero.revision,values:{resources:{currency_silver:999}}},
            "item-increase":{family:"items",id:item.id,expectedRevision:item.revision,values:{quantity:item.quantity+1}},
            "magical-artifact-create":{family:"items",id:randomUUID(),expectedRevision:null,values:{quantity:1}},
          };
          return {changes:[changes[kind]],...(kind==="unknown-location"?{worldMinutes:source.runtime.worldMinutes+1}:{})};
        }});
      assert.equal(turn.result.status,"failed");
      assert.equal(turn.result.failure,"validation");
      assert.equal(turn.result.narration,null);
      assert.deepEqual(await s.protectedState(),before);
      assert.equal(await s.sceneCount(),scenes);
      const persisted=await s.f.one("select input,committed_revision from rpg_private.turns where id=$1",[turn.input.operationId]);
      assert.equal(persisted.committed_revision,null);
      assert.equal(persisted.input.input,turn.input.input,"Rejected durable state must not lose the player's literal input");
    }finally{await s.f.db.close();}
  });
}

test("an unavailable magical artifact may remain a fictional possibility without granting an Item or power",async()=>{
  const s=await setup();
  try{
    const before=await s.protectedState();
    const narration="No legendary blade materializes. The organiser has heard a tale about such a weapon, but cannot verify it or give you one.";
    const turn=await s.turn("I ask for a legendary magic sword.",narration,{finalPatch:()=>({
      effects:[{kind:"unsupported_optional",description:"No accepted authority can grant the requested magical artifact."}]
    })});
    assert.equal(turn.result.status,"committed");
    assert.equal(turn.result.narration,narration);
    assert.deepEqual(await s.protectedState(),before);
  }finally{await s.f.db.close();}
});

// These are production-context and deterministic persistence regressions with
// scripted output, not evidence that a live model always honors the prose rule.
