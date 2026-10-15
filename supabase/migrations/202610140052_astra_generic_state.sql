-- Generic state V1. No historical contract backfill, public table, or second ledger.
begin;
alter table rpg_private.turns add column astra_state_contract text
 check(astra_state_contract is null or astra_state_contract='generic-v1');

create function rpg_private.astra_generic_manifest(s jsonb,input_text text)
returns jsonb language plpgsql immutable set search_path='' as $$
declare family text; r jsonb; n bigint; k text; f text; records jsonb:='{}'; evidence jsonb:=jsonb_build_object('input/current',input_text);
begin
 foreach family in array array['entities','locations','items','storages','quests'] loop
  for r,n in select value,ordinality-1 from jsonb_array_elements(s#>array['snapshot',family]) with ordinality loop
   if family='items' and exists(select 1 from jsonb_array_elements(coalesce(s->'astraSettlementItemPolicies','[]')) p
    where p.value->'itemId'=r->'id' and p.value->>'visibility'<>'public') then continue;end if;
   k:=case when family='entities' and s#>'{runtime,configuration,controlledEntityIds}' ? (r->>'id') then 'hero' else family||'-'||n end;
   records:=records||jsonb_build_object(k,jsonb_build_object('family',family,'id',r->'id'));
   foreach f in array array['name','title','details','description'] loop
    if jsonb_typeof(r->f)='string' then evidence:=evidence||jsonb_build_object(k||'/'||f,r->f); end if;
   end loop;
  end loop;
 end loop;
 for r,n in with ranked as (
  select value,ordinality-1 n,
   case when value->'id'=s#>'{snapshot,publicState,current_scene_id}' then 1 else 0 end current_scene,
   (select count(distinct term[1]) from regexp_matches(lower(input_text),'[a-z0-9]{3,}','g') term
     where strpos(lower((value->>'title')||E'\n'||(value->>'body')),term[1])>0) score
  from jsonb_array_elements(s#>'{snapshot,scenes}') with ordinality
 ) select ranked.value,ranked.n from ranked order by ranked.current_scene desc,ranked.score desc,ranked.n desc limit 4 loop
  evidence:=evidence||jsonb_build_object('scene-'||n,(r->>'title')||E'\n'||(r->>'body'));
 end loop;
 n:=0;
 for r in select value from jsonb_array_elements(s#>'{snapshot,documents}') where value->>'status'='canon' loop
  evidence:=evidence||jsonb_build_object('canon-'||n,r->'body'); n:=n+1;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(s->'astraSettlementJobs','[]')) loop
  if r#>>'{rewardTerms,currencyName}' is not null then
   evidence:=evidence||jsonb_build_object('job/'||(r->>'questId')||'/currency',r#>'{rewardTerms,currencyName}'); end if;
 end loop;
 return jsonb_build_object('records',records,'evidence',evidence);
end $$;

create function rpg_private.astra_generic_publication(plan jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare p jsonb:=plan->'publication'; b jsonb; d jsonb; narration text:=''; visual text:=''; locale text; independent boolean:=false; keep boolean;
begin
 perform rpg_private.fields(p,array['beats','visualDescription','sceneLocale']);
 perform rpg_private.assert(jsonb_typeof(p->'beats')='array' and jsonb_array_length(p->'beats') between 1 and 12);
 for b in select value from jsonb_array_elements(p->'beats') loop
  perform rpg_private.fields(b,array['text','requiresOperations']);
  perform rpg_private.assert(jsonb_typeof(b->'text')='string' and length(b->>'text')<=6000 and jsonb_typeof(b->'requiresOperations')='array' and
   jsonb_array_length(b->'requiresOperations')<=12 and (select count(*)=count(distinct value) from jsonb_array_elements(b->'requiresOperations')));
  keep:=true;
  for d in select value from jsonb_array_elements(b->'requiresOperations') loop
   perform rpg_private.assert(d#>>'{}' ~ '^[a-z][a-z0-9_-]{0,31}$');keep:=keep and plan->'accepted' ? (d#>>'{}');end loop;
  independent:=independent or b->'requiresOperations'='[]' and length(btrim(b->>'text'))>0;
  if keep and length(btrim(b->>'text'))>0 then narration:=narration||case when narration='' then '' else E'\n\n' end||(b->>'text');end if;
 end loop;
 perform rpg_private.assert(independent and length(narration) between 1 and 6000);
 b:=p->'visualDescription';
 if b<>'null' then
  perform rpg_private.fields(b,array['text','requiresOperations']);perform rpg_private.assert(jsonb_typeof(b->'text')='string' and length(b->>'text')<=2000 and jsonb_typeof(b->'requiresOperations')='array');
  if not exists(select 1 from jsonb_array_elements_text(b->'requiresOperations') where not plan->'accepted' ? value) then visual:=b->>'text';end if;
 end if;
 b:=p->'sceneLocale';
 if b<>'null' then
  perform rpg_private.fields(b,array['label','requiresOperations']);perform rpg_private.assert(rpg_private.astra_settlement_text(b->>'label',120) and jsonb_typeof(b->'requiresOperations')='array');
  if not exists(select 1 from jsonb_array_elements_text(b->'requiresOperations') where not plan->'accepted' ? value) then locale:=b->>'label';end if;
 end if;
 return jsonb_build_object('narration',narration,'visualDescription',visual,'clarification',null,'sceneLocale',locale);
end $$;

-- The existing business persistence applies the independently reconstructed changes.
-- Metadata is applied inside the core commit, before its existing autosave capture.
alter function rpg_private.runtime_change(uuid,uuid,jsonb) rename to runtime_change_before_astra_generic;
create function rpg_private.runtime_change(cid uuid,opid uuid,change jsonb)
returns void language plpgsql set search_path='' as $$
declare t rpg_private.turns%rowtype; job jsonb; f rpg_private.world_foundations%rowtype;
begin
 if current_setting('rpg.astra_generic_commit',true)=opid::text then
  select * into strict t from rpg_private.turns where campaign_id=cid and id=opid;
  perform rpg_private.assert(t.astra_state_contract='generic-v1' and t.status='generating' and
   exists(select 1 from jsonb_array_elements(t.astra_ordered_effects#>'{resolution,changes}') where value=change));
  if t.astra_ordered_effects->'foundationState'<>'null' and current_setting('rpg.astra_generic_registry',true) is distinct from opid::text then
   select * into strict f from rpg_private.world_foundations where campaign_id=cid for update;
   perform rpg_private.assert(f.loop_state=t.source->'astraProgressionState');
   perform set_config('rpg.astra_generic_registry',opid::text,true);
   update rpg_private.world_foundations set loop_state=t.astra_ordered_effects->'foundationState',revision=revision+1 where campaign_id=cid;
  end if;
 end if;
 perform rpg_private.runtime_change_before_astra_generic(cid,opid,change);
 if current_setting('rpg.astra_generic_commit',true)=opid::text and change->>'family'='quests' then
  select value into job from jsonb_array_elements(t.astra_ordered_effects->'jobs') where value->'questId'=change->'id';
  if job is not null then update public.rpg_quests set reward_terms=job->'rewardTerms',
   reward_operation_id=(job->>'rewardOperationId')::uuid where campaign_id=cid and id=(change->>'id')::uuid;end if;
 end if;
end $$;

-- Preserve every legacy freeze branch; add only the already-authorized currency-registry metadata projection.
do $$ declare d text; at integer; branch text:=$branch$
 declare generic_op text:=current_setting('rpg.astra_generic_registry',true); generic_turn rpg_private.turns%rowtype;
 begin
  if tg_op='UPDATE' and generic_op ~ '^[0-9a-f-]{36}$' and current_setting('rpg.astra_generic_commit',true)=generic_op then
   select * into generic_turn from rpg_private.turns where id=generic_op::uuid and campaign_id=old.campaign_id
    and astra_state_contract='generic-v1' and status='generating';
   if generic_turn.id is not null and new.loop_state=generic_turn.astra_ordered_effects->'foundationState' and new.revision=old.revision+1 and
    (to_jsonb(new)-'loop_state'-'revision'-'updated_at')=(to_jsonb(old)-'loop_state'-'revision'-'updated_at') and
    (new.loop_state-'currencies'-'version')=(old.loop_state-'currencies'-'version') then
    perform rpg_private.wave4_state(old.campaign_id,new.loop_state,old.ruleset);return new;
   end if;
   raise exception 'rpg_conflict';
  end if;
 end;
$branch$; begin
 select replace(pg_get_functiondef('rpg_private.astra_takeover_freeze_world()'::regprocedure),E'\r\n',E'\n') into d;
 perform rpg_private.assert(strpos(d,'astra_ordered_foundation')>0 and strpos(d,'astra_generic_registry')=0);
 at:=strpos(d,E'begin\n');perform rpg_private.assert(at>0);
 d:=overlay(d placing E'begin\n'||branch from at for 6);execute d;
end $$;

create function rpg_private.astra_generic_tool_assert(t rpg_private.turns,s jsonb,call jsonb,result jsonb)
returns void language plpgsql stable set search_path='' as $$
declare actor jsonb; target jsonb; item jsonb; checks jsonb:=t.checkpoint->'checks'; receipts jsonb:=t.checkpoint#>'{astraPrimary,toolReceipts}';
 n integer:=jsonb_array_length(checks); dc integer; modifier integer; sides integer; expected jsonb;
begin
 perform rpg_private.fields(call,array['kind','actorId','targetId','dc','itemId','scope']);
 perform rpg_private.assert(call->>'kind' in ('query','skill','attack','save','damage') and result->>'kind'=call->>'kind');
 if call->>'kind'='query' then
  perform rpg_private.assert(call='{"kind":"query","actorId":null,"targetId":null,"dc":null,"itemId":null,"scope":"current-public"}'::jsonb);
  expected:=jsonb_build_object('kind','query','stateRevision',t.expected_revision,'state',jsonb_build_object(
   'worldMinutes',s#>'{runtime,worldMinutes}','currentLocationId',s#>'{snapshot,publicState,current_location_id}',
   'entities',(select coalesce(jsonb_agg(jsonb_build_object('id',value->'id','name',value->'name','hp',value->'hp','resources',value->'resources') order by value->>'id'),'[]')
     from jsonb_array_elements(s#>'{snapshot,entities}') where s#>'{runtime,configuration,presentEntityIds}' ? (value->>'id')),
   'items',(select coalesce(jsonb_agg(jsonb_build_object('id',value->'id','name',value->'name','quantity',value->'quantity') order by value->>'id'),'[]')
     from jsonb_array_elements(s#>'{snapshot,items}') where
      s#>'{runtime,configuration,controlledEntityIds}' ? (value->>'owner_entity_id') or
      s#>'{runtime,configuration,presentEntityIds}' ? (value->>'equipped_entity_id') or
      s#>'{runtime,configuration,nearbyStorageIds}' ? (value->>'storage_id'))));
  perform rpg_private.assert(result=expected);return;
 end if;
 perform rpg_private.assert(call->'scope'='null' and s#>'{runtime,configuration,presentEntityIds}' ? (call->>'actorId'));
 actor:=rpg_private.astra_shadow_row(s,'entities',(call->>'actorId')::uuid);perform rpg_private.assert(actor is not null);
 if call->>'kind' in ('attack','damage') then
  target:=rpg_private.astra_shadow_row(s,'entities',(call->>'targetId')::uuid);
  perform rpg_private.assert(call->'dc'='null' and target is not null and s#>'{runtime,configuration,presentEntityIds}' ? (call->>'targetId'));
 else perform rpg_private.assert(call->'targetId'='null' and call->'itemId'='null' and rpg_private.wave4_integer(call->'dc',1,40));end if;
 if call->'itemId'<>'null' then
  item:=rpg_private.astra_shadow_row(s,'items',(call->>'itemId')::uuid);
  perform rpg_private.assert(item->>'owner_entity_id'=call->>'actorId' and item->>'equipped_entity_id'=call->>'actorId' and (item->>'quantity')::integer>0 and
   exists(select 1 from jsonb_array_elements(s#>'{runtime,configuration,itemRules}') r where r.value->'itemId'=call->'itemId' and r.value->>'tag'='weapon'));
 end if;
 if call->>'kind' in ('attack','skill') and exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') where value->>'status'='active') then
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(s#>'{runtime,participants}') p where p.value->'entity_id'=call->'actorId' and
   p.value#>'{public_resources,active}'='true' and p.value#>'{public_resources,withdrawn}'='false' and p.value#>>'{public_resources,action}'='1' and
   exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') e where e.value->'id'=p.value->'encounter_id' and e.value->>'status'='active')) and
   not exists(select 1 from jsonb_array_elements(receipts) where value#>>'{call,kind}' in ('attack','skill') and value#>'{call,actorId}'=call->'actorId'));
  if call->>'kind'='attack' then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(s#>'{runtime,participants}') p where p.value->'entity_id'=call->'targetId' and
   p.value#>'{public_resources,active}'='true' and p.value#>'{public_resources,withdrawn}'='false' and exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') e
    where e.value->'id'=p.value->'encounter_id' and e.value->>'status'='active')));end if;
 end if;
 perform rpg_private.assert(result->'actorId'=call->'actorId' and result->'targetId'=call->'targetId' and jsonb_typeof(result->'dice')='array' and
   jsonb_array_length(result->'dice')=1 and rpg_private.wave4_integer(result#>'{dice,0}',1,20));
 if call->>'kind'='damage' then
  perform rpg_private.fields(result,array['kind','actorId','targetId','itemId','dice','modifier','total']);
  select coalesce((select (value->>'damage')::integer from jsonb_array_elements(s#>'{runtime,configuration,itemRules}') where value->'itemId'=call->'itemId' and value->>'tag'='weapon'),2) into sides;
  perform rpg_private.assert(result->'itemId'=call->'itemId' and result->'modifier'='0' and (result#>>'{dice,0}')::integer<=sides and
   result->'total'=result#>'{dice,0}' and exists(select 1 from jsonb_array_elements(receipts) a where a.value#>>'{call,kind}'='attack' and
    a.value#>'{call,actorId}'=call->'actorId' and a.value#>'{call,targetId}'=call->'targetId' and a.value#>'{call,itemId}'=call->'itemId' and exists(
     select 1 from jsonb_array_elements(checks) c where c.value->'id'=a.value#>'{result,id}' and c.value->'success'='true')) and
    not exists(select 1 from jsonb_array_elements(receipts) where value#>>'{call,kind}'='damage' and value#>'{call,actorId}'=call->'actorId' and value#>'{call,targetId}'=call->'targetId' and value#>'{call,itemId}'=call->'itemId'));
 else
  perform rpg_private.fields(result,array['index','actorId','targetId','kind','stat','dc','dcPublic','visibility','important','uncertainty','advantage','id','dice','kept','modifier','total','success','rollNumber']);
  dc:=case when call->>'kind'='attack' then coalesce((target#>>'{stats,defense}')::integer,10) else (call->>'dc')::integer end;
  modifier:=coalesce((actor#>>array['stats',call->>'kind'])::integer,0)+case when call->>'kind'='skill' and exists(
    select 1 from jsonb_array_elements(s#>'{runtime,effects}') where value->'entity_id'=call->'actorId' and value#>>'{definition,kind}'='coffee' and
     value#>>'{definition,status}'='active' and value#>>'{definition,remaining}'='1') then 1 else 0 end;
  perform rpg_private.assert(n<8 and result->'index'=to_jsonb(n) and result->>'id'=rpg_private.wave4_id(t.id,'check:'||n)::text and
   result->'kind'=call->'kind' and result->'stat'=call->'kind' and result->>'advantage'='normal' and result->'dcPublic'='false' and
   result->'important'='true' and result->>'uncertainty'='meaningful' and result->'rollNumber'='1' and result->>'visibility'=
    case when s#>'{runtime,configuration,controlledEntityIds}' ? (call->>'actorId') then 'player' else 'private' end and
   result->'dc'=to_jsonb(dc) and modifier between -100 and 100 and result->'modifier'=to_jsonb(modifier) and result->'kept'=result#>'{dice,0}' and
   result->'total'=to_jsonb((result->>'kept')::integer+modifier) and result->'success'=to_jsonb((result->>'total')::integer>=dc));
 end if;
end $$;

create function rpg_private.astra_generic_ref(w jsonb,ref jsonb,family text)
returns uuid language plpgsql immutable set search_path='' as $$
declare r jsonb;
begin
 perform rpg_private.fields(ref,array['source','key']);
 r:=case ref->>'source' when 'known' then w#>array['manifest','records',ref->>'key']
  when 'local' then w#>array['refs',ref->>'key'] else null end;
 perform rpg_private.assert(r->>'family'=family and r->>'id' is not null);
 return (r->>'id')::uuid;
end $$;

create function rpg_private.astra_generic_text(w jsonb,v jsonb,maximum integer,fallback text default null)
returns text language plpgsql immutable set search_path='' as $$
declare result text;
begin
 if v='null' then perform rpg_private.assert(fallback is not null); return fallback; end if;
 if v->>'source'='inline' then
  perform rpg_private.fields(v,array['source','text']);
  perform rpg_private.assert(w#>>'{source,astraResponseMode}' is distinct from 'private-informed');
 else
  perform rpg_private.fields(v,array['source','evidence','text']);
  perform rpg_private.assert(v->>'source'='public-evidence' and
   w#>array['manifest','evidence',v->>'evidence'] is not null and length(v->>'text')>0 and
   strpos(w#>>array['manifest','evidence',v->>'evidence'],v->>'text')>0);
 end if;
 result:=v->>'text';perform rpg_private.assert(rpg_private.astra_settlement_text(result,maximum));
 return result;
end $$;

create function rpg_private.astra_generic_write(w jsonb,family text,rid uuid,values_row jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare old_row jsonb; c jsonb;
begin
 old_row:=rpg_private.astra_shadow_row(w->'source',family,rid);
 c:=jsonb_build_object('family',family,'id',rid,'expectedRevision',coalesce(old_row->'revision','null'),'values',values_row);
 return jsonb_set(jsonb_set(w,'{source}',rpg_private.astra_shadow_apply(w->'source',c)),
  '{changes}',rpg_private.astra_shadow_collapse(w->'changes',jsonb_build_array(c)));
end $$;

create function rpg_private.astra_generic_present(w jsonb,rid uuid)
returns jsonb language plpgsql immutable set search_path='' as $$
declare r jsonb;
begin
 r:=rpg_private.astra_shadow_row(w->'source','entities',rid);
 perform rpg_private.assert(r is not null and w#>'{source,runtime,configuration,presentEntityIds}' ? rid::text);
 return r;
end $$;

create function rpg_private.astra_generic_storage(w jsonb,op uuid,cid uuid,owner_id uuid,ref jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare actor jsonb; r jsonb; rid uuid;
begin
 actor:=rpg_private.astra_generic_present(w,owner_id);
 if ref<>'null' then
  rid:=rpg_private.astra_generic_ref(w,ref,'storages');r:=rpg_private.astra_shadow_row(w->'source','storages',rid);
  perform rpg_private.assert(r->>'entity_id'=owner_id::text);
 else
  select value into r from jsonb_array_elements(w#>'{source,snapshot,storages}') where value->>'entity_id'=owner_id::text order by value->>'id' limit 1;
  if r is not null then rid:=(r->>'id')::uuid;
  else
   perform rpg_private.assert(actor->>'kind'='npc');
   rid:=rpg_private.wave4_id(op,'generic-v1:'||cid||':storage:'||owner_id);
   w:=rpg_private.astra_generic_write(w,'storages',rid,jsonb_build_object('name',left('Inventory of '||(actor->>'name'),160),
    'kind','merchant','entity_id',owner_id));
  end if;
 end if;
 return w||jsonb_build_object('storageId',rid);
end $$;

create function rpg_private.astra_generic_currency(w jsonb,cid uuid,v jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb; definition jsonb; name text; state jsonb;
begin
 perform rpg_private.fields(v,array['existing','publicName']);
 perform rpg_private.assert((v->'existing'='null')<>(v->'publicName'='null'));
 if v->'existing'<>'null' then
  select value into definition from jsonb_array_elements(w#>'{source,astraSettlementCurrencies}') where value->>'resourceKey'=v->>'existing';
  perform rpg_private.assert(definition is not null);
 else
  name:=regexp_replace(lower(rpg_private.astra_generic_text(w,v->'publicName',32)),' +',' ','g');
  result:=rpg_private.astra_shadow_currency(cid,w->'source',name,true);definition:=result->'definition';
  if result->'newDefinition'<>'null' then
   state:=w#>'{source,astraProgressionState}';perform rpg_private.assert(jsonb_typeof(state)='object');
   state:=state||jsonb_build_object('currencies',(state->'currencies')||jsonb_build_array(definition),'version',(state->>'version')::integer+1);
   w:=jsonb_set(jsonb_set(w,'{source,astraSettlementCurrencies}',(w#>'{source,astraSettlementCurrencies}')||jsonb_build_array(definition)),
    '{source,astraProgressionState}',state)||jsonb_build_object('foundationState',state);
  end if;
 end if;
 return w||jsonb_build_object('currency',jsonb_build_object('name',definition->'label','key',definition->'resourceKey'));
end $$;

create function rpg_private.astra_generic_adjust(w jsonb,rid uuid,key text,amount integer)
returns jsonb language plpgsql immutable set search_path='' as $$
declare actor jsonb; after_value bigint;
begin
 actor:=rpg_private.astra_generic_present(w,rid);
 after_value:=coalesce((actor#>>array['resources',key])::bigint,0)+amount;
 perform rpg_private.assert(after_value between 0 and 1000000);
 return rpg_private.astra_generic_write(w,'entities',rid,jsonb_build_object('resources',(actor->'resources')||jsonb_build_object(key,after_value)));
end $$;

create function rpg_private.astra_generic_pay(w jsonb,cid uuid,recipient uuid,payer uuid,currency jsonb,amount integer)
returns jsonb language plpgsql stable set search_path='' as $$
declare actor jsonb; key text;
begin
 perform rpg_private.assert(recipient<>payer and amount between 1 and 20);
 w:=rpg_private.astra_generic_currency(w,cid,currency);key:=w#>>'{currency,key}';actor:=rpg_private.astra_generic_present(w,payer);
 if actor->'resources' ? key then w:=rpg_private.astra_generic_adjust(w,payer,key,-amount);
 else perform rpg_private.assert(actor->>'kind'='npc' and w#>'{source,runtime,configuration,controlledEntityIds}' ? recipient::text); end if;
 return rpg_private.astra_generic_adjust(w,recipient,key,amount);
end $$;

create function rpg_private.astra_generic_refs(v jsonb)
returns text[] language plpgsql immutable set search_path='' as $$
declare result text[]:='{}'; child jsonb;
begin
 if jsonb_typeof(v)='object' then
  if v->>'source'='local' then result:=array_append(result,v->>'key'); end if;
  for child in select value from jsonb_each(v) loop result:=result||rpg_private.astra_generic_refs(child); end loop;
 elsif jsonb_typeof(v)='array' then
  for child in select value from jsonb_array_elements(v) loop result:=result||rpg_private.astra_generic_refs(child); end loop;
 end if; return result;
end $$;

create function rpg_private.astra_generic_one(w jsonb,t rpg_private.turns,o jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
declare common text[]:=array['opId','requiresOperations','atomicGroup','kind']; rid uuid; target uuid; owner_id uuid;
 cid uuid:=t.campaign_id; m jsonb; oldrow jsonb; values_row jsonb:='{}'; current_row jsonb; name text; description text;
 key text; amount integer; qty integer; sid uuid; job jsonb; terms jsonb; reward jsonb; item jsonb; money jsonb;
 basis jsonb; ref jsonb; other jsonb; delta integer; total integer; changes jsonb; is_new boolean;
begin
 perform rpg_private.assert(o->>'opId' ~ '^[a-z][a-z0-9_-]{0,31}$');
 rid:=rpg_private.wave4_id(t.id,'generic-v1:'||cid||':'||(o->>'opId'));
 basis:=coalesce(o->'basis',o#>'{mutation,basis}','null'::jsonb);
 if basis<>'null' then
  perform rpg_private.fields(basis,array['source','key']);
  perform rpg_private.assert(case basis->>'source'
   when 'public-evidence' then w#>array['manifest','evidence',basis->>'key'] is not null
   when 'rule' then basis->>'key' in ('long-rest','short-rest')
   when 'tool' then exists(select 1 from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}') r
    where 'tool-'||(r.value->>'position')=basis->>'key') else false end);
 end if;
 if o->>'kind'='entity.upsert' then
  perform rpg_private.fields(o,common||array['target','name','description','profile','present']);
  if o->'target'<>'null' then rid:=rpg_private.astra_generic_ref(w,o->'target','entities'); end if;
  oldrow:=rpg_private.astra_shadow_row(w->'source','entities',rid);
  perform rpg_private.assert((o->'profile'='null' or oldrow is null and o->>'profile' like 'actor-profile:%') and
   (oldrow is null or oldrow->>'kind' in ('npc','companion')));
  if o->'name'<>'null' then values_row:=values_row||jsonb_build_object('name',rpg_private.astra_generic_text(w,o->'name',200)); end if;
  if o->'description'<>'null' then values_row:=values_row||jsonb_build_object('details',rpg_private.astra_generic_text(w,o->'description',1000)); end if;
  if oldrow is null then
   perform rpg_private.assert(values_row->>'name' is not null and not exists(select 1 from jsonb_array_elements(w#>'{source,snapshot,entities}') r
    where lower(r.value->>'name')=lower(values_row->>'name')));
   values_row:=values_row||jsonb_build_object('kind','npc','details',coalesce(values_row->>'details','An ordinary person named '||(values_row->>'name')||'.'),
    'hp',null,'max_hp',null,'stats','{}'::jsonb,'resources','{}'::jsonb,'conditions','[]'::jsonb,'equipment_slots','[]'::jsonb);
  end if;
  if o->'profile'<>'null' then
   target:=rpg_private.astra_generic_ref(w,jsonb_build_object('source','known','key',substring(o->>'profile' from 15)),'entities');
   current_row:=rpg_private.astra_shadow_row(w->'source','entities',target);
   perform rpg_private.assert(rpg_private.wave4_integer(current_row->'max_hp',1,1000000) and
    rpg_private.wave4_integer(current_row#>'{stats,attack}',-20,20) and rpg_private.wave4_integer(current_row#>'{stats,defense}',1,40) and
    rpg_private.wave4_integer(current_row#>'{stats,skill}',-20,20) and (current_row#>'{stats,save}' is null or rpg_private.wave4_integer(current_row#>'{stats,save}',-20,20)));
   select jsonb_object_agg(k,v) into ref from jsonb_each(current_row->'stats') x(k,v) where k in ('attack','defense','skill','save') and jsonb_typeof(v)='number';
   values_row:=values_row||jsonb_build_object('hp',current_row->'max_hp','max_hp',current_row->'max_hp','stats',ref);
  end if;
  perform rpg_private.assert(values_row<>'{}' or o->'present'<>'null');
  w:=rpg_private.astra_generic_write(w,'entities',rid,values_row);
  w:=jsonb_set(w,'{refs}',(w->'refs')||jsonb_build_object(o->>'opId',jsonb_build_object('family','entities','id',rid)));
  if o->'present'<>'null' then
   perform rpg_private.assert(jsonb_typeof(o->'present')='boolean');
   current_row:=w#>'{source,runtime,configuration,presentEntityIds}';
   if o->'present'='true' and not current_row ? rid::text then current_row:=current_row||to_jsonb(rid);
   elsif o->'present'='false' then select coalesce(jsonb_agg(value),'[]') into current_row from jsonb_array_elements(current_row) where value<>to_jsonb(rid); end if;
   w:=jsonb_set(w,'{source,runtime,configuration,presentEntityIds}',current_row);
   if w#>'{source,worldTakeover}' is not null then w:=jsonb_set(w,'{source,worldTakeover,presentEntityIds}',current_row); end if;
  end if;
 elsif o->>'kind'='location.upsert' then
  perform rpg_private.fields(o,common||array['target','name','description','status','makeCurrent']);
  if o->'target'<>'null' then rid:=rpg_private.astra_generic_ref(w,o->'target','locations'); end if;
  oldrow:=rpg_private.astra_shadow_row(w->'source','locations',rid);
  if o->'name'<>'null' then values_row:=values_row||jsonb_build_object('name',rpg_private.astra_generic_text(w,o->'name',200)); end if;
  if o->'description'<>'null' then values_row:=values_row||jsonb_build_object('description',rpg_private.astra_generic_text(w,o->'description',1000)); end if;
  if o->'status'<>'null' then perform rpg_private.assert(o->>'status' in ('known','visited'));values_row:=values_row||jsonb_build_object('status',o->'status'); end if;
  if oldrow is null then perform rpg_private.assert(values_row->>'name' is not null);
   values_row:=values_row||jsonb_build_object('description',coalesce(values_row->>'description','A place called '||(values_row->>'name')||'.'),
    'status',coalesce(values_row->>'status','known'));end if;
  w:=rpg_private.astra_generic_write(w,'locations',rid,values_row);
  w:=jsonb_set(w,'{refs}',(w->'refs')||jsonb_build_object(o->>'opId',jsonb_build_object('family','locations','id',rid)));
  perform rpg_private.assert(jsonb_typeof(o->'makeCurrent')='boolean');
  if o->'makeCurrent'='true' then
   perform rpg_private.assert((w#>>'{source,runtime,worldMinutes}')::integer>(w->>'origin')::integer);
   w:=rpg_private.astra_generic_write(w,'public_state',cid,jsonb_build_object('current_location_id',rid));
   select coalesce(jsonb_agg(value),'[]') into current_row from jsonb_array_elements(w#>'{source,runtime,configuration,presentEntityIds}') r
    where w#>'{source,runtime,configuration,controlledEntityIds}' ? (r.value#>>'{}') or exists(
     select 1 from jsonb_array_elements(w#>'{source,snapshot,entities}') e where e.value->'id'=r.value and e.value->>'kind'='companion');
   w:=jsonb_set(jsonb_set(w,'{source,runtime,configuration,presentEntityIds}',current_row),'{source,runtime,configuration,nearbyStorageIds}','[]');
  end if;
 elsif o->>'kind'='item.mutate' then
  perform rpg_private.fields(o,common||array['mutation']);m:=o->'mutation';
  if m->>'action'='create' then
   perform rpg_private.fields(m,array['action','name','description','category','quantity','owner','storage','basis']);
   perform rpg_private.assert(m->>'category' in ('food','supply','misc') and rpg_private.wave4_integer(m->'quantity',1,20));
   owner_id:=rpg_private.astra_generic_ref(w,m->'owner','entities');
   name:=rpg_private.astra_generic_text(w,m->'name',80);description:=rpg_private.astra_generic_text(w,m->'description',160,'Ordinary '||name||'.');
   w:=rpg_private.astra_generic_storage(w,t.id,cid,owner_id,m->'storage');sid:=(w->>'storageId')::uuid;
   w:=rpg_private.astra_generic_write(w,'items',rid,jsonb_build_object('name',name,'category',m->'category','quantity',m->'quantity',
    'description',description,'mechanics','','owner_entity_id',owner_id,'storage_id',sid,'equipped_entity_id',null,'equipped_slot',null));
   w:=jsonb_set(w,'{refs}',(w->'refs')||jsonb_build_object(o->>'opId',jsonb_build_object('family','items','id',rid)));
  else
   target:=rpg_private.astra_generic_ref(w,m->'target','items');oldrow:=rpg_private.astra_shadow_row(w->'source','items',target);
   owner_id:=(oldrow->>'owner_entity_id')::uuid;perform rpg_private.astra_generic_present(w,owner_id);
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(coalesce(w#>'{source,astraSettlementItemPolicies}','[]')) p
    where p.value->>'itemId'=target::text and (p.value->>'visibility'<>'public' or p.value->>'trade'<>'allowed')));
   if m->>'action'='update' then
    perform rpg_private.fields(m,array['action','target','name','description','equipment']);
    if m->'name'<>'null' then values_row:=values_row||jsonb_build_object('name',rpg_private.astra_generic_text(w,m->'name',200));end if;
    if m->'description'<>'null' then values_row:=values_row||jsonb_build_object('description',rpg_private.astra_generic_text(w,m->'description',1000));end if;
    if m->'equipment'<>'null' then
     perform rpg_private.fields(m->'equipment',array['wearer','slot']);target:=rpg_private.astra_generic_ref(w,m#>'{equipment,wearer}','entities');
     current_row:=rpg_private.astra_generic_present(w,target);
     perform rpg_private.assert(target=owner_id and (oldrow->>'quantity')::integer>0 and (m#>'{equipment,slot}'='null' or exists(
      select 1 from jsonb_array_elements(current_row->'equipment_slots') slot where slot.value->'id'=m#>'{equipment,slot}' and slot.value->'accepts' ? (oldrow->>'category'))) and
      not exists(select 1 from jsonb_array_elements(w#>'{source,snapshot,items}') i where i.value->'id'<>oldrow->'id' and
       i.value->>'equipped_entity_id'=owner_id::text and i.value->'equipped_slot'=m#>'{equipment,slot}' and m#>'{equipment,slot}'<>'null'));
     values_row:=values_row||jsonb_build_object('equipped_entity_id',case when m#>'{equipment,slot}'='null' then null else owner_id end,'equipped_slot',m#>'{equipment,slot}');
    end if;
    perform rpg_private.assert(values_row<>'{}');w:=rpg_private.astra_generic_write(w,'items',(oldrow->>'id')::uuid,values_row);
   else
    qty:=(m->>'quantity')::integer;
    perform rpg_private.assert(rpg_private.wave4_integer(m->'quantity',1,1000000) and qty<=(oldrow->>'quantity')::integer and oldrow->'equipped_entity_id'='null');
    if m->>'action'='transfer' then
     perform rpg_private.fields(m,array['action','target','quantity','recipient','storage','basis']);
     owner_id:=rpg_private.astra_generic_ref(w,m->'recipient','entities');
     w:=rpg_private.astra_generic_storage(w,t.id,cid,owner_id,m->'storage');sid:=(w->>'storageId')::uuid;
     values_row:=jsonb_build_object('quantity',qty,'owner_entity_id',owner_id,'storage_id',sid,'equipped_entity_id',null,'equipped_slot',null);
     if qty=(oldrow->>'quantity')::integer then rid:=(oldrow->>'id')::uuid;
     else
      w:=rpg_private.astra_generic_write(w,'items',(oldrow->>'id')::uuid,jsonb_build_object('quantity',(oldrow->>'quantity')::integer-qty));
      values_row:=jsonb_build_object('name',oldrow->'name','category',oldrow->'category','description',oldrow->'description','mechanics',oldrow->'mechanics')||values_row;
     end if;
     w:=rpg_private.astra_generic_write(w,'items',rid,values_row);
     w:=jsonb_set(w,'{refs}',(w->'refs')||jsonb_build_object(o->>'opId',jsonb_build_object('family','items','id',rid)));
    else
     perform rpg_private.fields(m,array['action','target','quantity','basis']);perform rpg_private.assert(m->>'action' in ('consume','remove'));
     w:=rpg_private.astra_generic_write(w,'items',target,jsonb_build_object('quantity',(oldrow->>'quantity')::integer-qty));
    end if;
   end if;
  end if;
 elsif o->>'kind'='resource.adjust' then
  perform rpg_private.fields(o,common||array['mutation']);m:=o->'mutation';amount:=(m->>'amount')::integer;
  if m->>'action'='transfer' then
   perform rpg_private.fields(m,array['action','from','to','currency','amount','basis']);
   owner_id:=rpg_private.astra_generic_ref(w,m->'from','entities');target:=rpg_private.astra_generic_ref(w,m->'to','entities');
   perform rpg_private.assert(owner_id<>target and rpg_private.wave4_integer(m->'amount',1,20));
   w:=rpg_private.astra_generic_currency(w,cid,m->'currency');key:=w#>>'{currency,key}';
   w:=rpg_private.astra_generic_adjust(w,owner_id,key,-amount);w:=rpg_private.astra_generic_adjust(w,target,key,amount);
  else
   perform rpg_private.fields(m,array['action','actor','resource','amount','payer','basis']);perform rpg_private.assert(m->>'action'='delta' and rpg_private.wave4_integer(m->'amount',-1000000,1000000));
   target:=rpg_private.astra_generic_ref(w,m->'actor','entities');oldrow:=rpg_private.astra_generic_present(w,target);
   if m#>>'{resource,kind}'='currency' then
    perform rpg_private.fields(m->'resource',array['kind','currency']);
    if amount>0 then w:=rpg_private.astra_generic_pay(w,cid,target,rpg_private.astra_generic_ref(w,m->'payer','entities'),m#>'{resource,currency}',amount);
    else perform rpg_private.assert(m->'payer'='null');w:=rpg_private.astra_generic_currency(w,cid,m#>'{resource,currency}');w:=rpg_private.astra_generic_adjust(w,target,w#>>'{currency,key}',amount);end if;
   elsif m#>>'{resource,kind}'='tracked' then
    perform rpg_private.fields(m->'resource',array['kind','key']);key:=m#>>'{resource,key}';
    perform rpg_private.assert(amount<=0 and m->'payer'='null' and oldrow->'resources' ? key);w:=rpg_private.astra_generic_adjust(w,target,key,amount);
   else
    perform rpg_private.fields(m->'resource',array['kind']);perform rpg_private.assert(m#>>'{resource,kind}'='hp' and amount<0 and m->'payer'='null' and basis->>'source'='tool');
    select coalesce(sum((value#>>'{result,total}')::integer),0) into total from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}')
     where value#>>'{call,kind}'='damage' and value#>>'{call,targetId}'=target::text;
    perform rpg_private.assert(amount=-least((oldrow->>'hp')::integer,total) and exists(
     select 1 from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}') where value#>>'{call,kind}'='damage' and
      value#>>'{call,targetId}'=target::text and 'tool-'||(value->>'position')=basis->>'key') and not exists(
       select 1 from jsonb_array_elements_text(w->'damageApplied') where value=target::text));
    w:=rpg_private.astra_generic_write(w,'entities',target,jsonb_build_object('hp',(oldrow->>'hp')::integer+amount));
    w:=jsonb_set(w,'{damageApplied}',(w->'damageApplied')||to_jsonb(target));
    select coalesce(jsonb_agg(value->'id'),'[]') into changes from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}')
      where value#>>'{call,kind}'='damage' and value#>>'{call,targetId}'=target::text;
    w:=jsonb_set(w,'{damageRefs}',(w->'damageRefs')||changes);
   end if;
  end if;
 elsif o->>'kind'='quest.mutate' then
  perform rpg_private.fields(o,common||array['mutation']);m:=o->'mutation';
  if m->>'action'='create' then
   perform rpg_private.fields(m,array['action','title','description','issuer','reward','basis']);
   owner_id:=case when m->'issuer'='null' then null else rpg_private.astra_generic_ref(w,m->'issuer','entities') end;
   if owner_id is not null then perform rpg_private.assert(rpg_private.astra_generic_present(w,owner_id)->>'kind'='npc');end if;
   name:=rpg_private.astra_generic_text(w,m->'title',120);description:=rpg_private.astra_generic_text(w,m->'description',500);
   terms:=case when owner_id is null then 'null'::jsonb else jsonb_build_object('issuerId',owner_id,'currencyName',null,'currencyAmount',null,
    'itemName',null,'itemCategory',null,'itemDescription',null) end;reward:=m->'reward';
   if reward<>'null' then
    perform rpg_private.fields(reward,array['currency','amount','item']);perform rpg_private.assert(owner_id is not null);
    money:=reward->'currency';item:=reward->'item';
    if money<>'null' then w:=rpg_private.astra_generic_currency(w,cid,money);perform rpg_private.assert(rpg_private.wave4_integer(reward->'amount',1,20));
    else perform rpg_private.assert(reward->'amount'='0');end if;
    if item<>'null' then perform rpg_private.fields(item,array['name','category','description']);perform rpg_private.assert(item->>'category' in ('food','supply','misc'));end if;
    terms:=jsonb_build_object('issuerId',owner_id,'currencyName',case when money='null' then null else w#>>'{currency,name}' end,
     'currencyAmount',case when money='null' then 'null'::jsonb else reward->'amount' end,
     'itemName',case when item='null' then null else rpg_private.astra_generic_text(w,item->'name',80) end,
     'itemCategory',case when item='null' then 'null'::jsonb else item->'category' end,
     'itemDescription',case when item='null' then null else rpg_private.astra_generic_text(w,item->'description',160,
      'Ordinary '||rpg_private.astra_generic_text(w,item->'name',80)||'.') end);
   end if;
   w:=rpg_private.astra_generic_write(w,'quests',rid,jsonb_build_object('title',name,'description',description,'status','open'));
   job:=jsonb_build_object('questId',rid,'issuerId',owner_id,'rewardTerms',terms,'rewardOperationId',null);
   w:=jsonb_set(w,'{jobs}',(w->'jobs')||jsonb_build_array(job));
   w:=jsonb_set(w,'{refs}',(w->'refs')||jsonb_build_object(o->>'opId',jsonb_build_object('family','quests','id',rid)));
  else
   target:=rpg_private.astra_generic_ref(w,m->'target','quests');oldrow:=rpg_private.astra_shadow_row(w->'source','quests',target);
   select value into job from jsonb_array_elements(w->'jobs') where value->>'questId'=target::text;
   if m->>'action'='update' then
    perform rpg_private.fields(m,array['action','target','title','description']);
    if m->'title'<>'null' then values_row:=values_row||jsonb_build_object('title',rpg_private.astra_generic_text(w,m->'title',120));end if;
    if m->'description'<>'null' then values_row:=values_row||jsonb_build_object('description',rpg_private.astra_generic_text(w,m->'description',500));end if;
    perform rpg_private.assert(values_row<>'{}');w:=rpg_private.astra_generic_write(w,'quests',target,values_row);
   elsif m->>'action'='status' then
    perform rpg_private.fields(m,array['action','target','status','outcome','basis']);
    perform rpg_private.assert(oldrow->>'status'='open' and m->>'status' in ('complete','archived') and coalesce(job->>'rewardOperationId','')='');
    values_row:=jsonb_build_object('status',m->'status');
    if m->'outcome'<>'null' then values_row:=values_row||jsonb_build_object('description',(oldrow->>'description')||E'\n'||rpg_private.astra_generic_text(w,m->'outcome',500));end if;
    w:=rpg_private.astra_generic_write(w,'quests',target,values_row);
   else
    perform rpg_private.fields(m,array['action','target','basis']);terms:=job->'rewardTerms';
    perform rpg_private.assert(m->>'action'='claim' and oldrow->>'status'='complete' and job->>'issuerId' is not null and
     terms<>'null' and (terms->>'currencyName' is not null or terms->>'itemName' is not null) and job->'rewardOperationId'='null');owner_id:=(w#>>'{source,runtime,configuration,controlledEntityIds,0}')::uuid;
    if terms->>'currencyName' is not null then
     w:=rpg_private.astra_generic_pay(w,cid,owner_id,(job->>'issuerId')::uuid,jsonb_build_object('existing',null,
      'publicName',jsonb_build_object('source','public-evidence','evidence','job/'||target||'/currency','text',terms->'currencyName')),(terms->>'currencyAmount')::integer);
    end if;
    if terms->>'itemName' is not null then
     w:=rpg_private.astra_generic_storage(w,t.id,cid,owner_id,'null');sid:=(w->>'storageId')::uuid;
     w:=rpg_private.astra_generic_write(w,'items',rid,jsonb_build_object('name',terms->'itemName','category',terms->'itemCategory','quantity',1,
      'description',terms->'itemDescription','mechanics','','owner_entity_id',owner_id,'storage_id',sid,'equipped_entity_id',null,'equipped_slot',null));
    end if;
    select jsonb_agg(case when value->>'questId'=target::text then value||jsonb_build_object('rewardOperationId',t.id) else value end order by n)
     into current_row from jsonb_array_elements(w->'jobs') with ordinality x(value,n);
    w:=jsonb_set(w,'{jobs}',current_row);w:=rpg_private.astra_generic_write(w,'quests',target,jsonb_build_object('status','complete'));
   end if;
  end if;
 else
  perform rpg_private.assert(o->>'kind'='time.advance');perform rpg_private.fields(o,common||array['minutes','basis']);
  perform rpg_private.assert(rpg_private.wave4_integer(o->'minutes',0,1440));
  amount:=(w#>>'{source,runtime,worldMinutes}')::integer+(o->>'minutes')::integer;
  perform rpg_private.assert(amount<=(w->>'origin')::integer+1440);w:=jsonb_set(w,'{source,runtime,worldMinutes}',to_jsonb(amount));
 end if;
 for job in select value from jsonb_array_elements(w->'jobs') loop
  if job#>>'{rewardTerms,currencyName}' is not null then w:=jsonb_set(w,'{manifest,evidence}',(w#>'{manifest,evidence}')||
   jsonb_build_object('job/'||(job->>'questId')||'/currency',job#>'{rewardTerms,currencyName}'));end if;
 end loop;
 return w;
end $$;

create function rpg_private.astra_generic_compile(t rpg_private.turns,proposed jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
declare s jsonb:=t.source||jsonb_build_object('astraResponseMode',t.astra_response_mode); w jsonb; candidate jsonb;
 intents jsonb:=proposed->'intents'; accepted jsonb:='[]'; rejected jsonb:='[]'; refs text[];
 first_op jsonb; o jsonb; other jsonb; group_ops jsonb; group_key text; seen text[]:='{}'; closed_groups text[]:='{}'; group_ids text[];
 index integer:=0; j integer; dep text; rest_op jsonb; rule_entry jsonb; rule_result jsonb; rule_plans jsonb:='[]';
 local_t rpg_private.turns; c jsonb; r jsonb; cost integer; defeated boolean; oldrow jsonb; rid uuid; item jsonb; payer uuid; recipient uuid;
begin
 perform rpg_private.assert(jsonb_typeof(intents)='array' and jsonb_array_length(intents)<=12 and
  t.runtime_identity='astra-primary-v1' and t.astra_state_contract='generic-v1' and t.astra_response_contract='unified-v1' and
  t.astra_response_mode in ('public-unified','private-informed') and t.input->>'mode'='game');
 w:=jsonb_build_object('source',s,'manifest',rpg_private.astra_generic_manifest(s,t.input->>'input'),
  'refs','{}'::jsonb,'changes','[]'::jsonb,'jobs',coalesce(s->'astraSettlementJobs','[]'),
  'foundationState',null,'origin',s#>'{runtime,worldMinutes}','damageApplied','[]'::jsonb,'damageRefs','[]'::jsonb);
 while index<jsonb_array_length(intents) loop
  first_op:=intents->index;group_key:=first_op->>'atomicGroup';group_ops:=jsonb_build_array(first_op);index:=index+1;
  if group_key is not null then
   while index<jsonb_array_length(intents) and intents->index->>'atomicGroup'=group_key loop
    group_ops:=group_ops||jsonb_build_array(intents->index);index:=index+1;
   end loop;
  end if;
  candidate:=w;group_ids:='{}';
  begin
   perform rpg_private.assert(group_key is null or group_key ~ '^[a-z][a-z0-9_-]{0,31}$' and not group_key=any(closed_groups));
   select value into rest_op from jsonb_array_elements(group_ops) where value->>'kind'='time.advance' and value#>>'{basis,source}'='rule' limit 1;
   if rest_op is not null then
    perform rpg_private.assert(group_key is not null and rest_op->'minutes'='null' and rest_op#>>'{basis,key}' in ('long-rest','short-rest'));
    select value into rule_entry from jsonb_array_elements(coalesce(proposed->'rulePlans','[]')) where value->>'opId'=rest_op->>'opId';
    perform rpg_private.assert(rule_entry is not null and rule_entry#>>'{plan,kind}'='formal_rest' and
      rule_entry#>>'{plan,intent,restKind}'=case when rest_op#>>'{basis,key}'='long-rest' then 'long' else 'short' end);
    local_t:=t;local_t.source:=candidate->'source';
    rule_result:=rpg_private.astra_mechanics_expected(t.campaign_id,local_t,rule_entry->'plan');
    perform rpg_private.assert(rule_result=rule_entry->'plan');
    for o in select value from jsonb_array_elements(group_ops) loop
     if o->>'kind'='time.advance' then
      perform rpg_private.fields(o,array['opId','requiresOperations','atomicGroup','kind','minutes','basis']);
      perform rpg_private.assert(o=rest_op);
     elsif o->>'kind'='resource.adjust' and o#>>'{mutation,action}'='delta' then
      perform rpg_private.fields(o,array['opId','requiresOperations','atomicGroup','kind','mutation']);
      perform rpg_private.fields(o->'mutation',array['action','actor','resource','amount','payer','basis']);
      perform rpg_private.assert(o#>'{mutation,resource}'='{"kind":"hp"}' and o#>'{mutation,payer}'='null' and o#>'{mutation,basis}'=rest_op->'basis');
      rid:=rpg_private.astra_generic_ref(candidate,o#>'{mutation,actor}','entities');oldrow:=rpg_private.astra_shadow_row(candidate->'source','entities',rid);
      perform rpg_private.assert(exists(select 1 from jsonb_array_elements(rule_result#>'{resolution,changes}')
       where value->>'family'='entities' and value->>'id'=rid::text and (value#>>'{values,hp}')::integer=(oldrow->>'hp')::integer+(o#>>'{mutation,amount}')::integer));
     elsif o->>'kind'='item.mutate' and o#>>'{mutation,action}'='consume' then
      perform rpg_private.fields(o,array['opId','requiresOperations','atomicGroup','kind','mutation']);
      perform rpg_private.fields(o->'mutation',array['action','target','quantity','basis']);
      perform rpg_private.assert(o#>'{mutation,basis}'=rest_op->'basis');
      rid:=rpg_private.astra_generic_ref(candidate,o#>'{mutation,target}','items');oldrow:=rpg_private.astra_shadow_row(candidate->'source','items',rid);
      perform rpg_private.assert(exists(select 1 from jsonb_array_elements(rule_result#>'{resolution,changes}')
       where value->>'family'='items' and value->>'id'=rid::text and (value#>>'{values,quantity}')::integer=(oldrow->>'quantity')::integer-(o#>>'{mutation,quantity}')::integer));
     else raise exception 'rpg_validation';end if;
    end loop;
    for c in select value from jsonb_array_elements(rule_result#>'{resolution,changes}') loop
     candidate:=rpg_private.astra_generic_write(candidate,c->>'family',(c->>'id')::uuid,c->'values');
    end loop;
    candidate:=jsonb_set(jsonb_set(candidate,'{source,runtime,worldMinutes}',rule_result#>'{resolution,worldMinutes}'),
     '{source,runtime,configuration}',rule_result#>'{resolution,configuration}');
   end if;
   for o in select value from jsonb_array_elements(group_ops) loop
    perform rpg_private.assert(o->>'opId' ~ '^[a-z][a-z0-9_-]{0,31}$' and not o->>'opId'=any(seen||group_ids) and
     (select count(*)=1 from jsonb_array_elements(intents) where value->>'opId'=o->>'opId') and
     jsonb_typeof(o->'requiresOperations')='array' and (select count(*)=count(distinct value) from jsonb_array_elements(o->'requiresOperations')));
    refs:=rpg_private.astra_generic_refs(o);
    for dep in select value from jsonb_array_elements_text(o->'requiresOperations') union all select unnest(refs) loop
     perform rpg_private.assert(accepted ? dep or dep=any(group_ids));
    end loop;
    if rest_op is null then
     -- Reciprocal exchange legs cannot be separated into independently payable groups.
     if o->>'kind'='resource.adjust' and o#>>'{mutation,action}'='transfer' then
      payer:=rpg_private.astra_generic_ref(candidate,o#>'{mutation,from}','entities');recipient:=rpg_private.astra_generic_ref(candidate,o#>'{mutation,to}','entities');
      for other in select value from jsonb_array_elements(intents) where value->>'kind'='item.mutate' and value#>>'{mutation,action}'='transfer' loop
       item:=rpg_private.astra_shadow_row(candidate->'source','items',rpg_private.astra_generic_ref(candidate,other#>'{mutation,target}','items'));
       if item->>'owner_entity_id'=recipient::text and rpg_private.astra_generic_ref(candidate,other#>'{mutation,recipient}','entities')=payer then
        perform rpg_private.assert(group_key is not null and other->>'atomicGroup'=group_key);end if;
      end loop;
     elsif o->>'kind'='item.mutate' and o#>>'{mutation,action}'='transfer' then
      item:=rpg_private.astra_shadow_row(candidate->'source','items',rpg_private.astra_generic_ref(candidate,o#>'{mutation,target}','items'));
      recipient:=rpg_private.astra_generic_ref(candidate,o#>'{mutation,recipient}','entities');
      for other in select value from jsonb_array_elements(intents) where value->>'kind'='resource.adjust' and value#>>'{mutation,action}'='transfer' loop
       if rpg_private.astra_generic_ref(candidate,other#>'{mutation,from}','entities')=recipient and
        rpg_private.astra_generic_ref(candidate,other#>'{mutation,to}','entities')::text=item->>'owner_entity_id' then
        perform rpg_private.assert(group_key is not null and other->>'atomicGroup'=group_key);end if;
      end loop;
     end if;
     candidate:=rpg_private.astra_generic_one(candidate,t,o);
    end if;
    group_ids:=array_append(group_ids,o->>'opId');
   end loop;
   if rest_op is not null then rule_plans:=rule_plans||jsonb_build_array(rule_entry);end if;
   w:=candidate;accepted:=accepted||to_jsonb(group_ids);
  exception when raise_exception or invalid_parameter_value or invalid_text_representation or numeric_value_out_of_range or null_value_not_allowed then
   for o in select value from jsonb_array_elements(group_ops) loop rejected:=rejected||jsonb_build_array(
    jsonb_build_object('opId',coalesce(o->>'opId','invalid'),'reason','not_authorized'));end loop;
  end;
  for o in select value from jsonb_array_elements(group_ops) loop seen:=array_append(seen,o->>'opId');end loop;
  if group_key is not null then closed_groups:=array_append(closed_groups,group_key);end if;
 end loop;
 for r in select value from jsonb_array_elements(coalesce(t.source#>'{runtime,participants}','[]')) loop
  if not exists(select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e where e.value->'id'=r->'encounter_id' and e.value->>'status'='active') then continue;end if;
  select count(*)::integer into cost from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}') where
    value#>>'{call,kind}' in ('attack','skill') and value#>'{call,actorId}'=r->'entity_id';
  defeated:=exists(select 1 from jsonb_array_elements(w->'changes') where value->>'family'='entities' and value->'id'=r->'entity_id' and value#>'{values,hp}'='0');
  if cost=0 and not coalesce(defeated,false) then continue;end if;
  perform rpg_private.assert(cost<=1 and (r#>>'{public_resources,action}')::integer>=cost);
  w:=rpg_private.astra_generic_write(w,'encounter_participants',(r->>'id')::uuid,jsonb_build_object('public_position',r->'public_position',
    'public_resources',(r->'public_resources')||jsonb_build_object('action',(r#>>'{public_resources,action}')::integer-cost,
      'withdrawn',r#>'{public_resources,withdrawn}'='true' or coalesce(defeated,false))));
 end loop;
 perform rpg_private.assert(jsonb_array_length(w->'changes')<=100);
 return jsonb_build_object('schemaVersion',3,'intents',intents,'accepted',accepted,'rejected',rejected,
  'resolution',jsonb_build_object('changes',w->'changes','worldMinutes',w#>'{source,runtime,worldMinutes}',
    'configuration',w#>'{source,runtime,configuration}','outcomes','[]'::jsonb),
  'foundationState',w->'foundationState','jobs',w->'jobs','publication',proposed->'publication',
  'behavior',proposed->'behavior','rulePlans',rule_plans,'refs',w->'refs','damageRefs',w->'damageRefs');
end $$;

-- A derived World Lab snapshot may include current generic actors. Playable
-- Foundation rows/events and immutable source saves are never rewritten.
alter function rpg_private.lab_rows(uuid,uuid,text) rename to lab_rows_before_astra_generic;
create function rpg_private.lab_rows(cid uuid,mid uuid,tab text) returns jsonb
language plpgsql stable set search_path='' as $$
declare rows jsonb; f jsonb; rt jsonb; ps jsonb; entities jsonb; actors jsonb:='[]'; actor jsonb; entity jsonb; eid uuid; place uuid;
begin
 rows:=rpg_private.lab_rows_before_astra_generic(cid,mid,tab);
 if tab<>'rpg_private.world_foundations' or jsonb_array_length(rows)<>1 or rows#>'{0,astra_takeover}' is null or rows#>'{0,astra_takeover}'='null' then return rows;end if;
 if not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows_before_astra_generic(cid,mid,'rpg_private.turns')) where
  value->>'astra_state_contract'='generic-v1' and value->>'status'='committed') then return rows;end if;
 f:=rows->0;rt:=rpg_private.lab_rows_before_astra_generic(cid,mid,'rpg_private.runtime_state')->0;
 ps:=rpg_private.lab_rows_before_astra_generic(cid,mid,'public.rpg_public_state')->0;
 entities:=rpg_private.lab_rows_before_astra_generic(cid,mid,'public.rpg_entities');place:=(ps->>'current_location_id')::uuid;
 for actor in select value from jsonb_array_elements(f#>'{world,actors}') loop
  select value into entity from jsonb_array_elements(entities) where value->'id'=actor->'entityId';
  if entity is not null then actor:=actor||jsonb_build_object('publicName',entity->'name','locationId',
    case when rt#>'{configuration,presentEntityIds}' ? (entity->>'id') then to_jsonb(place)
     when entity->>'kind'='npc' then 'null'::jsonb else actor->'locationId' end);end if;
  actors:=actors||jsonb_build_array(actor);
 end loop;
 for entity in select value from jsonb_array_elements(entities) loop
  if entity->>'kind' not in ('npc','companion') or exists(select 1 from jsonb_array_elements(actors) where value->'entityId'=entity->'id') then continue;end if;
  eid:=(entity->>'id')::uuid;
  actors:=actors||jsonb_build_array(jsonb_build_object('id',eid,
   'campaignId',cid,'revision',entity->'revision','kind','entity','entityId',eid,'control','autonomous','publicName',entity->'name',
   'locationId',case when rt#>'{configuration,presentEntityIds}' ? eid::text then place else null end,
   'capabilities','[]'::jsonb,'limitations','[]'::jsonb,'knowledge','[]'::jsonb));
 end loop;
 return jsonb_build_array(jsonb_set(f,'{world,actors}',actors));
end $$;
do $$ declare d text; old_call text:=$old$rpg_private.astra_takeover_project_world(saved->'world',current_id,
      (ps->>'current_location_id')::uuid,companions)$old$;begin
 select replace(pg_get_functiondef('rpg_private.astra_takeover_lab_refs(uuid,rpg_private.timeline_manifests,uuid)'::regprocedure),E'\r\n',E'\n') into d;
 perform rpg_private.assert(strpos(d,old_call)>0);
 d:=replace(d,old_call,$new$(rpg_private.lab_rows(cid,base.id,'rpg_private.world_foundations')->0)->'world'$new$);execute d;
end $$;

create function rpg_private.astra_generic_scene_title()
returns trigger language plpgsql set search_path='' as $$
declare t rpg_private.turns%rowtype; op text:=current_setting('rpg.astra_generic_commit',true); locale text;
begin
 if new.role='narration' and op ~ '^[0-9a-f-]{36}$' then
  select * into t from rpg_private.turns where id=op::uuid and campaign_id=new.campaign_id and astra_state_contract='generic-v1' and status='generating';
  if t.id is not null then locale:=t.checkpoint#>>'{narration,sceneLocale}';
   if locale is not null then perform rpg_private.assert(rpg_private.astra_settlement_text(locale,120));new.title:=locale;end if;
  end if;
 end if;return new;
end $$;
create trigger astra_generic_scene_title before insert on public.rpg_scenes for each row execute function rpg_private.astra_generic_scene_title();

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_astra_generic;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare t rpg_private.turns%rowtype; prior jsonb; incoming jsonb; expected jsonb; result jsonb; cp jsonb; final jsonb;
 requested text; pos integer; receipts jsonb; receipt jsonb; s jsonb; c jsonb; behavior jsonb; actor uuid; prefix_length integer;
 check_row jsonb; old_check jsonb; command jsonb; saved rpg_private.runtime_commands%rowtype; used integer; packet jsonb;
begin
 if p_action not in ('begin','claim','astra_state_contract','checkpoint','astra_tool','commit','reroll','astra_reroll_receipt') then
  return public.rpg_runtime_before_astra_generic(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501';end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;if not found then raise exception 'rpg_not_found';end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action not in ('claim','astra_state_contract'));
 select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
 if p_action='astra_state_contract' then
  perform rpg_private.fields(p_payload,array['operationId']);
  return case when t.id is null then 'null'::jsonb else to_jsonb(coalesce(t.astra_state_contract,'legacy-state')) end;
 end if;
 if p_action='begin' then
  requested:=p_payload->>'serverAstraStateContract';
  perform rpg_private.assert(requested is null or requested='generic-v1' and p_payload->>'serverRuntime'='astra-primary-v1' and p_payload->>'serverAstraContract'='unified-v1' and p_payload->>'mode'='game');
  if t.id is not null and t.astra_state_contract is distinct from requested then raise exception 'rpg_conflict';end if;
  result:=public.rpg_runtime_before_astra_generic(p_owner_id,p_campaign_id,p_action,p_payload-'serverAstraStateContract',p_timeline);
  if t.id is null and requested is not null then update rpg_private.turns set astra_state_contract=requested where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id and owner_id=p_owner_id;perform rpg_private.assert(found);end if;
  return result;
 end if;
 if p_action='claim' then
  result:=public.rpg_runtime_before_astra_generic(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
  if result is null then return result;end if;
  if t.astra_state_contract='generic-v1' then
   result:=jsonb_set(result,'{turn,checkpoint}',(result#>'{turn,checkpoint}')-'astraEffects');
   if t.astra_ordered_effects is not null then result:=jsonb_set(result,'{turn,checkpoint,astraGeneric}',t.astra_ordered_effects);end if;
   result:=jsonb_set(result,'{source,astraStateContract}','"generic-v1"');
  end if;
  return result||jsonb_build_object('astraStateContract',t.astra_state_contract);
 end if;
 if t.astra_state_contract is distinct from 'generic-v1' or t.status='committed' then
  return public.rpg_runtime_before_astra_generic(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);end if;
 if t.lease_token is distinct from (p_payload->>'token')::uuid or t.lease_token is null or t.lease_until<=now() or
  t.expected_revision<>(p_payload->>'expectedRevision')::integer or t.expected_revision<>(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id)
  then raise exception 'rpg_conflict';end if;
 perform rpg_private.assert(p_payload->>'campaignId'=p_campaign_id::text and t.status in ('pending','generating','awaiting_confirmation') and
  t.astra_response_contract='unified-v1' and t.astra_response_mode in ('public-unified','private-informed') and t.source is not null);
 if t.source#>>'{snapshot,settings,values,rulesSystem,id}'='world-logic-v1' then perform rpg_private.assert(rpg_private.astra_takeover_active(p_campaign_id));end if;
 prior:=t.astra_ordered_effects;
 if p_action='checkpoint' then
  perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','checkpoint','status']);
  cp:=p_payload->'checkpoint';incoming:=cp->'astraGeneric';final:=cp#>'{astraPrimary,finalProposal}';
  perform rpg_private.fields(incoming,array['schemaVersion','intents','accepted','rejected','resolution','foundationState','jobs','publication','behavior','rulePlans','refs','damageRefs']);
  expected:=rpg_private.astra_generic_compile(t,incoming);perform rpg_private.assert(incoming=expected);
  if prior is not null then
   prefix_length:=jsonb_array_length(prior->'intents');
   if prefix_length>jsonb_array_length(incoming->'intents') or exists(select 1 from jsonb_array_elements(prior->'intents') with ordinality x(value,n)
    where value<>incoming->'intents'->(n::integer-1)) then raise exception 'rpg_conflict';end if;
   if t.checkpoint#>'{astraPrimary,finalProposal}'<>'null' and prior<>incoming then raise exception 'rpg_conflict';end if;
  end if;
  if final<>'null' then
   perform rpg_private.assert(final->'resolution'=incoming->'resolution' and jsonb_typeof(final->'privatePatches')='array' and jsonb_array_length(final->'privatePatches')<=6);
   if t.astra_response_mode='public-unified' then perform rpg_private.assert(cp->'narration'=rpg_private.astra_generic_publication(incoming));
   else perform rpg_private.assert(incoming->'publication'='null');end if;
   for behavior in select value from jsonb_array_elements(incoming->'behavior') loop
    perform rpg_private.fields(behavior,array['actor','stance','tone','intensity']);perform rpg_private.assert(behavior#>>'{actor,source}'='known');
    actor:=rpg_private.astra_generic_ref(jsonb_build_object('manifest',rpg_private.astra_generic_manifest(t.source,t.input->>'input')),behavior->'actor','entities');
    perform rpg_private.assert(t.source#>'{runtime,configuration,presentEntityIds}' ? actor::text and not t.source#>'{runtime,configuration,controlledEntityIds}' ? actor::text and
     behavior->>'stance' in ('accept','refuse','hesitate','deflect','leave','attack','offer_conditions') and behavior->>'tone' in ('neutral','warm','firm','guarded','angry','fearful','tired') and
     rpg_private.wave4_integer(behavior->'intensity',1,3));
   end loop;
   perform rpg_private.assert(jsonb_array_length(incoming->'behavior')<=2 and (select count(*)=count(distinct value->'actor') from jsonb_array_elements(incoming->'behavior')));
   for c in select value from jsonb_array_elements(final->'privatePatches') loop
    perform rpg_private.assert(not (c->>'kind'='npc' and c->>'key' like 'character_%'));
   end loop;
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}') r where
     r.value#>>'{call,kind}'='damage' and (r.value#>>'{result,total}')::integer>0 and not incoming->'damageRefs' ? (r.value->>'id')));
  end if;
  result:=public.rpg_runtime_before_astra_settlement(p_owner_id,p_campaign_id,'checkpoint',jsonb_set(p_payload,'{checkpoint}',cp-'astraGeneric'),p_timeline);
  update rpg_private.turns set astra_ordered_effects=incoming where id=t.id and campaign_id=p_campaign_id;
  return result;
 elsif p_action='astra_tool' then
  perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','position','call','result']);
  perform rpg_private.assert(prior is not null and t.checkpoint#>'{astraPrimary,finalProposal}'='null');
  receipts:=t.checkpoint#>'{astraPrimary,toolReceipts}';pos:=(p_payload->>'position')::integer;
  perform rpg_private.assert(pos between 0 and 11 and pos<=jsonb_array_length(receipts));
  if pos<jsonb_array_length(receipts) then receipt:=receipts->pos;if receipt->'call'<>p_payload->'call' then raise exception 'rpg_conflict';end if;return receipt;end if;
  perform rpg_private.assert(prior=rpg_private.astra_generic_compile(t,prior));
  s:=t.source;
  for c in select value from jsonb_array_elements(prior#>'{resolution,changes}') loop s:=rpg_private.astra_shadow_apply(s,c);end loop;
  s:=jsonb_set(jsonb_set(s,'{runtime,configuration}',prior#>'{resolution,configuration}'),'{runtime,worldMinutes}',prior#>'{resolution,worldMinutes}');
  perform rpg_private.astra_generic_tool_assert(t,s,p_payload->'call',p_payload->'result');
  receipt:=jsonb_build_object('position',pos,'id',rpg_private.wave4_id(t.id,'astra:tool:'||pos),
   'call',p_payload->'call','result',p_payload->'result','prefixLength',jsonb_array_length(prior->'intents'));
  cp:=jsonb_set(t.checkpoint,'{astraPrimary,toolReceipts}',receipts||jsonb_build_array(receipt));
  if p_payload#>>'{call,kind}' in ('skill','attack','save') then cp:=jsonb_set(cp,'{checks}',(cp->'checks')||jsonb_build_array(p_payload->'result'));end if;
  update rpg_private.turns set checkpoint=cp,updated_at=now() where campaign_id=p_campaign_id and id=t.id;return receipt;
 elsif p_action='astra_reroll_receipt' then
  perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','command']);command:=p_payload->'command';
  perform rpg_private.fields(command-'timeline',array['commandId','campaignId','operationId','action','checkId']);
  perform rpg_private.assert(command->>'campaignId'=p_campaign_id::text and command->>'operationId'=t.id::text and command->>'action'='reroll');
  select * into saved from rpg_private.runtime_commands where id=(command->>'commandId')::uuid;
  if not found then return 'null'::jsonb;end if;
  if saved.owner_id<>p_owner_id or saved.campaign_id<>p_campaign_id or saved.operation_id<>t.id or saved.request<>(command-'timeline') then raise exception 'rpg_conflict';end if;
  return t.checkpoint->'checks';
 elsif p_action='reroll' then
  perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','command','check']);command:=p_payload->'command';
  perform rpg_private.fields(command-'timeline',array['commandId','campaignId','operationId','action','checkId']);
  perform rpg_private.assert(t.checkpoint#>'{astraPrimary,finalProposal}'='null');
  select * into saved from rpg_private.runtime_commands where id=(command->>'commandId')::uuid;
  if found then if saved.owner_id<>p_owner_id or saved.campaign_id<>p_campaign_id or saved.request<>(command-'timeline') then raise exception 'rpg_conflict';end if;return t.checkpoint->'checks';end if;
  perform rpg_private.assert(t.status='awaiting_confirmation' and command->>'action'='reroll' and command->>'campaignId'=p_campaign_id::text and command->>'operationId'=t.id::text);
  select value into old_check from jsonb_array_elements(t.checkpoint->'checks') where value->>'id'=command->>'checkId';
  perform rpg_private.assert(old_check->>'visibility'='player' and t.settings->>'dicePresentation'<>'hidden' and
   (t.settings->>'dicePresentation'='all-player-rolls' or old_check->'important'='true'));
  select count(*)::integer into used from rpg_private.runtime_commands q join rpg_private.turns r on r.id=q.operation_id where q.campaign_id=p_campaign_id and
   r.session_id is not distinct from t.session_id and q.request->>'action'='reroll';
  perform rpg_private.assert(t.settings#>>'{difficulty,rerolls}'='unlimited' or t.settings#>>'{difficulty,rerolls}'='limited' and used<(t.settings#>>'{difficulty,rerollsPerSession}')::integer);
  check_row:=p_payload->'check';perform rpg_private.assert(check_row->'id'=old_check->'id' and (check_row->>'rollNumber')::integer=(old_check->>'rollNumber')::integer+1 and
   (check_row-array['dice','kept','total','success','rollNumber'])=(old_check-array['dice','kept','total','success','rollNumber']) and
   jsonb_array_length(check_row->'dice')=1 and rpg_private.wave4_integer(check_row#>'{dice,0}',1,20) and check_row->'kept'=check_row#>'{dice,0}' and
   (check_row->>'total')::integer=(check_row->>'kept')::integer+(old_check->>'modifier')::integer and check_row->'success'=to_jsonb((check_row->>'total')::integer>=(old_check->>'dc')::integer));
  select jsonb_agg(case when value->'id'=old_check->'id' then check_row else value end order by (value->>'index')::integer) into cp from jsonb_array_elements(t.checkpoint->'checks');
  update rpg_private.turns set checkpoint=jsonb_set(checkpoint,'{checks}',cp) where campaign_id=p_campaign_id and id=t.id;
  insert into rpg_private.runtime_commands(id,campaign_id,owner_id,operation_id,request,result) values((command->>'commandId')::uuid,p_campaign_id,p_owner_id,t.id,command-'timeline',cp);
  return cp;
 elsif p_action='commit' then
  perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','packet']);packet:=p_payload->'packet';final:=t.checkpoint#>'{astraPrimary,finalProposal}';
  perform rpg_private.assert(prior is not null and final<>'null' and prior=rpg_private.astra_generic_compile(t,prior) and
   final->'resolution'=prior->'resolution' and packet->'resolution'=final->'resolution' and packet->'privatePatches'=final->'privatePatches' and
   packet->'checks'=t.checkpoint->'checks' and packet->'narration'=t.checkpoint#>'{narration,narration}' and packet->'visualDescription'=t.checkpoint#>'{narration,visualDescription}' and
   t.source#>>'{runtime,revision}'=t.expected_revision::text and final->>'campaignId'=p_campaign_id::text and final->>'operationId'=t.id::text and final->>'input'=t.input->>'input');
  perform set_config('rpg.astra_generic_commit',t.id::text,true);
  result:=public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
  perform set_config('rpg.astra_generic_commit','',true);perform set_config('rpg.astra_generic_registry','',true);
  return result;
 end if;
 raise exception 'rpg_validation';
end $$;


do $$ declare entry record;begin
 for entry in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='rpg_private' and (p.proname like 'astra_generic_%' or p.proname in ('runtime_change_before_astra_generic','runtime_change','lab_rows_before_astra_generic','lab_rows')) loop
  execute format('revoke all on function %s from public,anon,authenticated,service_role',entry.signature);end loop;
end $$;
revoke all on function public.rpg_runtime_before_astra_generic(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
commit;
