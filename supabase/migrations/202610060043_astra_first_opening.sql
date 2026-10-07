-- The approved structured opening and its existing Astra takeover are one
-- private transaction. A failed handoff rolls back the opening and receipt.
-- Older and narrative bootstraps keep their existing authority and routing.
begin;

alter function public.rpg_bootstrap(uuid,uuid,text,jsonb)
  rename to rpg_bootstrap_before_astra_first;

create function public.rpg_bootstrap(p_owner_id uuid,p_campaign_id uuid,
  p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb; hero uuid; sheet jsonb; opening uuid;
  state public.rpg_public_state%rowtype;
  rt rpg_private.runtime_state%rowtype;
  wf rpg_private.world_foundations%rowtype;
  tc rpg_private.timeline_campaigns%rowtype;
  tl rpg_private.timelines%rowtype;
  fence jsonb; takeover_request uuid; event_head bigint;
  takeover jsonb; approved_before boolean:=false;
begin
  if p_action='creation_replay_status' then
    if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
        where user_id=p_owner_id) then
      raise exception 'rpg_forbidden' using errcode='42501';
    end if;
    perform rpg_private.assert(p_campaign_id is null and
      jsonb_typeof(p_payload)='object' and
      octet_length(p_payload::text)<=131072);
    perform rpg_private.fields(p_payload,array['requestId','draftId','review']);
    return jsonb_build_object('approved',exists(
      select 1 from rpg_private.library_commands c
      where c.owner_id=p_owner_id and
        c.id=rpg_private.wave4_id((p_payload->>'draftId')::uuid,
          'bootstrap:approved') and
        c.request=jsonb_build_object('kind','creation','phase','commit',
          'input',p_payload)));
  end if;
  if p_action='astra_first_status' then
    if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
        where user_id=p_owner_id) then
      raise exception 'rpg_forbidden' using errcode='42501';
    end if;
    if p_campaign_id is null or not exists(select 1 from public.rpg_campaigns
        where id=p_campaign_id) then raise exception 'rpg_not_found'; end if;
    perform rpg_private.fields(p_payload,array['timeline']);
    perform rpg_private.assert(p_payload->'timeline' is not null);
    perform rpg_private.timeline_assert(p_campaign_id,p_payload->'timeline',true);
    perform rpg_private.assert(exists(select 1
      from rpg_private.timeline_campaigns timeline_campaign_row
      join rpg_private.timelines timeline_row
        on timeline_row.campaign_id=timeline_campaign_row.campaign_id
        and timeline_row.id=timeline_campaign_row.active_timeline_id
      where timeline_campaign_row.campaign_id=p_campaign_id and
        timeline_row.purpose='playable'));
    return jsonb_build_object('approvedOpening',exists(
      select 1 from rpg_private.world_events e
      join rpg_private.world_commands c on c.campaign_id=e.campaign_id
        and c.id=rpg_private.wave4_id(e.operation_id,'bootstrap:approved')
      join public.rpg_scenes s on s.campaign_id=e.campaign_id
        and s.id::text=e.event#>>'{payload,sceneId}'
      where e.campaign_id=p_campaign_id and
        e.event->>'kind'='adventure.opening' and
        e.event->>'visibility'='public' and
        e.event#>>'{payload,classification}'='campaign_authored_opening' and
        c.request->>'kind'='opening' and c.request->>'phase'='commit' and
        c.request#>>'{input,campaignId}'=p_campaign_id::text and
        c.request#>>'{input,draftId}'=e.operation_id::text and
        c.result->>'requestId'=c.request#>>'{input,requestId}'));
  end if;
  if p_action='opening.commit' then
    approved_before:=exists(select 1 from rpg_private.world_commands c
      where c.campaign_id=p_campaign_id and
        c.id=rpg_private.wave4_id((p_payload->>'draftId')::uuid,
          'bootstrap:approved'));
  end if;
  result:=public.rpg_bootstrap_before_astra_first(p_owner_id,p_campaign_id,
    p_action,p_payload);
  if p_action<>'opening.commit' then return result; end if;
  -- An approval receipt already in the active save is intentional legacy
  -- history. Replaying it cannot cross a restored pre-takeover boundary.
  if approved_before then return result; end if;

  -- The reviewed v2 public sheet identifies the new structured bootstrap.
  -- Old characters have NULL here; narrative characters have no mechanics.
  select e.id,e.character_sheet into hero,sheet from public.rpg_entities e
    where e.campaign_id=p_campaign_id and e.kind='player';
  if coalesce(sheet->>'mode','')<>'structured_rpg' then return result; end if;
  perform rpg_private.assert((select count(*) from public.rpg_entities e
      where e.campaign_id=p_campaign_id and e.kind='player')=1 and
    exists(select 1 from rpg_private.world_events e
      where e.campaign_id=p_campaign_id and
        e.event->>'kind'='campaign.bootstrap.created' and
        e.event#>>'{payload,heroId}'=hero::text and
        e.event#>>'{payload,original,output,schemaVersion}'='2'));

  select * into strict wf from rpg_private.world_foundations
    where campaign_id=p_campaign_id for update;
  if wf.astra_takeover is not null then
    perform rpg_private.assert(wf.astra_takeover->>'runtime'='astra-primary-v1');
    return result;
  end if;
  -- A structured campaign approved before this migration may already have
  -- legacy gameplay. Preserve its exact old approval receipt and routing;
  -- only a genuinely fresh opening becomes Astra-first automatically.
  if exists(select 1 from rpg_private.turns t
      where t.campaign_id=p_campaign_id and t.input->>'mode'='game') then
    return result;
  end if;

  opening:=(p_payload->>'draftId')::uuid;
  select * into strict state from public.rpg_public_state
    where campaign_id=p_campaign_id for update;
  select * into strict rt from rpg_private.runtime_state
    where campaign_id=p_campaign_id for update;
  select * into strict tc from rpg_private.timeline_campaigns
    where campaign_id=p_campaign_id for update;
  select * into strict tl from rpg_private.timelines
    where campaign_id=p_campaign_id and id=tc.active_timeline_id for update;
  perform rpg_private.assert(state.current_scene_id=
      rpg_private.wave4_id(opening,'bootstrap:opening') and
    state.current_location_id=
      rpg_private.wave4_id(opening,'bootstrap:location') and
    tl.purpose='playable' and
    rt.configuration->>'profile'='console-basic-v1' and
    rt.configuration->'controlledEntityIds'=jsonb_build_array(hero) and
    rt.configuration->'presentEntityIds' ? hero::text);

  fence:=rpg_private.timeline_fence(p_campaign_id);
  takeover_request:=rpg_private.wave4_id(opening,
    'astra-first:takeover:'||tc.active_timeline_id::text||':'||tc.epoch::text);
  select coalesce(max(sequence),0) into event_head
    from rpg_private.world_events where campaign_id=p_campaign_id;
  takeover:=jsonb_build_object('requestId',takeover_request,
    'campaignId',p_campaign_id,'timeline',fence,
    'expectedRuntimeRevision',rt.revision,
    'expectedWorldRevision',wf.revision,
    'expectedPublicRevision',state.revision,
    'expectedHeadId',tl.head_manifest_id,
    'expectedWorldDigest',encode(sha256(convert_to(wf.world::text,'UTF8')),'hex'),
    'expectedWorldEventSequence',event_head);
  perform public.rpg_runtime(p_owner_id,p_campaign_id,'astra_takeover',
    takeover,fence);
  return result;
end $$;

-- The application can only call the atomic wrapper. The renamed original is
-- a private implementation detail, not a service-role bypass.
revoke all on function public.rpg_bootstrap_before_astra_first(uuid,uuid,text,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_bootstrap(uuid,uuid,text,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_bootstrap(uuid,uuid,text,jsonb)
  to service_role;
commit;
