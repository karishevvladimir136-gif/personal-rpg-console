import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { naturalFixture, finalDecision, fakeUsage, privateCanary } from "../tests/helpers/natural-play-fixture.mjs";
import { selectedContinuitySubjects } from "../src/lib/gameplay/astra-natural-continuity.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { maintainAstraMemoryAfterCommit } from "../src/lib/memory/lifecycle.ts";

const actions=(entries)=>({kind:"mechanic_actions",actions:entries,restSafety:null});
const narrator=()=>assert.fail("Public-only soak must not invoke a narrator");
const request=(subjectRef,kind,purpose)=>({subjectRef,kind,purpose,ownerRef:null});
const publicStory=(fiction,claims=[])=>({independentBeat:fiction,
  beats:claims.map(([text,index])=>({text,requiresEffects:[index]})),
  visualDescription:{text:"",requiresEffects:[]}});

/** Actual production Memory/turn store/SQL chain, fake provider only. There are
 * no environment reads, HTTP requests, owner state or paid dispatches here. */
export async function runNaturalPlaySoak({turns=200}={}) {
  assert.ok(Number.isInteger(turns)&&turns>=200&&turns<=300&&turns%10===0);
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc",secondCampaign:true});
  const before=await h.snapshot();
  const worldBefore=await h.f.one(`select world,(select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
    from rpg_private.world_foundations where campaign_id=$1`,[h.f.cid]);
  let providerCalls=0,callbackSeen=false,overflowSeen=false,maintenance=0,millerId=null,looseItem=null,jobId=null;
  const perTurnCalls=[],sizes=[];
  try {
    for(let index=0;index<turns;index++) {
      const phase=index%10,round=Math.floor(index/10),name=`ordinary stick ${round+1}`;
      const text=phase===0 ? index===0 ? "I visit the village mill and greet the miller." : `I pick up ${name}.`
        : phase===1 ? index===11 ? "I finish the agreed flour delivery and ask Hobb for my two silver." : "I ask about work at the mill and accept the delivery." : phase===2 ? "I set my loose stick down."
        : phase===3 ? "I retrieve my loose stick." : phase===4 ? "I give Nera my loose stick."
        : phase===5 ? "I spend one Focus on careful preparation." : phase===6 ? "I make a careful ordinary skill attempt."
        : phase===7 ? "I wait quietly and exchange a few harmless words."
        : phase===8 ? "I take a permitted long rest in the village barn." : "I return to the village mill and recall Hobb and the brass compass promise.";
      let calls=0;
      const provider={next:async(context,input,receipts,_checks,_caps,source)=>{
        calls++;providerCalls++;sizes.push(Buffer.byteLength(context.input,"utf8"));
        assert.equal(context.input.includes(privateCanary),false);
        assert.equal(source.astraNaturalContract,"natural-v1");
        assert.equal(source.astraResponseMode,"public-unified");
        assert.equal(source.historyComplete,true,"Prepared bounded Memory coverage survives every provisional context refresh, including beyond64 turns");
        const effects=[],materializations=[];
        let continuity={locale:null,subjects:[]};
        if(index===0)continuity={locale:{name:"Village Mill",description:"An ordinary working mill in the village."},
          subjects:[{subjectRef:null,kind:"npc",name:"miller",description:"Hobb is the ordinary village miller."}]};
        if(phase===0&&index>0)materializations.push(request(`input:${name}`,"item","inventory"));
        if(phase===1&&index===1){
          const subject=selectedContinuitySubjects(source,input).find(row=>row.name==="miller");assert.ok(subject);
          millerId=subject.id;materializations.push(request(millerId,"npc","job"));
          effects.push({kind:"job_offer",issuerId:millerId,title:"Deliver flour",description:"Deliver the agreed flour parcel.",
            currencyName:"silver",currencyAmount:2,itemName:null,itemCategory:null,itemDescription:null});
        }
        if(index===11)effects.push({kind:"job_complete",questId:jobId},{kind:"job_reward",questId:jobId,recipientId:h.hero});
        if(phase===2&&looseItem)effects.push({kind:"item_relocate",actorId:h.hero,itemId:looseItem,quantity:1,destinationEntityId:null});
        if(phase===3&&looseItem)effects.push({kind:"item_relocate",actorId:h.hero,itemId:looseItem,quantity:1,destinationEntityId:h.hero});
        if(phase===4&&looseItem)effects.push({kind:"item_relocate",actorId:h.hero,itemId:looseItem,quantity:1,destinationEntityId:h.npc});
        if(phase===5)effects.push(actions([{kind:"resource.spend",entityId:h.hero,resource:"focus",amount:1}]));
        if(phase===6&&!receipts.length)return {usage:fakeUsage,output:{type:"tool",final:null,materializations:[],
          call:{kind:"skill",actorId:h.hero,targetId:null,itemId:null,dc:12,scope:null}}};
        if(phase===8)effects.push({kind:"formal_rest",restKind:"long",restSafety:{locationId:h.home,suitable:true}});
        if(phase===9){
          const subject=selectedContinuitySubjects(source,input).find(row=>row.id===millerId);
          assert.ok(subject,"The same miller remains retrievable after rapid unrelated play");
          assert.ok(context.input.includes("brass compass"));callbackSeen=true;
          continuity={locale:{name:"Village Mill",description:"The same village mill."},subjects:[{
            subjectRef:subject.id,kind:subject.kind,name:subject.name,description:subject.description}]};
        }
        const fiction=index===0 ? "At the village mill Hobb offers two silver for delivering flour to the village store."
          : phase===9 ? `Hobb recalls the unresolved compass promise; the quiet village scene continues ${index+1}.`
          : `The ordinary scene continues ${index+1}; Nera answers in her own voice.`;
        return finalDecision(source,fiction,{continuity,materializations,effects,
          publicNarration:publicStory(fiction,effects.map((effect,i)=>[
            effect.kind==="formal_rest" ? "The recorded rest finishes." : "The recorded consequence takes effect.",i]))});
      },narrate:narrator};
      const done=await h.turn(text,provider);
      const failureDiagnostic=done.result.status==="committed" ? null : await h.f.one(
        "select astra_diagnostic,source is not null source_present,coalesce(jsonb_typeof(checkpoint#>'{astraPrimary,finalProposal}')='object',false) final_present from rpg_private.turns where id=$1",
        [done.input.operationId]);
      assert.equal(done.result.status,"committed",JSON.stringify({turn:index+1,phase,calls,failure:done.result.failure,
        diagnostic:failureDiagnostic,errors:h.errors}));
      perTurnCalls.push(calls);
      if(index===1)jobId=(await h.f.one("select id from public.rpg_quests where campaign_id=$1 and title='Deliver flour'",[h.f.cid])).id;
      if(phase===0&&index>0){const row=await h.f.one("select astra_natural_state s from rpg_private.turns where id=$1",[done.input.operationId]);
        looseItem=row.s.materializations[0].recordId;assert.ok(looseItem);}
      assert.doesNotMatch(JSON.stringify(done.result),/SYNTHETIC_UNREVEALED|astraNaturalState|privatePatches|toolReceipts/);
      if([0,11,49,99,149,199].includes(index)){
        const exact=await h.snapshot();assert.equal((await runAstraTurn(done.input,done.deps)).status,"committed");
        assert.equal(calls,perTurnCalls.at(-1));assert.deepEqual(await h.snapshot(),exact);
      }
      if(index<35){const context=await h.memory.context(h.f.cid,[],true);overflowSeen ||= context.overflow;}
      else {const current=await h.f.fence(h.f.cid);const result=await maintainAstraMemoryAfterCommit(h.f.cid,h.memory,h.summaryProvider,current);
        maintenance++;assert.equal(Boolean(result?.failed),false);}
      if(index===turns-1){
        const saved=await h.f.saves(h.f.cid,"create",await h.f.command(h.f.cid,{kind:"manual",name:"Natural soak complete"}));
        const save=saved.snapshot.saves.find(row=>row.name==="Natural soak complete"),exact=await h.snapshot();
        await h.f.saves(h.f.cid,"load",await h.f.command(h.f.cid,{saveId:save.id,label:"Natural soak resumed",recovery:false}));
        assert.deepEqual(await h.snapshot(),exact);
      }
    }
    const after=await h.snapshot(),cycles=turns/10;
    assert.equal(after.turns-before.turns,turns);assert.equal(after.events-before.events,turns);
    assert.equal(providerCalls,turns+cycles);assert.equal(after.state.hp,10);
    assert.ok(perTurnCalls.every((count,index)=>count===(index%10===6?2:1)),"Only the scheduled server skill check adds a continuation request");
    assert.deepEqual(after.state.resources,{focus:40-cycles,currency_silver:2});
    assert.equal(after.state.world_minutes,480*cycles);assert.equal(after.state.location,h.home);
    assert.equal(after.supplies,50-cycles);assert.equal(after.rests,cycles);
    assert.equal(after.items.length,before.items.length+cycles-1);
    const promoted=await h.f.one("select count(*)::integer n from public.rpg_items where campaign_id=$1 and name like 'ordinary stick %' and owner_entity_id=$2",[h.f.cid,h.npc]);
    assert.equal(promoted.n,cycles-1);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_quests where campaign_id=$1",[h.f.cid])).n,1);
    const job=await h.f.one("select status,reward_operation_id from public.rpg_quests where id=$1",[jobId]);
    assert.equal(job.status,"complete");assert.ok(job.reward_operation_id);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_entities where campaign_id=$1 and kind='player'",[h.f.cid])).n,1);
    assert.equal(callbackSeen,true);assert.equal(overflowSeen,true);assert.ok(h.summaryCalls()>0);
    assert.equal(maintenance,turns-35);
    assert.deepEqual(await h.f.one(`select world,(select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
      from rpg_private.world_foundations where campaign_id=$1`,[h.f.cid]),worldBefore);
    for(const table of ["rpg_items","rpg_quests","rpg_scenes"])
      assert.equal((await h.f.one(`select count(*)::integer n from public.${table} where campaign_id=$1`,[h.foreignCampaignId])).n,0);
    return {turns,providerCalls,paidProviderCalls:0,summaryCalls:h.summaryCalls(),maintenance,
      exactFinal:{hp:after.state.hp,resources:after.state.resources,worldMinutes:after.state.world_minutes,
        locationUnchanged:after.state.location===h.home,supplies:after.supplies,completedRests:after.rests,
        newMundaneItems:cycles-1,quests:1},callbackSeen,overflowSeen,
      maximumContextBytes:Math.max(...sizes),perTurnCalls};
  } finally {await h.f.db.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  runNaturalPlaySoak().then(report=>console.log(JSON.stringify(report,null,2))).catch(error=>{
    console.error(JSON.stringify({name:error.name,message:error.message}));process.exitCode=1;});
