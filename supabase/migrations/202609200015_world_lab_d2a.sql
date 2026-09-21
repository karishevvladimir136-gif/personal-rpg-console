-- D2A: reviewed composition and one pinned model on the accepted detached ledger.
-- Verification uses disposable databases only. Historical manifests are unchanged.
begin;

create function rpg_private.lab_execution_profile(profile jsonb,task text) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(profile,array['schemaVersion','id','policyRevision','registryVersion','task','providerId','modelId','reasoning']);
 perform rpg_private.assert(profile->>'schemaVersion'='1' and (profile->>'id')::uuid is not null
  and profile->>'registryVersion'='openai-responses-v1' and profile->>'task'=task and task in ('world.compose','world.resolve')
  and jsonb_typeof(profile->'policyRevision')='number' and (profile->>'policyRevision')::numeric=trunc((profile->>'policyRevision')::numeric)
  and (profile->>'policyRevision')::numeric between 0 and 2147483646 and profile->'reasoning'<>'null'::jsonb);
 perform rpg_private.wave2_model_selection(jsonb_build_object('providerId',profile->'providerId','modelId',profile->'modelId','reasoning',profile->'reasoning'));
end $$;

-- Composition begins at an exact saved base without requiring an already
-- composed Scenario. This returns private authorized records to server code,
-- never to the browser, and does not create or activate a timeline.
create function rpg_private.lab_composition_base(uid uuid,cid uuid,sid uuid) returns jsonb
language plpgsql stable set search_path='' as $$
declare s rpg_private.save_points%rowtype; m rpg_private.timeline_manifests%rowtype;
 f jsonb; guide jsonb; binding jsonb; pack jsonb; sc jsonb; src jsonb; ref jsonb;
 library jsonb:='[]'; heads jsonb; docs jsonb; basis jsonb;
begin
 select * into s from rpg_private.save_points where campaign_id=cid and id=sid;
 perform rpg_private.assert(s.id is not null and exists(select 1 from rpg_private.timelines where campaign_id=cid and id=s.timeline_id and purpose='playable'));
 select * into strict m from rpg_private.timeline_manifests where campaign_id=cid and id=s.manifest_id;
 perform rpg_private.lab_validate_manifest(cid,m.id);
 perform rpg_private.assert(m.schema_version=2 and m.lab_run_id is null and m.canon_generation=(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid));
 perform rpg_private.assert(m.public_metadata->'pendingAction'='false'::jsonb);
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.turns')) t where t->>'owner_id'<>uid::text or t->>'status' not in ('committed','cancelled','failed') or (t->>'status'='failed' and t->>'retryable'<>'false')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'public.rpg_pending_actions')) a where a->>'status' not in ('resolved','cancelled')));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_stages')) st where not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.turns')) t where t->>'id'=st->>'id' and t->>'status'='committed')));
 f:=rpg_private.lab_rows(cid,m.id,'rpg_private.world_foundations')->0;
 perform rpg_private.assert(f->'world' is not null and f->'world'<>'null'::jsonb and f#>>'{ruleset,id}' in ('console-basic-v1','world-logic-v1'));
 perform rpg_private.assert((m.public_metadata->>'worldMinutes')::integer=(rpg_private.lab_rows(cid,m.id,'rpg_private.runtime_state')->0->>'world_minutes')::integer);
 for binding in select value from jsonb_array_elements(coalesce(f->'bindings','[]')) loop
  perform rpg_private.assert(binding->>'ownerId'=uid::text and binding->>'campaignId'=cid::text);
  pack:=rpg_private.library_ref(uid,binding->>'packVersionId','pack');
  perform rpg_private.assert(pack->>'id'=binding->>'packId' and pack#>>'{body,status}'='approved' and pack#>>'{body,approval,ownerId}'=uid::text);
  library:=library||jsonb_build_array(pack);
  if binding->>'scenarioVersionId' is null then
   perform rpg_private.assert(binding->'sourceVersionIds'=pack#>'{body,sourceVersionIds}');
  else
   sc:=rpg_private.library_ref(uid,binding->>'scenarioVersionId','scenario');
   perform rpg_private.assert(sc#>>'{body,status}'='approved' and sc#>>'{body,approval,ownerId}'=uid::text and sc#>'{body,entry}'=binding->'entry' and sc#>'{body,sourcePriority}'=binding->'sourcePriority' and sc#>'{body,sourceVersionIds}'=binding->'sourceVersionIds');
   library:=library||jsonb_build_array(sc);
   for ref in select value from jsonb_array_elements(sc#>'{body,packVersionIds}') loop library:=library||jsonb_build_array(rpg_private.library_ref(uid,ref#>>'{}','pack')); end loop;
  end if;
  for ref in select value from jsonb_array_elements(binding->'sourceVersionIds') loop library:=library||jsonb_build_array(rpg_private.library_ref(uid,ref#>>'{}','source')); end loop;
 end loop;
 select coalesce(jsonb_agg(value order by value->>'versionId'),'[]') into library from (select distinct value from jsonb_array_elements(library)) x;
 for pack in select value from jsonb_array_elements(library) where value->>'kind'='pack' loop
  perform rpg_private.assert(pack#>>'{body,status}'='approved' and pack#>>'{body,approval,ownerId}'=uid::text and jsonb_typeof(pack#>'{body,contradictions}')='array');
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(pack#>'{body,contradictions}') c where c->>'status' is distinct from 'resolved'));
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(pack#>'{body,sourceVersionIds}') pin where not exists(select 1 from jsonb_array_elements(library) source_record where source_record->>'kind'='source' and source_record->>'versionId'=pin.value)));
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('sourceId',source_row.value->'id','versionId',latest.version_id) order by source_row.value->>'id'),'[]') into heads
 from jsonb_array_elements(library) source_row cross join lateral (select version_id from rpg_private.library_records where owner_id=uid and kind='source' and id=(source_row.value->>'id')::uuid order by version desc limit 1) latest where source_row.value->>'kind'='source';
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(library) source_row where source_row->>'kind'='source' and not exists(select 1 from jsonb_array_elements(heads) h where h->'sourceId'=source_row->'id' and h->'versionId'=source_row->'versionId')));
 guide:=rpg_private.lab_rows(cid,m.id,'public.rpg_documents')->0;
 perform rpg_private.assert(guide is not null and exists(select 1 from public.rpg_document_versions v where v.campaign_id=cid and v.id=(guide->>'current_version_id')::uuid and v.document_id=(guide->>'id')::uuid and v.body=guide->>'body' and v.title=guide->>'title' and v.status=guide->>'status'));
 select coalesce(jsonb_agg(jsonb_build_object('documentId',v.document_id,'versionId',v.id,'digest',encode(sha256(convert_to(v.body,'UTF8')),'hex')) order by v.document_id),'[]') into docs
 from public.rpg_document_versions v where v.campaign_id=cid and (v.id=(guide->>'current_version_id')::uuid or exists(select 1 from public.rpg_documents d where d.campaign_id=cid and d.id=v.document_id and d.current_version_id=v.id and d.id<>(guide->>'id')::uuid and not exists(select 1 from public.rpg_dm_guides g where g.campaign_id=cid and g.document_id=d.id)));
 basis:=jsonb_build_object('ownerId',uid,'campaignId',cid,'saveId',sid,'manifestId',m.id,'canonGeneration',m.canon_generation,'sourceHeads',heads,'documents',docs);
 return jsonb_build_object('state',rpg_private.lab_read_state(uid,cid,m.id,null,library,docs),'sourceHeads',heads,'documents',docs,
  'base',jsonb_build_object('saveId',sid,'timelineId',s.timeline_id,'label',s.name,'worldMinutes',(m.public_metadata->>'worldMinutes')::integer),'basisDigest',rpg_private.lab_digest(basis));
end $$;

-- Exact row-source adapter for the existing owning consequence validator.
create function rpg_private.wave3_consequence_rows(cid uuid,mid uuid,family text) returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb; begin
 perform rpg_private.assert(family=any(array['public.rpg_public_state','public.rpg_entities','public.rpg_locations','public.rpg_items','public.rpg_storages','public.rpg_quests','public.rpg_encounters','public.rpg_rest_records','public.rpg_pending_actions','rpg_private.runtime_state' ]));
 if mid is not null then return rpg_private.lab_rows(cid,mid,family); end if;
 case family
 when 'public.rpg_public_state' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_public_state t where t.campaign_id=cid;
 when 'public.rpg_entities' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_entities t where t.campaign_id=cid;
 when 'public.rpg_locations' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_locations t where t.campaign_id=cid;
 when 'public.rpg_items' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_items t where t.campaign_id=cid;
 when 'public.rpg_storages' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_storages t where t.campaign_id=cid;
 when 'public.rpg_quests' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_quests t where t.campaign_id=cid;
 when 'public.rpg_encounters' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_encounters t where t.campaign_id=cid;
 when 'public.rpg_rest_records' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_rest_records t where t.campaign_id=cid;
 when 'public.rpg_pending_actions' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from public.rpg_pending_actions t where t.campaign_id=cid;
 when 'rpg_private.runtime_state' then select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from rpg_private.runtime_state t where t.campaign_id=cid;
 end case; return result;
end $$;

create function rpg_private.wave3_consequences(cid uuid,w jsonb,effects jsonb,mode text,decisions jsonb,caps jsonb,act text,elapsed bigint,detached_manifest uuid)
returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_column
declare effect jsonb; kind text; cap text; target jsonb; holder jsonb; protected_ids jsonb; entity jsonb; item jsonb; destination jsonb; quest jsonb;
 auth jsonb:='[]'; facts jsonb:='[]'; texts jsonb:='[]'; actors jsonb:=w->'actors'; before_value jsonb; after_value jsonb; changes jsonb:='[]';
 family text; rid text; rev integer; field text; idx integer; row_index integer; oldentry jsonb; current_location uuid; amount integer; resource text; fact text;
 seen text[]:=array[]::text[]; effect_key text; russian boolean; line text;
begin
 if detached_manifest is not null then
  perform rpg_private.lab_validate_manifest(cid,detached_manifest);
  perform rpg_private.assert(exists(select 1 from rpg_private.timeline_manifests m join rpg_private.timelines t on t.id=m.timeline_id and t.campaign_id=m.campaign_id where m.id=detached_manifest and m.campaign_id=cid and m.schema_version=3 and t.purpose='simulation'));
 end if;
 perform rpg_private.assert(mode in ('action','resolver') and jsonb_typeof(effects)='array' and jsonb_array_length(effects)<=6 and elapsed between 0 and 1000000000);
 perform rpg_private.uuid_array(decisions); perform rpg_private.assert(jsonb_typeof(caps)='array');
 select current_location_id into current_location from jsonb_populate_recordset(null::public.rpg_public_state,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_public_state')) where campaign_id=cid;
 select language='ru' into russian from public.rpg_campaigns where id=cid;
 select coalesce(jsonb_agg(distinct value),'[]') into protected_ids from (
  select to_jsonb(id::text) value from jsonb_populate_recordset(null::public.rpg_entities,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_entities')) where campaign_id=cid and kind='player'
  union all select value from jsonb_populate_recordset(null::rpg_private.runtime_state,rpg_private.wave3_consequence_rows(cid,detached_manifest,'rpg_private.runtime_state')) r,jsonb_array_elements(coalesce(r.configuration->'controlledEntityIds','[]')) where r.campaign_id=cid
  union all select to_jsonb(coalesce(a->>'entityId',a->>'id')) from jsonb_array_elements(actors) a where a->>'control'='player'
 ) protected;
 if mode='action' and jsonb_array_length(effects)>0 then
  perform rpg_private.assert(jsonb_array_length(decisions)=1 and protected_ids @> decisions);
 elsif mode='resolver' then perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(decisions) d where protected_ids ? d)); end if;
 if exists(select 1 from jsonb_array_elements(effects) e where e->>'kind'<>'fact.observe') then
  perform rpg_private.assert(not exists(select 1 from jsonb_populate_recordset(null::public.rpg_encounters,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_encounters')) where campaign_id=cid and status='active')
   and not exists(select 1 from jsonb_populate_recordset(null::public.rpg_rest_records,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_rest_records')) where campaign_id=cid and status='planned')
   and not exists(select 1 from jsonb_populate_recordset(null::public.rpg_pending_actions,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_pending_actions')) where campaign_id=cid and status in ('proposed','confirmed')));
 end if;
 for effect in select value from jsonb_array_elements(effects) loop
  kind:=effect->>'kind'; target:=null; family:=null; rid:=null; rev:=null; field:=null; before_value:=null; after_value:=null; line:=null;
  case kind
   when 'inventory.consume' then
    perform rpg_private.fields(effect,array['kind','actorId','itemId','quantity']);
    perform rpg_private.assert(jsonb_typeof(effect->'quantity')='number' and effect->>'quantity' ~ '^[0-9]{1,2}$' and (effect->>'quantity')::integer between 1 and 20);
    cap:='world.consume:'||(effect->>'itemId'); effect_key:='item:'||(effect->>'itemId');
   when 'resource.spend' then
    perform rpg_private.fields(effect,array['kind','actorId','resource','amount']);
    perform rpg_private.assert(jsonb_typeof(effect->'amount')='number' and effect->>'amount' ~ '^[0-9]{1,2}$' and (effect->>'amount')::integer between 1 and 20
      and effect->>'resource' ~ '^[a-z][a-z0-9_-]{0,47}$' and effect->>'resource' not in ('constructor','prototype','__proto__'));
    cap:='world.spend:'||(effect->>'resource'); effect_key:='resource:'||(effect->>'actorId')||':'||(effect->>'resource');
   when 'condition.add','condition.remove' then
    perform rpg_private.fields(effect,array['kind','actorId','condition']);
    perform rpg_private.assert(effect->>'condition' in ('wet','cold','tired','hungry','thirsty','dirty'));
    cap:='world.'||kind||':'||(effect->>'condition'); effect_key:='condition:'||(effect->>'actorId')||':'||(effect->>'condition');
   when 'actor.relocate' then
    perform rpg_private.fields(effect,array['kind','actorId','fromLocationId','toLocationId']);
    cap:='world.relocate:'||(effect->>'actorId')||':'||(effect->>'toLocationId'); effect_key:='actor:'||(effect->>'actorId');
   when 'fact.observe' then
    perform rpg_private.fields(effect,array['kind','family','recordId']);
    perform rpg_private.assert(effect->>'family' in ('entities','locations','quests'));
    cap:='world.observe:'||(effect->>'family')||':'||(effect->>'recordId'); effect_key:='fact:'||(effect->>'family')||':'||(effect->>'recordId');
   when 'quest.complete' then
    perform rpg_private.fields(effect,array['kind','questId']);
    cap:='world.complete:'||(effect->>'questId'); effect_key:='quest:'||(effect->>'questId');
   else raise exception 'rpg_validation';
  end case;
  perform rpg_private.assert(not effect_key=any(seen)); seen:=array_append(seen,effect_key);
  if effect ? 'actorId' then
   select value into target from jsonb_array_elements(actors) where value->>'id'=effect->>'actorId' and value->>'campaignId'=cid::text;
   perform rpg_private.assert(target is not null);
   if mode='resolver' then perform rpg_private.assert(not protected_ids ? coalesce(target->>'entityId',target->>'id') and decisions ? (target->>'id'));
   elsif kind<>'actor.relocate' then perform rpg_private.assert(target->'id'=decisions->0); end if;
  end if;
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(actors) a where decisions ? (a->>'id') and a->'capabilities' ? cap
    and caps ? case mode when 'action' then cap else (a->>'id')||':'||cap end
    and (mode='action' or target is null or kind='actor.relocate' or a->>'id'=target->>'id')));
  if kind='actor.relocate' then
   perform rpg_private.assert(not protected_ids ? coalesce(target->>'entityId',target->>'id') and effect->'fromLocationId'<>effect->'toLocationId'
    and target->'locationId'=effect->'fromLocationId' and elapsed>0);
   select to_jsonb(l) into destination from jsonb_populate_recordset(null::public.rpg_locations,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_locations')) l where campaign_id=cid and id=(effect->>'toLocationId')::uuid and status in ('known','visited');
   perform rpg_private.assert(destination is not null and exists(select 1 from jsonb_populate_recordset(null::public.rpg_locations,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_locations')) where campaign_id=cid and id=(effect->>'fromLocationId')::uuid));
   if mode='action' then perform rpg_private.assert(target->>'publicName' is not null and target->>'locationId'=current_location::text and act in ('attempt','speak','move')); end if;
   family:='world.actors';rid:=target->>'id';rev:=(target->>'revision')::integer;
   before_value:=jsonb_build_object('locationId',target->'locationId','revision',rev); after_value:=jsonb_build_object('locationId',effect->'toLocationId','revision',rev+1);
   select ordinality::integer-1 into idx from jsonb_array_elements(actors) with ordinality where value->>'id'=rid;
   actors:=jsonb_set(actors,array[idx::text],target||after_value);
   line:=case when russian then (target->>'publicName')||' прибывает: '||(destination->>'name')||'.' else (target->>'publicName')||' reaches '||(destination->>'name')||'.' end;
  elsif kind='inventory.consume' then
   select to_jsonb(i) into item from jsonb_populate_recordset(null::public.rpg_items,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_items')) i where campaign_id=cid and id=(effect->>'itemId')::uuid;
   amount:=(effect->>'quantity')::integer;
   perform rpg_private.assert(target->>'entityId' is not null and item->>'owner_entity_id'=target->>'entityId'
    and exists(select 1 from jsonb_populate_recordset(null::public.rpg_storages,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_storages')) where campaign_id=cid and id=(item->>'storage_id')::uuid and entity_id=(target->>'entityId')::uuid)
    and item->'equipped_entity_id'='null' and item->'equipped_slot'='null' and (item->>'quantity')::integer>=amount
    and (mode='resolver' or act in ('attempt','move','wait')));
   family:='items';rid:=item->>'id';rev:=(item->>'revision')::integer;field:='quantity';
   before_value:=jsonb_build_object('quantity',item->'quantity');after_value:=jsonb_build_object('quantity',(item->>'quantity')::integer-amount);
   line:=case when russian then (item->>'name')||': израсходовано '||amount||'.' else (item->>'name')||': '||amount||' consumed.' end;
  elsif kind in ('resource.spend','condition.add','condition.remove') then
   select to_jsonb(e) into entity from jsonb_populate_recordset(null::public.rpg_entities,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_entities')) e where campaign_id=cid and id=(target->>'entityId')::uuid;
   perform rpg_private.assert(entity is not null);
   family:='entities';rid:=entity->>'id';rev:=(entity->>'revision')::integer;
   field:=case when kind='resource.spend' then 'resources' else 'conditions' end;
   select value into oldentry from jsonb_array_elements(auth) where value->>'family'=family and value->>'id'=rid and value->'after' ? field;
   before_value:=jsonb_build_object(field,entity->field);after_value:=coalesce(oldentry->'after',before_value);
   if kind='resource.spend' then
    resource:=effect->>'resource';amount:=(effect->>'amount')::integer;
    perform rpg_private.assert(entity->'resources' ? resource and jsonb_typeof(entity->'resources'->resource)='number' and entity->'resources'->>resource ~ '^[0-9]{1,7}$'
     and (entity->'resources'->>resource)::bigint>=amount and (mode='resolver' or act in ('attempt','move','speak')));
    after_value:=jsonb_set(after_value,array['resources',resource],to_jsonb((entity->'resources'->>resource)::bigint-amount));
    line:=case when russian then (entity->>'name')||': потрачено '||amount||' ('||resource||').' else (entity->>'name')||': '||amount||' '||resource||' spent.' end;
   else
    perform rpg_private.assert((entity->'conditions' ? (effect->>'condition'))=(kind='condition.remove') and (mode='resolver' or act in ('attempt','move','wait')));
    if kind='condition.add' then after_value:=jsonb_set(after_value,'{conditions}',(after_value->'conditions')||jsonb_build_array(effect->>'condition'));
    else after_value:=jsonb_set(after_value,'{conditions}',coalesce((select jsonb_agg(value order by ordinality) from jsonb_array_elements(after_value->'conditions') with ordinality where value<>effect->'condition'),'[]')); end if;
    perform rpg_private.assert(jsonb_array_length(after_value->'conditions')<=50);
    line:=case when russian then (entity->>'name')||': '||(effect->>'condition')||' — '||case kind when 'condition.add' then 'добавлено.' else 'снято.' end
     else (entity->>'name')||': '||(effect->>'condition')||' '||case kind when 'condition.add' then 'added.' else 'removed.' end end;
   end if;
  elsif kind='quest.complete' then
   select to_jsonb(q) into quest from jsonb_populate_recordset(null::public.rpg_quests,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_quests')) q where campaign_id=cid and id=(effect->>'questId')::uuid;
   perform rpg_private.assert(mode='action' and act='attempt' and quest->>'status'='open');
   family:='quests';rid:=quest->>'id';rev:=(quest->>'revision')::integer;field:='status';before_value:=jsonb_build_object('status','open');after_value:=jsonb_build_object('status','complete');
   line:=case when russian then 'Цель достигнута: '||(quest->>'title')||'.' else 'Objective completed: '||(quest->>'title')||'.' end;
  else
   perform rpg_private.assert(mode='resolver' or act in ('observe','attempt','speak'));
   case effect->>'family'
    when 'locations' then
     select description into fact from jsonb_populate_recordset(null::public.rpg_locations,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_locations')) where campaign_id=cid and id=(effect->>'recordId')::uuid;
     perform rpg_private.assert(case mode when 'action' then effect->>'recordId'=current_location::text else exists(select 1 from jsonb_array_elements(actors) a where decisions ? (a->>'id') and a->'locationId'=effect->'recordId') end);
    when 'entities' then
     select details into fact from jsonb_populate_recordset(null::public.rpg_entities,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_entities')) where campaign_id=cid and id=(effect->>'recordId')::uuid;
     select value into holder from jsonb_array_elements(actors) where value->'entityId'=effect->'recordId' and value->>'publicName' is not null;
     perform rpg_private.assert(holder->>'locationId' is not null and case mode when 'action' then holder->>'locationId'=current_location::text else exists(select 1 from jsonb_array_elements(actors) a where decisions ? (a->>'id') and a->'locationId'=holder->'locationId') end);
    when 'quests' then select description into fact from jsonb_populate_recordset(null::public.rpg_quests,rpg_private.wave3_consequence_rows(cid,detached_manifest,'public.rpg_quests')) where campaign_id=cid and id=(effect->>'recordId')::uuid and status<>'archived';
   end case;
   perform rpg_private.assert(length(btrim(fact)) between 1 and 4000);
   facts:=facts||jsonb_build_array(jsonb_build_object('family',effect->'family','recordId',effect->'recordId','text',fact));line:=fact;
  end if;
  if family is not null then
   row_index:=null;
   if field is not null then select ordinality::integer-1 into row_index from jsonb_array_elements(auth) with ordinality where value->>'family'=family and value->>'id'=rid and value->'after' ? field; end if;
   if row_index is null then auth:=auth||jsonb_build_array(jsonb_build_object('family',family,'id',rid,'expectedRevision',rev,'before',before_value,'after',after_value));
   else auth:=jsonb_set(auth,array[row_index::text,'after'],after_value); end if;
  end if;
  if mode='action' and line is not null then texts:=texts||jsonb_build_array(line); end if;
 end loop;
 for oldentry in select value from jsonb_array_elements(auth) where value->>'family'<>'world.actors' loop
  select ordinality::integer-1 into idx from jsonb_array_elements(changes) with ordinality where value->'family'=oldentry->'family' and value->'id'=oldentry->'id';
  if idx is null then changes:=changes||jsonb_build_array(jsonb_build_object('family',oldentry->'family','id',oldentry->'id','expectedRevision',oldentry->'expectedRevision','values',oldentry->'after'));
  else changes:=jsonb_set(changes,array[idx::text,'values'],(changes->idx->'values')||(oldentry->'after')); end if;
 end loop;
 return jsonb_build_object('authority',auth,'facts',facts,'publicTexts',texts,'actors',actors,'changes',changes);
end $$;

-- Existing live API is unchanged and delegates to the same validator.
create or replace function rpg_private.wave3_consequences(cid uuid,w jsonb,effects jsonb,mode text,decisions jsonb,caps jsonb,act text,elapsed bigint)
returns jsonb language sql stable set search_path='' as $$
 select rpg_private.wave3_consequences(cid,w,effects,mode,decisions,caps,act,elapsed,null::uuid)
$$;

-- D2A additions continue below; all calls are service-role only.

-- The existing immutable Scenario stores composition provenance. Its basis is
-- resolved afresh before approval/preparation; no live Pack binding is changed.
create function rpg_private.lab_composition_valid(uid uuid,cid uuid,mid uuid,body jsonb) returns void
language plpgsql stable set search_path='' as $$
declare meta jsonb:=body->'composition'; basis jsonb:=meta->'basis'; ctx jsonb; packs jsonb; sources jsonb; question record; begin
 perform rpg_private.fields(meta,array['schemaVersion','phase','operationId','premise','language','basis','composeProfile','simulationProfile','choices','originalProposal','review','ownerEdit','usage']);
 perform rpg_private.fields(basis,array['ownerId','campaignId','saveId','baseManifestId','baseTimelineId','canonGeneration','basisDigest','sourceHeads','documents','packVersionIds','sourceVersionIds','startWorldMinutes']);
 perform rpg_private.assert(meta->>'schemaVersion'='1' and meta->>'phase' in ('requested','review','approved') and meta->>'language' in ('en','ru') and (meta->>'operationId')::uuid is not null and length(btrim(meta->>'premise')) between 1 and 6000);
 perform rpg_private.assert(basis->>'ownerId'=uid::text and basis->>'campaignId'=cid::text and basis->>'baseManifestId'=mid::text);
 ctx:=rpg_private.lab_composition_base(uid,cid,(basis->>'saveId')::uuid);
 perform rpg_private.assert(ctx#>>'{state,manifest,id}'=mid::text and ctx#>'{state,manifest,timelineId}'=basis->'baseTimelineId' and ctx#>'{state,canonGeneration}'=basis->'canonGeneration'
  and ctx->'basisDigest'=basis->'basisDigest' and ctx->'sourceHeads'=basis->'sourceHeads' and ctx->'documents'=basis->'documents' and ctx#>'{base,worldMinutes}'=basis->'startWorldMinutes');
 select coalesce(jsonb_agg(v->'versionId' order by v->>'versionId'),'[]') into packs from jsonb_array_elements(ctx#>'{state,libraryRecords}') v where v->>'kind'='pack';
 select coalesce(jsonb_agg(v->'versionId' order by v->>'versionId'),'[]') into sources from jsonb_array_elements(ctx#>'{state,libraryRecords}') v where v->>'kind'='source';
 perform rpg_private.assert(basis->'packVersionIds'=packs and basis->'sourceVersionIds'=sources and body->'packVersionIds'=packs and body->'sourceVersionIds'=sources and body->'sourcePriority'=sources);
 perform rpg_private.assert(body#>'{entry,worldMinutes}'=basis->'startWorldMinutes' and body#>'{entry,evidence}'='[]'::jsonb and body->>'adaptation'='original' and body->'identities'='[]'::jsonb and body->'carriedClaimIds'='[]'::jsonb and body->'localHistory'='null'::jsonb and body->'unresolvedConflictIds'='[]'::jsonb);
 perform rpg_private.lab_execution_profile(meta->'composeProfile','world.compose');
 perform rpg_private.lab_execution_profile(meta->'simulationProfile','world.resolve');
 perform rpg_private.assert(meta#>'{composeProfile,policyRevision}'=meta#>'{simulationProfile,policyRevision}');
 if meta->>'phase'='requested' then
  perform rpg_private.assert(meta->'originalProposal'='null'::jsonb and meta->'review'='null'::jsonb and meta->'ownerEdit'='null'::jsonb and meta->'usage'='null'::jsonb);
 else
  perform rpg_private.assert(jsonb_typeof(meta->'originalProposal')='object' and jsonb_typeof(meta->'review')='object' and jsonb_typeof(meta->'usage')='object');
  perform rpg_private.assert(body->'title'=meta#>'{review,title}' and jsonb_array_length(meta#>'{review,ambiguityAnswers}')=jsonb_array_length(meta#>'{originalProposal,ambiguities}'));
 end if;
 perform rpg_private.assert((body->>'status'='approved')=(meta->>'phase'='approved') and (body->'approval'<>'null'::jsonb)=(meta->>'phase'='approved'));
 if meta->>'phase'='approved' then
  perform rpg_private.assert(body#>>'{approval,ownerId}'=uid::text and meta#>>'{review,divergenceType}' in ('circumstance','actor_intent','resource')
   and (meta#>>'{review,offsetMinutes}')::integer>=0 and (meta#>>'{review,offsetMinutes}')::integer<(meta#>>'{review,horizonMinutes}')::integer
   and (meta#>>'{review,horizonMinutes}')::integer between 1 and 43200 and meta#>'{review,policy}'=(rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0)#>'{world,policy}');
  for question in select value,n from jsonb_array_elements(meta#>'{originalProposal,ambiguities}') with ordinality q(value,n) loop
   perform rpg_private.assert(question.value->>'consequential'<>'true' or length(btrim(meta#>>array['review','ambiguityAnswers',(question.n-1)::text]))>0);
  end loop;
 end if;
end $$;

create function rpg_private.lab_composition_history() returns trigger language plpgsql set search_path='' as $$
declare previous jsonb; a jsonb:=new.body->'composition'; b jsonb; begin
 if new.kind<>'scenario' or not new.body ? 'composition' then return new; end if;
 perform rpg_private.lab_composition_valid(new.owner_id,(a#>>'{basis,campaignId}')::uuid,(a#>>'{basis,baseManifestId}')::uuid,new.body);
 if new.previous_version_id is null then perform rpg_private.assert(a->>'phase'='requested'); return new; end if;
 select body into strict previous from rpg_private.library_records where owner_id=new.owner_id and version_id=new.previous_version_id and id=new.id and kind='scenario';
 b:=previous->'composition'; perform rpg_private.assert(b is not null);
 perform rpg_private.assert(a->'basis'=b->'basis' and a->'choices'=b->'choices' and a->'premise'=b->'premise' and a->'language'=b->'language');
 if a->>'phase'='requested' then perform rpg_private.assert(b->>'phase'='requested');
 elsif b->>'phase'='requested' then perform rpg_private.assert(a->>'phase'='review' and a->'composeProfile'=b->'composeProfile' and a->'simulationProfile'=b->'simulationProfile' and a->'ownerEdit'='null'::jsonb);
 else
  perform rpg_private.assert(a->'originalProposal'=b->'originalProposal' and a->'usage'=b->'usage' and a->'composeProfile'=b->'composeProfile' and a->'operationId'=b->'operationId');
  if a->>'phase'='approved' then perform rpg_private.assert(b->>'phase'='review' and (a-'phase')=(b-'phase'));
  else perform rpg_private.assert(a#>>'{ownerEdit,ownerId}'=new.owner_id::text and a#>>'{ownerEdit,fromVersionId}'=new.previous_version_id::text); end if;
 end if;
 return new;
end $$;
create trigger library_d2a_composition before insert on rpg_private.library_records for each row execute function rpg_private.lab_composition_history();

alter table rpg_private.world_lab_commands drop constraint world_lab_commands_stage_check;
alter table rpg_private.world_lab_commands add constraint world_lab_commands_stage_check check(stage in ('prepare','claim','commit','pause','cancel','resume','model_request','model_result'));

-- The run's existing operation ledger records request and result before settlement.
-- A receipt authorizes no new callback; every first write checks its exact lease.
create function rpg_private.lab_model_operation(uid uuid,cid uuid,action text,p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare r rpg_private.world_lab_runs%rowtype; receipt rpg_private.world_lab_commands%rowtype; request_row rpg_private.world_lab_commands%rowtype; claim rpg_private.world_lab_commands%rowtype; op uuid:=(p->>'operationId')::uuid; result jsonb; usage jsonb; actual text; begin
 perform rpg_private.assert(action in ('model_read','model_request','model_result') and op is not null);
 if action='model_read' then
  perform rpg_private.fields(p,array['operationId','runId']);
  select * into r from rpg_private.world_lab_runs where owner_id=uid and campaign_id=cid and id=(p->>'runId')::uuid;
  if not found then raise exception 'rpg_not_found'; end if;
  select * into request_row from rpg_private.world_lab_commands where operation_id=op and stage='model_request';
  if not found then return 'null'::jsonb; end if;
  perform rpg_private.assert(request_row.owner_id=uid and request_row.campaign_id=cid and request_row.run_id=r.id);
  return jsonb_build_object('request',request_row.request,'result',(select c.result from rpg_private.world_lab_commands c where c.operation_id=op and c.stage='model_result' and c.run_id=r.id));
 end if;
 if action='model_request' then perform rpg_private.fields(p,array['operationId','fence','profile','contractVersion','contextDigest']);
 else perform rpg_private.fields(p,array['operationId','fence','result']); end if;
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into receipt from rpg_private.world_lab_commands where operation_id=op and stage=action;
 if found then
  if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>p then raise exception 'rpg_conflict'; end if;
  return receipt.result;
 end if;
 perform 1 from rpg_private.owner_registry where user_id=uid for share;
 perform 1 from rpg_private.timeline_campaigns where campaign_id=cid for share;
 select * into r from rpg_private.world_lab_runs where owner_id=uid and campaign_id=cid and id=(p#>>'{fence,runId}')::uuid for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if r.status<>'running' or rpg_private.lab_fence(r)<>p->'fence' or not rpg_private.lab_fresh(r) then raise exception 'rpg_conflict'; end if;
 perform rpg_private.assert(r.input_bundle#>>'{resolutionPolicy,id}'='single-model-world-v1');
 select * into claim from rpg_private.world_lab_commands where operation_id=op and stage='claim';
 perform rpg_private.assert(claim.owner_id=uid and claim.campaign_id=cid and claim.run_id=r.id and claim.result->'inputDigest'=to_jsonb(r.input_digest) and claim.result->'leaseGeneration'=to_jsonb(r.lease_generation) and claim.result->'headManifestId'=to_jsonb(r.head_manifest_id));
 perform rpg_private.assert(not exists(select 1 from rpg_private.world_lab_commands where operation_id=op and (owner_id<>uid or campaign_id<>cid or run_id<>r.id or stage not in ('claim','model_request','model_result'))));
 if action='model_request' then
  perform rpg_private.lab_execution_profile(p->'profile','world.resolve');
  perform rpg_private.assert(p->'profile'=r.input_bundle->'executionProfile' and p->>'contractVersion'='world-resolver-simulation-v2' and p->>'contextDigest' ~ '^[0-9a-f]{64}$');
  result:=p;
 else
  select * into request_row from rpg_private.world_lab_commands where operation_id=op and stage='model_request' and run_id=r.id;
  perform rpg_private.assert(request_row.request->'fence'=p->'fence');
  result:=p->'result'; perform rpg_private.fields(result,array['proposal','usage','error']);
  perform rpg_private.assert((result->'error'='null'::jsonb and jsonb_typeof(result->'proposal')='object' and jsonb_typeof(result->'usage')='object') or (result->>'error' in ('unavailable','unsupported') and result->'proposal'='null'::jsonb and result->'usage'='null'::jsonb));
  if result->'error'='null'::jsonb then
   usage:=result->'usage'; perform rpg_private.fields(usage,array['model','inputTokens','outputTokens','calls','latencyMs']);
   actual:=usage->>'model'; perform rpg_private.assert(actual=r.input_bundle#>>'{executionProfile,modelId}' or (left(actual,length(r.input_bundle#>>'{executionProfile,modelId}'))=r.input_bundle#>>'{executionProfile,modelId}' and substr(actual,length(r.input_bundle#>>'{executionProfile,modelId}')+1) ~ '^-[0-9]{4}-[0-9]{2}-[0-9]{2}$'));
   perform rpg_private.assert(usage->>'calls'='1' and not exists(select 1 from jsonb_each(usage-'model') x where jsonb_typeof(x.value)<>'number' or (x.value#>>'{}')::numeric<>trunc((x.value#>>'{}')::numeric) or (x.value#>>'{}')::numeric<0 or (x.value#>>'{}')::numeric>2147483646));
  end if;
 end if;
 insert into rpg_private.world_lab_commands(operation_id,stage,owner_id,campaign_id,run_id,request,result) values(op,action,uid,cid,r.id,p,result);
 return result;
end $$;

create or replace function rpg_private.lab_dependencies(uid uuid,cid uuid,mid uuid,scid uuid,dvid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare sc jsonb:=rpg_private.library_ref(uid,scid::text,'scenario'); dv jsonb:=rpg_private.library_ref(uid,dvid::text,'divergence'); f jsonb; s jsonb; p jsonb; i jsonb; sources jsonb:='[]'; result jsonb; minute integer; begin
 perform rpg_private.lab_validate_manifest(cid,mid);
 f:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0;
 minute:=(rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0->>'world_minutes')::integer;
 perform rpg_private.fields(sc->'body',array['schemaVersion','title','status','packVersionIds','sourceVersionIds','sourcePriority','entry','adaptation','identities','assumptions','carriedClaimIds','localHistory','unresolvedConflictIds','approval'],case when sc->'body' ? 'composition' then array['composition'] else '{}'::text[] end);
 if sc->'body' ? 'composition' then perform rpg_private.lab_composition_valid(uid,cid,mid,sc->'body'); end if;
 perform rpg_private.fields(dv->'body',array['schemaVersion','scenarioVersionId','title','changes','approval']);
 perform rpg_private.fields(sc#>'{body,approval}',array['ownerId','reviewedConflictIds','reviewedUnknownIds']);
 perform rpg_private.fields(dv#>'{body,approval}',array['ownerId','reviewedConflictIds','reviewedUnknownIds']);
 perform rpg_private.uuid_array(dv#>'{body,approval,reviewedConflictIds}'); perform rpg_private.uuid_array(dv#>'{body,approval,reviewedUnknownIds}');
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,title}')='string' and length(btrim(sc#>>'{body,title}')) between 1 and 240 and jsonb_typeof(dv#>'{body,title}')='string' and length(btrim(dv#>>'{body,title}')) between 1 and 240);
 perform rpg_private.fields(sc#>'{body,entry}',array['label','worldMinutes','evidence']);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,entry,label}')='string' and length(btrim(sc#>>'{body,entry,label}')) between 1 and 1000);
 perform rpg_private.assert(sc#>>'{body,schemaVersion}'='1' and sc#>>'{body,status}'='approved' and sc#>>'{body,approval,ownerId}'=uid::text and dv#>>'{body,schemaVersion}'='1' and dv#>>'{body,scenarioVersionId}'=scid::text and dv#>>'{body,approval,ownerId}'=uid::text);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,entry,worldMinutes}')='number' and (sc#>>'{body,entry,worldMinutes}')::integer between 0 and minute);
 perform rpg_private.assert(sc#>>'{body,adaptation}' in ('original','literal_crossover','native_adaptation'));
 perform rpg_private.uuid_array(sc#>'{body,carriedClaimIds}',1000);
 perform rpg_private.assert(sc#>'{body,localHistory}'='null'::jsonb or (jsonb_typeof(sc#>'{body,localHistory}')='string' and length(btrim(sc#>>'{body,localHistory}')) between 1 and 8000));
 perform rpg_private.assert(sc#>>'{body,adaptation}'='literal_crossover' or sc#>'{body,carriedClaimIds}'='[]'::jsonb);
 perform rpg_private.assert(sc#>>'{body,adaptation}'<>'native_adaptation' or sc#>'{body,localHistory}'<>'null'::jsonb);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,identities}')='array' and jsonb_array_length(sc#>'{body,identities}')<=500);
 for i in select value from jsonb_array_elements(sc#>'{body,identities}') loop
  perform rpg_private.fields(i,array['packVersionId','packEntityId','scenarioEntityId']);
  perform rpg_private.assert((i->>'scenarioEntityId')::uuid is not null and (sc#>'{body,packVersionIds}') ? (i->>'packVersionId'));
  p:=rpg_private.library_ref(uid,i->>'packVersionId','pack');
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(p#>'{body,entities}') e where e->'id'=i->'packEntityId'));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'scenarioEntityId') and count(*)=count(distinct (value->>'packVersionId')||':'||(value->>'packEntityId')) from jsonb_array_elements(sc#>'{body,identities}')));
 perform rpg_private.uuid_array(sc#>'{body,packVersionIds}');
 perform rpg_private.source_set(uid,sc#>'{body,sourceVersionIds}',sc#>'{body,sourcePriority}');
 perform rpg_private.uuid_array(sc#>'{body,unresolvedConflictIds}');
 perform rpg_private.assert(sc#>'{body,unresolvedConflictIds}'='[]'::jsonb and sc#>'{body,approval,reviewedConflictIds}'='[]'::jsonb and sc#>'{body,approval,reviewedUnknownIds}'='[]'::jsonb);
 perform rpg_private.assert(jsonb_typeof(sc#>'{body,assumptions}')='array' and jsonb_typeof(dv#>'{body,changes}')='array' and jsonb_array_length(dv#>'{body,changes}') between 1 and 200);
 perform rpg_private.assert(jsonb_array_length(sc#>'{body,assumptions}')<=200 and (select count(*)=count(distinct value->>'id') from jsonb_array_elements(sc#>'{body,assumptions}')) and (select count(*)=count(distinct value->>'id') from jsonb_array_elements(dv#>'{body,changes}')));
 for i in select value from jsonb_array_elements((sc#>'{body,assumptions}')||(dv#>'{body,changes}')) loop
  perform rpg_private.fields(i,array['id','text','visibility']); perform rpg_private.assert((i->>'id')::uuid is not null and jsonb_typeof(i->'text')='string' and length(btrim(i->>'text')) between 1 and 4000 and i->>'visibility' in ('public','private'));
 end loop;
 result:=jsonb_build_array(sc,dv);
 for i in select value from jsonb_array_elements(sc#>'{body,packVersionIds}') loop
  p:=rpg_private.library_ref(uid,i#>>'{}','pack'); perform rpg_private.assert(p#>>'{body,status}'='approved' and p#>>'{body,approval,ownerId}'=uid::text);
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(coalesce(f->'bindings','[]')) b where b->>'ownerId'=uid::text and b->>'campaignId'=cid::text and ((b->>'scenarioVersionId'=scid::text and b->'sourceVersionIds'=sc#>'{body,sourceVersionIds}') or (sc->'body' ? 'composition' and b->'packVersionId'=i))));
  sources:=sources||(p#>'{body,sourceVersionIds}'); result:=result||jsonb_build_array(p);
 end loop;
 perform rpg_private.assert(sources @> (sc#>'{body,sourceVersionIds}') and (sc#>'{body,sourceVersionIds}') @> sources);
 for i in select value from jsonb_array_elements(sc#>'{body,sourceVersionIds}') loop s:=rpg_private.library_ref(uid,i#>>'{}','source'); result:=result||jsonb_build_array(s); end loop;
 perform rpg_private.library_evidence(uid,sc#>'{body,entry,evidence}',sc#>'{body,sourceVersionIds}');
 perform rpg_private.assert(jsonb_array_length(sc#>'{body,packVersionIds}')>0 or jsonb_array_length(sc#>'{body,assumptions}')>0 or sc#>>'{body,composition,phase}'='approved');
 -- Every saved binding participates, even if another Scenario was selected.
 for i in select value from jsonb_array_elements(coalesce(f->'bindings','[]')) loop
  perform rpg_private.assert(i->>'ownerId'=uid::text and i->>'campaignId'=cid::text);
  p:=rpg_private.library_ref(uid,i->>'packVersionId','pack');
  perform rpg_private.assert(p->>'id'=i->>'packId' and p#>>'{body,status}'='approved' and p#>>'{body,approval,ownerId}'=uid::text);
  result:=result||jsonb_build_array(p);
  if i->>'scenarioVersionId' is null then perform rpg_private.assert(i->'sourceVersionIds'=p#>'{body,sourceVersionIds}'); end if;
  if i->>'scenarioVersionId' is not null then
   p:=rpg_private.library_ref(uid,i->>'scenarioVersionId','scenario');
   perform rpg_private.assert(p#>>'{body,status}'='approved' and p#>'{body,entry}'=i->'entry' and p#>'{body,sourcePriority}'=i->'sourcePriority');
   result:=result||jsonb_build_array(p);
   for s in select value from jsonb_array_elements(p#>'{body,packVersionIds}') loop result:=result||jsonb_build_array(rpg_private.library_ref(uid,s#>>'{}','pack')); end loop;
  end if;
  for s in select value from jsonb_array_elements(i->'sourceVersionIds') loop result:=result||jsonb_build_array(rpg_private.library_ref(uid,s#>>'{}','source')); end loop;
 end loop;
 select coalesce(jsonb_agg(value order by value->>'versionId'),'[]') into result from (select distinct value from jsonb_array_elements(result)) x;
 for p in select value from jsonb_array_elements(result) where value->>'kind'='pack' loop
  perform rpg_private.assert(p#>>'{body,status}'='approved' and p#>>'{body,approval,ownerId}'=uid::text and jsonb_typeof(p#>'{body,contradictions}')='array');
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(p#>'{body,contradictions}') contradiction where contradiction->>'status' is distinct from 'resolved'));
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(p#>'{body,sourceVersionIds}') pin where not exists(select 1 from jsonb_array_elements(result) source_record where source_record->>'kind'='source' and source_record->>'versionId'=pin.value)));
 end loop;
 return result;
end $$;

create or replace function rpg_private.lab_input(uid uuid,cid uuid,req jsonb,context jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare mid uuid:=(context#>>'{state,manifest,id}')::uuid; f jsonb; guide jsonb; start_minute integer; horizon integer; packs jsonb; sources jsonb; composition jsonb; result jsonb; begin
 perform rpg_private.fields(req,array['operationId','campaignId','saveId','scenarioVersionId','divergenceVersionId','label','horizonMinutes']);
 perform rpg_private.assert(req->>'campaignId'=cid::text and (req->>'operationId')::uuid is not null and jsonb_typeof(req->'label')='string' and length(btrim(req->>'label')) between 1 and 160 and btrim(req->>'label')=req->>'label');
 perform rpg_private.assert(jsonb_typeof(req->'horizonMinutes')='number' and (req->>'horizonMinutes')::numeric=trunc((req->>'horizonMinutes')::numeric));
 horizon:=(req->>'horizonMinutes')::integer; perform rpg_private.assert(horizon between 1 and 43200);
 f:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0; guide:=rpg_private.lab_rows(cid,mid,'public.rpg_documents')->0;
 start_minute:=(rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0->>'world_minutes')::integer;
 perform rpg_private.assert(start_minute between 0 and 2147483646-horizon);
 select coalesce(jsonb_agg(value->'versionId' order by value->>'versionId'),'[]') into packs from jsonb_array_elements(context#>'{state,libraryRecords}') where value->>'kind'='pack';
 select coalesce(jsonb_agg(value->'versionId' order by value->>'versionId'),'[]') into sources from jsonb_array_elements(context#>'{state,libraryRecords}') where value->>'kind'='source';
 select value#>'{body,composition}' into composition from jsonb_array_elements(context#>'{state,libraryRecords}') where value->'versionId'=req->'scenarioVersionId';
 if composition is not null then perform rpg_private.assert(composition#>'{basis,saveId}'=req->'saveId' and composition#>'{review,horizonMinutes}'=req->'horizonMinutes'); end if;
 result:=jsonb_build_object('schemaVersion',1,'purpose','simulation','nonCanon',true,'ownerId',uid,'campaignId',cid,
 'base',jsonb_build_object('saveId',req->'saveId','timelineId',context#>'{state,manifest,timelineId}','manifestId',mid,'schemaVersion',2),
 'scenarioVersionId',req->'scenarioVersionId','divergenceVersionId',req->'divergenceVersionId','packVersionIds',packs,'sourceVersionIds',sources,
 'documentVersions',context->'documents','sourceHeads',context->'sourceHeads','canonGeneration',context#>'{state,canonGeneration}','ruleset',f->'ruleset',
 'effectiveSettings',rpg_private.lab_rows(cid,mid,'public.rpg_settings')->0->'values',
 'effectiveGuidance',jsonb_build_object('documentId',guide->'id','versionId',guide->'current_version_id','sessionGuidance',rpg_private.lab_rows(cid,mid,'public.rpg_session_guidance')),
 'resolutionPolicy',jsonb_build_object('id','deterministic-world-v1','version',1,'maxSteps',32),'startWorldMinutes',start_minute,'throughWorldMinutes',start_minute+horizon);
 if composition is not null then result:=jsonb_set(result,'{resolutionPolicy,id}','"single-model-world-v1"')||jsonb_build_object('executionProfile',composition->'simulationProfile'); end if;
 return result;
end $$;

create or replace function rpg_private.lab_world_schedule(r rpg_private.world_lab_runs,op uuid,through_minute integer,trigger_kind text,simulation boolean) returns jsonb language plpgsql stable set search_path='' as $$
declare cid uuid:=r.campaign_id; mid uuid:=r.head_manifest_id; f jsonb:=rpg_private.lab_rows(cid,mid,'rpg_private.world_foundations')->0; rt jsonb:=rpg_private.lab_rows(cid,mid,'rpg_private.runtime_state')->0; oldw jsonb:=f->'world'; nextw jsonb:=oldw; events jsonb:='[]'; sources jsonb; protected jsonb; entities jsonb:=rpg_private.lab_rows(cid,mid,'public.rpg_entities'); current_location text:=rpg_private.lab_rows(cid,mid,'public.rpg_public_state')->0->>'current_location_id'; candidate record; th jsonb; st jsonb; ev jsonb; evidence jsonb; actor jsonb; hc jsonb; hidx integer; idx integer; at_minute integer; boundary integer:=r.current_world_minutes; seen_threads jsonb:='[]'; seen_actors jsonb:='[]'; max_threads integer; max_actors integer; private_id uuid; public_id uuid; begin
 perform rpg_private.assert(trigger_kind in ('time_skip','session_boundary','none') and through_minute between r.current_world_minutes and (r.input_bundle->>'throughWorldMinutes')::integer);
 perform rpg_private.assert(through_minute::bigint-r.current_world_minutes<=60);
 perform rpg_private.assert(trigger_kind not in ('session_boundary','none') or through_minute=r.current_world_minutes);
 if oldw is null or oldw='null'::jsonb or trigger_kind='none' or (trigger_kind<>'session_boundary' and through_minute=r.current_world_minutes) then return 'null'::jsonb; end if;
 perform rpg_private.assert((oldw->>'policyChangedAtWorldMinutes')::integer<=r.current_world_minutes);
 if not simulation then perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(oldw->'threads') t,jsonb_array_elements(t->'steps') with ordinality st(v,n) where n>(t->>'cursor')::integer and coalesce(st.v->'consequences','[]')<>'[]'::jsonb)); end if;
 select coalesce(jsonb_agg(distinct s.value order by s.value),'[]') into sources from jsonb_array_elements(f->'bindings') b,jsonb_array_elements(b->'sourceVersionIds') s;
 select coalesce(jsonb_agg(a->'id'),'[]') into protected from jsonb_array_elements(oldw->'actors') a where a->>'control'='player' or exists(select 1 from jsonb_array_elements(entities) e where e->>'kind'='player' and e->'id'=a->'entityId') or coalesce(rt#>'{configuration,controlledEntityIds}','[]') ? (a->>'entityId');
 max_threads:=case oldw#>>'{policy,autonomy}' when 'low' then 3 when 'moderate' then 8 when 'high' then 12 end;
 max_actors:=case oldw#>>'{policy,autonomy}' when 'low' then 8 when 'moderate' then 16 when 'high' then 24 end;
 perform rpg_private.assert(max_threads is not null);
 loop
  select x.th,x.st,x.idx,greatest(boundary,(x.st#>>'{trigger,atWorldMinutes}')::integer) as at into candidate from
   (select t.value th,t.value->'steps'->(t.value->>'cursor')::integer st,(t.n-1)::integer idx from jsonb_array_elements(nextw->'threads') with ordinality t(value,n) where t.value->>'status'='active') x
   where oldw#>>'{policy,simulation}'='true' and x.st#>>'{trigger,kind}' in ('autonomy','deadline') and (x.st#>>'{trigger,atWorldMinutes}')::integer<=through_minute
   and not exists(select 1 from jsonb_array_elements_text(x.th->'prerequisiteThreadIds') p where not exists(select 1 from jsonb_array_elements(nextw->'threads') done where done->>'id'=p.value and done->>'status'='resolved'))
   and ((x.st#>>'{trigger,kind}'='deadline' and (oldw#>>'{policy,deadlinePressure}'='normal' or (oldw#>>'{policy,deadlinePressure}'='critical_only' and x.st#>>'{trigger,scenarioCritical}'='true' and x.st#>>'{trigger,established}'='true')))
    or (x.st#>>'{trigger,kind}'='autonomy' and array_position(array['local','related','broad'],x.st#>>'{trigger,scope}')<=array_position(array['low','moderate','high'],oldw#>>'{policy,autonomy}')
     and (oldw#>>'{policy,deadlinePressure}'='normal' or ((x.th->>'cursor')::integer<jsonb_array_length(x.th->'steps')-1 and x.st->'hookChanges'='[]'::jsonb and x.st->>'consequence'='background'))
     and (x.st#>>'{trigger,scope}'<>'local' or x.th->'locationIds'='[]'::jsonb or x.th->'locationIds' ? current_location)))
   order by greatest(boundary,(x.st#>>'{trigger,atWorldMinutes}')::integer),x.th->>'id',x.st->>'id' limit 1;
  exit when not found;
  th:=candidate.th; st:=candidate.st; idx:=candidate.idx; at_minute:=candidate.at;
  if not seen_threads ? (th->>'id') then seen_threads:=seen_threads||jsonb_build_array(th->'id'); end if;
  select coalesce(jsonb_agg(distinct value),'[]') into seen_actors from jsonb_array_elements(seen_actors||(th->'actorIds'));
  perform rpg_private.assert(jsonb_array_length(seen_threads)<=max_threads and jsonb_array_length(seen_actors)<=max_actors and jsonb_array_length(events)+case when st->'publicOutcome'='null'::jsonb then 1 else 2 end<=8);
  perform rpg_private.assert((simulation or st->>'resolution'='deterministic') and not exists(select 1 from jsonb_array_elements_text(th->'decisionActorIds') a where protected ? a.value));
  perform rpg_private.library_evidence(r.owner_id,st->'evidence',sources);
  for evidence in select value from jsonb_array_elements(st->'evidence') loop
   perform rpg_private.assert(evidence->>'knowledge' not in ('source','future_source'));
   for actor in select value from jsonb_array_elements(oldw->'actors') a where th->'decisionActorIds' ? (a->>'id') loop perform rpg_private.assert(actor->'knowledge' @> jsonb_build_array(evidence)); end loop;
  end loop;
  if st->>'consequence'='surface_before_complete' then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(oldw->'warnings') w where w->'stepId'=st->'id' and (w->>'opportunityUntilWorldMinutes')::integer<=r.current_world_minutes and (w->>'atWorldMinutes')::integer<r.current_world_minutes and exists(select 1 from jsonb_array_elements_text(w->'recipientActorIds') a where protected ? a.value))); end if;
  boundary:=at_minute; private_id:=rpg_private.world_event_id(op,th->>'id',st->>'id','private'); public_id:=rpg_private.world_event_id(op,th->>'id',st->>'id','public');
  ev:=jsonb_build_object('schemaVersion',1,'id',private_id,'campaignId',cid,'originTimelineId',r.timeline_id,'operationId',op,'worldMinutes',at_minute,'kind','world.thread.advanced','actorIds',th->'actorIds','threadIds',jsonb_build_array(th->'id'),'visibility','private','text',st->'privateText','evidence',st->'evidence','payload',jsonb_build_object('schemaVersion',1,'stepId',st->'id','previousCursor',th->'cursor','nextCursor',(th->>'cursor')::integer+1,'hookChanges',st->'hookChanges'));
  events:=events||jsonb_build_array(ev);
  if st->'publicOutcome'<>'null'::jsonb then
   perform rpg_private.library_evidence(r.owner_id,st#>'{publicOutcome,evidence}',sources,true);
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(st#>'{publicOutcome,evidence}') e where e->>'knowledge'<>'character'));
   ev:=jsonb_build_object('schemaVersion',1,'id',public_id,'campaignId',cid,'originTimelineId',r.timeline_id,'operationId',op,'worldMinutes',at_minute,'kind','world.observed','actorIds',st#>'{publicOutcome,actorIds}','threadIds',case when th->>'publicTitle' is null then '[]'::jsonb else jsonb_build_array(th->'id') end,'visibility','public','text',st#>'{publicOutcome,text}','evidence',st#>'{publicOutcome,evidence}','payload','{}'::jsonb);
   events:=events||jsonb_build_array(ev);
   if st->'warning'<>'null'::jsonb then
    perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(nextw->'warnings') w where w->'stepId'=st#>'{warning,forStepId}'));
    nextw:=jsonb_set(nextw,'{warnings}',(nextw->'warnings')||jsonb_build_array(jsonb_build_object('stepId',st#>'{warning,forStepId}','eventId',public_id,'atWorldMinutes',at_minute,'opportunityUntilWorldMinutes',at_minute+(st#>>'{warning,opportunityMinutes}')::integer,'recipientActorIds',st#>'{warning,recipientActorIds}')));
   end if;
  end if;
  for hc in select value from jsonb_array_elements(st->'hookChanges') loop
   select (h.n-1)::integer into hidx from jsonb_array_elements(nextw->'hooks') with ordinality h(value,n) where h.value->'id'=hc->'hookId' and h.value->>'status' not in ('resolved','expired');
   perform rpg_private.assert(hidx is not null); nextw:=jsonb_set(nextw,array['hooks',hidx::text,'status'],hc->'status');
  end loop;
  th:=th||jsonb_build_object('cursor',(th->>'cursor')::integer+1,'revision',(th->>'revision')::integer+1,'status',case when (th->>'cursor')::integer+1=jsonb_array_length(th->'steps') then 'resolved' else 'active' end);
  nextw:=jsonb_set(nextw,array['threads',idx::text],th);
 end loop;
 if events='[]'::jsonb then return 'null'::jsonb; end if;
 return jsonb_build_object('operationId',op,'campaignId',cid,'timeline',jsonb_build_object('timelineId',r.timeline_id,'epoch',1),'expectedRevision',f->'revision','expectedRuntimeRevision',rt->'revision','expectedHeadId',mid,'schemaVersion',1,'status','staged','fromWorldMinutes',r.current_world_minutes,'throughWorldMinutes',through_minute,'sourceVersionIds',sources,'events',events,'nextWorld',nextw);
end $$;

create or replace function rpg_private.lab_world_step(r rpg_private.world_lab_runs,op uuid,through_minute integer,trigger_kind text) returns jsonb language sql stable set search_path='' as $$
 select rpg_private.lab_world_schedule(r,op,through_minute,trigger_kind,false)
$$;

create or replace function public.rpg_world_lab(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare uid uuid:=p_owner_id; cid uuid:=p_campaign_id; req jsonb; ctx jsonb; input jsonb; result jsonb; r rpg_private.world_lab_runs%rowtype; receipt rpg_private.world_lab_commands%rowtype; base rpg_private.timeline_manifests%rowtype; m rpg_private.timeline_manifests%rowtype; op uuid; rid uuid; tid uuid; mid uuid; status_value text; reason_value text; library jsonb; bases jsonb; scenarios jsonb; runs jsonb; begin
 if uid is null or not exists(select 1 from rpg_private.owner_registry where user_id=uid) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if not exists(select 1 from public.rpg_campaigns where id=cid) then raise exception 'rpg_not_found'; end if;
 perform rpg_private.assert(jsonb_typeof(p_payload)='object' and length(p_payload::text)<=2000000);
 if p_action='composition_base' then
  perform rpg_private.fields(p_payload,array['saveId']);
  return rpg_private.lab_composition_base(uid,cid,(p_payload->>'saveId')::uuid);
 elsif p_action='model_usage' then
  perform rpg_private.fields(p_payload,array['runId','throughRevision']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'throughRevision')='number' and p_payload->>'throughRevision' ~ '^[1-9][0-9]{0,9}$');
  perform rpg_private.assert(exists(select 1 from rpg_private.world_lab_runs where owner_id=uid and campaign_id=cid and id=(p_payload->>'runId')::uuid));
  return (select jsonb_build_object('recordedResponses',count(*) filter(where c.result->'usage'<>'null'::jsonb),
   'inputTokens',case when bool_or(c.result->'usage'='null'::jsonb) then null else coalesce(sum((c.result#>>'{usage,inputTokens}')::bigint),0) end,
   'outputTokens',case when bool_or(c.result->'usage'='null'::jsonb) then null else coalesce(sum((c.result#>>'{usage,outputTokens}')::bigint),0) end)
   from rpg_private.world_lab_commands c join rpg_private.world_lab_commands claimed on claimed.operation_id=c.operation_id and claimed.stage='claim'
   where c.owner_id=uid and c.campaign_id=cid and c.run_id=(p_payload->>'runId')::uuid and c.stage='model_result' and (claimed.result->>'revision')::integer<=(p_payload->>'throughRevision')::integer);
 elsif p_action in ('model_read','model_request','model_result') then
  return rpg_private.lab_model_operation(uid,cid,p_action,p_payload);
 elsif p_action='read_result' then
  perform rpg_private.fields(p_payload,array['action','request']);
  return rpg_private.lab_result_view(uid,cid,p_payload->>'action',p_payload->'request');
 elsif p_action='read' and p_payload ? 'operationId' then
  perform rpg_private.fields(p_payload,array['operationId','request']);
  if p_payload->'request' ? 'runId' then
   select * into receipt from rpg_private.world_lab_commands where operation_id=(p_payload->>'operationId')::uuid and stage='claim';
   if not found then return 'null'::jsonb; end if;
   if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>p_payload->'request' then raise exception 'rpg_conflict'; end if;
   return jsonb_build_object('claim',receipt.result,'commit',(select c.result from rpg_private.world_lab_commands c where c.operation_id=receipt.operation_id and c.stage='commit' and c.run_id=receipt.run_id and c.owner_id=uid and c.campaign_id=cid));
  end if;
  select * into receipt from rpg_private.world_lab_commands where operation_id=(p_payload->>'operationId')::uuid and stage='prepare';
  if not found then return 'null'::jsonb; end if;
  if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request->'request'<>p_payload->'request' then raise exception 'rpg_conflict'; end if;
  return receipt.result;
 elsif p_action='read_detached' then
  if p_payload ? 'saveId' then
   perform rpg_private.fields(p_payload,array['saveId','scenarioVersionId','divergenceVersionId']);
   return rpg_private.lab_preparation(uid,cid,(p_payload->>'saveId')::uuid,(p_payload->>'scenarioVersionId')::uuid,(p_payload->>'divergenceVersionId')::uuid);
  end if;
  perform rpg_private.fields(p_payload,array['runId'],array['manifestId']);
  select * into r from rpg_private.world_lab_runs where id=(p_payload->>'runId')::uuid and owner_id=uid and campaign_id=cid;
  if not found then raise exception 'rpg_not_found'; end if;
  r:=rpg_private.lab_refresh(r.id); mid:=coalesce((p_payload->>'manifestId')::uuid,r.head_manifest_id);
  return rpg_private.lab_read_state(uid,cid,mid,r.id,rpg_private.lab_run_library(r),r.input_bundle->'documentVersions');
 elsif p_action='read' then
  perform rpg_private.fields(p_payload,array['runId']);
  select * into r from rpg_private.world_lab_runs where id=(p_payload->>'runId')::uuid and owner_id=uid and campaign_id=cid;
  if not found then raise exception 'rpg_not_found'; end if;
  return rpg_private.lab_read_run(rpg_private.lab_refresh(r.id));
 elsif p_action='catalog' then
  perform rpg_private.fields(p_payload,'{}');
  select coalesce(jsonb_agg(jsonb_build_object('saveId',s.id,'timelineId',s.timeline_id,'label',s.name,'worldMinutes',(s.public_metadata->>'worldMinutes')::integer) order by s.created_at desc),'[]') into bases from
   (select s.* from rpg_private.save_points s join rpg_private.timeline_manifests m on m.campaign_id=s.campaign_id and m.id=s.manifest_id join rpg_private.timelines t on t.campaign_id=s.campaign_id and t.id=s.timeline_id where s.campaign_id=cid and t.purpose='playable' and m.schema_version=2 and m.lab_run_id is null and m.canon_generation=(select canon_generation from rpg_private.timeline_campaigns where campaign_id=cid) and m.public_metadata->'pendingAction'='false'::jsonb and rpg_private.lab_rows(cid,m.id,'rpg_private.world_foundations')->0->'world'<>'null'::jsonb order by s.created_at desc limit 100) s;
  select coalesce(jsonb_agg(jsonb_build_object('scenario',rpg_private.library_record_json(sc),'divergence',rpg_private.library_record_json(dv)) order by dv.created_at desc),'[]') into scenarios from rpg_private.library_records sc join rpg_private.library_records dv on dv.owner_id=sc.owner_id and dv.kind='divergence' and dv.body->>'scenarioVersionId'=sc.version_id::text where sc.owner_id=uid and sc.kind='scenario' and (not sc.body ? 'composition' or sc.body#>>'{composition,basis,campaignId}'=cid::text) and sc.body->>'status'='approved' and sc.body#>>'{approval,ownerId}'=uid::text and dv.body#>>'{approval,ownerId}'=uid::text;
  runs:='[]'; for rid in select id from rpg_private.world_lab_runs where campaign_id=cid and owner_id=uid order by created_at desc limit 100 loop runs:=runs||jsonb_build_array(rpg_private.lab_read_run(rpg_private.lab_refresh(rid))); end loop;
  return jsonb_build_object('campaignId',cid,'bases',bases,'scenarios',scenarios,'runs',runs);
 end if;
 perform rpg_private.assert(p_action in ('prepare','claim','pause','cancel','resume','commit'));
 req:=case when p_action='prepare' then p_payload->'request' else p_payload end;
 op:=(req->>'operationId')::uuid; perform rpg_private.assert(op is not null);
 -- Serialize only this operation. Different detached branches do not depend on
 -- the active campaign epoch; locking the source-generation row never edits it.
 perform pg_advisory_xact_lock(hashtextextended(op::text,0));
 select * into receipt from rpg_private.world_lab_commands where operation_id=op and stage=p_action;
 if found then
  if receipt.owner_id<>uid or receipt.campaign_id<>cid or receipt.request<>p_payload then raise exception 'rpg_conflict'; end if;
  return receipt.result;
 end if;
 perform rpg_private.assert(not exists(select 1 from rpg_private.world_lab_commands where operation_id=op and (owner_id<>uid or campaign_id<>cid or (stage not in ('claim','model_request','model_result','commit') or p_action not in ('claim','model_request','model_result','commit')))));
 -- Source append takes the owner-registry row FOR UPDATE. This shared lock
 -- fences even a source no longer bound in the currently active projection.
 perform 1 from rpg_private.owner_registry where user_id=uid for share;
 perform 1 from rpg_private.timeline_campaigns where campaign_id=cid for share;
 if p_action='prepare' then
  perform rpg_private.fields(p_payload,array['request','input','inputDigest']);
  ctx:=rpg_private.lab_preparation(uid,cid,(req->>'saveId')::uuid,(req->>'scenarioVersionId')::uuid,(req->>'divergenceVersionId')::uuid);
  input:=rpg_private.lab_input(uid,cid,req,ctx);
  perform rpg_private.assert(input=p_payload->'input' and rpg_private.lab_digest(input)=p_payload->>'inputDigest');
  select * into strict base from rpg_private.timeline_manifests where campaign_id=cid and id=(input#>>'{base,manifestId}')::uuid;
  rid:=gen_random_uuid(); tid:=gen_random_uuid(); mid:=gen_random_uuid();
  insert into rpg_private.timelines(id,campaign_id,label,parent_timeline_id,fork_save_id,purpose) values(tid,cid,req->>'label',base.timeline_id,(req->>'saveId')::uuid,'simulation');
  insert into rpg_private.world_lab_runs(id,campaign_id,owner_id,timeline_id,label,input_bundle,input_digest,status,head_manifest_id,last_checkpoint_id,current_world_minutes) values(rid,cid,uid,tid,req->>'label',input,p_payload->>'inputDigest','prepared',mid,mid,(input->>'startWorldMinutes')::integer) returning * into r;
  insert into rpg_private.timeline_manifests(id,campaign_id,timeline_id,refs,public_metadata,canon_generation,schema_version,lab_run_id) values(mid,cid,tid,base.refs,base.public_metadata||jsonb_build_object('labOrdinal',0),base.canon_generation,3,rid);
  update rpg_private.timelines set head_manifest_id=mid,head_public=base.public_metadata,head_revision=0 where campaign_id=cid and id=tid;
  result:=rpg_private.lab_run_json(r);
 elsif p_action='commit' then
  perform rpg_private.assert(not exists(select 1 from rpg_private.world_lab_commands where operation_id=op and stage='claim' and run_id::text is distinct from p_payload#>>'{fence,runId}'));
  result:=rpg_private.lab_commit(uid,cid,p_payload); rid:=(result#>>'{run,id}')::uuid;
 else
  perform rpg_private.fields(req,array['operationId','campaignId','runId','expectedRevision']);
  perform rpg_private.assert(req->>'campaignId'=cid::text);
  perform rpg_private.assert(jsonb_typeof(req->'expectedRevision')='number' and (req->>'expectedRevision')::numeric=trunc((req->>'expectedRevision')::numeric) and (req->>'expectedRevision')::numeric between 1 and 2147483646);
  select * into r from rpg_private.world_lab_runs where id=(req->>'runId')::uuid and campaign_id=cid and owner_id=uid for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if r.revision<>(req->>'expectedRevision')::integer or r.status in ('completed','cancelled') then raise exception 'rpg_conflict'; end if;
  if p_action in ('claim','resume') and not rpg_private.lab_fresh(r) then raise exception 'rpg_conflict'; end if;
  if p_action='claim' then perform rpg_private.assert(r.status in ('prepared','running')); status_value:='running';
  elsif p_action='resume' then perform rpg_private.assert(r.status in ('paused','failed','running') and r.step_count<32 and r.current_world_minutes<(r.input_bundle->>'throughWorldMinutes')::integer); status_value:='running';
  elsif p_action='pause' then perform rpg_private.assert(r.status in ('prepared','running')); status_value:='paused'; reason_value:='review_required';
  else status_value:='cancelled'; reason_value:='cancelled'; end if;
  update rpg_private.world_lab_runs set status=status_value,reason=reason_value,revision=revision+1,lease_generation=lease_generation+1,updated_at=now() where id=r.id returning * into r;
  rid:=r.id; result:=rpg_private.lab_run_json(r);
 end if;
 insert into rpg_private.world_lab_commands(operation_id,stage,owner_id,campaign_id,run_id,request,result) values(op,p_action,uid,cid,rid,p_payload,result);
 return result;
end $$;

-- Positive exact-record knowledge at the detached boundary. This is an extra
-- SQL gate; the existing Memory adapter still owns context admission/ranking.
create function rpg_private.lab_known_record(r rpg_private.world_lab_runs,family text,rid text,actors jsonb) returns boolean language plpgsql stable set search_path='' as $$
declare source_kind text; row jsonb; sources jsonb; restrictions jsonb; begin
 source_kind:=case family when 'entities' then 'entity' when 'locations' then 'location' when 'quests' then 'quest' end;
 if source_kind is null or jsonb_array_length(actors)=0 then return false; end if;
 select value into row from jsonb_array_elements(rpg_private.lab_rows(r.campaign_id,r.head_manifest_id,'public.rpg_'||family)) where value->>'id'=rid and value->>'status'<>'archived';
 if row is null then return false; end if;
 restrictions:=rpg_private.lab_rows(r.campaign_id,r.head_manifest_id,'rpg_private.memory_restrictions');
 if exists(select 1 from jsonb_array_elements(restrictions) x where x->>'kind'=source_kind and x->>'source_id'=rid) or exists(select 1 from rpg_private.timeline_global_restrictions where campaign_id=r.campaign_id and timeline_global_restrictions.kind=source_kind and source_id::text=rid) then return false; end if;
 sources:=rpg_private.lab_rows(r.campaign_id,r.head_manifest_id,'rpg_private.memory_public_sources')||rpg_private.lab_rows(r.campaign_id,r.head_manifest_id,'rpg_private.memory_private_sources');
 return exists(select 1 from jsonb_array_elements(sources) s where s->>'kind'=source_kind and s->>'source_id'=rid and s->>'version'=row->>'revision'
  and s->>'current'='true' and s->>'status'='valid' and s->>'statement_kind'='fact' and s->>'authority' in ('state','correction','canon') and s->'source_refs'='[]'::jsonb
  and not exists(select 1 from jsonb_array_elements(restrictions) x where x->>'source_id' in (s->>'id',rid))
  and not exists(select 1 from rpg_private.timeline_global_restrictions x where x.campaign_id=r.campaign_id and x.source_id::text in (s->>'id',rid))
  and s->'known_by' @> actors and (s->>'valid_from' is null or (s->>'valid_from')::integer<=r.current_world_minutes) and (s->>'valid_to' is null or (s->>'valid_to')::integer>r.current_world_minutes)
  and position(case family when 'entities' then row->>'details' else row->>'description' end in s->>'text')>0);
end $$;

create function rpg_private.lab_simulation_settlement(r rpg_private.world_lab_runs,op uuid,through_minute integer,proof jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare f jsonb:=rpg_private.lab_rows(r.campaign_id,r.head_manifest_id,'rpg_private.world_foundations')->0;
 oldw jsonb:=f->'world'; world jsonb; sc jsonb:=rpg_private.library_ref(r.owner_id,r.input_bundle->>'scenarioVersionId','scenario'); meta jsonb:=sc#>'{body,composition}'; review jsonb:=meta->'review'; scope jsonb:=proof->'scope';
 actor_ids jsonb:='[]'; thread_ids jsonb:='[]'; selected jsonb; entry jsonb; actor jsonb; thread jsonb; step jsonb; decision jsonb; effect jsonb; applied jsonb; settlement jsonb; events jsonb; ev jsonb; observation jsonb; payload jsonb;
 auth jsonb:='[]'; changes jsonb:='[]'; seen jsonb:='[]'; expected_decisions jsonb:='[]'; assumptions jsonb; at_minute integer; location_id jsonb; affected boolean; ei integer; pi integer; labels jsonb; line text; words jsonb; cap text; count_decisions integer:=0;
begin
 perform rpg_private.fields(proof,array['schemaVersion','trigger','executionProfile','scope','proposal','settlement','consequenceChanges','consequenceAuthority']);
 perform rpg_private.assert(proof->>'schemaVersion'='2' and r.input_bundle#>>'{resolutionPolicy,id}'='single-model-world-v1' and proof->'executionProfile'=r.input_bundle->'executionProfile' and meta->>'phase'='approved' and meta->'simulationProfile'=proof->'executionProfile');
 perform rpg_private.fields(scope,array['schemaVersion','scenarioVersionId','divergenceVersionId','language','locationId','atWorldMinutes','threadIds','actorIds','change','assumptions','constraints','unchangedBaseline','knowledge']);
 perform rpg_private.assert(scope->>'schemaVersion'='1' and scope->'scenarioVersionId'=r.input_bundle->'scenarioVersionId' and scope->'divergenceVersionId'=r.input_bundle->'divergenceVersionId' and scope->'language'=meta->'language'
  and scope->'change'=review->'changeDescription' and scope->'constraints'=review->'constraints' and scope->'unchangedBaseline'=review->'unchangedBaseline' and review->'policy'=oldw->'policy');
 at_minute:=(r.input_bundle->>'startWorldMinutes')::integer+(review->>'offsetMinutes')::integer;
 perform rpg_private.assert((scope->>'atWorldMinutes')::integer=at_minute and through_minute=least(r.current_world_minutes+60,(r.input_bundle->>'throughWorldMinutes')::integer,case when at_minute>r.current_world_minutes then at_minute else 2147483646 end));
 location_id:=case when review->'locationIndex'='null'::jsonb then 'null'::jsonb else meta->'choices'->'locations'->(review->>'locationIndex')::integer->'id' end;
 perform rpg_private.assert(scope->'locationId'=location_id);
 assumptions:=review->'assumptions';
 for entry in select jsonb_build_object('answer',v,'index',n-1) from jsonb_array_elements(review->'ambiguityAnswers') with ordinality a(v,n) where v<>'null'::jsonb loop
  assumptions:=assumptions||jsonb_build_array((meta->'originalProposal'->'ambiguities'->(entry->>'index')::integer->>'question')||E'\nOwner assumption: '||(entry->>'answer'));
 end loop;
 perform rpg_private.assert(scope->'assumptions'=assumptions);
 for entry in select value from jsonb_array_elements(review->'affectedActorIndexes') loop
  selected:=meta->'choices'->'actors'->(entry#>>'{}')::integer;
  select value into actor from jsonb_array_elements(oldw->'actors') where value->'id'=selected->'id' and value->>'control'='autonomous';
  perform rpg_private.assert(actor is not null and selected->>'control'='autonomous'); actor_ids:=actor_ids||jsonb_build_array(actor->'id');
 end loop;
 for entry in select value from jsonb_array_elements(review->'affectedThreadIndexes') loop thread_ids:=thread_ids||jsonb_build_array(meta->'choices'->'threads'->(entry#>>'{}')::integer->'id'); end loop;
 for thread in select value from jsonb_array_elements(oldw->'threads') where exists(select 1 from jsonb_array_elements(value->'decisionActorIds') a where actor_ids @> jsonb_build_array(a)) loop
  if not thread_ids ? (thread->>'id') then thread_ids:=thread_ids||jsonb_build_array(thread->'id'); end if;
 end loop;
 perform rpg_private.assert(scope->'actorIds'=actor_ids and scope->'threadIds'=thread_ids and jsonb_array_length(thread_ids) between 1 and 32);
 settlement:=rpg_private.lab_world_schedule(r,op,through_minute,proof->>'trigger',true);
 if settlement='null'::jsonb then
  perform rpg_private.assert(proof->'proposal'='null'::jsonb and proof->'consequenceChanges'='[]'::jsonb and proof->'consequenceAuthority'='[]'::jsonb and proof->'settlement'='null'::jsonb);
  return settlement;
 end if;
 world:=settlement->'nextWorld'; events:=settlement->'events';
 -- Decision order follows the existing deterministic World scheduler.
 for ev in select value from jsonb_array_elements(events) where value->>'kind'='world.thread.advanced' loop
  select value into strict thread from jsonb_array_elements(oldw->'threads') where value->'id'=ev->'threadIds'->0;
  select value into strict step from jsonb_array_elements(thread->'steps') where value->'id'=ev#>'{payload,stepId}';
  affected:=thread_ids ? (thread->>'id') and (ev->>'worldMinutes')::integer>=at_minute;
  if not affected and step->>'resolution'<>'resolver_required' then
   perform rpg_private.assert(coalesce(step->'consequences','[]')='[]'::jsonb);
   continue;
  end if;
  if affected then perform rpg_private.assert(step->'warning'='null'::jsonb and step->'hookChanges'='[]'::jsonb); end if;
  perform rpg_private.assert(proof->'proposal'<>'null'::jsonb);
  perform rpg_private.fields(proof->'proposal',array['schemaVersion','decisions']);
  perform rpg_private.assert(proof#>>'{proposal,schemaVersion}'='2' and jsonb_array_length(proof#>'{proposal,decisions}')<=8);
  select value into strict decision from jsonb_array_elements(proof#>'{proposal,decisions}') where value->'threadId'=thread->'id' and value->'stepId'=step->'id';
  perform rpg_private.fields(decision,array['threadId','stepId','decision','uncertainty','capabilityRefs','evidenceIndexes','consequences']);
  perform rpg_private.assert(decision->>'decision'='advance' and decision->>'uncertainty'='resolved' and (select count(*)=count(distinct v) from jsonb_array_elements(decision->'capabilityRefs') v));
  perform rpg_private.assert((select coalesce(jsonb_agg(i order by i),'[]') from generate_series(0,jsonb_array_length(step->'evidence')-1) i)=(select coalesce(jsonb_agg(v order by (v#>>'{}')::integer),'[]') from jsonb_array_elements(decision->'evidenceIndexes') v));
  for cap in select value from jsonb_array_elements_text(decision->'capabilityRefs') loop
   perform rpg_private.assert(exists(select 1 from jsonb_array_elements(oldw->'actors') a,jsonb_array_elements_text(a->'capabilities') c where thread->'decisionActorIds' ? (a->>'id') and (a->>'id')||':'||c.value=cap));
  end loop;
  if affected then perform rpg_private.assert(jsonb_array_length(decision->'consequences')>0); else perform rpg_private.assert(decision->'consequences'=coalesce(step->'consequences','[]')); end if;
  for effect in select value from jsonb_array_elements(decision->'consequences') loop
   if effect ? 'actorId' then
    select value into actor from jsonb_array_elements(world->'actors') where value->'id'=effect->'actorId';
    perform rpg_private.assert(not affected or actor_ids='[]'::jsonb or actor_ids ? (effect->>'actorId'));
    perform rpg_private.assert(not affected or location_id='null'::jsonb or actor->'locationId'=location_id or (effect->>'kind'='actor.relocate' and effect->'toLocationId'=location_id));
   end if;
   if effect->>'kind'='actor.relocate' then perform rpg_private.assert(rpg_private.lab_known_record(r,'locations',effect->>'toLocationId',thread->'decisionActorIds'));
   elsif effect->>'kind'='fact.observe' then perform rpg_private.assert(rpg_private.lab_known_record(r,effect->>'family',effect->>'recordId',thread->'decisionActorIds'));
   end if;
  end loop;
  applied:=rpg_private.wave3_consequences(r.campaign_id,world,decision->'consequences','resolver',thread->'decisionActorIds',decision->'capabilityRefs',null,(ev->>'worldMinutes')::bigint-r.current_world_minutes,r.head_manifest_id);
  for entry in select value from jsonb_array_elements(applied->'authority') loop
   perform rpg_private.assert(not seen ? ((entry->>'family')||':'||(entry->>'id')));
  end loop;
  select seen||coalesce(jsonb_agg(distinct (v->>'family')||':'||(v->>'id')),'[]') into seen from jsonb_array_elements(applied->'authority') v;
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(world->'threads') t,jsonb_array_elements(applied->'changes') c where t->>'status'='active' and t->'steps'->(t->>'cursor')::integer#>>'{trigger,kind}'='causal' and t->'steps'->(t->>'cursor')::integer#>'{trigger,family}'=c->'family' and t->'steps'->(t->>'cursor')::integer#>'{trigger,recordId}'=c->'id'));
  world:=jsonb_set(world,'{actors}',applied->'actors'); auth:=auth||(applied->'authority'); changes:=changes||(applied->'changes');
  payload:=(ev->'payload')||jsonb_build_object('resolverReceipt',jsonb_build_object('schemaVersion',2,'operationId',op)||decision,'consequences',decision->'consequences','consequenceAuthority',applied->'authority','consequenceFacts',applied->'facts');
  select (n-1)::integer into ei from jsonb_array_elements(events) with ordinality e(v,n) where v->'id'=ev->'id';
  events:=jsonb_set(events,array[ei::text],ev||jsonb_build_object('text','Validated autonomous World consequences.','payload',payload));
  select v,(n-1)::integer into observation,pi from jsonb_array_elements(events) with ordinality e(v,n) where v->>'id'=rpg_private.world_event_id(op,thread->>'id',step->>'id','public')::text;
  if observation is not null then
   words:='[]';
   for effect in select value from jsonb_array_elements(decision->'consequences') loop
    line:=case when meta->>'language'='ru' then case effect->>'kind' when 'inventory.consume' then 'Припасы израсходованы.' when 'resource.spend' then 'Ресурс израсходован.' when 'condition.add' then 'Возникло физическое состояние.' when 'condition.remove' then 'Физическое состояние прошло.' when 'actor.relocate' then 'Самостоятельный персонаж сменил местоположение.' when 'fact.observe' then 'Замечен установленный факт.' end else case effect->>'kind' when 'inventory.consume' then 'Supplies are consumed.' when 'resource.spend' then 'A resource is spent.' when 'condition.add' then 'A physical condition takes effect.' when 'condition.remove' then 'A physical condition ends.' when 'actor.relocate' then 'An autonomous actor changes location.' when 'fact.observe' then 'An established fact is observed.' end end;
    perform rpg_private.assert(line is not null); if not words ? line then words:=words||jsonb_build_array(line); end if;
   end loop;
   if words='[]'::jsonb then events:=events-pi;
   else events:=jsonb_set(events,array[pi::text,'text'],to_jsonb((select string_agg(v,' ' order by n) from jsonb_array_elements_text(words) with ordinality w(v,n)))); end if;
  end if;
  count_decisions:=count_decisions+1;
 end loop;
 if count_decisions=0 then perform rpg_private.assert(proof->'proposal'='null'::jsonb);
 else
  perform rpg_private.assert(jsonb_array_length(proof#>'{proposal,decisions}')=count_decisions);
  perform rpg_private.assert(exists(select 1 from rpg_private.world_lab_commands c where c.operation_id=op and c.stage='model_result' and c.run_id=r.id and c.owner_id=r.owner_id and c.campaign_id=r.campaign_id and c.request->'fence'=rpg_private.lab_fence(r) and c.result->'proposal'=proof->'proposal' and c.result->'error'='null'::jsonb));
 end if;
 settlement:=jsonb_set(jsonb_set(settlement,'{nextWorld}',world),'{events}',events);
 perform rpg_private.assert(settlement=proof->'settlement' and auth=proof->'consequenceAuthority' and changes=proof->'consequenceChanges');
 return settlement;
end $$;

create or replace function rpg_private.lab_commit(uid uuid,cid uuid,p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare r rpg_private.world_lab_runs%rowtype; m rpg_private.timeline_manifests%rowtype; newm rpg_private.timeline_manifests%rowtype; v rpg_private.timeline_versions%rowtype; rt rpg_private.timeline_versions%rowtype; wf rpg_private.timeline_versions%rowtype; op uuid; through_minute integer; settlement jsonb; expected jsonb:='[]'; writes jsonb; e jsonb; w jsonb; refs jsonb; new_payload jsonb; metadata jsonb; seq bigint; vid uuid; mid uuid; hash text; begin
 if p->>'kind'='pause' then perform rpg_private.fields(p,array['operationId','fence','kind','reason']);
 else perform rpg_private.fields(p,array['operationId','fence','kind','throughWorldMinutes','writes','proof']); end if;
 op:=(p->>'operationId')::uuid;
 select * into r from rpg_private.world_lab_runs where id=(p#>>'{fence,runId}')::uuid and campaign_id=cid and owner_id=uid for update;
 if not found then raise exception 'rpg_not_found'; end if;
 if r.status<>'running' or rpg_private.lab_fence(r)<>p->'fence' or not rpg_private.lab_fresh(r) or r.step_count>=32 then raise exception 'rpg_conflict'; end if;
 perform 1 from rpg_private.timelines where campaign_id=cid and id=r.timeline_id and purpose='simulation' and head_manifest_id=r.head_manifest_id and head_revision=r.head_revision for update;
 if not found then raise exception 'rpg_conflict'; end if;
 perform rpg_private.lab_validate_manifest(cid,r.head_manifest_id);
 select * into strict m from rpg_private.timeline_manifests where campaign_id=cid and id=r.head_manifest_id;
 if p->>'kind'='pause' then
  perform rpg_private.assert(p->>'reason' in ('review_required','unsupported','work_limit','unavailable'));
  update rpg_private.world_lab_runs set status='paused',reason=p->>'reason',revision=revision+1,lease_generation=lease_generation+1,updated_at=now() where id=r.id returning * into r;
  return jsonb_build_object('run',rpg_private.lab_run_json(r),'manifest',rpg_private.lab_manifest_json(m),'operationId',op,'committed',false);
 end if;
 perform rpg_private.assert(jsonb_typeof(p->'throughWorldMinutes')='number' and (p->>'throughWorldMinutes')::numeric=trunc((p->>'throughWorldMinutes')::numeric));
 through_minute:=(p->>'throughWorldMinutes')::integer;
 if r.input_bundle ? 'executionProfile' then
  settlement:=rpg_private.lab_simulation_settlement(r,op,through_minute,p->'proof');
 else
  perform rpg_private.fields(p->'proof',array['schemaVersion','trigger','settlement']); perform rpg_private.assert(p#>>'{proof,schemaVersion}'='1');
  settlement:=rpg_private.lab_world_step(r,op,through_minute,p#>>'{proof,trigger}');
 end if;
 perform rpg_private.assert(settlement=p#>'{proof,settlement}');
 select * into strict rt from rpg_private.timeline_versions where campaign_id=cid and table_name='rpg_private.runtime_state' and m.refs->'rpg_private.runtime_state' ? id::text;
 perform rpg_private.assert((rt.payload->>'world_minutes')::integer=r.current_world_minutes);
 if settlement<>'null'::jsonb then
  select * into strict wf from rpg_private.timeline_versions where campaign_id=cid and table_name='rpg_private.world_foundations' and m.refs->'rpg_private.world_foundations' ? id::text;
  expected:=expected||jsonb_build_array(jsonb_build_object('tableName',wf.table_name,'rowKey',wf.row_key,'expectedVersionId',wf.id,'payload',wf.payload||jsonb_build_object('world',settlement->'nextWorld','revision',(wf.payload->>'revision')::integer+1)));
 end if;
 if settlement<>'null'::jsonb or through_minute<>r.current_world_minutes then expected:=expected||jsonb_build_array(jsonb_build_object('tableName',rt.table_name,'rowKey',rt.row_key,'expectedVersionId',rt.id,'payload',rt.payload||jsonb_build_object('world_minutes',through_minute,'revision',(rt.payload->>'revision')::integer+1))); end if;
 select coalesce(max((value->>'sequence')::bigint),0) into seq from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_events'));
 for e in select value from jsonb_array_elements(coalesce(nullif(settlement,'null')->'events','[]')) loop
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(rpg_private.lab_rows(cid,m.id,'rpg_private.world_events')) old where old->'id'=e->'id'));
  seq:=seq+1;
  expected:=expected||jsonb_build_array(jsonb_build_object('tableName','rpg_private.world_events','rowKey',e->'id','expectedVersionId',null,'payload',jsonb_build_object('id',e->'id','campaign_id',cid,'operation_id',op,'sequence',seq,'event',e)));
 end loop;
 if r.input_bundle ? 'executionProfile' then
  for e in select value from jsonb_array_elements(p#>'{proof,consequenceChanges}') loop
   perform rpg_private.fields(e,array['family','id','expectedRevision','values']);
   perform rpg_private.assert(e->>'family' in ('entities','items'));
   select * into strict v from rpg_private.timeline_versions where campaign_id=cid and table_name='public.rpg_'||(e->>'family') and row_key=e->>'id' and m.refs->('public.rpg_'||(e->>'family')) ? id::text;
   perform rpg_private.assert(v.payload->'revision'=e->'expectedRevision');
   perform rpg_private.assert(not exists(select 1 from jsonb_object_keys(e->'values') k where k<>all(case e->>'family' when 'items' then array['quantity'] else array['resources','conditions'] end)));
   expected:=expected||jsonb_build_array(jsonb_build_object('tableName',v.table_name,'rowKey',v.row_key,'expectedVersionId',v.id,'payload',v.payload||(e->'values')||jsonb_build_object('revision',(v.payload->>'revision')::integer+1)));
  end loop;
 end if;
 perform rpg_private.assert(p->'writes'=expected and p->>'kind'=case when expected='[]'::jsonb then 'noop' when r.input_bundle ? 'executionProfile' then 'resolved_world' else 'deterministic_world' end);
 refs:=m.refs; mid:=m.id; newm:=m;
 if expected<>'[]'::jsonb then
  for w in select value from jsonb_array_elements(expected) loop
   new_payload:=w->'payload'; hash:=encode(sha256(convert_to(new_payload::text,'UTF8')),'hex');
   insert into rpg_private.timeline_versions(campaign_id,table_name,row_key,digest,payload,origin_timeline_id) values(cid,w->>'tableName',w->>'rowKey',hash,new_payload,r.timeline_id) on conflict(campaign_id,table_name,row_key,digest) do nothing;
   select id into strict vid from rpg_private.timeline_versions where campaign_id=cid and table_name=w->>'tableName' and row_key=w->>'rowKey' and digest=hash and timeline_versions.payload=new_payload;
   if w->>'expectedVersionId' is null then writes:=(refs->(w->>'tableName'))||jsonb_build_array(vid);
   else select jsonb_agg(case when value=w->'expectedVersionId' then to_jsonb(vid) else value end order by n) into writes from jsonb_array_elements(refs->(w->>'tableName')) with ordinality a(value,n); end if;
   refs:=jsonb_set(refs,array[w->>'tableName'],writes);
  end loop;
  mid:=gen_random_uuid(); metadata:=m.public_metadata||jsonb_build_object('worldMinutes',through_minute,'labOrdinal',r.head_revision+1);
  insert into rpg_private.timeline_manifests(id,campaign_id,timeline_id,refs,public_metadata,canon_generation,schema_version,lab_run_id) values(mid,cid,r.timeline_id,refs,metadata,m.canon_generation,3,r.id) returning * into newm;
  update rpg_private.timelines set head_manifest_id=mid,head_revision=head_revision+1,head_public=metadata,updated_at=now() where campaign_id=cid and id=r.timeline_id and purpose='simulation' and head_manifest_id=r.head_manifest_id and head_revision=r.head_revision;
  if not found then raise exception 'rpg_conflict'; end if;
 end if;
 update rpg_private.world_lab_runs set head_manifest_id=mid,last_checkpoint_id=mid,head_revision=head_revision+case when mid<>m.id then 1 else 0 end,step_count=step_count+case when mid<>m.id then 1 else 0 end,current_world_minutes=through_minute,revision=revision+1,
 status=case when through_minute=(input_bundle->>'throughWorldMinutes')::integer then 'completed' when step_count+case when mid<>m.id then 1 else 0 end>=32 then 'paused' else 'running' end,
 reason=case when through_minute<>(input_bundle->>'throughWorldMinutes')::integer and step_count+case when mid<>m.id then 1 else 0 end>=32 then 'work_limit' else null end,updated_at=now() where id=r.id returning * into r;
 return jsonb_build_object('run',rpg_private.lab_run_json(r),'manifest',rpg_private.lab_manifest_json(newm),'operationId',op,'committed',mid<>m.id);
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
