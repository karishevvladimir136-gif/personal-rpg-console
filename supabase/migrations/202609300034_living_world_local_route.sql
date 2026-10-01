-- A committed mundane authoring turn is the only additional local travel
-- authority. Routes are derived from the active projection, never persisted.
begin;

create function rpg_private.living_world_local_route(uid uuid,cid uuid,actor_id uuid,from_id uuid,to_id uuid) returns boolean
language sql stable set search_path='' as $$
 select exists(
  select 1
  from public.rpg_public_state ps
  join public.rpg_locations origin on origin.campaign_id=cid and origin.id=from_id and origin.status in ('known','visited')
  join public.rpg_locations destination on destination.campaign_id=cid and destination.id=to_id and destination.status in ('known','visited')
  join rpg_private.turns authored on authored.campaign_id=cid and authored.owner_id=uid and authored.status='committed' and authored.input->>'mode'='game'
  cross join lateral (select authored.checkpoint->'worldLogic' proposal) proof
  join public.rpg_entities entity on entity.campaign_id=cid and entity.id=actor_id
  where ps.campaign_id=cid and ps.current_location_id=from_id and from_id<>to_id
   and proof.proposal->'schemaVersion'='3'::jsonb
   and proof.proposal->>'kind'='location.establish'
   and proof.proposal->>'uncertainty'='resolved'
   and proof.proposal->>'actorId'=actor_id::text
   and proof.proposal->>'vicinity' in ('nearby','same_street')
   and proof.proposal->'destinationId'='null'::jsonb
   and proof.proposal->'evidenceIndexes'='[]'::jsonb
   and proof.proposal->>'input'=authored.input->>'input'
   and authored.source->>'ownerId'=uid::text
   and authored.source#>>'{snapshot,campaign,id}'=cid::text
   and authored.source#>>'{snapshot,publicState,current_location_id}'=proof.proposal->>'anchorLocationId'
   and proof.proposal->'circumstanceRefs'=jsonb_build_array('location:'||(proof.proposal->>'anchorLocationId'))
   and (entity.kind='player' or authored.source#>'{runtime,configuration,controlledEntityIds}' ? actor_id::text)
   and (
    (proof.proposal->>'anchorLocationId'=from_id::text and rpg_private.wave4_id(authored.id,'living-world:location')=to_id)
    or
    (proof.proposal->>'anchorLocationId'=to_id::text and rpg_private.wave4_id(authored.id,'living-world:location')=from_id)
   )
 );
$$;
revoke all on function rpg_private.living_world_local_route(uuid,uuid,uuid,uuid,uuid) from public,anon,authenticated,service_role;

-- Replace only the Wave 3 v2 move route assertion. The rest of the existing
-- validator, including its actor, settlement and consequence checks, remains.
do $$ declare d text; needle text; replacement text; begin
 d:=pg_get_functiondef('rpg_private.world_validate_settlement(uuid,uuid,jsonb,rpg_private.turns)'::regprocedure);
 needle:='proposal->''capabilityRefs'' ? route and exists(select 1 from jsonb_array_elements(w->''actors'') actor where actor->>''entityId''=proposal->>''actorId'' and actor->''capabilities'' ? route)';
 replacement:='((proposal->''capabilityRefs'' ? route and exists(select 1 from jsonb_array_elements(w->''actors'') actor where actor->>''entityId''=proposal->>''actorId'' and actor->''capabilities'' ? route)) or rpg_private.living_world_local_route(uid,cid,(proposal->>''actorId'')::uuid,(select current_location_id from public.rpg_public_state where campaign_id=cid),(proposal->>''destinationId'')::uuid))';
 perform rpg_private.assert(length(d)-length(replace(d,needle,''))=length(needle) and position('living_world_local_route' in d)=0);
 execute replace(d,needle,replacement);
end $$;

-- A separate service-only read returns bounded current actor/destination
-- pairs. The existing World read response remains byte-for-byte unchanged.
do $$ declare d text; needle text; replacement text; begin
 d:=pg_get_functiondef('public.rpg_world(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
 needle:='if p_action not in (''loop_read'',''loop_receipt'',''loop_commit'') then';
 replacement:=$replacement$
 if p_action='local_routes' then
  perform rpg_private.fields(p_payload,'{}');
  result:=public.rpg_world_wave3(p_owner_id,cid,'read','{}'::jsonb,p_timeline);
  return (
    select coalesce(jsonb_agg(jsonb_build_object('actorId',routes.actor_id,'destinationId',routes.destination_id) order by routes.actor_id,routes.destination_id),'[]'::jsonb)
    from (
     select distinct (actor->>'entityId')::uuid actor_id, location.id destination_id
     from jsonb_array_elements(coalesce(result->'world'->'actors','[]'::jsonb)) actor
     join public.rpg_public_state ps on ps.campaign_id=cid
     join public.rpg_locations location on location.campaign_id=cid and location.status in ('known','visited') and location.id<>ps.current_location_id
     where actor->>'control'='player' and actor->>'entityId' is not null
      and rpg_private.living_world_local_route(p_owner_id,cid,(actor->>'entityId')::uuid,ps.current_location_id,location.id)
    ) routes
   );
 end if;
 if p_action not in ('loop_read','loop_receipt','loop_commit') then
$replacement$;
 perform rpg_private.assert(length(d)-length(replace(d,needle,''))=length(needle) and position('local_routes' in d)=0);
 execute replace(d,needle,replacement);
end $$;

commit;
