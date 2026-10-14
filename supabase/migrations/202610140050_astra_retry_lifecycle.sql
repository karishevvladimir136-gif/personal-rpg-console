-- A claimed retry of a failed Astra turn is a new leased execution attempt.
-- Keep its exact operation, source, checkpoint, checks, receipts and outcome
-- pins; reset only attempt status and diagnostics before provider work resumes.
begin;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_retry_lifecycle;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; t rpg_private.turns%rowtype; op uuid;
begin
  result:=public.rpg_runtime_before_astra_retry_lifecycle(p_owner_id,p_campaign_id,
    p_action,p_payload,p_timeline);
  if p_action<>'claim' or result is null then return result; end if;
  op:=(p_payload->>'operationId')::uuid;
  select * into t from rpg_private.turns where id=op and campaign_id=p_campaign_id
    and owner_id=p_owner_id for update;
  -- Migration 48 already promotes failed schema-2 ordered-effect claims. Its
  -- returned row is generating, so this branch covers the other Astra pins.
  if t.runtime_identity is distinct from 'astra-primary-v1' or t.status<>'failed' or
    not t.retryable then return result; end if;
  perform rpg_private.assert(t.input->>'mode'='game' and
    t.checkpoint#>'{astraPrimary,schemaVersion}'='1'::jsonb and
    t.source is not null and t.lease_token=(result#>>'{lease,token}')::uuid and
    t.lease_until>now() and
    t.expected_revision=(result#>>'{lease,expectedRevision}')::integer);
  update rpg_private.turns set status='generating',failure=null,retryable=false,
    astra_diagnostic=null where id=op and campaign_id=p_campaign_id
      and owner_id=p_owner_id and status='failed' and retryable
      and lease_token=t.lease_token and lease_until>now() returning * into t;
  perform rpg_private.assert(t.id=op);
  return jsonb_set(result,'{turn,public}',rpg_private.timeline_stamp(
    rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id)));
end $$;

revoke all on function public.rpg_runtime_before_astra_retry_lifecycle(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;

commit;
