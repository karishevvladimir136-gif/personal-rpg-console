import test from "node:test";
import assert from "node:assert/strict";
import { createIrisWorld } from "./astra-iris-fixture.mjs";
import { createIrisTextGate,runIrisLive } from "../scripts/astra-iris-parser-live.mjs";

const request=(stage="dm_plan")=>({body:JSON.stringify({
  model:"gpt-6-astra",store:false,service_tier:"default",
  reasoning:{effort:stage==="dm_plan"?"high":"medium"},
  text:{format:{name:stage,strict:true}},
  input:[{content:[{type:"input_text",text:"synthetic"}]}],
})});
const response=(output)=>new Response(JSON.stringify({model:"gpt-6-astra",
  status:"completed",output:[{type:"message",role:"assistant",status:"completed",
    content:[{type:"output_text",text:JSON.stringify(output)}]}],
  usage:{input_tokens:5,output_tokens:5}}),{status:200});
const final={type:"final",call:null,final:{schemaVersion:1,worldMinutes:0,
  changes:[],outcomes:[],privatePatches:[],effects:[]}};

test("Iris gate allows three text requests and refuses a fourth without a displayed Continue",async()=>{
  let reached=0;
  const report={maxTextRequests:3,textRequests:0,requestCapReached:false,
    providerHttpStatuses:[],providerResultStatuses:[]};
  const gate=createIrisTextGate(async()=>{reached++;return response(final);},report);
  assert.equal(gate.permitDisplayedContinue({status:"awaiting_confirmation",checks:[]}),false);
  assert.equal(gate.permitDisplayedContinue({status:"failed",checks:[
    {kind:"skill",rollNumber:1}]}),false);
  for(let i=0;i<3;i++)await gate.fetcher("https://api.openai.com/v1/responses",request());
  await assert.rejects(gate.fetcher("https://api.openai.com/v1/responses",request()),
    {message:"text_request_cap_reached"});
  assert.equal(reached,3);assert.equal(report.textRequests,3);
  assert.equal(report.requestCapReached,true);
  assert.deepEqual(report.providerResultStatuses,["completed","completed","completed"]);
});

test("Iris gate permits exactly one fourth request for a public displayed check",async()=>{
  let reached=0;
  const report={maxTextRequests:3,textRequests:0,requestCapReached:false,
    providerHttpStatuses:[],providerResultStatuses:[],displayedCheckContinue:false};
  const gate=createIrisTextGate(async()=>{reached++;return response(final);},report);
  await gate.fetcher("https://api.openai.com/v1/responses",request());
  assert.equal(gate.permitDisplayedContinue({status:"awaiting_confirmation",
    checks:[{kind:"skill",rollNumber:1}]}),true);
  assert.equal(gate.permitDisplayedContinue({status:"awaiting_confirmation",
    checks:[{kind:"skill",rollNumber:1}]}),false);
  for(let i=0;i<3;i++)await gate.fetcher("https://api.openai.com/v1/responses",request());
  await assert.rejects(gate.fetcher("https://api.openai.com/v1/responses",request()),
    {message:"text_request_cap_reached"});
  assert.equal(reached,4);assert.equal(report.maxTextRequests,4);
  assert.equal(report.displayedCheckContinue,true);
});

test("Iris fake-provider turn uses normal Continue after a displayed check",async()=>{
  const world=await createIrisWorld();
  let requests=0;
  const realFetch=async(_url,init)=>{
    requests++;
    const stage=JSON.parse(init.body).text.format.name;
    if(stage==="dm_narrate")return response({narration:"The seller considers the request.",
      visualDescription:"",clarification:null});
    if(requests===1)return response({type:"tool",final:null,
      call:{kind:"skill",actorId:world.hero,targetId:null,dc:10,itemId:null,scope:null}});
    return response(final);
  };
  const report=await runIrisLive({live:true,apiKey:"synthetic-only",realFetch,
    worldFactory:async()=>world});
  assert.equal(report.status,"committed");
  assert.equal(report.displayedCheckContinue,true);
  assert.equal(report.maxTextRequests,4);
  assert.equal(report.textRequests,3);
  assert.equal(requests,3);
  assert.deepEqual(report.toolCategories,["skill"]);
  assert.deepEqual(report.decisionCategories,["tool","final"]);
  assert.equal(report.mediaRequests,0);
  assert.equal(JSON.stringify(report).includes(world.hero),false);
});

test("Iris report keeps only accepted and rejected effect categories",async()=>{
  const world=await createIrisWorld();
  const effects=[{kind:"mundane_grant",issuerId:world.seller,
    recipientId:world.hero,currencyName:"silver",currencyAmount:2,
    itemName:"vegetables",itemCategory:"food",itemDescription:null},
  {kind:"unsupported_optional",description:"No persistent lodging permission"}];
  const realFetch=async(_url,init)=>JSON.parse(init.body).text.format.name==="dm_plan"
    ?response({...final,final:{...final.final,effects}})
    :response({narration:"The seller pays Iris and offers a loft.",
      visualDescription:"",clarification:null});
  const report=await runIrisLive({live:true,apiKey:"synthetic-only",realFetch,
    worldFactory:async()=>world});
  assert.equal(report.status,"committed");
  assert.equal(report.textRequests,2);
  assert.deepEqual(report.effectCategories,["mundane_grant","unsupported_optional"]);
  assert.deepEqual(report.acceptedEffectCategories,["mundane_grant"]);
  assert.deepEqual(report.rejectedEffectCategories,[{
    kind:"unsupported_optional",reason:"not_authorized"}]);
  assert.equal(report.after.silverBalance,2);
  const safe=JSON.stringify(report);
  assert.equal(safe.includes(world.hero),false);
  assert.equal(safe.includes(world.seller),false);
  assert.equal(safe.includes("The seller pays"),false);
});

test("Iris harness requires an explicit live flag before any fetch",async()=>{
  let fetched=false;
  await assert.rejects(runIrisLive({live:false,apiKey:"synthetic-only",
    realFetch:async()=>{fetched=true;return response(final);}}),
  {message:"explicit_live_flag_required"});
  assert.equal(fetched,false);
});
