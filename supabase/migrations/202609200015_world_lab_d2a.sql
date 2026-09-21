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
 perform rpg_private.assert(meta->>'schemaVersion'='1' and meta->>'phase' in ('requested','review','approved') and meta->>'language' in ('en','ru') and (meta->>'operationId')::uuid is not null and length(btrim(meta->>'premise')) between 1 and 12000);
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
   and (meta#>>'{review,horizonMinutes}')::integer between 1 and 43200 and meta#>'{review,policy}'=ctx#>'{state,records,rpg_private.world_foundations,0,world,policy}');
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

revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
