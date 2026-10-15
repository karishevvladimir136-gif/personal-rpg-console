import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture } from "./phase2-mechanics-fixtures.mjs";
import { buildSceneContinuity, readSceneContinuity, selectSceneContinuity,
  selectedContinuitySubjects, sceneContinuitySubjectId } from "../src/lib/gameplay/astra-natural-continuity.ts";

function setup(){
  const source=fixture();
  source.astraResponseContract="unified-v1";
  source.astraNaturalContract="natural-v1";
  source.privateState={};
  const request=text=>({operationId:randomUUID(),campaignId:source.snapshot.campaign.id,
    expectedRevision:source.runtime.revision,mode:"game",input:text,companionId:null,listenerIds:[],mechanic:null});
  function append(input,proposal){
    const sceneId=randomUUID();
    const capsule=buildSceneContinuity(source,input,proposal,sceneId);
    const scene={id:sceneId,campaign_id:input.campaignId,session_id:source.snapshot.publicState.current_session_id,
      title:"DM",body:"A public scene.",role:"narration",settings_revision:1,revision:1,
      created_at:"2026-10-14T00:00:00Z",updated_at:"2026-10-14T00:00:00Z",
      sequence:source.snapshot.scenes.length+1,public_continuity:capsule};
    source.snapshot.scenes.push(scene);
    source.snapshot.publicState.current_scene_id=sceneId;
    source.runtime.revision++;
    return {scene,capsule};
  }
  return {source,request,append};
}
const miller={subjectRef:null,kind:"npc",name:"Tomas",description:"The flour-dusted miller of the Old Mill."};
const mill={name:"Old Mill",description:"A small working mill within the clearing's surroundings."};

test("new public continuity identities are server-derived and replay-stable without new gameplay records",()=>{
  const f=setup(),input=f.request("I meet the miller Tomas."),sceneId=randomUUID();
  const tracked=structuredClone({entities:f.source.snapshot.entities,locations:f.source.snapshot.locations,
    items:f.source.snapshot.items,quests:f.source.snapshot.quests,location:f.source.snapshot.publicState.current_location_id});
  const proposal={locale:mill,subjects:[miller]};
  const first=buildSceneContinuity(f.source,input,proposal,sceneId);
  assert.deepEqual(buildSceneContinuity(f.source,input,proposal,sceneId),first);
  assert.equal(first.subjects[0].id,sceneContinuitySubjectId(input.operationId,0));
  assert.equal(first.subjects[0].originSceneId,sceneId);
  assert.equal(first.subjects[0].originOperationId,input.operationId);
  assert.equal(first.parentLocationId,tracked.location);
  assert.deepEqual({entities:f.source.snapshot.entities,locations:f.source.snapshot.locations,
    items:f.source.snapshot.items,quests:f.source.snapshot.quests,location:f.source.snapshot.publicState.current_location_id},tracked);
});

test("twenty rapid public snapshots remember a ten-turn callback with no summary or Memory dependency",()=>{
  const f=setup();
  const original=f.append(f.request("I meet Tomas at the Old Mill."),{locale:mill,subjects:[miller]});
  const subject=original.capsule.subjects[0];
  for(let index=2;index<=12;index++){
    f.append(f.request(`I watch the road quietly, moment ${index}.`),{locale:null,subjects:[]});
  }
  const callback=f.request("I return to the Old Mill and greet Tomas.");
  const selected=selectSceneContinuity(f.source,callback);
  assert.deepEqual(selected.current.subjects,[],"Historical recall does not make a departed NPC present");
  assert.ok(selected.relevant.some(capsule=>capsule.subjects.some(row=>row.id===subject.id)));
  const returned=f.append(callback,{locale:mill,subjects:[{...miller,subjectRef:subject.id}]});
  assert.equal(returned.capsule.subjects[0].id,subject.id);
  assert.equal(returned.capsule.subjects[0].originSceneId,original.scene.id);
  for(let index=14;index<=20;index++){
    f.append(f.request(`I continue talking with Tomas, moment ${index}.`),{
      locale:mill,subjects:[{...miller,subjectRef:subject.id}]});
  }
  assert.equal(f.source.snapshot.scenes.length,20);
  assert.equal(f.source.memory,undefined,"This helper reads committed public originals, not a generated digest");
  assert.equal(selectSceneContinuity(f.source,f.request("What does he say next?")).current.subjects[0].id,subject.id);
});

test("serialized save/session source fixtures preserve prior subject identity and clear current presence",()=>{
  const f=setup();
  const original=f.append(f.request("I speak with Tomas."),{locale:mill,subjects:[miller]});
  const restored=JSON.parse(JSON.stringify(f.source));
  restored.snapshot.publicState.current_session_id=randomUUID();
  restored.snapshot.publicState.current_scene_id=null;
  const input={...f.request("I return to Tomas at the Old Mill."),expectedRevision:restored.runtime.revision};
  const selection=selectSceneContinuity(restored,input);
  assert.equal(selection.current,null);
  assert.equal(selection.relevant[0].subjects[0].id,original.capsule.subjects[0].id);
  const next=buildSceneContinuity(restored,input,{locale:mill,
    subjects:[{...miller,subjectRef:original.capsule.subjects[0].id}]},randomUUID());
  assert.equal(next.subjects[0].originSceneId,original.scene.id);
  assert.equal(next.parentLocationId,restored.snapshot.publicState.current_location_id);
});

test("current capsule and at most three relevant older capsules are selected without inventing presence",()=>{
  const f=setup();
  for(let index=0;index<8;index++)f.append(f.request(`I inspect workshop ${index}.`),{
    locale:{name:`Workshop ${index}`,description:"A public workshop."},subjects:[]});
  const selected=selectSceneContinuity(f.source,f.request("I remember the workshop."));
  assert.equal(selected.current.locale.name,"Workshop 7");
  assert.equal(selected.relevant.length,3);
  assert.equal(selected.relevant[0].locale.name,"Workshop 6");
});

test("owner-corrected, foreign, malformed and forged continuity is omitted safely",()=>{
  const f=setup(),entry=f.append(f.request("I meet Tomas."),{locale:mill,subjects:[miller]});
  const valid=structuredClone(entry.scene);
  for(const change of [
    scene=>{scene.revision=2;scene.body="Owner correction: this scene is different.";},
    scene=>{scene.campaign_id=randomUUID();},
    scene=>{scene.role="player";},
    scene=>{scene.public_continuity.subjects[0].id=randomUUID();},
    scene=>{scene.public_continuity.parentLocationId=randomUUID();},
    scene=>{scene.public_continuity.hiddenTruth="PRIVATE_CANARY";},
  ]){
    const scene=structuredClone(valid);change(scene);
    assert.equal(readSceneContinuity(f.source,scene),null);
  }
});

test("continuity proposals cannot forge parent, IDs, provenance, identity or extra private fields",()=>{
  const f=setup(),first=f.append(f.request("I meet Tomas."),{locale:mill,subjects:[miller]});
  const good={locale:mill,subjects:[{...miller,subjectRef:first.capsule.subjects[0].id}]};
  for(const change of [
    proposal=>{proposal.parentLocationId=randomUUID();},
    proposal=>{proposal.subjects[0].id=randomUUID();},
    proposal=>{proposal.subjects[0].originSceneId=randomUUID();},
    proposal=>{proposal.subjects[0].kind="item";},
    proposal=>{proposal.subjects[0].subjectRef=randomUUID();},
    proposal=>{proposal.subjects[0].description="x".repeat(601);},
    proposal=>{proposal.locale.name="A\nmultiline label";},
    proposal=>{proposal.subjects.push({...proposal.subjects[0]});},
  ]){
    const proposal=structuredClone(good);change(proposal);
    assert.throws(()=>buildSceneContinuity(f.source,f.request("I talk to Tomas."),proposal,randomUUID()),{code:"validation"});
  }
  assert.equal(selectedContinuitySubjects(f.source,f.request("Tomas"))[0].id,first.capsule.subjects[0].id);
});

test("full snapshots clear scene locale/subjects without mutating tracked geography",()=>{
  const f=setup(),parent=f.source.snapshot.publicState.current_location_id;
  f.append(f.request("I visit the Old Mill."),{locale:mill,subjects:[miller]});
  const cleared=f.append(f.request("I leave the mill and return to the open clearing."),{locale:null,subjects:[]});
  assert.equal(cleared.capsule.locale,null);
  assert.deepEqual(cleared.capsule.subjects,[]);
  assert.equal(cleared.capsule.parentLocationId,parent);
  assert.equal(f.source.snapshot.publicState.current_location_id,parent);
});

test("current public description outranks an older capsule for the same subject identity",()=>{
  const f=setup();
  const old=f.append(f.request("I meet Tomas."),{locale:mill,subjects:[miller]});
  f.append(f.request("I see Tomas wearing his new blue apron."),{locale:mill,subjects:[{
    ...miller,subjectRef:old.capsule.subjects[0].id,description:"Tomas now wears a blue apron."}]});
  assert.equal(selectedContinuitySubjects(f.source,f.request("I greet Tomas the miller."))[0].description,
    "Tomas now wears a blue apron.");
});

test("an explicit public subject may reveal a bounded name while identity and origin remain unchanged",()=>{
  const f=setup();
  const first=f.append(f.request("I meet a miller."),{locale:mill,subjects:[{...miller,name:"miller"}]});
  const original=first.capsule.subjects[0],entities=structuredClone(f.source.snapshot.entities);
  const named=f.append(f.request("What is your name?"),{locale:mill,subjects:[{
    subjectRef:original.id,kind:"npc",name:"Hobb",description:"Hobb introduces himself as the local miller."}]});
  assert.deepEqual(named.capsule.subjects[0],{...original,name:"Hobb",description:"Hobb introduces himself as the local miller."});
  assert.deepEqual(f.source.snapshot.entities,entities,"scene label changes confer no Entity-name write authority");
  assert.equal(selectedContinuitySubjects(f.source,f.request("I ask Hobb about the mill."))[0].id,original.id);
});

test("null-reference same-name fallback is parent/locale scoped while explicit selected identity may travel",()=>{
  const f=setup(),originalParent=f.source.snapshot.publicState.current_location_id;
  const first=f.append(f.request("I meet Tomas at the Old Mill."),{locale:mill,subjects:[miller]});
  const firstId=first.capsule.subjects[0].id;
  f.source.snapshot.publicState.current_location_id=f.source.snapshot.locations.find(row=>row.id!==originalParent).id;
  const otherTown=f.append(f.request("I meet Tomas at another Old Mill."),{locale:mill,subjects:[miller]});
  assert.notEqual(otherTown.capsule.subjects[0].id,firstId,"A same name in another town is a new subject");
  const otherRoom=f.append(f.request("I meet Tomas at the Town Tavern."),{
    locale:{name:"Town Tavern",description:"A different room."},subjects:[miller]});
  assert.notEqual(otherRoom.capsule.subjects[0].id,otherTown.capsule.subjects[0].id,"Other locale also cannot silently merge names");
  const explicit=f.append(f.request("The original Tomas from the Old Mill follows me here."),{
    locale:{name:"Town Tavern",description:"A different room."},subjects:[{...miller,subjectRef:firstId}]});
  assert.equal(explicit.capsule.subjects[0].id,firstId,"Explicit public identity retains its immutable origin");
  assert.equal(explicit.capsule.subjects[0].originSceneId,first.scene.id);
});

test("compact continuity rejects padded or control-bearing metadata without rewriting Unicode bytes",()=>{
  const f=setup(),input=f.request("I look around.");
  for(const content of [" padded","padded ","line\nbreak","tab\there","line\rbreak","delete\u007fmark"]){
    assert.throws(()=>buildSceneContinuity(f.source,input,{locale:{name:"Mill",description:content},subjects:[]},randomUUID()),{code:"validation"});
    assert.throws(()=>buildSceneContinuity(f.source,input,{locale:null,subjects:[{...miller,description:content}]},randomUUID()),{code:"validation"});
  }
  const unicode="\u00a0élan\u00a0";
  const accepted=buildSceneContinuity(f.source,input,{locale:{name:"Ｍill",description:unicode},subjects:[]},randomUUID());
  assert.equal(accepted.locale.description,unicode,"SQL-compatible edge policy never strips Unicode whitespace");
  const first=f.append(f.request("I meet Tomas at the Mill."),{locale:{name:"Mill",description:"ASCII label."},subjects:[miller]});
  const separate=f.append(f.request("I meet Tomas at the full-width Ｍill."),{locale:{name:"Ｍill",description:"Different literal label."},subjects:[miller]});
  assert.notEqual(first.capsule.subjects[0].id,separate.capsule.subjects[0].id,"NFKC must not collapse distinct supplied labels");
});

test("continuity byte gate includes jsonb separator spaces at the exact 12000-byte boundary",()=>{
  const f=setup(),input=f.request("I survey the busy room."),sceneId=randomUUID();
  const proposal={locale:{name:"Hall",description:"A public hall."},subjects:Array.from({length:12},(_,index)=>({
    subjectRef:null,kind:"npc",name:`Visitor ${index}`,description:"a".repeat(600)}))};
  const base=buildSceneContinuity(f.source,input,proposal,sceneId);
  // Four capsule members, two locale members, twelve six-member subjects, and
  // eleven inter-subject commas: 7 + 3 + 12*11 + 11 jsonb separator spaces.
  const overhead=153,baseBytes=Buffer.byteLength(JSON.stringify(base));
  let extra=12000-overhead-baseBytes;
  assert.ok(extra>0&&extra<7200);
  for(const subject of proposal.subjects){const count=Math.min(extra,600);
    subject.description="é".repeat(count)+"a".repeat(600-count);extra-=count;}
  const exact=buildSceneContinuity(f.source,input,proposal,sceneId);
  assert.equal(Buffer.byteLength(JSON.stringify(exact))+overhead,12000);
  const room=proposal.subjects.find(subject=>subject.description.includes("a"));
  room.description=room.description.replace("a","é");
  assert.throws(()=>buildSceneContinuity(f.source,input,proposal,sceneId),{code:"validation"},
    "Compact JSON alone still fits; PostgreSQL-rendered metadata would exceed the ceiling");
});

test("unique local public identity lookup is independent of selected context and does not imply presence",()=>{
  const f=setup();
  const first=f.append(f.request("I meet Tomas at the Old Mill."),{locale:mill,subjects:[miller]});
  f.append(f.request("I leave for the open road."),{locale:null,subjects:[]});
  const input=f.request("I wait quietly.");
  assert.equal(selectSceneContinuity(f.source,input).relevant.length,0);
  assert.deepEqual(selectSceneContinuity(f.source,input).current.subjects,[]);
  const returned=buildSceneContinuity(f.source,input,{locale:mill,subjects:[miller]},randomUUID());
  assert.equal(returned.subjects[0].id,first.capsule.subjects[0].id);
  assert.equal(returned.subjects[0].originSceneId,first.scene.id);
  assert.deepEqual(selectSceneContinuity(f.source,input).current.subjects,[],"A pure identity lookup does not make an older actor present");
});

// These test source snapshots and pure production helpers. Actual PostgreSQL
// save/load/atomic commit acceptance is owned by the Migration-52/runtime tests.
