import test from 'node:test';
import assert from 'node:assert/strict';
import { experimentalTransport,executionProfile,safeMetadata,safeError } from '../src/transport.mjs';
import { planSchema,parsePlan,narrationSchema,parseNarration,feedbackSchema,parseFeedback } from '../../../src/lib/gameplay/dm-schema.ts';
import { summarySchemaFor,parseSummary } from '../../../src/lib/memory/summary.ts';
import { runtimeFixture } from '../../../tests/phase2-runtime-fixtures.mjs';

globalThis.fetch=async()=>{throw new Error('NETWORK_DISABLED_IN_TESTS');};
const secret='SYNTHETIC_PRIVATE_DO_NOT_LOG';
const profile=executionProfile('astra'),jev=executionProfile('jev');
const routing=p=>({gateway:{cost:'0.00001',routing:{finalProvider:p.provider,resolvedProviderApiModelId:p.kind==='language'?'gpt-6-astra':'jev',modelAttemptCount:1,totalProviderAttemptCount:1,planningReasoning:secret,modelAttempts:[{providerAttempts:[{provider:p.provider,providerApiModelId:p.kind==='language'?'gpt-6-astra':'jev',success:true}]}]}}});
const packet=(value,p=profile,extra={})=>({content:[{type:'text',text:JSON.stringify(value)}],finishReason:{unified:'stop',raw:'stop'},usage:{inputTokens:{total:20,noCache:20,cacheRead:0,cacheWrite:0},outputTokens:{total:10,text:10,reasoning:0}},providerMetadata:routing(p),...extra});
const response=body=>new Response(JSON.stringify(body),{headers:{'Content-Type':'application/json'}});
const simpleSchema={type:'object',additionalProperties:false,required:['ok'],properties:{ok:{type:'boolean'}}};
const simpleParse=v=>{if(!v||Object.keys(v).join()!=='ok'||v.ok!==true)throw new Error('validation');return v;};
const job={id:'synthetic-job',campaignId:'synthetic-campaign',visibility:'public',generation:1,stateRevision:1,settingsRevision:1,fromSequence:0,throughSequence:0,sources:[],requiredSourceIds:[]};
const examples=[
  ['plan',planSchema,runtimeFixture().plan,parsePlan],
  ['narration',narrationSchema,{narration:'The synthetic gate opens.',visualDescription:'A brass gate.',clarification:null},parseNarration],
  ['feedback',feedbackSchema,{narration:'A slower pace is possible.',guidanceProposal:null},parseFeedback],
  ['summary',summarySchemaFor(job),{schemaVersion:1,selections:[]},v=>parseSummary(v,job)],
];
for(const [stage,schema,value,parse] of examples){
  test(`real SDK transport preserves the existing ${stage} strict schema and independent parser (mock HTTP only)`,async()=>{
    let calls=0,wire;
    const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async(url,init)=>{calls++;assert.match(String(url),/\/language-model$/);wire=JSON.parse(init.body);return response(packet(value));}});
    const result=await t.structured(profile,'Use synthetic fixtures only.',{stage},schema,parse);
    assert.equal(calls,1);assert.deepEqual(result.output,value);assert.deepEqual(wire.responseFormat.schema,schema);
    assert.deepEqual(wire.providerOptions.gateway.only,['openai']);assert.equal(wire.providerOptions.gateway.models,undefined);assert.equal(wire.providerOptions.gateway.order,undefined);
    assert.equal(wire.providerOptions.gateway.zeroDataRetention,undefined);assert.equal(wire.providerOptions.gateway.disallowPromptTraining,undefined);
    assert.equal(wire.providerOptions.openai.reasoningEffort,'xhigh');assert.equal(wire.providerOptions.openai.store,false);
    assert.equal(result.metadata.actualModel,'gpt-6-astra');assert.equal(result.metadata.finalProvider,'openai');assert.equal(result.metadata.inputTokens,20);
    assert.equal(JSON.stringify(result.metadata).includes(secret),false);
  });
}
test('frozen registry/profile is data only; unknown models/options rejected before fetch',()=>{
  assert.equal(Object.isFrozen(profile.providerOptions.gateway.only),true);assert.throws(()=>profile.providerOptions.gateway.only.push('azure'));
  assert.throws(()=>executionProfile('unknown'));assert.throws(()=>executionProfile('astra',{temperature:1}));
});
test('domain parser transformations occur only on the raw schema shape, not on transformed DTOs',async()=>{
  const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>response(packet({ok:true}))});
  const r=await t.structured(profile,'x',{},simpleSchema,v=>{simpleParse(v);return {parsed:true};});
  assert.deepEqual(r.output,{parsed:true});
});
test('request overflow rejects before the injectable HTTP transport',async()=>{
  let calls=0;const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>{calls++;return response(packet({ok:true}));}});
  await assert.rejects(()=>t.structured(profile,'x',{text:'x'.repeat(12000)},simpleSchema,simpleParse),e=>e.category==='bounded_overflow');
  assert.equal(calls,0);
});
test('Jev calls installed experimental evaluation API with hard TypeSafe pin and typed choices',async()=>{
  let calls=0,wire;
  const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async(url,init)=>{calls++;assert.match(String(url),/\/evaluation-model$/);wire=JSON.parse(init.body);assert.equal(new Headers(init.headers).get('ai-model-id'),'typesafe-ai/jev');return response({answers:{a:{type:'choice',choice:'uncertain',probabilities:{relevant:0.1,irrelevant:0.1,uncertain:0.8}}},usage:{inputTokens:20,outputTokens:5},providerMetadata:routing(jev)});}});
  const r=await t.classify(jev,{text:'Synthetic ambiguous task.'},{a:{type:'choice',instructions:'Classify.',criteria:{relevant:'Relevant',irrelevant:'Unrelated',uncertain:'Unknown'}}});
  assert.equal(calls,1);assert.equal(r.answers.a.choice,'uncertain');assert.deepEqual(wire.providerOptions.gateway.only,['typesafe-ai']);assert.equal(wire.providerOptions.gateway.models,undefined);
});
for(const [status,category] of [[400,'unsupported_or_denied'],[401,'unsupported_or_denied'],[403,'unsupported_or_denied'],[404,'unsupported_or_denied'],[402,'quota'],[429,'rate_limit'],[503,'unavailable']]){
  test(`HTTP ${status} safely fails once without model/provider fallback or error leakage`,async()=>{
    let calls=0;const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>{calls++;return new Response(JSON.stringify({error:{message:secret}}),{status});}});
    await assert.rejects(()=>t.structured(profile,'x',{},simpleSchema,simpleParse),e=>e.category===category&&!JSON.stringify(e).includes(secret));assert.equal(calls,1);
  });
}
for(const mode of ['malformed','refusal','incomplete','warning','wrong-provider','wrong-model','missing-routing']){
  test(`${mode} is a controlled failure; no raw SDK payload enters the safe error`,async()=>{
    const p=packet({ok:true});
    if(mode==='malformed')p.content=[{type:'text',text:'{invalid'}];
    if(mode==='refusal'){p.content=[];p.finishReason={unified:'content-filter',raw:'content_filter'};}
    if(mode==='incomplete')p.finishReason={unified:'length',raw:'max_tokens'};
    if(mode==='warning')p.warnings=[{type:'unsupported',feature:secret,details:secret}];
    if(mode==='wrong-provider')p.providerMetadata.gateway.routing.finalProvider='azure';
    if(mode==='wrong-model')p.providerMetadata.gateway.routing.modelAttempts[0].providerAttempts[0].providerApiModelId='unapproved-model';
    if(mode==='missing-routing')delete p.providerMetadata;
    const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>response(p)});
    await assert.rejects(()=>t.structured(profile,'x',{},simpleSchema,simpleParse),e=>['configuration','provider','validation'].includes(e.code)&&!JSON.stringify(e).includes(secret));
  });
}
test('bounded timeout maps safely; the original provider is not replaced',async()=>{
  let calls=0;const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async(_url,init)=>{calls++;return await new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('test_timeout_failed')),500);init.signal.addEventListener('abort',()=>{clearTimeout(timer);reject(init.signal.reason);},{once:true});});}});
  await assert.rejects(()=>t.structured(executionProfile('astra',{timeoutMs:10}),'x',{},simpleSchema,simpleParse),e=>e.category==='timeout');assert.equal(calls,1);
});

test('Jev pinned outage fails once without substitution',async()=>{
  let calls=0;const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>{calls++;return new Response(JSON.stringify({error:{message:secret}}),{status:503});}});
  await assert.rejects(()=>t.classify(jev,{text:'synthetic'},{a:{type:'choice',instructions:'Classify.',criteria:{relevant:'Relevant',uncertain:'Unknown'}}}),e=>e.category==='unavailable'&&!JSON.stringify(e).includes(secret));
  assert.equal(calls,1);
});
test('Jev unsupported question configuration fails locally with no HTTP call',async()=>{
  let calls=0;const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>{calls++;throw new Error('unexpected_fetch');}});
  await assert.rejects(()=>t.classify(jev,{text:'synthetic'},{a:{type:'choice',criteria:{relevant:'Relevant',uncertain:'Unknown'}}}),e=>e.category==='unsupported_configuration');
  assert.equal(calls,0);
});
test('Jev response model echo without verified routing cannot establish actual provider',async()=>{
  const t=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>response({answers:{a:{type:'choice',choice:'uncertain'}},usage:{inputTokens:5,outputTokens:1},response:{modelId:'typesafe-ai/jev'}})});
  await assert.rejects(()=>t.classify(jev,{text:'synthetic'},{a:{type:'choice',instructions:'Classify.',criteria:{relevant:'Relevant',uncertain:'Unknown'}}}),e=>e.category==='unverified_routing');
});
test('untrusted diagnostic values, SDK model echo and absent usage are never fabricated as safe metadata',()=>{
  const m=safeMetadata({gateway:{routing:{finalProvider:secret,resolvedProviderApiModelId:secret},cost:secret}},{inputTokens:secret},jev,1);
  assert.equal(m.actualModel,null);assert.equal(m.finalProvider,null);assert.equal(m.costUSD,null);assert.equal(m.inputTokens,null);assert.equal(m.routingVerified,false);assert.equal(JSON.stringify(m).includes(secret),false);
  assert.deepEqual(safeError({name:'TimeoutError',message:secret}),{code:'provider',category:'timeout',retryable:true});
});
