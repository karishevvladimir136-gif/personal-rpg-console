import test from 'node:test';
import assert from 'node:assert/strict';
import {safeMetadata,executionProfile,experimentalTransport} from '../src/transport.mjs';
import {metadataFailure} from '../src/smoke-recovery.mjs';
globalThis.fetch=()=>{throw new Error('NETWORK_DISABLED_IN_TESTS');};
const profile=executionProfile('astra'),usage={inputTokens:1218,outputTokens:262};
const routing=()=>({gateway:{cost:'0.0283175',routing:{originalModelId:profile.model,canonicalSlug:profile.model,finalProvider:'openai',modelAttemptCount:1,totalProviderAttemptCount:1,modelAttempts:[{modelId:'openai:gpt-6-astra',canonicalSlug:profile.model,success:true,providerAttemptCount:1,providerAttempts:[{provider:'openai',success:true}]}]}}});
const safe=m=>safeMetadata(m,usage,profile,10);
test('pinned documented routing with missing API model name succeeds with explicit null provenance',()=>{
 const m=safe(routing());assert.equal(m.routingVerified,true);assert.equal(m.actualModel,null);assert.equal(metadataFailure(m,profile),null);
 assert.equal(m.gatewayCanonicalModel,profile.model);assert.equal(m.modelAttemptCanonicalModel,profile.model);assert.equal(m.modelAttemptId,'openai:gpt-6-astra');assert.equal(m.successfulProvider,'openai');assert.equal(m.successfulProviderAttempts,1);
});
for(const [name,mutate] of [
 ['wrong final provider',r=>{r.finalProvider='azure';}],
 ['unexpected successful provider',r=>{r.modelAttempts[0].providerAttempts[0].provider='azure';}],
 ['two providers',r=>{r.totalProviderAttemptCount=2;r.modelAttempts[0].providerAttempts.push({provider:'azure',success:true});}],
 ['hidden extra attempt despite count one',r=>{r.modelAttempts[0].providerAttempts.unshift({provider:'azure',success:false});}],
 ['same-provider retry',r=>{r.modelAttempts[0].providerAttempts.unshift({provider:'openai',success:false});}],
 ['no successful provider',r=>{r.modelAttempts[0].providerAttempts[0].success=false;}],
 ['missing provider attempts',r=>{delete r.modelAttempts[0].providerAttempts;}],
 ['two models',r=>{r.modelAttemptCount=2;r.modelAttempts.push({...r.modelAttempts[0]});}],
 ['hidden extra model despite count one',r=>{r.modelAttempts.push({...r.modelAttempts[0]});}],
 ['wrong original model',r=>{r.originalModelId='openai/gpt-5.4';}],
 ['wrong canonical model',r=>{r.canonicalSlug='openai/gpt-5.4';}],
 ['wrong model attempt canonical slug',r=>{r.modelAttempts[0].canonicalSlug='openai/gpt-5.4';}],
 ['wrong model attempt ID',r=>{r.modelAttempts[0].modelId='openai:gpt-5.4';}],
 ['model attempt reports failure',r=>{r.modelAttempts[0].success=false;}],
 ['model attempt count disagrees',r=>{r.modelAttempts[0].providerAttemptCount=2;}],
 ['conflicting API model naming',r=>{r.resolvedProviderApiModelId='gpt-5.4';}],
])test(name+' fails closed',()=>{const m=routing();mutate(m.gateway.routing);assert.equal(safe(m).routingVerified,false);});
test('exact allowlisted API model survives as provenance; canonical evidence is separate',()=>{
 const m=routing();m.gateway.routing.modelAttempts[0].providerAttempts[0].providerApiModelId='gpt-6-astra-2026-09-01';
 assert.equal(safe(m).actualModel,'gpt-6-astra-2026-09-01');assert.equal(safe(m).routingVerified,true);
 delete m.gateway.routing.modelAttempts[0].providerAttempts[0].providerApiModelId;m.gateway.routing.resolvedProviderApiModelId='gpt-6-astra';assert.equal(safe(m).actualModel,'gpt-6-astra');
});
test('optional canonical fields can be absent but cannot be wrong or fabricated',()=>{
 const m=routing();delete m.gateway.routing.canonicalSlug;delete m.gateway.routing.originalModelId;delete m.gateway.routing.modelAttempts[0].canonicalSlug;delete m.gateway.routing.modelAttempts[0].modelId;
 const result=safe(m);assert.equal(result.routingVerified,true);assert.equal(result.gatewayCanonicalModel,null);assert.equal(result.modelAttemptId,null);
});
test('untrusted routing names are not retained in safe output',()=>{
 const marker='SYNTHETIC_PRIVATE_NEVER_LOG',m=routing();m.gateway.routing.canonicalSlug=marker;m.gateway.routing.modelAttempts[0].modelId=marker;m.gateway.routing.planningReasoning=marker;
 const result=safe(m);assert.equal(result.routingVerified,false);assert.equal(JSON.stringify(result).includes(marker),false);
});
test('modified profile model, missing hard pin or alternate fallback cannot satisfy routing',()=>{
 for(const mutate of [p=>{p.model='openai/gpt-5.4';},p=>{delete p.providerOptions.gateway.only;},p=>{p.providerOptions.gateway.only.push('azure');},p=>{p.providerOptions.gateway.models=['openai/gpt-5.4'];}]){
 const p=structuredClone(profile);mutate(p);assert.equal(safeMetadata(routing(),usage,p,1).routingVerified,false);
 }
});
for(const hasRouting of [true,false])test('SDK response model echo never becomes actual execution provenance; routing '+hasRouting,async()=>{
 const packet={content:[{type:'text',text:'{"ok":true}'}],finishReason:{unified:'stop',raw:'stop'},usage:{inputTokens:{total:1218},outputTokens:{total:262}},response:{modelId:profile.model},...(hasRouting?{providerMetadata:routing()}:{})};
 let calls=0;const transport=experimentalTransport({apiKey:'SYNTHETIC_ONLY',fetcher:async()=>{calls++;return new Response(JSON.stringify(packet),{headers:{'Content-Type':'application/json'}});}});
 const call=()=>transport.structured(profile,'Synthetic.',{},{type:'object',additionalProperties:false,required:['ok'],properties:{ok:{type:'boolean'}}},v=>v);
 if(hasRouting){const r=await call();assert.equal(r.metadata.actualModel,null);assert.equal(r.metadata.routingVerified,true);}
 else await assert.rejects(call,e=>e.category==='unverified_routing');assert.equal(calls,1);
});
