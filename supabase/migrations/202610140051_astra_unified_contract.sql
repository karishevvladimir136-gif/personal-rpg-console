-- Pin response semantics when literal input is durably saved. Historical/null
-- values, including immutable old save manifests, retain two-stage Astra play.
begin;

alter table rpg_private.turns add column astra_response_contract text
  check (astra_response_contract is null or astra_response_contract='unified-v1');
alter table rpg_private.turns add column astra_response_mode text
  check (astra_response_mode is null or (astra_response_contract is not distinct from 'unified-v1' and
    astra_response_mode in ('public-unified','private-informed')));

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_unified_contract;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare t rpg_private.turns%rowtype; result jsonb; requested text;
begin
  if p_action not in ('begin','claim','astra_contract','astra_response_mode',
      'astra_tool','checkpoint','commit') then
    return public.rpg_runtime_before_astra_unified_contract(p_owner_id,p_campaign_id,
      p_action,p_payload,p_timeline);
  end if;
  if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
    where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
  perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action not in ('astra_contract','claim'));
  select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid
    and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
  if p_action='astra_contract' then
    perform rpg_private.fields(p_payload,array['operationId']);
    return case when t.id is null then 'null'::jsonb
      else to_jsonb(coalesce(t.astra_response_contract,'legacy-two-stage')) end;
  end if;
  if p_action='astra_response_mode' then
    perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','mode']);
    requested:=p_payload->>'mode';
    perform rpg_private.assert(t.id is not null and
      t.runtime_identity='astra-primary-v1' and t.astra_response_contract='unified-v1' and
      requested in ('public-unified','private-informed') and
      p_payload->>'campaignId'=p_campaign_id::text and t.status in ('pending','generating') and
      t.source is not null and t.lease_token=(p_payload->>'token')::uuid and t.lease_until>now() and
      t.expected_revision=(p_payload->>'expectedRevision')::integer and
      t.expected_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id));
    if t.astra_response_mode is not null then
      if t.astra_response_mode<>requested then raise exception 'rpg_conflict'; end if;
      return to_jsonb(t.astra_response_mode);
    end if;
    perform rpg_private.assert(t.checkpoint#>'{astraPrimary,finalProposal}'='null'::jsonb and
      jsonb_array_length(t.checkpoint#>'{astraPrimary,toolReceipts}')=0);
    update rpg_private.turns set astra_response_mode=requested where id=t.id and campaign_id=p_campaign_id;
    return to_jsonb(requested);
  end if;
  if p_action='begin' then
    requested:=p_payload->>'serverAstraContract';
    perform rpg_private.assert(requested is null or (requested='unified-v1' and
      p_payload->>'serverRuntime'='astra-primary-v1' and p_payload->>'mode'='game'));
    if t.id is not null and t.astra_response_contract is distinct from requested then
      raise exception 'rpg_conflict';
    end if;
    result:=public.rpg_runtime_before_astra_unified_contract(p_owner_id,p_campaign_id,
      p_action,p_payload-'serverAstraContract',p_timeline);
    if t.id is null and requested is not null then
      update rpg_private.turns set astra_response_contract=requested
        where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id
          and owner_id=p_owner_id and runtime_identity='astra-primary-v1';
      perform rpg_private.assert(found);
    end if;
    return result;
  end if;
  if p_action in ('astra_tool','checkpoint','commit') then
    if t.astra_response_contract='unified-v1' and
      (p_action in ('astra_tool','commit') or
        nullif(p_payload#>'{checkpoint,astraPrimary,finalProposal}','null') is not null) then
      perform rpg_private.assert(t.astra_response_mode in ('public-unified','private-informed'));
    end if;
    return public.rpg_runtime_before_astra_unified_contract(p_owner_id,p_campaign_id,
      p_action,p_payload,p_timeline);
  end if;
  result:=public.rpg_runtime_before_astra_unified_contract(p_owner_id,p_campaign_id,
    p_action,p_payload,p_timeline);
  if result is null then return null; end if;
  return result||jsonb_build_object('astraResponseContract',t.astra_response_contract,
    'astraResponseMode',t.astra_response_mode);
end $$;

revoke all on function public.rpg_runtime_before_astra_unified_contract(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;

commit;
