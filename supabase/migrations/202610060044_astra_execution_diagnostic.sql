-- Astra execution diagnostics are private, bounded stage markers. Historical
-- turns and immutable save manifests naturally retain a NULL marker.
alter table rpg_private.turns add column astra_diagnostic jsonb;

comment on column rpg_private.turns.astra_diagnostic is
  'Server-owned Astra stage/phase only; never provider text, prompts, or private prose.';

-- Add one service-only action while preserving the effective post-43 runtime
-- and all legacy, natural-combat, takeover, and Astra commit guards beneath it.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_diagnostic;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare t rpg_private.turns%rowtype; diagnostic jsonb; prior jsonb;
  stages constant text[]:=array['plan','final_validated','final_checkpoint','narration_context',
    'narration_provider','narration_parse','narration_safety',
    'narration_checkpoint','commit']; next_rank integer; prior_rank integer;
begin
  if p_action<>'astra_diagnostic' then
    return public.rpg_runtime_before_astra_diagnostic(p_owner_id,p_campaign_id,
      p_action,p_payload,p_timeline);
  end if;
  if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
    where user_id=p_owner_id) then
    raise exception 'rpg_forbidden' using errcode='42501';
  end if;
  perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.timeline_assert(p_campaign_id,p_timeline,true);
  perform rpg_private.fields(p_payload,
    array['campaignId','operationId','token','expectedRevision','diagnostic']);
  diagnostic:=p_payload->'diagnostic';
  perform rpg_private.fields(diagnostic,array['stage','phase',
    'providerResponseReceived','narrationParseSucceeded','failureCategory']);
  next_rank:=array_position(stages,diagnostic->>'stage');
  perform rpg_private.assert(next_rank is not null and
    diagnostic->>'phase' in ('entered','completed','failed') and
    jsonb_typeof(diagnostic->'providerResponseReceived')='boolean' and
    jsonb_typeof(diagnostic->'narrationParseSucceeded')='boolean' and
    (diagnostic->'narrationParseSucceeded'='false'::jsonb or
      diagnostic->'providerResponseReceived'='true'::jsonb) and
    (diagnostic->>'phase'='failed')=(diagnostic->>'failureCategory' is not null) and
    (diagnostic->>'failureCategory' is null or
      diagnostic->>'failureCategory' in ('configuration','provider','context',
        'validation','conflict','unavailable')));
  select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid
    and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
  if t.id is null then raise exception 'rpg_not_found'; end if;
  perform rpg_private.assert(p_payload->>'campaignId'=p_campaign_id::text and
    t.runtime_identity='astra-primary-v1' and t.status in ('pending','generating') and
    t.lease_token=(p_payload->>'token')::uuid and t.lease_until>now() and
    t.expected_revision=(p_payload->>'expectedRevision')::integer and
    t.source is not null);
  prior:=t.astra_diagnostic;
  prior_rank:=array_position(stages,prior->>'stage');
  perform rpg_private.assert(prior is null or
    (prior_rank is not null and next_rank>=prior_rank and
      (next_rank>prior_rank or diagnostic=prior or
        (prior->>'phase'='entered' and diagnostic->>'phase' in ('completed','failed')))));
  update rpg_private.turns set astra_diagnostic=diagnostic,updated_at=now()
    where id=t.id and campaign_id=p_campaign_id;
  return null;
end $$;

revoke all on function public.rpg_runtime_before_astra_diagnostic(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;
