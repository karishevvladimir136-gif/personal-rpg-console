-- Session 2 fix: a dm-loop-v1 turn that runs longer than its claim lease (sandbox, 2026-10-20).
--   The claim sets lease_until = now()+300 s and nothing renewed it. A turn of 5.1 minutes (ten
--   Opus requests at xhigh) then hit the expired lease at the commit AND at the failure that
--   followed it (both rpg_conflict), so the row stayed 'generating' forever.
--   Every fenced write of a dm-loop-v1 turn — a tool receipt, a checkpoint, the commit, the
--   failure — now renews the lease first, while the claimant still holds it. The lease token is
--   the fence: a new claim replaces it, and a cancel, a timeline switch or any end of the turn
--   clears it, so a write that carries the current token can only come from the current claimant.
--   An expired lease still lets another claim take the turn over (a retry); from then on the old
--   claimant's token no longer matches and every write of it fails exactly as before.
-- Additive only: one wrapper over the current entry point; no column, row or function removed.
begin;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_turn_lease;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare op uuid; token uuid;
begin
 if p_action in ('dm_tool','checkpoint','commit','fail') and jsonb_typeof(p_payload)='object' and
   p_payload->>'operationId' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' and
   p_payload->>'token' ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' and
   p_owner_id is not null and exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then
   op:=(p_payload->>'operationId')::uuid;
   token:=(p_payload->>'token')::uuid;
   -- The lock order of every runtime action: the campaign first, then the turn.
   perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
   -- The renewal is part of this call's transaction: a write the entry point then refuses
   -- (fence, revision, status, validation) leaves the lease as it was.
   update rpg_private.turns set lease_until=now()+interval '300 seconds'
     where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id
       and runtime_identity='dm-loop-v1' and status in ('pending','generating')
       and lease_token is not null and lease_token=token;
 end if;
 return public.rpg_runtime_before_turn_lease(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
end $$;

revoke all on function public.rpg_runtime_before_turn_lease(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
