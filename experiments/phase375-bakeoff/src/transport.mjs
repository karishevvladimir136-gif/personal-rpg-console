import { createGateway } from '@ai-sdk/gateway';
import { generateText, Output, jsonSchema, experimental_evaluate as evaluate } from 'ai';
import { digest } from './fixtures.mjs';

// SDK warning text can contain provider/source content. This isolated process records codes only.
globalThis.AI_SDK_LOG_WARNINGS = false;
/** @template T @param {T} object @returns {Readonly<T>} */
export function freeze(object){if(object&&typeof object==='object'){for(const value of Object.values(object))freeze(value);Object.freeze(object);}return object;}
// Descriptive, immutable data; not a provider, executor, state store or orchestration engine.
export const REGISTRY=freeze({version:'bakeoff-registry-v2-synthetic-only',astra:{kind:'language',model:'openai/gpt-6-astra',provider:'openai'},jev:{kind:'evaluation',model:'typesafe-ai/jev',provider:'typesafe-ai'}});
/** @typedef {{version:string,scope:'authored-synthetic-only',kind:string,model:string,provider:string,reasoning:'xhigh'|null,maxRetries:0,maxOutputTokens:number,timeoutMs:number,providerOptions:{gateway:{only:string[]},openai?:{reasoningEffort:'xhigh',store:false}}}} Profile */
/** @param {string} key @param {Record<string,unknown>} [options] @returns {Readonly<Profile>} */
export function executionProfile(key,options={}){
  if(!['astra','jev'].includes(key)||Object.keys(options).some(k=>!['timeoutMs'].includes(k)))throw new SafeFailure('configuration','unsupported_configuration');
  const entry=key==='astra'?REGISTRY.astra:REGISTRY.jev;
  const timeoutMs=options.timeoutMs??60000;
  if(typeof timeoutMs!=='number'||timeoutMs<1||timeoutMs>60000)throw new SafeFailure('configuration','unsupported_configuration');
  return freeze({version:REGISTRY.version,scope:'authored-synthetic-only',kind:entry.kind,model:entry.model,provider:entry.provider,reasoning:key==='astra'?'xhigh':null,maxRetries:0,maxOutputTokens:key==='astra'?4096:0,timeoutMs,
    providerOptions:{gateway:{only:[entry.provider]},...(key==='astra'?{openai:{reasoningEffort:/** @type {const} */('xhigh'),store:/** @type {const} */(false)}}:{})}});
}
export class SafeFailure extends Error {
  /** @param {'configuration'|'provider'|'validation'|'context'} code @param {string} category @param {boolean} [retryable] */
  constructor(code,category,retryable=false){super(code);this.code=code;this.category=category;this.retryable=retryable;}
}
/** @param {unknown} value @returns {Record<string,unknown>} */
function record(value){return value&&typeof value==='object'?/** @type {Record<string,unknown>} */(value):{};}
/** @param {unknown} error */
export function safeError(error){
  if(error instanceof SafeFailure)return {code:error.code,category:error.category,retryable:error.retryable};
  const e=record(error),cause=record(e.cause),status=e.statusCode??cause.statusCode;
  if(typeof e.name==='string'&&/InvalidArgument|UnsupportedQuestionType/.test(e.name))return {code:'configuration',category:'unsupported_configuration',retryable:false};
  if(e.name==='TimeoutError'||e.name==='AbortError')return {code:'provider',category:'timeout',retryable:true};
  if(e.finishReason==='content-filter'||cause.finishReason==='content-filter')return {code:'provider',category:'refusal',retryable:false};
  if(status===401||status===403||status===400||status===404)return {code:'configuration',category:'unsupported_or_denied',retryable:false};
  if(status===402)return {code:'provider',category:'quota',retryable:false};
  if(status===429)return {code:'provider',category:'rate_limit',retryable:true};
  if(typeof status==='number'&&status>=500)return {code:'provider',category:'unavailable',retryable:true};
  if(typeof e.name==='string'&&/NoObjectGenerated|NoOutputGenerated|JSONParse|TypeValidation|InvalidResponse|Evaluation/.test(e.name))return {code:'validation',category:'malformed',retryable:false};
  return {code:'provider',category:'request_failed',retryable:true};
}
/** @param {unknown} value */
const count=value=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=10000000?value:null;
/** Allow-listed metadata only. SDK response.modelId can echo the requested model; never use it as proof.
 * @param {unknown} metadata @param {unknown} usage @param {Readonly<Profile>} profile @param {number} latencyMs
 */
export function safeMetadata(metadata,usage,profile,latencyMs){
  const gateway=record(record(metadata).gateway),routing=record(gateway.routing),u=record(usage);
  const finalProvider=routing.finalProvider===profile.provider?profile.provider:null;
  const attempts=Array.isArray(routing.modelAttempts)?routing.modelAttempts.map(record):[];
  const providers=attempts.flatMap(a=>Array.isArray(a.providerAttempts)?a.providerAttempts.map(record):[]);
  const successful=providers.filter(a=>a.success===true),attempt=attempts[0],last=successful[0];
  // These are documented Gateway routing fields, NOT SDK response.modelId or provider API names.
  // https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering
  const canonicalValues=[routing.originalModelId,routing.canonicalSlug,...attempts.map(a=>a.canonicalSlug)];
  const modelIds=[profile.model,profile.model.replace('/',':')];
  const canonicalRoutingMatches=canonicalValues.every(v=>v==null||v===profile.model)
    &&attempts.every(a=>a.modelId==null||modelIds.includes(/** @type {string} */(a.modelId)));
  const pattern=profile.kind==='language'?/^(?:openai\/)?gpt-6-astra(?:-\d{4}-\d{2}-\d{2})?$/:/^(?:typesafe-ai\/)?jev(?:-[\d.]+)?$/;
  const reported=last?.providerApiModelId??routing.resolvedProviderApiModelId;
  const actualModel=typeof reported==='string'&&pattern.test(reported)?reported:null;
  // Missing provider-internal naming is explicitly UNKNOWN. Conflicting supplied names still fail closed.
  const apiNamesMatch=[last?.providerApiModelId,routing.resolvedProviderApiModelId].every(v=>v==null||(typeof v==='string'&&pattern.test(v)));
  const profileMatches=JSON.stringify(profile)===JSON.stringify(executionProfile(profile.kind==='language'?'astra':'jev',{timeoutMs:profile.timeoutMs}));
  const routingVerified=Boolean(profileMatches&&finalProvider&&canonicalRoutingMatches&&apiNamesMatch
    &&(routing.resolvedProvider==null||routing.resolvedProvider===profile.provider)
    &&routing.modelAttemptCount===1&&attempts.length===1
    &&(attempt.success==null||attempt.success===true)
    &&(attempt.providerAttemptCount==null||attempt.providerAttemptCount===1)
    &&routing.totalProviderAttemptCount===1&&providers.length===1&&successful.length===1&&last.provider===profile.provider);
  const cost=typeof gateway.cost==='string'&&/^\d+(\.\d+)?$/.test(gateway.cost)?Number(gateway.cost):typeof gateway.cost==='number'?gateway.cost:null;
  return {requestedModel:profile.model,actualModel,finalProvider,
    gatewayOriginalModel:routing.originalModelId===profile.model?profile.model:null,
    gatewayCanonicalModel:routing.canonicalSlug===profile.model?profile.model:null,
    modelAttemptCanonicalModel:attempt?.canonicalSlug===profile.model?profile.model:null,
    modelAttemptId:typeof attempt?.modelId==='string'&&modelIds.includes(attempt.modelId)?attempt.modelId:null,
    canonicalRoutingMatches,successfulProvider:last?.provider===profile.provider?profile.provider:null,successfulProviderAttempts:successful.length,
    modelAttempts:count(routing.modelAttemptCount),providerAttempts:count(routing.totalProviderAttemptCount),inputTokens:count(u.inputTokens),outputTokens:count(u.outputTokens),costUSD:typeof cost==='number'&&Number.isFinite(cost)&&cost>=0&&cost<=100?cost:null,latencyMs:Math.round(latencyMs),profileHash:digest(profile),routingVerified};
}
/** Injectable fetch is mandatory: importing this module can never contact a provider.
 * @param {{apiKey:string,fetcher:typeof fetch}} options
 */
export function experimentalTransport({apiKey,fetcher}){
  const gateway=createGateway({apiKey,fetch:fetcher});
  /** @param {Readonly<Profile>} profile @param {unknown} input */
  function preflight(profile,input){
    if(!apiKey||!Object.isFrozen(profile)||JSON.stringify(profile)!==JSON.stringify(executionProfile(profile.kind==='language'?'astra':'jev',{timeoutMs:profile.timeoutMs})))throw new SafeFailure('configuration','unfrozen_or_modified_profile');
    if(Buffer.byteLength(JSON.stringify(input))>12000)throw new SafeFailure('context','bounded_overflow');
  }
  return {
    /** Transport only; caller still supplies the existing independent domain parser.
     * @param {Readonly<Profile>} profile @param {string} instructions @param {unknown} input
     * @param {Parameters<typeof jsonSchema>[0]} schema @param {(value:unknown)=>unknown} parse
     */
    async structured(profile,instructions,input,schema,parse){
      preflight(profile,{instructions,input,schema});if(profile.kind!=='language')throw new SafeFailure('configuration','wrong_capability');
      const started=performance.now(),signal=AbortSignal.timeout(profile.timeoutMs);
      try {
        const result=await generateText({model:gateway(profile.model),system:instructions,prompt:JSON.stringify(input),maxOutputTokens:profile.maxOutputTokens,maxRetries:0,abortSignal:signal,providerOptions:profile.providerOptions,
          experimental_telemetry:{isEnabled:false,recordInputs:false,recordOutputs:false},
          output:Output.object({schema:jsonSchema(schema,{validate:async value=>{try{parse(value);return {success:true,value};}catch{return {success:false,error:new Error('validation')};}}})})});
        if(result.warnings?.length)throw new SafeFailure('configuration','unsupported_options');
        if(result.finishReason==='content-filter')throw new SafeFailure('provider','refusal');
        if(result.finishReason!=='stop')throw new SafeFailure('provider','incomplete');
        const metadata=safeMetadata(result.providerMetadata,result.usage,profile,performance.now()-started);
        if(!metadata.routingVerified)throw new SafeFailure('provider','unverified_routing');
        return {output:parse(result.output),metadata};
      }catch(error){if(signal.aborted)throw new SafeFailure('provider','timeout',true);const safe=safeError(error);throw new SafeFailure(/** @type {SafeFailure['code']} */(safe.code),safe.category,safe.retryable);}
    },
    /** @param {Readonly<Profile>} profile @param {Parameters<typeof evaluate>[0]['state']} state @param {Parameters<typeof evaluate>[0]['questions']} questions */
    async classify(profile,state,questions){
      preflight(profile,{state,questions});if(profile.kind!=='evaluation')throw new SafeFailure('configuration','wrong_capability');
      const started=performance.now(),signal=AbortSignal.timeout(profile.timeoutMs);
      try{
        const result=await evaluate({model:gateway.evaluationModel(profile.model),state,questions,maxRetries:0,abortSignal:signal,providerOptions:profile.providerOptions});
        if(result.warnings?.length)throw new SafeFailure('configuration','unsupported_options');
        const metadata=safeMetadata(result.providerMetadata,result.usage,profile,performance.now()-started);
        if(!metadata.routingVerified)throw new SafeFailure('provider','unverified_routing');
        return {answers:result.answers,metadata};
      }catch(error){if(signal.aborted)throw new SafeFailure('provider','timeout',true);const safe=safeError(error);throw new SafeFailure(/** @type {SafeFailure['code']} */(safe.code),safe.category,safe.retryable);}
    },
  };
}
