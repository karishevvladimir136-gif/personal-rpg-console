import test from "node:test";
import assert from "node:assert/strict";
import {genericLiveGate,verifyOfficialPricing,runGenericLiveSmoke} from "../scripts/astra-generic-live-smoke.mjs";
const price=async()=>({url:"https://developers.openai.com/api/docs/models/gpt-6-astra.md",checkedAt:"synthetic",inputPerMillion:10,cacheWritePerMillion:12.5,outputPerMillion:50});
const budget=()=>({calls:0,reservedUsd:0,entries:[],stopped:false});
const request=(changes={})=>({body:JSON.stringify({model:"gpt-6-astra",reasoning:{effort:"high"},service_tier:"default",max_output_tokens:4096,...changes})});
const url="https://api.openai.com/v1/responses";
test("live gate reserves before dispatch and re-verifies pricing for every request",async()=>{
 const b=budget();let verified=0,calls=0;
 const gate=genericLiveGate(b,async()=>{calls++;assert.equal(b.calls,calls);assert.ok(b.reservedUsd>0);return new Response("{}");},async()=>{verified++;return price();});
 await gate(url,request());await gate(url,request({reasoning:{effort:"medium"}}));assert.equal(calls,2);assert.equal(verified,2);
 assert.ok(!JSON.stringify(b).includes("Authorization"));
});
test("live gate refuses unverifiable/changed pricing without a provider call",async()=>{
 for(const pricing of [async()=>{throw Error("unavailable");},async()=>({...await price(),outputPerMillion:51})]){
  const b=budget();await assert.rejects(genericLiveGate(b,()=>assert.fail("paid dispatch"),pricing)(url,request()));assert.equal(b.calls,0);
 }
});
test("live gate caps total reservations including failed/unused output allowance",async()=>{
 const b=budget(),gate=genericLiveGate(b,async()=>new Response("{}"),price);
 const body=request({input:"x".repeat(60000)});let stopped=false;
 for(let i=0;i<10;i++){try{await gate(url,body);}catch{stopped=true;break;}}
 assert.equal(stopped,true);assert.ok(b.calls<10);assert.ok(b.reservedUsd<=5);
});
test("live gate caps ten text dispatches and rejects configuration expansion",async()=>{
 const b=budget(),gate=genericLiveGate(b,async()=>new Response("{}"),price);
 for(let i=0;i<10;i++)await gate(url,request({max_output_tokens:1}));
 await assert.rejects(gate(url,request({max_output_tokens:1})));assert.equal(b.calls,10);
 for(const changes of [{service_tier:"fast"},{model:"other"},{stream:true},{max_output_tokens:4097}])
  await assert.rejects(genericLiveGate(budget(),()=>assert.fail("dispatch"),price)(url,request(changes)));
});
test("uncertain transport stops subsequent actual dispatch; reservation remains held",async()=>{
 const b=budget(),gate=genericLiveGate(b,async()=>{throw Error("synthetic network failure");},price);
 await assert.rejects(gate(url,request()));const held=b.reservedUsd;assert.equal(b.calls,1);
 await assert.rejects(gate(url,request()));assert.equal(b.calls,1);assert.equal(b.reservedUsd,held);
});
test("official pricing parser rejects missing prices and unavailable page",async()=>{
 const text="| Input | $10 | 1M tokens |\n| Cached input | $1 | 1M tokens |\n| Cache writes | $12.5 | 1M tokens |\n| Output | $50 | 1M tokens |\n272K";
 assert.equal((await verifyOfficialPricing(async()=>new Response(text))).inputPerMillion,10);
 await assert.rejects(verifyOfficialPricing(async()=>new Response(text.replace("$50","$55"))));
 await assert.rejects(verifyOfficialPricing(async()=>new Response("",{status:503})));
});
test("synthetic harness stops after unmet durable journey assertion and redacts credentials",async()=>{
 let calls=0;const apiKey="sk-SYNTHETIC_ONLY_NEVER_REAL_0123456789";
 const report=await runGenericLiveSmoke({apiKey,confirmation:"ten-text-requests-five-usd-offline-gates-passed",pricing:price,fetcher:async()=>{
  calls++;const raw={type:"final",toolRequest:null,final:{genericOperations:[],privatePatches:[],publicBehavior:[],publicNarration:{beats:[{text:"The scene continues.",requiresOperations:[]}],visualDescription:null,sceneLocale:null}}};
  return new Response(JSON.stringify({model:"gpt-6-astra",service_tier:"default",status:"completed",output:[{type:"message",role:"assistant",status:"completed",content:[{type:"output_text",text:JSON.stringify(raw)}]}],usage:{input_tokens:100,output_tokens:20}}));
 }});
 assert.equal(calls,2);assert.equal(report.requests,2);assert.equal(report.stopReason,"live_reward_journey_not_established");
 assert.ok(!JSON.stringify(report).includes(apiKey));assert.ok(!JSON.stringify(report).includes("Bearer"));assert.equal(report.realMediaCalls,0);
});
