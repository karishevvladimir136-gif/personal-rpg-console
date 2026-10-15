import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {randomUUID} from 'node:crypto';
import {fixture} from './phase2-mechanics-fixtures.mjs';
import {astraCapabilities} from '../src/lib/gameplay/astra-capabilities.ts';
import {modelBudget} from '../src/lib/gameplay/dm-context.ts';
import {resolveNaturalReferences} from '../src/lib/gameplay/astra-natural-contract.ts';
const hook=registerHooks({resolve(specifier,context,next){return specifier==='server-only'
  ? {url:'data:text/javascript,export%20{}',shortCircuit:true}:next(specifier,context);}});
const {createAstraPrimaryProvider}=await import('../src/lib/server/dm/astra-primary-provider.ts');
hook.deregister();
function setup(){
  const source=fixture();source.astraResponseContract='unified-v1';source.astraNaturalContract='natural-v1';
  source.astraResponseMode='public-unified';source.astraNaturalState={schemaVersion:1,materializations:[]};
  source.worldTakeover={schemaVersion:1,sourceWorldRevision:1,
    presentEntityIds:[...source.runtime.configuration.presentEntityIds],
    routeLocationIds:source.snapshot.locations.map(row=>row.id),actors:[],policy:{},unresolvedThreads:[],recentWorldEvents:[]};
  const input={operationId:randomUUID(),campaignId:source.snapshot.campaign.id,
    expectedRevision:source.runtime.revision,mode:'game',input:'I ask the miller for work.',
    companionId:null,listenerIds:[],mechanic:null};
  const raw={type:'final',materializations:[],call:null,final:{schemaVersion:1,
    worldMinutes:source.runtime.worldMinutes,changes:[],outcomes:[],privatePatches:[],effects:[],behavior:[],
    continuity:{locale:{name:'Village Mill',description:'A mundane watermill.'},subjects:[
      {subjectRef:null,kind:'npc',name:'Miller',description:'A flour-dusted worker.'}]},
    publicNarration:{independentBeat:'The miller looks up. “What can I do for you?”',beats:[],
      visualDescription:{text:'A watermill.',requiresEffects:[]}}}};
  const calls=[];
  const provider=createAstraPrimaryProvider({apiKey:'synthetic-only',attemptObserver:()=>{},planDiagnosticObserver:()=>{},
    fetcher:async(_url,init)=>{calls.push(JSON.parse(init.body));return new Response(JSON.stringify({
      id:'resp_synthetic_natural',model:'gpt-6-astra',status:'completed',service_tier:'default',output:[{type:'message',role:'assistant',status:'completed',
        content:[{type:'output_text',text:JSON.stringify(raw)}]}],usage:{input_tokens:10,output_tokens:10}}));}});
  const context={instructions:'Synthetic natural play',input:'{}',budget:modelBudget('gpt-6-astra'),estimatedTokens:0,sourceCount:0};
  const next=()=>provider.next(context,input,[],[],astraCapabilities(source),source);
  return {source,input,raw,calls,provider,context,next};
}
test('natural public contract requires an independent beat and bounded ephemeral continuity with one High request',async()=>{
  const f=setup();const result=await f.next();
  assert.equal(result.output.final.publicNarration.independentBeat,f.raw.final.publicNarration.independentBeat);
  assert.deepEqual(result.output.final.publicNarration.beats,[]);
  assert.deepEqual(result.output.final.continuity,f.raw.final.continuity);
  assert.equal(f.calls.length,1);assert.equal(f.calls[0].reasoning.effort,'high');
  const schema=f.calls[0].text.format.schema;
  assert.ok(schema.required.includes('materializations'));
  assert.ok(schema.properties.final.anyOf[0].properties.publicNarration.required.includes('independentBeat'));
});
test('natural schema/parser preserve original effect dependency indexes including all-dependent optional beats',async()=>{
  for(const effects of [[],[{kind:'unsupported_optional',description:'Unimplemented optional flourish'}],
    [{kind:'unsupported_optional',description:'one'},{kind:'unsupported_optional',description:'two'}]]){
    const f=setup();f.raw.final.effects=effects;
    f.raw.final.publicNarration.beats=effects.map((_e,index)=>({text:'A dependent durable assertion.',requiresEffects:[index]}));
    const result=await f.next();assert.equal(result.output.final.publicNarration.beats.length,effects.length);
    assert.ok(result.output.final.publicNarration.independentBeat);
  }
});
test('missing independent beat, malformed dependency and forged continuity parent reject without a semantic retry',async()=>{
  for(const bad of ['independent','dependency','parent']){
    const f=setup();
    if(bad==='independent')delete f.raw.final.publicNarration.independentBeat;
    if(bad==='dependency')f.raw.final.publicNarration.beats=[{text:'Paid.',requiresEffects:[0]}];
    if(bad==='parent')f.raw.final.continuity.parentLocationId=randomUUID();
    await assert.rejects(f.next(),error=>error.code==='validation');assert.equal(f.calls.length,1);
  }
});
test('natural private-informed contract contains only enum behavior and no public continuity/prose',async()=>{
  const f=setup();f.source.astraResponseMode='private-informed';
  delete f.raw.final.publicNarration;delete f.raw.final.continuity;
  const result=await f.next();assert.deepEqual(result.output.final.behavior,[]);
  assert.equal(Object.hasOwn(result.output.final,'publicNarration'),false);
  assert.equal(Object.hasOwn(result.output.final,'continuity'),false);
  f.raw.final.behavior=[{actorId:randomUUID(),stance:'refuse',tone:'firm',intensity:2}];
  await assert.rejects(f.next(),error=>error.code==='validation');
});
test('natural public-safe narrator has a separate continuity contract and no materialization authority',async()=>{
  const f=setup();
  f.context.input=JSON.stringify({astraPrimary:{responseContract:'unified-v1',responseMode:'private-informed',naturalContract:'natural-v1'}});
  Object.keys(f.raw).forEach(key=>delete f.raw[key]);Object.assign(f.raw,{narration:'“No,” she says firmly.',
    visualDescription:'',clarification:null,continuity:{locale:null,subjects:[]}});
  const result=await f.provider.narrate(f.context,f.input);
  assert.deepEqual(result.output.continuity,{locale:null,subjects:[]});
  assert.equal(f.calls[0].reasoning.effort,'medium');
  assert.equal(f.calls[0].text.format.schema.properties.materializations,undefined);
});
test('natural encounter termination schema exactly matches the existing mechanics parser',async()=>{
  const f=setup();
  await f.next();
  const schema=f.calls[0].text.format.schema;
  const dereference=value=>value?.$ref ? schema.$defs[value.$ref.split('/').at(-1)] : value;
  const endings=[];
  const visit=value=>{
    if(!value || typeof value!=='object')return;
    if(value.properties?.kind && dereference(value.properties.kind)?.enum?.includes('encounter.end'))
      endings.push(dereference(value.properties.outcome).enum);
    Object.values(value).forEach(child=>Array.isArray(child)?child.forEach(visit):visit(child));
  };
  visit(schema);
  assert.equal(endings.length,1);
  assert.deepEqual(endings[0],['victory','escape','surrender','negotiation','objective-completion']);
});
test('advertised materialization aliases normalize change IDs while leaving prose byte-identical',()=>{
  const id=randomUUID(),alias='input:rat';
  const raw={changes:[{id,hp:0},{id:alias,hp:0}],actorId:alias,entityIds:[alias],
    independentBeat:'input:rat is ordinary prose.',description:alias};
  assert.deepEqual(resolveNaturalReferences(raw,new Map([[alias,id]])),{
    ...raw,changes:[{id,hp:0},{id,hp:0}],actorId:id,entityIds:[id]});
});
