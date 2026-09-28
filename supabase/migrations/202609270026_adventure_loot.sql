-- Bounded secured objects live in existing exact World Event manifests.
-- One Item/Storage, reward receipt, runtime, dice and save authority remains.
begin;
create function rpg_private.adventure_loot_version(cid uuid,oid uuid) returns jsonb language sql stable set search_path='' as $$
 select event->'payload' from rpg_private.world_events where campaign_id=cid and event->>'visibility'='private' and event->>'kind' in ('loot.object.configured','loot.object.corrected','loot.object.changed') and event#>>'{payload,object,id}'=oid::text order by sequence desc limit 1
$$;
create function rpg_private.adventure_loot_owner(cid uuid,snap jsonb,raw jsonb,plan jsonb) returns void language plpgsql stable set search_path='' as $$
declare state jsonb:=(select loop_state from rpg_private.world_foundations where campaign_id=cid); input jsonb:=plan#>'{events,0,payload}'; old jsonb; obj jsonb:=input->'object'; policy jsonb:=input->'policy'; a jsonb; x jsonb; expected jsonb; routes jsonb:='[]'; route jsonb; dc jsonb; approach text; begin
 perform rpg_private.fields(input,array['schemaVersion','expectedObjectRevision','object','policy','privateItems','authority']);
 perform rpg_private.assert(input->'schemaVersion'='1' and input->>'authority'='owner' and obj->>'campaignId'=cid::text and policy->>'campaignId'=cid::text and obj->'id'=policy->'objectId' and policy->'profile'=snap->'ruleset');
 perform rpg_private.fields(obj,array['schemaVersion','campaignId','id','revision','storageId','locationId','ownerEntityId','label','access','lockClass','structureClass','environmentTags','portable','contentsEstablished','materializationId','knownBy','contentsKnownBy']);
 perform rpg_private.assert(obj->'schemaVersion'='1' and jsonb_typeof(obj->'label')='string' and length(btrim(obj->>'label')) between 1 and 200 and obj->>'label'=btrim(raw->>'label') and obj->>'access' in ('open','closed','locked','sealed','jammed','broken') and obj->'access'=raw->'access' and obj->'portable'=raw->'portable' and (obj->'portable'='null' or jsonb_typeof(obj->'portable')='boolean') and rpg_private.wave4_integer(obj->'revision',1));
 select actor into a from jsonb_array_elements(snap#>'{world,actors}') actor join rpg_private.runtime_state rt on rt.campaign_id=cid where actor->>'control'='player' and (rt.configuration->'controlledEntityIds' ? (actor->>'entityId') or exists(select 1 from public.rpg_entities pc where pc.campaign_id=cid and pc.id=(actor->>'entityId')::uuid and pc.kind='player')) and actor->>'locationId'=(select current_location_id::text from public.rpg_public_state where campaign_id=cid) limit 1;
 perform rpg_private.assert(a is not null and obj->'locationId'=a->'locationId');
 old:=rpg_private.adventure_loot_version(cid,(obj->>'id')::uuid);
 perform rpg_private.assert(coalesce(old#>'{object,revision}','null')=input->'expectedObjectRevision' and (obj->>'revision')::integer=coalesce((old#>>'{object,revision}')::integer,0)+1);
 if raw->>'action'='edit' then
  perform rpg_private.fields(raw,array['action','objectId','expectedObjectRevision','label','access','portable']);
  perform rpg_private.assert(old is not null and old#>'{object,id}'=raw->'objectId' and old#>'{object,revision}'=raw->'expectedObjectRevision' and old#>'{object,knownBy}' ? (a->>'id'));
  expected:=jsonb_set(old,'{object}',(old->'object')||jsonb_build_object('revision',obj->'revision','label',obj->'label','access',raw->'access','portable',raw->'portable'))||jsonb_build_object('expectedObjectRevision',old#>'{object,revision}','authority','owner');
  perform rpg_private.assert(input=expected);
 else
  perform rpg_private.fields(raw,array['action','storageId','locationId','ownerEntityId','label','access','portable','capability','lockDc','forceDc']);
  perform rpg_private.assert(raw->>'action'='create' and old is null and obj->'storageId'=raw->'storageId' and obj->'ownerEntityId'=raw->'ownerEntityId' and obj->'locationId'=raw->'locationId' and obj->'revision'='1' and obj->'environmentTags'='[]' and obj->'knownBy'=jsonb_build_array(a->'id') and obj->'contentsKnownBy'='[]' and obj->>'contentsEstablished'='true' and input->'privateItems'='[]' and a->'capabilities' ? (raw->>'capability'));
  perform rpg_private.assert(exists(select 1 from public.rpg_storages st join public.rpg_locations loc on loc.id=(obj->>'locationId')::uuid and loc.campaign_id=cid and loc.status='visited' where st.campaign_id=cid and st.id=(obj->>'storageId')::uuid and st.entity_id=(obj->>'ownerEntityId')::uuid));
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(snap#>'{world,actors}') actor where actor->'entityId'=obj->'ownerEntityId' and actor->'locationId'=obj->'locationId' and actor->'publicName'<>'null'));
  perform rpg_private.assert(not exists(select 1 from rpg_private.world_events where campaign_id=cid and event->>'visibility'='private' and event->>'kind' in ('loot.object.configured','loot.object.corrected','loot.object.changed') and event#>'{payload,object,storageId}'=obj->'storageId'));
  perform rpg_private.assert(not exists(select 1 from public.rpg_items item where item.campaign_id=cid and item.storage_id=(obj->>'storageId')::uuid and not exists(select 1 from jsonb_array_elements(state->'itemPolicies') p where p->>'itemId'=item.id::text and p->>'visibility'='public')));
  foreach approach in array array['lock','force'] loop
   dc:=raw->case when approach='lock' then 'lockDc' else 'forceDc' end;
   perform rpg_private.assert(dc='null' or rpg_private.wave4_integer(dc,1) and (dc#>>'{}')::integer<=40);
   if dc<>'null' then
    route:=jsonb_build_object('id',approach,'capability',raw->'capability','from',jsonb_build_array('closed','locked','sealed','jammed'),'lockClass',case when approach='lock' then '"owner-lock"'::jsonb else 'null'::jsonb end,'structureClass',case when approach='force' then '"owner-structure"'::jsonb else 'null'::jsonb end,'environmentTags','[]'::jsonb,'requiresPortable',false,'requiredItemIds','[]'::jsonb,'resourceCost',null,'check',jsonb_build_object('index',0,'stat','skill','dc',dc),'to',case when approach='lock' then 'open' else 'broken' end,'noise',approach='force','fragileLoss',0);
    routes:=routes||jsonb_build_array(route);
   end if;
  end loop;
  perform rpg_private.assert(policy=jsonb_build_object('schemaVersion',1,'campaignId',cid,'objectId',obj->'id','id','owner-object-v1','version',1,'profile',snap->'ruleset','discoveryCheck',null,'contents','[]'::jsonb,'approaches',routes));
  perform rpg_private.assert(obj->'lockClass'=case when raw->'lockDc'='null' then 'null'::jsonb else '"owner-lock"'::jsonb end and obj->'structureClass'=case when raw->'forceDc'='null' then 'null'::jsonb else '"owner-structure"'::jsonb end and obj->>'materializationId'=rpg_private.wave4_id((obj->>'id')::uuid,'loot:materialization-v1')::text);
 end if;
 perform rpg_private.assert(plan->'world'=snap->'world' and plan->'changes'='[]' and plan->'state'=jsonb_set(state,'{version}',to_jsonb((state->>'version')::integer+1)) and jsonb_array_length(plan->'events')=1 and plan#>>'{events,0,visibility}'='private' and plan#>>'{events,0,kind}'=case when old is null then 'loot.object.configured' else 'loot.object.corrected' end and plan#>'{events,0,payload}'=input and plan#>'{events,0,actorIds}'='[]' and plan#>'{events,0,threadIds}'='[]');
end $$;

-- Only positive current object/check facts are pinned into the ordinary Turn
-- source. The original server validator must not read fresh policy on replay.
create function rpg_private.adventure_loot_checks(cid uuid) returns jsonb language plpgsql stable set search_path='' as $$
declare worldstate jsonb; controlled jsonb; a jsonb; obj jsonb; version jsonb; route jsonb; checks jsonb:='[]'; oid uuid; currentlocation uuid;
begin
 select world into worldstate from rpg_private.world_foundations where campaign_id=cid;
 select configuration->'controlledEntityIds' into controlled from rpg_private.runtime_state where campaign_id=cid;
 select current_location_id into currentlocation from public.rpg_public_state where campaign_id=cid;
 if worldstate is null or currentlocation is null or controlled is null then return checks;end if;
 for a in select value from jsonb_array_elements(worldstate->'actors') where value->>'control'='player' and controlled ? (value->>'entityId') and value->>'locationId'=currentlocation::text loop
  for oid in select distinct (event#>>'{payload,object,id}')::uuid from rpg_private.world_events where campaign_id=cid and event->>'kind' in ('loot.object.configured','loot.object.corrected','loot.object.changed') and event->>'visibility'='private' loop
   version:=rpg_private.adventure_loot_version(cid,oid);obj:=version->'object';
   if obj->'knownBy' ? (a->>'id') and obj->>'locationId'=currentlocation::text then
    if version#>'{policy,discoveryCheck}'<>'null' then checks:=checks||jsonb_build_array(jsonb_build_object('actorId',a->'id','entityId',a->'entityId','objectId',oid,'kind','search','approachId',null,'requirement',version#>'{policy,discoveryCheck}'));end if;
    for route in select value from jsonb_array_elements(version#>'{policy,approaches}') where a->'capabilities' ? (value->>'capability') and value->'check'<>'null' loop
     checks:=checks||jsonb_build_array(jsonb_build_object('actorId',a->'id','entityId',a->'entityId','objectId',oid,'kind','access','approachId',route->'id','requirement',route->'check'));
    end loop;
   end if;
  end loop;
 end loop;
 return checks;
end $$;
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_loot;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_loot(cid,uid,mode); checks jsonb;begin
 if mode='game' then checks:=rpg_private.adventure_loot_checks(cid);if checks<>'[]' then result:=result||jsonb_build_object('lootChecks',checks);end if;end if;return result;
end $$;

create function rpg_private.adventure_loot_guard(cid uuid,t rpg_private.turns,settlement jsonb) returns void language plpgsql stable set search_path='' as $$
declare proposal jsonb:=settlement->'proposal'; intent jsonb:=proposal->'intent'; plan jsonb:=settlement->'plan'; s jsonb; worldstate jsonb; old jsonb; obj jsonb; policy jsonb; next jsonb; actor jsonb; entity public.rpg_entities%rowtype; required jsonb; route jsonb; checkrow jsonb; success boolean:=true; expectedobj jsonb; expectedstate jsonb; changes jsonb:='[]'; privateitems jsonb; definition jsonb; itemid uuid; item public.rpg_items%rowtype; values jsonb; change jsonb; pol jsonb; transfer jsonb; dest uuid; transferred uuid; quantity integer; known jsonb; eid text; k text;
begin
 select loop_state,world into s,worldstate from rpg_private.world_foundations where campaign_id=cid;
 perform rpg_private.fields(proposal,array['schemaVersion','action','input','intent']);
 perform rpg_private.assert(proposal->'schemaVersion'='1' and proposal->>'action'='loot' and proposal->>'input'=t.input->>'input' and t.input->>'mode'='game' and plan->'world'=worldstate);
 perform rpg_private.assert(intent->>'kind' in ('search','access','take'));
 if intent->>'kind'='search' then perform rpg_private.fields(intent,array['kind','actorId','objectId']);
 elsif intent->>'kind'='access' then perform rpg_private.fields(intent,array['kind','actorId','objectId','approachId']);
 else perform rpg_private.fields(intent,array['kind','actorId','objectId','itemId','quantity','destinationStorageId']);end if;
 old:=rpg_private.adventure_loot_version(cid,(intent->>'objectId')::uuid); perform rpg_private.assert(old is not null);
 obj:=old->'object';policy:=old->'policy';privateitems:=old->'privateItems';expectedobj:=obj||jsonb_build_object('revision',(obj->>'revision')::integer+1);expectedstate:=jsonb_set(s,'{version}',to_jsonb((s->>'version')::integer+1));
 perform rpg_private.assert(policy->'profile'=(select ruleset from rpg_private.world_foundations where campaign_id=cid));
 select a into actor from jsonb_array_elements(worldstate->'actors') a where a->'id'=intent->'actorId' and a->>'control'='player' and a->'entityId'<>'null';
 eid:=actor->>'entityId';select * into entity from public.rpg_entities where campaign_id=cid and id=eid::uuid;
 perform rpg_private.assert(actor is not null and entity.id is not null and (entity.hp is null or entity.hp>0) and actor->'locationId'=obj->'locationId' and exists(select 1 from public.rpg_public_state where campaign_id=cid and current_location_id::text=obj->>'locationId') and exists(select 1 from public.rpg_storages where campaign_id=cid and id=(obj->>'storageId')::uuid and entity_id=(obj->>'ownerEntityId')::uuid));
 if t.checkpoint->'worldLogic'<>'null' and t.checkpoint ? 'worldLogic' then perform rpg_private.assert(t.checkpoint#>>'{worldLogic,actorId}'=actor->>'id' and t.checkpoint#>>'{worldLogic,outcome}'='completed' and t.checkpoint#>>'{worldLogic,uncertainty}'='resolved');
 else perform rpg_private.assert(t.source#>'{runtime,configuration,controlledEntityIds}' ? eid);end if;
 if intent->>'kind'='search' then required:=policy->'discoveryCheck';
 elsif intent->>'kind'='access' then
  perform rpg_private.assert(obj->'knownBy' ? (actor->>'id'));
  select a into route from jsonb_array_elements(policy->'approaches') a where a->'id'=intent->'approachId';
  perform rpg_private.assert(route is not null and actor->'capabilities' ? (route->>'capability') and route->'from' ? (obj->>'access') and (route->'lockClass'='null' or route->'lockClass'=obj->'lockClass') and (route->'structureClass'='null' or route->'structureClass'=obj->'structureClass') and (obj->'environmentTags') @> (route->'environmentTags') and (route->>'requiresPortable'='false' or obj->>'portable'='true'));
  for k in select jsonb_array_elements_text(route->'requiredItemIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_items where campaign_id=cid and id=k::uuid and owner_entity_id=entity.id and quantity>0));end loop;
  required:=route->'check';
 end if;
 if required is not null and required<>'null' then
  perform rpg_private.assert(not(t.checkpoint ? 'worldLogic') or t.checkpoint->'worldLogic'='null');
  select c into checkrow from jsonb_array_elements(t.checkpoint->'checks') c where c->'index'=required->'index';
  perform rpg_private.assert(checkrow is not null and checkrow->>'actorId'=eid and checkrow->'targetId'=obj->'id' and checkrow->'stat'=required->'stat' and checkrow->'kind'=required->'stat' and checkrow->'dc'=required->'dc' and checkrow->>'visibility'='player' and checkrow->>'uncertainty'='meaningful' and checkrow->>'id'=rpg_private.wave4_id(t.id,'check:'||(required->>'index'))::text);
  success:=(checkrow->>'success')::boolean;
 end if;
 if intent->>'kind'='search' and success then
  known:=obj->'knownBy';if not(known ? (actor->>'id'))then known:=known||jsonb_build_array(actor->'id');end if;expectedobj:=jsonb_set(expectedobj,'{knownBy}',known);
  if obj->>'access' in ('open','broken') then
   if obj->>'contentsEstablished'='false' then
    perform rpg_private.assert(not exists(select 1 from public.rpg_items where campaign_id=cid and storage_id=(obj->>'storageId')::uuid));
    expectedobj:=expectedobj||jsonb_build_object('contentsEstablished',true,'materializationId',rpg_private.wave4_id((obj->>'id')::uuid,'loot:materialization-v1'));
    for definition in select value from jsonb_array_elements(policy->'contents') loop
     itemid:=rpg_private.wave4_id((obj->>'id')::uuid,'loot:item:'||(definition->>'key'));
     values:=(definition->'visible')||jsonb_build_object('owner_entity_id',obj->'ownerEntityId','storage_id',obj->'storageId','equipped_entity_id',null,'equipped_slot',null);
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items','id',itemid,'expectedRevision',null,'values',values));
     expectedstate:=jsonb_set(expectedstate,'{itemPolicies}',(expectedstate->'itemPolicies')||jsonb_build_array((definition->'commerce')||jsonb_build_object('itemId',itemid,'version',1)));
     privateitems:=privateitems||jsonb_build_array(jsonb_build_object('itemId',itemid,'fragile',definition->'fragile','hidden',definition->'private'));
    end loop;
   end if;
   known:=obj->'contentsKnownBy';if not(known ? (actor->>'id'))then known:=known||jsonb_build_array(actor->'id');end if;expectedobj:=jsonb_set(expectedobj,'{contentsKnownBy}',known);
  end if;
 elsif intent->>'kind'='access' then
  if route->'resourceCost'<>'null' then
   k:=route#>>'{resourceCost,resource}';perform rpg_private.assert(rpg_private.wave4_integer(entity.resources->k) and (entity.resources->>k)::integer>=(route#>>'{resourceCost,amount}')::integer);
   changes:=changes||jsonb_build_array(jsonb_build_object('family','entities','id',entity.id,'expectedRevision',entity.revision,'values',jsonb_build_object('resources',jsonb_set(entity.resources,array[k],to_jsonb((entity.resources->>k)::integer-(route#>>'{resourceCost,amount}')::integer)))));
  end if;
  if success then
   expectedobj:=jsonb_set(expectedobj,'{access}',route->'to');
   if (route->>'fragileLoss')::integer>0 then
    perform rpg_private.assert(obj->>'contentsEstablished'='true');
    for definition in select value from jsonb_array_elements(privateitems) where value->>'fragile'='true' loop
     select * into item from public.rpg_items where campaign_id=cid and id=(definition->>'itemId')::uuid and storage_id=(obj->>'storageId')::uuid;
     if found and item.quantity>0 then changes:=changes||jsonb_build_array(jsonb_build_object('family','items','id',item.id,'expectedRevision',item.revision,'values',jsonb_build_object('quantity',greatest(0,item.quantity-(route->>'fragileLoss')::integer))));end if;
    end loop;
   end if;
  end if;
 elsif intent->>'kind'='take' then
  perform rpg_private.assert(obj->>'contentsEstablished'='true' and obj->>'access' in ('open','broken') and obj->'contentsKnownBy' ? (actor->>'id') and rpg_private.wave4_integer(intent->'quantity',1));
  select * into item from public.rpg_items where campaign_id=cid and id=(intent->>'itemId')::uuid and storage_id=(obj->>'storageId')::uuid and owner_entity_id=(obj->>'ownerEntityId')::uuid;
  perform rpg_private.assert(item.id is not null and item.equipped_entity_id is null and item.equipped_slot is null and item.quantity>=(intent->>'quantity')::integer);
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(worldstate->'actors') a join public.rpg_entities e on e.id=(a->>'entityId')::uuid and e.campaign_id=cid where a->>'entityId'=item.owner_entity_id::text and a->'publicName'<>'null' and a->'locationId'=actor->'locationId' and (e.hp is null or e.hp>0)));
  dest:=(intent->>'destinationStorageId')::uuid;quantity:=(intent->>'quantity')::integer;
  perform rpg_private.assert(dest<>item.storage_id and exists(select 1 from public.rpg_storages where campaign_id=cid and id=dest and entity_id=entity.id));
  select p into pol from jsonb_array_elements(s->'itemPolicies') p where p->>'itemId'=item.id::text;perform rpg_private.assert(pol->>'visibility'='public' and pol->>'trade'='allowed');
  transferred:=case when quantity=item.quantity then item.id else rpg_private.wave4_id(t.id,'commerce:transfer:'||item.id::text||':'||entity.id::text||':'||dest::text) end;
  values:=jsonb_build_object('quantity',quantity,'owner_entity_id',entity.id,'storage_id',dest,'equipped_entity_id',null,'equipped_slot',null);
  if transferred=item.id then changes:=changes||jsonb_build_array(jsonb_build_object('family','items','id',item.id,'expectedRevision',item.revision,'values',values));
  else
   changes:=changes||jsonb_build_array(jsonb_build_object('family','items','id',item.id,'expectedRevision',item.revision,'values',jsonb_build_object('quantity',item.quantity-quantity)),jsonb_build_object('family','items','id',transferred,'expectedRevision',null,'values',values||jsonb_build_object('name',item.name,'category',item.category,'description',item.description,'mechanics',item.mechanics)));
   select p into definition from jsonb_array_elements(privateitems) p where p->>'itemId'=item.id::text;if definition is not null then privateitems:=privateitems||jsonb_build_array(definition||jsonb_build_object('itemId',transferred));end if;
  end if;
  pol:=pol||jsonb_build_object('itemId',transferred,'version',case when transferred=item.id then (pol->>'version')::integer+1 else 1 end,'origin',case when item.owner_entity_id=entity.id then pol->>'origin' else 'stolen' end);
  expectedstate:=jsonb_set(expectedstate,'{itemPolicies}',coalesce((select jsonb_agg(p) from jsonb_array_elements(s->'itemPolicies') p where p->>'itemId'<>transferred::text),'[]')||jsonb_build_array(pol));
 end if;
 perform rpg_private.assert(plan->'changes'=changes and plan->'state'=expectedstate);
 select e->'payload' into next from jsonb_array_elements(plan->'events') e where e->>'kind'='loot.object.changed' and e->>'visibility'='private';
 perform rpg_private.assert(next=jsonb_build_object('schemaVersion',1,'expectedObjectRevision',obj->'revision','object',expectedobj,'policy',policy,'privateItems',privateitems,'authority','settlement'));
 for definition in select value from jsonb_array_elements(plan->'events') loop
  perform rpg_private.assert(definition->'actorIds'=jsonb_build_array(actor->'id') and definition->'threadIds'='[]');
  if definition->>'kind'='loot.object.changed' then perform rpg_private.assert(definition->>'visibility'='private' and definition->>'text'='A bounded object consequence was settled.');
  elsif definition->>'kind'='loot.item.transferred' then perform rpg_private.assert(intent->>'kind'='take' and definition->>'visibility'='private' and definition->'payload'=jsonb_build_object('schemaVersion',1,'objectId',obj->'id','sourceItemId',item.id,'transferredItemId',transferred,'quantity',quantity,'legalOwnerEntityId',obj->'ownerEntityId','origin',pol->'origin'));
  elsif definition->>'kind'='loot.noise' then perform rpg_private.assert(intent->>'kind'='access' and success and route->>'noise'='true' and definition->>'visibility'='public' and definition->>'text'='The action makes an audible crash nearby.' and definition->'payload'='{}');
  else perform rpg_private.assert(definition->>'kind'='loot.object.observed' and definition->>'visibility'='public' and definition->'payload'='{}' and definition->>'text' in ('The available object was inspected.','The search found no new information.','The object access changed.','The object access did not change.','An available item was transferred.'));end if;
 end loop;
 perform rpg_private.assert(jsonb_array_length(plan->'events')=case when intent->>'kind'='take' or intent->>'kind'='access' and success and route->>'noise'='true' then 3 else 2 end);
end $$;
alter function rpg_private.wave4_action_guard(uuid,rpg_private.turns,jsonb) rename to wave4_action_guard_before_loot;
create function rpg_private.wave4_action_guard(cid uuid,t rpg_private.turns,settlement jsonb) returns void language plpgsql stable set search_path='' as $$
begin
 if settlement#>>'{proposal,action}'='loot' then perform rpg_private.adventure_loot_guard(cid,t,settlement);else perform rpg_private.wave4_action_guard_before_loot(cid,t,settlement);end if;
end $$;

create function rpg_private.adventure_reward_policy(cid uuid,rid text) returns jsonb language sql stable set search_path='' as $$
 select event#>'{payload,policy}' from rpg_private.world_events where campaign_id=cid and event->>'kind'='reward.integrity.configured' and event->>'visibility'='private' and event#>>'{payload,policy,rewardId}'=rid and (event->>'worldMinutes')::integer<=(select world_minutes from rpg_private.runtime_state where campaign_id=cid) order by sequence desc limit 1
$$;
create function rpg_private.adventure_reward_configuration(cid uuid,snap jsonb,raw jsonb,plan jsonb) returns void language plpgsql stable set search_path='' as $$
declare state jsonb:=(select loop_state from rpg_private.world_foundations where campaign_id=cid); prior jsonb; payload jsonb:=plan#>'{events,0,payload}'; policy jsonb:=payload->'policy'; definition jsonb; item jsonb; assessment jsonb; items jsonb:='[]'; valuation jsonb; k text;begin
 perform rpg_private.fields(raw,array['rewardId','expectedRewardVersion','expectedPolicyVersion','sourceSignificance','usablePowerCeiling','meaningfulnessFloor','powerAggregation','nonItemSignificance','deliberateFloorException','items']);
 select d into definition from jsonb_array_elements(state#>'{rewards}') d where d->'id'=raw->'rewardId' and d->'version'=raw->'expectedRewardVersion';perform rpg_private.assert(definition is not null);
 perform rpg_private.assert(case definition#>>'{source,kind}' when 'quest' then exists(select 1 from public.rpg_quests where campaign_id=cid and id=(definition#>>'{source,id}')::uuid) when 'thread' then exists(select 1 from jsonb_array_elements(snap#>'{world,threads}') t where t->'id'=definition#>'{source,id}' and t->'publicTitle'<>'null') else exists(select 1 from rpg_private.world_events where campaign_id=cid and id=(definition#>>'{source,id}')::uuid and event->>'visibility'='public' and event->>'kind' in ('world.logic.resolved','world.thread.advanced')) end);
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(definition->'recipientIds') recipient join jsonb_array_elements(snap#>'{world,actors}') a on a->>'entityId'=recipient where a->'publicName'='null'));
 prior:=rpg_private.adventure_reward_policy(cid,raw->>'rewardId');perform rpg_private.assert(raw->'expectedPolicyVersion'=coalesce(prior->'version','null'));
 perform rpg_private.assert(raw->>'sourceSignificance' in ('ordinary','meaningful') and raw->>'powerAggregation' in ('maximum','sum') and rpg_private.wave4_integer(raw->'nonItemSignificance') and (raw->>'nonItemSignificance')::integer<=1000000);
 foreach k in array array['usablePowerCeiling','meaningfulnessFloor'] loop perform rpg_private.assert(raw->k='null' or rpg_private.wave4_integer(raw->k) and (raw->>k)::integer<=1000000);end loop;
 perform rpg_private.assert(raw->'deliberateFloorException'='null' or jsonb_typeof(raw->'deliberateFloorException')='string' and length(btrim(raw->>'deliberateFloorException')) between 1 and 2000);
 perform rpg_private.assert(jsonb_typeof(raw->'items')='array' and jsonb_array_length(raw->'items')<=32 and (select count(*)=count(distinct value->>'itemId') from jsonb_array_elements(raw->'items')) and jsonb_array_length(raw->'items')=(select count(*) from jsonb_array_elements(definition->'entries') e where e->>'kind'='item'));
 for assessment in select value from jsonb_array_elements(raw->'items') loop
  perform rpg_private.fields(assessment,array['itemId','rarity','usablePower','narrativeSignificance']);
  perform rpg_private.assert(jsonb_typeof(assessment->'rarity')='string' and length(btrim(assessment->>'rarity')) between 1 and 100 and rpg_private.wave4_integer(assessment->'usablePower') and (assessment->>'usablePower')::integer<=1000000 and rpg_private.wave4_integer(assessment->'narrativeSignificance') and (assessment->>'narrativeSignificance')::integer<=1000000);
  perform rpg_private.assert(exists(select 1 from jsonb_array_elements(definition->'entries') e where e->>'kind'='item' and e->'itemId'=assessment->'itemId'));
  select p into valuation from jsonb_array_elements(state#>'{itemPolicies}') p where p->'itemId'=assessment->'itemId' and p->>'visibility'='public';perform rpg_private.assert(valuation is not null);
  items:=items||jsonb_build_array(jsonb_build_object('itemId',assessment->'itemId','rarity',assessment->'rarity','fullPower',assessment->'usablePower','currentUsablePower',assessment->'usablePower','economicValue',valuation->'unitValue','narrativeSignificance',assessment->'narrativeSignificance','usability','available','requiredCapabilities','[]'::jsonb));
 end loop;
 perform rpg_private.assert(payload=jsonb_build_object('schemaVersion',1,'expectedPolicyVersion',coalesce(prior->'version','null'),'policy',jsonb_build_object('schemaVersion',1,'id',coalesce(prior->>'id',rpg_private.wave4_id(cid,'reward-integrity-v1:'||(raw->>'rewardId'))::text),'version',coalesce((prior->>'version')::integer,0)+1,'profile',snap->'ruleset','rewardId',raw->'rewardId','rewardVersion',raw->'expectedRewardVersion','sourceSignificance',raw->'sourceSignificance','usablePowerCeiling',raw->'usablePowerCeiling','meaningfulnessFloor',raw->'meaningfulnessFloor','powerAggregation',raw->'powerAggregation','nonItemSignificance',raw->'nonItemSignificance','deliberateFloorException',raw->'deliberateFloorException','items',items)));
 perform rpg_private.assert(plan->'world'=snap->'world' and plan->'changes'='[]' and plan->'state'=jsonb_set(state,'{version}',to_jsonb((state->>'version')::integer+1)) and jsonb_array_length(plan->'events')=1 and plan#>>'{events,0,kind}'='reward.integrity.configured' and plan#>>'{events,0,visibility}'='private' and plan#>>'{events,0,text}'='Owner reward bounds were saved.' and plan#>'{events,0,actorIds}'='[]' and plan#>'{events,0,threadIds}'='[]');
end $$;
create function rpg_private.adventure_reward_guard(cid uuid,s jsonb,definition jsonb,plan jsonb) returns void language plpgsql stable set search_path='' as $$
declare policy jsonb:=rpg_private.adventure_reward_policy(cid,definition->>'id');assessment jsonb; entry jsonb; valuation jsonb; checked jsonb; total bigint:=0; significance bigint; usable bigint;begin
 select e->'payload' into checked from jsonb_array_elements(plan->'events') e where e->>'kind'='reward.integrity.checked' and e->>'visibility'='private';
 if policy is null then perform rpg_private.assert(checked is null);return;end if;
 perform rpg_private.assert(policy->'profile'=s->'profile' and policy->'rewardVersion'=definition->'version' and checked=policy and (select count(*)=1 from jsonb_array_elements(plan->'events') e where e->>'kind'='reward.integrity.checked'));
 perform rpg_private.assert(jsonb_array_length(policy->'items')=(select count(*) from jsonb_array_elements(definition->'entries') e where e->>'kind'='item'));
 significance:=(policy->>'nonItemSignificance')::bigint;
 for assessment in select value from jsonb_array_elements(policy->'items') loop
  select e into entry from jsonb_array_elements(definition->'entries') e where e->>'kind'='item' and e->'itemId'=assessment->'itemId';perform rpg_private.assert(entry is not null);
  select p into valuation from jsonb_array_elements(s->'itemPolicies') p where p->'itemId'=assessment->'itemId';perform rpg_private.assert(valuation->'unitValue'=assessment->'economicValue');
  if assessment->>'usability' in ('available','limited') then perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(definition->'recipientIds') recipient cross join jsonb_array_elements_text(assessment->'requiredCapabilities') capability where not exists(select 1 from rpg_private.world_foundations w cross join jsonb_array_elements(w.world->'actors') a where w.campaign_id=cid and a->>'entityId'=recipient and a->'capabilities' ? capability)));end if;
  if policy->'usablePowerCeiling'<>'null' then
   perform rpg_private.assert(assessment->'currentUsablePower'<>'null');usable:=(assessment->>'currentUsablePower')::bigint;
   if policy->>'powerAggregation'='sum' then total:=total+usable*(entry->>'quantity')::bigint;else total:=greatest(total,usable);end if;
  end if;
  significance:=greatest(significance,(assessment->>'narrativeSignificance')::bigint);
 end loop;
 if policy->'usablePowerCeiling'<>'null' then perform rpg_private.assert(total<=(policy->>'usablePowerCeiling')::bigint);end if;
 if policy->>'sourceSignificance'='meaningful' and policy->'meaningfulnessFloor'<>'null' and significance<(policy->>'meaningfulnessFloor')::bigint then perform rpg_private.assert(policy->'deliberateFloorException'<>'null');end if;
end $$;

-- Extend the existing atomic writer rather than copy it or change old manifests.
do $$ declare d text; before text; begin
 d:=pg_get_functiondef('public.rpg_world(uuid,uuid,text,jsonb,jsonb)'::regprocedure);before:=d;
 d:=replace(d,'kind in (''commerce.configure'',''progression.configure'',''progression.correct'',''reward'',''advancement'',''trade'',''prepare'')','kind in (''loot.configure'',''reward.integrity.configure'',''commerce.configure'',''progression.configure'',''progression.correct'',''reward'',''advancement'',''trade'',''prepare'')');
 d:=replace(d,'s:=plan->''state''; select loop_state into oldstate',E'perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(plan->''events'') e where (e->>''kind''=''reward.integrity.configured'' and kind<>''reward.integrity.configure'') or (e->>''kind''=''reward.integrity.checked'' and kind<>''reward'') or (e->>''kind'' in (''loot.object.configured'',''loot.object.corrected'',''loot.object.changed'') and kind<>''loot.configure'')));\n s:=plan->''state''; select loop_state into oldstate');
 d:=replace(d,'-- Rewards can only claim one already committed source, never a generated amount.',E'if kind=''reward.integrity.configure'' then perform rpg_private.adventure_reward_configuration(cid,snap,p_payload->''input'',plan); end if;\n if kind=''loot.configure'' then perform rpg_private.adventure_loot_owner(cid,snap,p_payload->''input'',plan); end if;\n -- Rewards can only claim one already committed source, never a generated amount.');
 d:=replace(d,'perform rpg_private.wave4_reward_guard(cid,oldstate,definition,plan);','perform rpg_private.adventure_reward_guard(cid,oldstate,definition,plan); perform rpg_private.wave4_reward_guard(cid,oldstate,definition,plan);');
 perform rpg_private.assert(d<>before and position('adventure_loot_owner' in d)>0 and position('adventure_reward_guard' in d)>0 and position('adventure_reward_configuration' in d)>0);execute d;
 d:=pg_get_functiondef('public.rpg_runtime_before_mega_dm(uuid,uuid,text,jsonb,jsonb)'::regprocedure);before:=d;
 d:=replace(d,'v->>''visibility''=''public'' and length(v->>''text'')', '(v->>''visibility''=''public'' or (settlement#>>''{proposal,action}''=''loot'' and v->>''visibility''=''private'' and v->>''kind'' in (''loot.object.changed'',''loot.item.transferred''))) and length(v->>''text'')');
 d:=replace(d,'rpg_private.memory_index(cid,''event'',eid,''1'',v->>''text'',''public'',t.session_id','rpg_private.memory_index(cid,case when v->>''visibility''=''private'' then ''private_event'' else ''event'' end,eid,''1'',v->>''text'',v->>''visibility'',t.session_id');
 d:=replace(d,'update rpg_private.memory_public_sources set valid_from=(settlement->>''worldMinutes'')::integer where campaign_id=cid and source_id=eid and kind=''event'';',E'update rpg_private.memory_public_sources set valid_from=(settlement->>''worldMinutes'')::integer where campaign_id=cid and source_id=eid and kind=''event'';\n update rpg_private.memory_private_sources set valid_from=(settlement->>''worldMinutes'')::integer where campaign_id=cid and source_id=eid and kind=''private_event'';');
 perform rpg_private.assert(d<>before and position('private_event' in d)>0);execute d;
end $$;
revoke all on function rpg_private.adventure_reward_policy(uuid,text),rpg_private.adventure_reward_configuration(uuid,jsonb,jsonb,jsonb),rpg_private.adventure_reward_guard(uuid,jsonb,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function rpg_private.adventure_loot_checks(uuid),rpg_private.adventure_loot_version(uuid,uuid),rpg_private.adventure_loot_owner(uuid,jsonb,jsonb,jsonb),rpg_private.adventure_loot_guard(uuid,rpg_private.turns,jsonb),rpg_private.wave4_action_guard_before_loot(uuid,rpg_private.turns,jsonb),rpg_private.wave4_action_guard(uuid,rpg_private.turns,jsonb) from public,anon,authenticated,service_role;
create function rpg_private.adventure_loot_check_target(cid uuid,t rpg_private.turns,c jsonb) returns boolean language sql stable set search_path='' as $$
 select coalesce(t.input->>'mode'='game' and t.source#>>'{snapshot,campaign,id}'=cid::text and t.checkpoint#>'{plan,publicPatches}'='[]' and t.checkpoint#>>'{plan,foundationAction,action}'='loot' and t.checkpoint#>'{plan,foundationAction,input}'=t.input->'input' and c->>'visibility'='player' and c->>'uncertainty'='meaningful' and c->'kind'=c->'stat' and exists(
  select 1 from jsonb_array_elements(coalesce(t.source->'lootChecks','[]')) pinned
  where pinned->'objectId'=c->'targetId' and pinned->'entityId'=c->'actorId' and pinned->'actorId'=t.checkpoint#>'{plan,foundationAction,intent,actorId}' and pinned->'objectId'=t.checkpoint#>'{plan,foundationAction,intent,objectId}' and pinned->'kind'=t.checkpoint#>'{plan,foundationAction,intent,kind}' and pinned->>'kind' in ('search','access') and (pinned->>'kind'='search' or pinned->'approachId'=t.checkpoint#>'{plan,foundationAction,intent,approachId}') and pinned#>'{requirement,index}'=c->'index' and pinned#>'{requirement,stat}'=c->'stat' and pinned#>'{requirement,dc}'=c->'dc' and t.source#>'{runtime,configuration,controlledEntityIds}' ? (c->>'actorId')
 ),false)
$$;
do $$ declare d text; needle text:='(entry->>''targetId'' is null or exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry->>''targetId'')::uuid))';begin
 d:=pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure);
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,'(entry->>''targetId'' is null or exists(select 1 from public.rpg_entities where campaign_id=cid and id=(entry->>''targetId'')::uuid) or rpg_private.adventure_loot_check_target(cid,turn,entry))');execute d;
end $$;
revoke all on function rpg_private.adventure_loot_check_target(uuid,rpg_private.turns,jsonb) from public,anon,authenticated,service_role;

commit;
