// Explicit opt-in, disposable PGlite and one literal V2 turn. No owner DB or
// application service is imported. Run only after offline P1 gates pass.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fixture, world } from "../tests/phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

const OUTPUT_LIMIT=120_000,ERROR_LIMIT=4_000,TRACE_LIMIT=128;
const price=(input,output)=>(input*10+output*50)/1_000_000;
function bounded(value,secret,limit=OUTPUT_LIMIT){
  if(typeof value!=="string")return null;
  let safe=secret?value.replaceAll(secret,"[REDACTED]"):value;
  safe=safe.replace(/Bearer\s+[^\s,;]+/gi,"Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g,"[REDACTED]")
    .replace(/\b(?:OPENAI_API_KEY|Authorization|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,"[REDACTED]");
  return {text:safe.slice(0,limit),bytes:Buffer.byteLength(value),
    truncated:safe.length>limit,redacted:safe!==value};
}
function safeError(error,secret){
  const e=error&&typeof error==="object"?error:{};
  return {name:bounded(e.name,secret,100)?.text??null,
    code:bounded(e.code,secret,100)?.text??null,
    message:bounded(e.message,secret,ERROR_LIMIT)?.text??null};
}
function trace(state,method,phase,detail={}){
  if(state.events.length<TRACE_LIMIT)state.events.push({order:state.events.length+1,
    method,phase,...detail});
  else state.traceOverflow++;
}
export function diagnosticState(secret=""){
  const state={events:[],traceOverflow:0,responses:[],sqlErrors:[],
    parsedDecision:null,requests:0,inputTokens:0,outputTokens:0,
    usageKnown:true,latenciesMs:[],privateSnapshot:null};
  Object.defineProperty(state,"secret",{value:secret,enumerable:false});
  return state;
}
export function diagnosticFetcher(state,realFetch){
  return async(url,init)=>{
    if(state.requests>=4)throw Error("diagnostic_request_cap");
    // Inspect request size for the spend ceiling; save no request or headers.
    const body=JSON.parse(String(init?.body??"{}"));
    if(!Number.isSafeInteger(body.max_output_tokens) || body.max_output_tokens<1)
      throw Error("diagnostic_output_cap_unknown");
    const upper=price(Buffer.byteLength(String(init.body))+2048,body.max_output_tokens);
    if(!state.usageKnown || price(state.inputTokens,state.outputTokens)+upper>1)
      throw Error("diagnostic_spend_cap");
    state.requests++;
    trace(state,"provider.http","entered",{request:state.requests});
    const started=performance.now();
    try{
      const response=await realFetch(url,init);
      try{
        const cloned=response.clone();
        const raw=await cloned.text();
        if(Buffer.byteLength(raw)>200_000)throw Error("diagnostic_response_too_large");
        const payload=JSON.parse(raw),usage=payload?.usage??{};
        const input=usage.input_tokens,output=usage.output_tokens;
        if(Number.isSafeInteger(input)&&input>=0&&Number.isSafeInteger(output)&&output>=0){
          state.inputTokens+=input;state.outputTokens+=output;
        }else state.usageKnown=false;
        const chunks=Array.isArray(payload?.output)?payload.output
          .filter((part)=>part?.type==="message"&&part.role==="assistant")
          .flatMap((part)=>Array.isArray(part.content)?part.content
            .filter((content)=>content?.type==="output_text"&&typeof content.text==="string")
            .map((content)=>content.text):[]):[];
        state.responses.push({httpStatus:response.status,
          model:bounded(payload?.model,state.secret,100)?.text??null,
          serviceTier:bounded(payload?.service_tier,state.secret,100)?.text??null,
          responseStatus:bounded(payload?.status,state.secret,100)?.text??null,
          usage:{inputTokens:Number.isSafeInteger(input)?input:null,
            outputTokens:Number.isSafeInteger(output)?output:null,
            reasoningTokens:Number.isSafeInteger(usage.output_tokens_details?.reasoning_tokens)
              ?usage.output_tokens_details.reasoning_tokens:null,
            cachedTokens:Number.isSafeInteger(usage.input_tokens_details?.cached_tokens)
              ?usage.input_tokens_details.cached_tokens:null},
          outputText:chunks.length===1?bounded(chunks[0],state.secret):null,
          outputTextCount:chunks.length});
        trace(state,"provider.http","returned",{httpStatus:response.status,
          outputTextExtracted:chunks.length===1});
      }catch(error){trace(state,"provider.http","capture-threw",{
        error:safeError(error,state.secret)});}
      return response;
    }catch(error){trace(state,"provider.http","threw",{
      error:safeError(error,state.secret)});throw error;}
    finally{state.latenciesMs.push(Math.round(performance.now()-started));}
  };
}
export function diagnosticProvider(state,provider){
  const wrapped={...provider};
  for(const method of ["next","narrate"]){
    wrapped[method]=async(...args)=>{
      trace(state,"provider."+method,"entered");
      try{
        const result=await provider[method](...args);
        if(method==="next")state.parsedDecision=bounded(JSON.stringify(result.output),state.secret);
        trace(state,"provider."+method,"returned",method==="next"
          ?{decisionType:result.output?.type??null}:{});
        return result;
      }catch(error){trace(state,"provider."+method,"threw",{
        error:safeError(error,state.secret)});throw error;}
    };
  }
  return wrapped;
}
export function diagnosticStore(state,store){
  const wrapped={...store};
  for(const method of ["begin","claim","recordAstraTool","checkpoint","reroll","commit","fail"]){
    if(typeof store[method]!=="function")continue;
    wrapped[method]=async(...args)=>{
      trace(state,"store."+method,"entered");
      try{
        const result=await store[method](...args);
        trace(state,"store."+method,"returned",{
          status:typeof result?.status==="string"?result.status:null});
        return result;
      }catch(error){trace(state,"store."+method,"threw",{
        error:safeError(error,state.secret)});throw error;}
    };
  }
  return wrapped;
}
export function diagnosticRpc(state,runtime){
  return async(args)=>{
    try{return {data:await runtime(args)};}
    catch(error){
      const detail={action:bounded(args.p_action,state.secret,100)?.text??null,
        error:safeError(error,state.secret)};
      state.sqlErrors.push(detail);
      trace(state,"disposable.sql","threw",detail);
      return {error:{message:error.message,code:error.code}};
    }
  };
}
async function privateSnapshot(f,campaignId,operationId){
  const row=await f.one("select runtime_identity,status,failure,retryable,expected_revision,source,checkpoint,narration from rpg_private.turns where id=$1 and campaign_id=$2",
    [operationId,campaignId]);
  if(!row)return null;
  const checkpoint=row.checkpoint??{},astra=checkpoint.astraPrimary??{};
  return {runtimeIdentity:row.runtime_identity,status:row.status,failure:row.failure,
    retryable:row.retryable,expectedRevision:row.expected_revision,
    sourcePresent:row.source!==null,checkpointKeys:Object.keys(checkpoint).sort(),
    toolReceipts:astra.toolReceipts??null,finalProposal:astra.finalProposal??null,
    resolutionExists:checkpoint.resolution!==null&&checkpoint.resolution!==undefined,
    narrationExists:(checkpoint.narration!==null&&checkpoint.narration!==undefined)
      ||row.narration!==null};
}

async function runSyntheticSmoke(){
if(process.env.ASTRA_P1_SYNTHETIC_SMOKE!=="yes" || !process.env.OPENAI_API_KEY)
  throw Error("Explicit synthetic smoke opt-in and server key are required");

const hook=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="server-only"
    ? {url:"data:text/javascript,export%20{}",shortCircuit:true}
    : nextResolve(specifier,context);
}});
const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

const f=await fixture(38);
const state=diagnosticState(process.env.OPENAI_API_KEY);
const operationId=randomUUID();
let status="not-started",campaignId=null,runError=null;
try {
  const w=await world(f,"Synthetic Astra production smoke");
  campaignId=w.cid;
  await f.one("update public.rpg_entities set name='Mara' where id=$1",[w.hero]);
  await f.one("update public.rpg_entities set name='Orin' where id=$1",[w.npc]);
  await f.one("update public.rpg_locations set name='Copper Lantern' where id=$1",[w.location]);
  await f.one("update public.rpg_scenes set body='Orin agreed to accompany Mara back to the Old Mine to discuss the promise about his father’s map.' where id=$1",[w.scene]);
  const mine=(await f.mutation("location.save",w.cid,{name:"Old Mine",
    description:"A known mine road and an old stone lamp",status:"known"})).id;
  const fence=await f.fence(w.cid);
  const runtime=diagnosticRpc(state,(args)=>
    f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline));
  const memoryRpc=diagnosticRpc(state,(args)=>
    f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline));
  const store=diagnosticStore(state,createRpcTurnStore(f.owner,runtime,"gpt-6-astra",fence));
  const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
  const actual=createAstraPrimaryProvider({apiKey:process.env.OPENAI_API_KEY,
    fetcher:diagnosticFetcher(state,fetch)});
  const provider=diagnosticProvider(state,actual);
  const play=await store.readPlay(w.cid);
  const input={operationId,campaignId:w.cid,timeline:play.timeline,
    expectedRevision:play.revision,mode:"game",
    input:"Orin, let's go back to the Old Mine and deal with this properly. I head there with him.",
    companionId:null,listenerIds:[],mechanic:null};
  const deps={store,memory,provider,summaries:{summarize:()=>{
    throw Error("unexpected_summary_provider_call");
  }}};
  let turn=await runAstraTurn(input,deps);
  if(turn.status==="awaiting_confirmation")turn=await resumeAstraTurn({
    commandId:randomUUID(),campaignId:w.cid,operationId,
    timeline:fence,action:"continue",checkId:null},deps);
  status=turn.status;
  if(status==="committed"){
    const current=await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",[w.cid]);
    const minutes=await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[w.cid]);
    if(current.current_location_id!==mine || minutes.world_minutes<=0)
      status="committed-without-required-travel";
  }
} catch(error) {
  status="threw";runError=error;
} finally {
  if(campaignId){
    try{state.privateSnapshot=await privateSnapshot(f,campaignId,operationId);}
    catch(error){trace(state,"disposable.snapshot","threw",{
      error:safeError(error,state.secret)});}
  }
  process.stdout.write(JSON.stringify({status,operationId,requests:state.requests,
    inputTokens:state.inputTokens,outputTokens:state.outputTokens,
    usageKnown:state.usageKnown,
    estimatedSpendUsd:state.usageKnown?Number(price(state.inputTokens,state.outputTokens).toFixed(4)):null,
    latenciesMs:state.latenciesMs,responses:state.responses,
    parsedDecision:state.parsedDecision,trace:state.events,
    traceOverflow:state.traceOverflow,sqlErrors:state.sqlErrors,
    privateSnapshot:state.privateSnapshot,
    runError:runError?safeError(runError,state.secret):null})+"\n");
  if(status!=="committed")process.exitCode=1;
  await f.db.close();
}
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
  await runSyntheticSmoke();
