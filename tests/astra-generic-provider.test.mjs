import test from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import {randomUUID} from "node:crypto";
import {fixture} from "./phase2-mechanics-fixtures.mjs";
import {modelBudget} from "../src/lib/gameplay/dm-context.ts";
import {astraCapabilities} from "../src/lib/gameplay/astra-primary.ts";
import {final} from "./astra-generic-fixture.mjs";
const hook=registerHooks({resolve(s,c,next){return s==="server-only"?{url:"data:text/javascript,export%20{}",shortCircuit:true}:next(s,c);}});
const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");hook.deregister();
const response=raw=>new Response(JSON.stringify({model:"gpt-6-astra",service_tier:"default",status:"completed",output:[{type:"message",role:"assistant",status:"completed",content:[{type:"output_text",text:JSON.stringify(raw)}]}],usage:{input_tokens:100,output_tokens:20}}));
function setup(mode="public-unified"){
 const source=fixture();Object.assign(source,{astraStateContract:"generic-v1",astraResponseContract:"unified-v1",astraResponseMode:mode});
 const input={operationId:randomUUID(),campaignId:source.snapshot.campaign.id,expectedRevision:source.runtime.revision,mode:"game",input:"I speak freely.",companionId:null,listenerIds:[],mechanic:null};
 const context={input:JSON.stringify({astraPrimary:{responseContract:"unified-v1",responseMode:mode,stateContract:"generic-v1"}}),instructions:"Synthetic only",budget:modelBudget("gpt-6-astra"),estimatedTokens:10,sourceCount:1};return {source,input,context};
}
test("generic provider sends closed six-family schema and parses one High public final",async()=>{
 const f=setup(),bodies=[],raw=final(f.source);
 const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async(_u,init)=>{bodies.push(JSON.parse(init.body));return response(raw);}});
 assert.deepEqual((await provider.next(f.context,f.input,[],[],astraCapabilities(f.source),f.source)).output,raw);
 assert.equal(bodies.length,1);assert.equal(bodies[0].model,"gpt-6-astra");assert.equal(bodies[0].reasoning.effort,"high");assert.equal(bodies[0].service_tier,"default");
 assert.equal(bodies[0].text.format.schema.$defs.operation.anyOf.length,6);
});
test("generic provider rejects unusable final envelope and tool shape with bounded diagnostics",async()=>{
 for(const raw of [{type:"final",toolRequest:null,final:{}},{type:"tool",final:null,toolRequest:{operations:[],call:{kind:"query"}}}]){
  const f=setup(),diagnostics=[];const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async()=>response(raw),planDiagnosticObserver:v=>diagnostics.push(v)});
  await assert.rejects(provider.next(f.context,f.input,[],[],astraCapabilities(f.source),f.source),{code:"validation"});assert.ok(diagnostics.length);
 }
});
test("generic private narrator stays Medium and persists bounded Scene locale without changing legacy schema",async()=>{
 const f=setup("private-informed"),bodies=[],raw={narration:"The miller refuses gently.",visualDescription:"",clarification:null,sceneLocale:"Village Mill"};
 const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async(_u,init)=>{bodies.push(JSON.parse(init.body));return response(raw);}});
 const result=await provider.narrate(f.context,f.input);assert.equal(result.output.sceneLocale,"Village Mill");assert.equal(bodies[0].reasoning.effort,"medium");assert.equal(bodies[0].service_tier,"default");
 raw.sceneLocale="x".repeat(121);await assert.rejects(provider.narrate(f.context,f.input),{code:"validation"});
});
