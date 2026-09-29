-- Reviewed, owner-authored World Logic creation/opening. No new character,
-- inventory, save, job or Canon store. Immutable existing command receipts retain
-- the original proposal, failed dispatch and owner correction independently.
begin;

-- Match the already accepted TypeScript registration. No default or fallback.
create or replace function rpg_private.wave2_model_selection(v jsonb) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(v,array['providerId','modelId','reasoning']);
 perform rpg_private.assert(v->>'providerId'='openai' and v->>'modelId' in ('gpt-6-astra','gpt-6-sol','gpt-5.4','gpt-5.4-mini'));
 perform rpg_private.assert(v->'reasoning'='null' or (jsonb_typeof(v->'reasoning')='string' and
  ((v->>'modelId'='gpt-6-astra' and v->>'reasoning' in ('low','medium','high','xhigh','max')) or
   (v->>'modelId'='gpt-6-sol' and v->>'reasoning' in ('none','low','medium','high','xhigh','max')) or
   (v->>'modelId' in ('gpt-5.4','gpt-5.4-mini') and v->>'reasoning' in ('none','low','medium','high','xhigh')))));
end $$;

create function rpg_private.bootstrap_text(v jsonb,lo integer,hi integer) returns boolean
language sql immutable set search_path='' as $$
 select jsonb_typeof(v)='string' and length(btrim(v#>>'{}')) between lo and hi
$$;
create function rpg_private.bootstrap_lines(v jsonb,n integer) returns boolean
language plpgsql immutable set search_path='' as $$
declare x jsonb; begin
 if jsonb_typeof(v)<>'array' or jsonb_array_length(v)>n then return false; end if;
 for x in select value from jsonb_array_elements(v) loop
  if not rpg_private.bootstrap_text(x,1,200) or x#>>'{}' ~* '^(world[.:]|loot[.:]|trade[.:]|can:)' or x#>>'{}' ~* '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{20,}' then return false; end if;
 end loop;
 return (select count(*)=count(distinct value) from jsonb_array_elements(v));
end $$;
create function rpg_private.bootstrap_proposal(kind text,p jsonb,input jsonb) returns void
language plpgsql set search_path='' as $$
declare x jsonb; label text; begin
 if kind='creation' then
  perform rpg_private.fields(p,array['schemaVersion','capabilities','limitations','possessions','resources','questions']);
  foreach label in array array['capabilities','limitations'] loop
   perform rpg_private.assert(jsonb_typeof(p->label)='array' and jsonb_array_length(p->label)<=24);
   for x in select value from jsonb_array_elements(p->label) loop
    perform rpg_private.fields(x,array['text','quote']);
    perform rpg_private.assert(rpg_private.bootstrap_lines(jsonb_build_array(x->'text'),1) and rpg_private.bootstrap_text(x->'quote',1,1000) and position(x->>'quote' in input->>'description')>0 and position(lower(x->>'text') in lower(x->>'quote'))>0);
   end loop;
  end loop;
  perform rpg_private.assert(jsonb_typeof(p->'possessions')='array' and jsonb_array_length(p->'possessions')<=12 and jsonb_typeof(p->'resources')='array' and jsonb_array_length(p->'resources')<=8);
  for x in select value from jsonb_array_elements(p->'possessions') loop
   perform rpg_private.fields(x,array['name','description','quantity','quote']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'name',1,200) and rpg_private.bootstrap_text(x->'description',0,2000) and rpg_private.bootstrap_text(x->'quote',1,1000) and position(x->>'quote' in input->>'description')>0 and position(lower(x->>'name') in lower(x->>'quote'))>0);
   perform rpg_private.assert((x->>'description'='' or position(x->>'description' in input->>'description')>0) and (x->'quantity'='null' or (rpg_private.wave4_integer(x->'quantity',1) and (x->>'quantity')::integer<=20 and ((x->>'quantity')::integer=1 or position(x->>'quantity' in x->>'quote')>0))));
  end loop;
  for x in select value from jsonb_array_elements(p->'resources') loop
   perform rpg_private.fields(x,array['key','label','amount','quote']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'key',1,48) and x->>'key' ~ '^[a-z][a-z0-9_-]*$' and x->>'key' not in ('constructor','prototype','__proto__') and rpg_private.bootstrap_text(x->'label',1,100) and rpg_private.bootstrap_text(x->'quote',1,1000) and position(x->>'quote' in input->>'description')>0 and position(lower(x->>'label') in lower(x->>'quote'))>0 and (x->'amount'='null' or (rpg_private.wave4_integer(x->'amount') and (x->>'amount')::integer<=1000000 and position(x->>'amount' in x->>'quote')>0)));
  end loop;
 else
  perform rpg_private.fields(p,array['schemaVersion','location','situation','narration','actors','questions']);
  perform rpg_private.bootstrap_opening_fields(p,false);
 end if;
 perform rpg_private.assert(p->>'schemaVersion'='1' and jsonb_typeof(p->'questions')='array' and jsonb_array_length(p->'questions')<=8);
 for x in select value from jsonb_array_elements(p->'questions') loop
  perform rpg_private.fields(x,array['question','consequential']);
  perform rpg_private.assert(rpg_private.bootstrap_text(x->'question',1,500) and jsonb_typeof(x->'consequential')='boolean');
 end loop;
end $$;
create function rpg_private.bootstrap_opening_fields(p jsonb,resolved boolean) returns void
language plpgsql set search_path='' as $$
declare x jsonb; begin
 perform rpg_private.fields(p->'location',array['name','description']);
 perform rpg_private.assert((not resolved and p#>'{location,name}'='null') or rpg_private.bootstrap_text(p#>'{location,name}',1,200));
 perform rpg_private.assert((not resolved and p#>'{location,description}'='null') or rpg_private.bootstrap_text(p#>'{location,description}',1,4000));
 perform rpg_private.assert((not resolved and p->'situation'='null') or rpg_private.bootstrap_text(p->'situation',1,4000));
 perform rpg_private.assert((not resolved and p->'narration'='null') or rpg_private.bootstrap_text(p->'narration',1,8000));
 perform rpg_private.assert(jsonb_typeof(p->'actors')='array' and jsonb_array_length(p->'actors')<=4 and (select count(*)=count(distinct value->>'name') from jsonb_array_elements(p->'actors')));
 for x in select value from jsonb_array_elements(p->'actors') loop
  perform rpg_private.fields(x,array['name','description','capabilities','limitations']);
  perform rpg_private.assert(rpg_private.bootstrap_text(x->'name',1,200) and rpg_private.bootstrap_text(x->'description',1,2000) and rpg_private.bootstrap_lines(x->'capabilities',24) and rpg_private.bootstrap_lines(x->'limitations',24));
 end loop;
end $$;
create function rpg_private.bootstrap_review(kind text,r jsonb,proposal jsonb) returns void
language plpgsql set search_path='' as $$
declare x jsonb; i integer; q jsonb; begin
 if kind='creation' then
  perform rpg_private.fields(r,array['name','description','capabilities','limitations','possessions','resources','answers']);
  perform rpg_private.assert(rpg_private.bootstrap_text(r->'name',1,200) and rpg_private.bootstrap_text(r->'description',1,8000) and rpg_private.bootstrap_lines(r->'capabilities',24) and rpg_private.bootstrap_lines(r->'limitations',24));
  perform rpg_private.assert(jsonb_typeof(r->'possessions')='array' and jsonb_array_length(r->'possessions')<=12 and (select count(*)=count(distinct value->>'name') from jsonb_array_elements(r->'possessions')) and jsonb_typeof(r->'resources')='array' and jsonb_array_length(r->'resources')<=8 and (select count(*)=count(distinct value->>'key') from jsonb_array_elements(r->'resources')));
  for x in select value from jsonb_array_elements(r->'possessions') loop
   perform rpg_private.fields(x,array['name','description','quantity']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'name',1,200) and rpg_private.bootstrap_text(x->'description',0,2000) and rpg_private.wave4_integer(x->'quantity',1) and (x->>'quantity')::integer<=20);
  end loop;
  for x in select value from jsonb_array_elements(r->'resources') loop
   perform rpg_private.fields(x,array['key','label','amount']);
   perform rpg_private.assert(rpg_private.bootstrap_text(x->'key',1,48) and x->>'key' ~ '^[a-z][a-z0-9_-]*$' and x->>'key' not in ('constructor','prototype','__proto__') and rpg_private.bootstrap_text(x->'label',1,100) and rpg_private.wave4_integer(x->'amount') and (x->>'amount')::integer<=1000000);
  end loop;
 else
  perform rpg_private.fields(r,array['location','situation','narration','actors','answers','publicOpeningConfirmed']);
  perform rpg_private.assert(r->'publicOpeningConfirmed'='true');
  perform rpg_private.bootstrap_opening_fields(r,true);
 end if;
 perform rpg_private.assert(jsonb_typeof(r->'answers')='array' and jsonb_array_length(r->'answers')=jsonb_array_length(proposal->'questions'));
 for q,i in select value,ordinality::integer-1 from jsonb_array_elements(proposal->'questions') with ordinality loop
  perform rpg_private.assert((q->'consequential'='false' and r->'answers'->i='null') or rpg_private.bootstrap_text(r->'answers'->i,1,2000));
 end loop;
end $$;

-- The normal catalog signals preparation without changing old profile DTOs.
create or replace function rpg_private.adventure_catalog(uid uuid,cid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare f jsonb:=rpg_private.foundation_read(uid,cid); history jsonb:=rpg_private.adventure_history(cid); latest jsonb; binding jsonb:=rpg_private.adventure_binding(cid); ready boolean:=rpg_private.adventure_can_change(cid); result jsonb;
begin
 select coalesce(jsonb_agg(a order by a->>'createdAt',a->>'id'),'[]') into latest from (select distinct on (a->>'id') a from jsonb_array_elements(history) a order by a->>'id',(a->>'version')::integer desc) x;
 if binding is not null then begin perform rpg_private.adventure_world_current(uid,(binding->>'worldId')::uuid,(binding->>'worldVersion')::integer); exception when raise_exception then if sqlerrm in ('rpg_conflict','rpg_not_found') then ready:=false; else raise; end if; end; end if;
 result:=jsonb_build_object('campaignId',cid,'timeline',f->'timeline','revision',f->'revision','runtimeRevision',f->'runtimeRevision','expectedHeadId',f->'headId','worldBinding',binding,'activeAdventureId',(select a->'id' from jsonb_array_elements(latest) a where a->>'status'='active'),'adventures',latest,'history',history,'canChange',ready,'detachedPlayable',false);
 if f#>>'{ruleset,id}'='world-logic-v1' then result:=result||jsonb_build_object('requiresOpening',(select current_location_id is null from public.rpg_public_state where campaign_id=cid)); end if;
 return result;
end $$;

create function rpg_private.bootstrap_receipt(uid uuid,cid uuid,op uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare r record; begin
 if cid is null then
  select request,result into r from rpg_private.library_commands where id=op and owner_id=uid;
 else
  perform rpg_private.foundation_read(uid,cid);
  select request,result into r from rpg_private.world_commands where id=op and campaign_id=cid;
 end if;
 if not found then return null; end if;
 return jsonb_build_object('request',r.request,'result',r.result);
end $$;
create function rpg_private.bootstrap_write_receipt(uid uuid,cid uuid,op uuid,request jsonb,result jsonb) returns void language plpgsql set search_path='' as $$
begin
 if cid is null then insert into rpg_private.library_commands values(op,uid,request,result);
 else insert into rpg_private.world_commands values(op,cid,request,result); end if;
end $$;

create function rpg_private.bootstrap_fresh(uid uuid,cid uuid,command jsonb) returns jsonb language plpgsql set search_path='' as $$
declare f jsonb; a jsonb; binding jsonb; begin
 perform rpg_private.fields(command,array['requestId','campaignId','timeline','expectedRevision','expectedRuntimeRevision','expectedHeadId','adventureId','expectedAdventureVersion']);
 perform rpg_private.assert(command->>'campaignId'=cid::text);
 f:=rpg_private.foundation_fence(uid,cid,jsonb_build_object('operationId',command->'requestId','campaignId',cid,'timeline',command->'timeline','expectedRevision',command->'expectedRevision','expectedRuntimeRevision',command->'expectedRuntimeRevision','expectedHeadId',command->'expectedHeadId'));
 perform rpg_private.assert(f->'ruleset'='{"id":"world-logic-v1","version":1,"mode":"world_logic","validatorVersion":"world-logic-v1"}'::jsonb and f->>'worldMinutes'='0' and rpg_private.adventure_can_change(cid));
 perform rpg_private.assert(exists(select 1 from rpg_private.world_events where campaign_id=cid and event->>'kind'='campaign.bootstrap.created'));
 perform rpg_private.assert(exists(select 1 from public.rpg_public_state where campaign_id=cid and current_location_id is null and summary='') and (select count(*)=1 from public.rpg_entities where campaign_id=cid) and not exists(select 1 from public.rpg_locations where campaign_id=cid) and not exists(select 1 from public.rpg_quests where campaign_id=cid));
 select event#>'{payload,adventure}' into a from rpg_private.world_events where campaign_id=cid and event->>'kind'='adventure.version' and event#>>'{payload,adventure,id}'=command->>'adventureId' order by sequence desc limit 1;
 if a is null or a->>'status'<>'prepared' or a->'version'<>command->'expectedAdventureVersion' or exists(select 1 from jsonb_array_elements(rpg_private.adventure_catalog(uid,cid)->'adventures') x where x->>'status'='active') then raise exception 'rpg_conflict'; end if;
 binding:=rpg_private.adventure_binding(cid); perform rpg_private.assert(binding is not null);
 perform rpg_private.adventure_world_current(uid,(binding->>'worldId')::uuid,(binding->>'worldVersion')::integer);
 return f;
end $$;

create function public.rpg_bootstrap(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare uid uuid:=p_owner_id; cid uuid:=p_campaign_id; kind text:=split_part(p_action,'.',1); phase text:=split_part(p_action,'.',2); op uuid; reserved_id uuid; result_id uuid; approved_id uuid; saved jsonb; completed jsonb; ticket jsonb; input jsonb; profile jsonb; request jsonb; result jsonb; w rpg_private.adventure_world_versions%rowtype; f jsonb; command jsonb; review jsonb; hero uuid; storage uuid; session uuid; scene uuid; place uuid; npc uuid; x jsonb; actor jsonb; worldstate jsonb; loopstate jsonb; actorids jsonb; i integer:=0; mid uuid; st public.rpg_public_state%rowtype; lang text; binding jsonb; eid uuid; prior_subject text:=current_setting('request.jwt.claim.sub',true); generation bigint;
begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(jsonb_typeof(p_payload)='object' and octet_length(p_payload::text)<=131072);
 if cid is not null then
  -- Campaigns have no owner_id column in this single-owner schema. Keep the
  -- same positive owner-registry authorization as rpg_world/rpg_adventures,
  -- plus exact campaign membership; never infer ownership from browser text.
  perform 1 from public.rpg_campaigns where id=cid and exists(select 1 from rpg_private.owner_registry where user_id=uid) for update;
  if not found then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 end if;
 if p_action='policy' then perform rpg_private.fields(p_payload,'{}'); perform rpg_private.assert(cid is not null); return rpg_private.foundation_read(uid,cid); end if;
 perform rpg_private.assert(kind in ('creation','opening') and phase in ('reserve','recover','result','failure','inspect','commit') and ((kind='creation')=(cid is null)));
 perform 1 from rpg_private.owner_registry where user_id=uid for update;
 if phase in ('reserve','recover') then
  perform rpg_private.fields(p_payload,case when phase='recover' then array['input'] else array['input','profile'] end);
  input:=p_payload->'input'; profile:=p_payload->'profile';
  if kind='creation' then
   perform rpg_private.fields(input,array['requestId','worldId','worldVersion','title','language','name','description']);
   perform rpg_private.assert(rpg_private.bootstrap_text(input->'title',1,200) and rpg_private.bootstrap_text(input->'name',1,200) and rpg_private.bootstrap_text(input->'description',1,8000) and input->>'language' in ('en','ru') and rpg_private.wave4_integer(input->'worldVersion',1));
   op:=(input->>'requestId')::uuid;
  else
   perform rpg_private.fields(input,array['action','input']); perform rpg_private.assert(input->>'action'='start'); command:=input->'input'; op:=(command->>'requestId')::uuid;
  end if;
 else
  perform rpg_private.fields(p_payload,case when phase='commit' then case when cid is null then array['requestId','draftId','review'] else array['requestId','campaignId','draftId','review'] end when phase='result' then array['draftId','result'] else array['draftId'] end);
  op:=(p_payload->>'draftId')::uuid;
 end if;
 perform rpg_private.assert(op is not null);
 reserved_id:=rpg_private.wave4_id(op,'bootstrap:reserved'); result_id:=rpg_private.wave4_id(op,'bootstrap:result'); approved_id:=rpg_private.wave4_id(op,'bootstrap:approved');
 saved:=rpg_private.bootstrap_receipt(uid,cid,reserved_id); completed:=rpg_private.bootstrap_receipt(uid,cid,result_id);
 if phase in ('reserve','recover') then
  if saved is not null then
   if saved#>'{request,input}'<>input or saved#>>'{request,kind}'<>kind then raise exception 'rpg_conflict'; end if;
   return jsonb_build_object('ticket',saved#>'{result,ticket}','dispatch',false,'result',completed#>'{result,result}');
  end if;
  if phase='recover' then return null; end if;
  perform rpg_private.lab_execution_profile(profile,'world.compose');
  if kind='creation' then
   w:=rpg_private.adventure_world_current(uid,(input->>'worldId')::uuid,(input->>'worldVersion')::integer);
   ticket:=jsonb_build_object('kind',kind,'input',input,'world',rpg_private.adventure_world_json(w),'profile',profile,'context',jsonb_build_object('language',input->'language','name',input->'name','description',input->'description','world',jsonb_build_object('title',w.title,'premise',w.premise),'ruleset','world-logic-v1'));
  else
   f:=rpg_private.bootstrap_fresh(uid,cid,command);
   binding:=rpg_private.adventure_binding(cid); w:=rpg_private.adventure_world_current(uid,(binding->>'worldId')::uuid,(binding->>'worldVersion')::integer);
   select canon_generation into generation from rpg_private.timeline_campaigns where campaign_id=cid;
   ticket:=jsonb_build_object('kind',kind,'input',input,'world',rpg_private.adventure_world_json(w),'profile',profile,'context',jsonb_build_object('language',(select language from public.rpg_campaigns where id=cid),'world',jsonb_build_object('title',w.title,'premise',w.premise),'protagonist',(select jsonb_build_object('name',e.name,'description',e.details,'capabilities',a->'capabilities','limitations',coalesce(a->'limitations','[]')) from public.rpg_entities e,rpg_private.world_foundations wf,jsonb_array_elements(wf.world->'actors') a where e.campaign_id=cid and e.kind='player' and wf.campaign_id=cid and a->>'entityId'=e.id::text),'adventure',(select jsonb_build_object('title',a->'title','premise',a->'premise','pacing',a->'pacing') from jsonb_array_elements(rpg_private.adventure_catalog(uid,cid)->'adventures') a where a->>'id'=command->>'adventureId'),'worldMinutes',f->'worldMinutes','currentLocation',null,'ruleset','world-logic-v1'));
  end if;
  request:=jsonb_build_object('kind',kind,'input',input,'canonGeneration',generation);
  perform rpg_private.bootstrap_write_receipt(uid,cid,reserved_id,request,jsonb_build_object('ticket',ticket));
  return jsonb_build_object('ticket',ticket,'dispatch',true,'result',null);
 end if;
 if saved is null or saved#>>'{request,kind}'<>kind then raise exception 'rpg_not_found'; end if;
 ticket:=saved#>'{result,ticket}'; input:=ticket->'input';
 if phase='inspect' then
  if completed is null or completed#>'{result,result}' is null then raise exception 'rpg_conflict'; end if;
  return jsonb_build_object('ticket',ticket,'result',completed#>'{result,result}');
 elsif phase in ('result','failure') then
  request:=jsonb_build_object('kind',kind,'phase',phase,'draftId',op,'result',case when phase='result' then p_payload->'result' else 'null'::jsonb end);
  if completed is not null then if completed->'request'<>request then raise exception 'rpg_conflict'; end if; return completed->'result'; end if;
  if phase='result' then
   perform rpg_private.fields(p_payload->'result',array['output','usage']);
   perform rpg_private.bootstrap_proposal(kind,p_payload#>'{result,output}',case when kind='creation' then input else '{}'::jsonb end);
   perform rpg_private.assert(jsonb_typeof(p_payload#>'{result,usage}')='object' and p_payload#>>'{result,usage,model}' ~ ('^'||replace(ticket#>>'{profile,modelId}','.','\.')||'(-[0-9]{4}-[0-9]{2}-[0-9]{2})?$'));
  end if;
  result:=jsonb_build_object('result',case when phase='result' then p_payload->'result' else 'null'::jsonb end,'failed',phase='failure');
  perform rpg_private.bootstrap_write_receipt(uid,cid,result_id,request,result); return result;
 end if;
 request:=jsonb_build_object('kind',kind,'phase','commit','input',p_payload);
 completed:=rpg_private.bootstrap_receipt(uid,cid,approved_id);
 if completed is not null then if completed->'request'<>request then raise exception 'rpg_conflict'; end if; return completed->'result'; end if;
 completed:=rpg_private.bootstrap_receipt(uid,cid,result_id); perform rpg_private.assert(completed#>'{result,result,output}' is not null);
 review:=p_payload->'review'; perform rpg_private.bootstrap_review(kind,review,completed#>'{result,result,output}');
 w:=rpg_private.adventure_world_current(uid,(ticket#>>'{world,id}')::uuid,(ticket#>>'{world,version}')::integer);
 perform rpg_private.assert(w.version_id::text=ticket#>>'{world,versionId}');
 if kind='creation' then
  perform set_config('request.jwt.claim.sub',uid::text,true);
  result:=public.rpg_apply_mutation((p_payload->>'requestId')::uuid,'campaign.create',null,0,jsonb_build_object('title',input->'title','subtitle',review->'name','language',input->'language'),null,null);
  cid:=coalesce(result->>'campaign_id',result->>'id')::uuid; hero:=rpg_private.wave4_id(op,'bootstrap:hero'); storage:=rpg_private.wave4_id(op,'bootstrap:storage'); session:=rpg_private.wave4_id(op,'bootstrap:session'); scene:=rpg_private.wave4_id(op,'bootstrap:initial'); lang:=input->>'language';
  perform public.rpg_apply_mutation(rpg_private.wave4_id(op,'bootstrap:settings'),'settings.save',cid,1,jsonb_set((select values from public.rpg_settings where campaign_id=cid),'{rulesSystem}','{"id":"world-logic-v1","label":"World Logic","enemyHpScaling":false,"enemyDamageScaling":false}'::jsonb),rpg_private.timeline_fence(cid),null);
  perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','entities','id',hero,'expectedRevision',null,'values',jsonb_build_object('kind','player','name',review->'name','details',review->'description','hp',null,'max_hp',null,'stats','{}'::jsonb,'resources',coalesce((select jsonb_object_agg(x->>'key',x->'amount') from jsonb_array_elements(review->'resources') x),'{}'::jsonb),'conditions','[]'::jsonb,'equipment_slots','[]'::jsonb)));
  insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,revision) values(storage,cid,case when lang='ru' then 'Вещи' else 'Possessions' end,'player',hero,1);
  for x in select value from jsonb_array_elements(review->'possessions') loop
   i:=i+1; perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','items','id',rpg_private.wave4_id(op,'bootstrap:item:'||i),'expectedRevision',null,'values',jsonb_build_object('name',x->'name','category','possession','quantity',x->'quantity','description',x->'description','mechanics','','owner_entity_id',hero,'storage_id',storage,'equipped_entity_id',null,'equipped_slot',null)));
  end loop;
  insert into public.rpg_sessions(id,campaign_id,title,status,recap,revision) values(session,cid,case when lang='ru' then 'Начало' else 'Beginning' end,'open','',1);
  insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision) values(scene,cid,session,case when lang='ru' then 'Перед приключением' else 'Before the Adventure' end,case when lang='ru' then 'Персонаж утверждён. Начальная сцена будет подготовлена при старте приключения.' else 'Your protagonist is approved. The opening will be prepared when you start an Adventure.' end,'note',2,1);
  update public.rpg_public_state set current_session_id=session,current_scene_id=scene,revision=revision+1 where campaign_id=cid;
  worldstate:=jsonb_build_object('schemaVersion',1,'campaignId',cid,'policy',jsonb_build_object('simulation',false,'autonomy','moderate','deadlinePressure','off'),'policyChangedAtWorldMinutes',0,'actors',jsonb_build_array(jsonb_build_object('id',hero,'campaignId',cid,'revision',1,'kind','entity','entityId',hero,'control','player','publicName',review->'name','locationId',null,'capabilities',review->'capabilities','limitations',review->'limitations','knowledge','[]'::jsonb)),'threads','[]'::jsonb,'hooks','[]'::jsonb,'warnings','[]'::jsonb);
  loopstate:=jsonb_build_object('schemaVersion',1,'version',1,'profile','{"id":"world-logic-v1","version":1,"mode":"world_logic","validatorVersion":"world-logic-v1"}'::jsonb,'progression','off','currencies','[]'::jsonb,'itemPolicies','[]'::jsonb,'merchants','[]'::jsonb,'tracks','[]'::jsonb,'rewards','[]'::jsonb,'progress','[]'::jsonb,'pending','[]'::jsonb,'preparations','[]'::jsonb);
  insert into rpg_private.world_foundations(campaign_id,world,loop_state,ruleset) values(cid,worldstate,loopstate,loopstate->'profile');
  perform rpg_private.world_validate_state(uid,cid,worldstate,'[]'); perform rpg_private.wave4_state(cid,loopstate,loopstate->'profile');
  perform rpg_private.adventure_record(uid,cid,rpg_private.wave4_id(op,'bootstrap:binding'),'bind','{}','adventure.world_bound',jsonb_build_object('schemaVersion',1,'binding',jsonb_build_object('worldId',w.id,'worldVersion',w.version,'title',w.title),'worldVersionId',w.version_id));
  perform rpg_private.adventure_record(uid,cid,rpg_private.wave4_id(op,'bootstrap:creation'),'creation',input,'campaign.bootstrap.created',jsonb_build_object('schemaVersion',1,'classification','owner_authored_protagonist','draftId',op,'original',completed#>'{result,result}','input',input,'review',review,'executionProfile',ticket->'profile','heroId',hero));
  result:=jsonb_build_object('requestId',p_payload->'requestId','campaignId',cid,'heroId',hero);
  perform rpg_private.bootstrap_write_receipt(uid,null,approved_id,request,result);
  mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(rpg_private.timeline_fence(cid)->>'timelineId')::uuid;
  perform set_config('request.jwt.claim.sub',coalesce(prior_subject,''),true);
 else
  perform rpg_private.assert(p_payload->>'campaignId'=cid::text); command:=input->'input'; f:=rpg_private.bootstrap_fresh(uid,cid,command);
  if saved#>'{request,canonGeneration}'<>(select to_jsonb(canon_generation) from rpg_private.timeline_campaigns where campaign_id=cid) then raise exception 'rpg_conflict'; end if;
  select * into strict st from public.rpg_public_state where campaign_id=cid; hero:=(select id from public.rpg_entities where campaign_id=cid and kind='player'); place:=rpg_private.wave4_id(op,'bootstrap:location'); scene:=rpg_private.wave4_id(op,'bootstrap:opening'); actorids:=jsonb_build_array(hero);
  perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','locations','id',place,'expectedRevision',null,'values',jsonb_build_object('name',review#>'{location,name}','description',review#>'{location,description}','status','visited')));
  select world into worldstate from rpg_private.world_foundations where campaign_id=cid;
  worldstate:=jsonb_set(worldstate,'{actors}',(select jsonb_agg(a||jsonb_build_object('locationId',place,'revision',(a->>'revision')::integer+1)) from jsonb_array_elements(worldstate->'actors') a));
  for x in select value from jsonb_array_elements(review->'actors') loop
   i:=i+1; npc:=rpg_private.wave4_id(op,'bootstrap:npc:'||i);
   perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','entities','id',npc,'expectedRevision',null,'values',jsonb_build_object('kind','npc','name',x->'name','details',x->'description','hp',null,'max_hp',null,'stats','{}'::jsonb,'resources','{}'::jsonb,'conditions','[]'::jsonb,'equipment_slots','[]'::jsonb)));
   worldstate:=jsonb_set(worldstate,'{actors}',(worldstate->'actors')||jsonb_build_array(jsonb_build_object('id',npc,'campaignId',cid,'revision',1,'kind','entity','entityId',npc,'control','autonomous','publicName',x->'name','locationId',place,'capabilities',x->'capabilities','limitations',x->'limitations','knowledge','[]'::jsonb))); actorids:=actorids||jsonb_build_array(npc);
  end loop;
  insert into public.rpg_scenes(id,campaign_id,session_id,title,body,role,settings_revision,revision) select scene,cid,st.current_session_id,review#>>'{location,name}',review->>'narration','narration',revision,1 from public.rpg_settings where campaign_id=cid;
  perform rpg_private.runtime_change(cid,op,jsonb_build_object('family','public_state','id',cid,'expectedRevision',st.revision,'values',jsonb_build_object('summary',review->'situation','current_location_id',place,'current_scene_id',scene)));
  perform rpg_private.world_validate_state(uid,cid,worldstate,f->'bindings'); update rpg_private.world_foundations set world=worldstate where campaign_id=cid;
  eid:=rpg_private.world_event_id(op,'adventure','opening','public');
  insert into rpg_private.world_events(id,campaign_id,operation_id,event) values(eid,cid,op,jsonb_build_object('schemaVersion',1,'id',eid,'campaignId',cid,'originTimelineId',command#>'{timeline,timelineId}','operationId',op,'worldMinutes',f->'worldMinutes','kind','adventure.opening','actorIds',actorids,'threadIds','[]'::jsonb,'visibility','public','text',review->'narration','evidence','[]'::jsonb,'payload',jsonb_build_object('sceneId',scene,'adventureId',command->'adventureId','classification','campaign_authored_opening')));
  perform rpg_private.memory_index(cid,'event',eid,'1',review->>'narration','public',st.current_session_id,array(select jsonb_array_elements_text(actorids)::uuid),array(select jsonb_array_elements_text(actorids)::uuid),'history','record'); perform rpg_private.memory_invalidate(cid);
  -- The existing Start owns activation, Turn/receipt/version and exact manifests.
  -- The original reviewed fence was checked above under the campaign lock.
  -- Record triggers advance runtime revisions for our own writes. Bind the
  -- internal Start to that exact in-transaction state, never to a client rebase.
  f:=rpg_private.foundation_read(uid,cid);
  command:=command||jsonb_build_object('expectedRevision',f->'revision','expectedRuntimeRevision',f->'runtimeRevision','expectedHeadId',f->'headId');
  result:=public.rpg_adventures(uid,cid,'start',command,command->'timeline');
  eid:=rpg_private.world_event_id(op,'bootstrap','review','private');
  insert into rpg_private.world_events(id,campaign_id,operation_id,event) values(eid,cid,op,jsonb_build_object('schemaVersion',1,'id',eid,'campaignId',cid,'originTimelineId',command#>'{timeline,timelineId}','operationId',op,'worldMinutes',f->'worldMinutes','kind','campaign.bootstrap.opening_review','actorIds','[]'::jsonb,'threadIds','[]'::jsonb,'visibility','private','text','Owner-reviewed public opening.','evidence','[]'::jsonb,'payload',jsonb_build_object('draftId',op,'original',completed#>'{result,result}','review',review,'executionProfile',ticket->'profile')));
  result:=result||jsonb_build_object('requestId',p_payload->'requestId');
  perform rpg_private.bootstrap_write_receipt(uid,cid,approved_id,request,result);
  mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(command#>>'{timeline,timelineId}')::uuid;
  -- Receipt retains its original catalog basis; callers refresh after success.
 end if;
 return result;
end $$;
revoke all on function public.rpg_bootstrap(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_bootstrap(uuid,uuid,text,jsonb) to service_role;
revoke all on function rpg_private.bootstrap_text(jsonb,integer,integer),rpg_private.bootstrap_lines(jsonb,integer),rpg_private.bootstrap_proposal(text,jsonb,jsonb),rpg_private.bootstrap_opening_fields(jsonb,boolean),rpg_private.bootstrap_review(text,jsonb,jsonb),rpg_private.bootstrap_receipt(uuid,uuid,uuid),rpg_private.bootstrap_write_receipt(uuid,uuid,uuid,jsonb,jsonb),rpg_private.bootstrap_fresh(uuid,uuid,jsonb) from public,anon,authenticated;
commit;
