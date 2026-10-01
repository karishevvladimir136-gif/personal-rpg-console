-- One ordinary public Location may be authored by a checkpointed World Logic
-- turn without a World settlement. The existing settlement branch is intact.
begin;

create function rpg_private.living_world_validate_mundane(uid uuid,cid uuid,t rpg_private.turns,packet jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare p jsonb:=t.checkpoint->'worldLogic'; source jsonb:=t.source; current_id uuid; anchor public.rpg_locations%rowtype;
 place_name text; category text; vicinity text; description text; expected jsonb; location_id uuid; language text; label text;
begin
 perform rpg_private.assert(t.id is not null and t.owner_id=uid and t.campaign_id=cid and t.input->>'mode'='game' and source->>'ownerId'=uid::text and source#>>'{snapshot,campaign,id}'=cid::text);
 perform rpg_private.fields(p,array['schemaVersion','actorId','input','uncertainty','circumstanceRefs','evidenceIndexes','kind','anchorLocationId','destinationId','name','category','vicinity']);
 perform rpg_private.assert(p->'schemaVersion'='3'::jsonb and jsonb_typeof(p->'actorId')='string' and jsonb_typeof(p->'input')='string' and jsonb_typeof(p->'anchorLocationId')='string' and jsonb_typeof(p->'name')='string' and jsonb_typeof(p->'category')='string' and jsonb_typeof(p->'vicinity')='string' and p->>'kind'='location.establish' and p->>'uncertainty'='resolved' and p->'input'=t.input->'input' and p->'evidenceIndexes'='[]' and p->'destinationId'='null');
 perform rpg_private.assert(t.checkpoint->'checks'='[]' and t.checkpoint#>'{plan,publicPatches}'='[]' and t.checkpoint#>'{plan,privatePatches}'='[]' and nullif(t.checkpoint->'foundationAction','null') is null and nullif(t.checkpoint->'foundationSettlement','null') is null and nullif(t.checkpoint#>'{plan,foundationAction}','null') is null);
 perform rpg_private.assert(packet->'privatePatches'='[]' and packet->'checks'='[]' and nullif(packet->'worldSettlement','null') is null and nullif(packet->'foundationSettlement','null') is null and not exists(select 1 from rpg_private.world_stages where campaign_id=cid and id=t.id));
 perform rpg_private.assert((select ruleset->>'id'='world-logic-v1' and world is not null from rpg_private.world_foundations where campaign_id=cid));
 perform rpg_private.assert(exists(select 1 from public.rpg_entities e where e.campaign_id=cid and e.id=(p->>'actorId')::uuid and (e.kind='player' or source#>'{runtime,configuration,controlledEntityIds}' ? e.id::text)));
 current_id:=(source#>>'{snapshot,publicState,current_location_id}')::uuid;
 perform rpg_private.assert(current_id is not null and p->>'anchorLocationId'=current_id::text and p->'circumstanceRefs'=jsonb_build_array('location:'||current_id::text) and (select current_location_id=current_id from public.rpg_public_state where campaign_id=cid));
 select * into anchor from public.rpg_locations where campaign_id=cid and id=current_id and status in ('known','visited');
 perform rpg_private.assert(anchor.id is not null and exists(select 1 from jsonb_array_elements(source#>'{snapshot,locations}') x where x->>'id'=anchor.id::text and x->>'name'=anchor.name and x->>'status'=anchor.status and (x->>'revision')::integer=anchor.revision));
 place_name:=p->>'name'; category:=p->>'category'; vicinity:=p->>'vicinity'; language:=source#>>'{snapshot,campaign,language}';
 perform rpg_private.assert(place_name is not null and length(place_name) between 1 and 120 and place_name ~ '^[[:alnum:]][[:alnum:] .''-]*$' and place_name=btrim(place_name) and category in ('tavern','inn','blacksmith','brothel','bathhouse','stable','market_stall','street','alley','shop') and vicinity in ('nearby','same_street'));
 perform rpg_private.assert(not exists(select 1 from public.rpg_locations l where l.campaign_id=cid and lower(l.name)=lower(place_name)));
 label:=replace(category,'_',' ');
 if language='ru' then
  label:=case category when 'tavern' then 'таверна' when 'inn' then 'постоялый двор' when 'blacksmith' then 'кузница' when 'brothel' then 'бордель' when 'bathhouse' then 'баня' when 'stable' then 'конюшня' when 'market_stall' then 'рыночная лавка' when 'street' then 'улица' when 'alley' then 'переулок' when 'shop' then 'магазин' end;
  description:='Обычное общественное место ('||label||') '||case vicinity when 'same_street' then 'на той же улице, что и' else 'рядом с' end||' '||anchor.name||'.';
 else
  description:='An ordinary public '||label||' '||case vicinity when 'same_street' then 'on the same street as' else 'near' end||' '||anchor.name||'.';
 end if;
 location_id:=rpg_private.wave4_id(t.id,'living-world:location');
 perform rpg_private.assert(not exists(select 1 from public.rpg_locations where id=location_id));
 expected:=jsonb_build_object('family','locations','id',location_id,'expectedRevision',null,'values',jsonb_build_object('name',place_name,'description',description,'status','known'));
 perform rpg_private.fields(packet->'resolution',array['changes','worldMinutes','configuration','outcomes']);
 perform rpg_private.assert(packet#>'{resolution,changes}'=jsonb_build_array(expected) and packet#>'{resolution,worldMinutes}'=source#>'{runtime,worldMinutes}' and packet#>'{resolution,configuration}'=source#>'{runtime,configuration}' and packet#>'{resolution,outcomes}'=jsonb_build_array(jsonb_build_object('kind','living.location.established','entityIds',jsonb_build_array(p->'actorId'),'itemIds','[]'::jsonb,'text',place_name||'. '||description)));
 return true;
end $$;
revoke all on function rpg_private.living_world_validate_mundane(uuid,uuid,rpg_private.turns,jsonb) from public,anon,authenticated,service_role;

-- Amend only the checkpointed World Logic commit guard. CASE ensures the
-- existing staged-settlement branch never invokes the mundane validator.
do $$ declare d text; old text; needle text; replacement text; begin
 d:=pg_get_functiondef('public.rpg_runtime_wave3(uuid,uuid,text,jsonb,jsonb)'::regprocedure); old:=d;
 needle:='jsonb_typeof(p_payload#>''{packet,worldSettlement}'')=''object'' and exists(select 1 from rpg_private.world_stages where campaign_id=p_campaign_id and id=t.id)';
 replacement:='case when jsonb_typeof(p_payload#>''{packet,worldSettlement}'')=''object'' and exists(select 1 from rpg_private.world_stages where campaign_id=p_campaign_id and id=t.id) then true else rpg_private.living_world_validate_mundane(p_owner_id,p_campaign_id,t,p_payload->''packet'') end';
 perform rpg_private.assert(position(needle in d)>0 and position('living_world_validate_mundane' in d)=0);
 d:=replace(d,needle,replacement);
 perform rpg_private.assert(d<>old);
 execute d;
end $$;

commit;
