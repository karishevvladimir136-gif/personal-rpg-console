-- Render public mechanical outcomes as their original human-readable text.
-- Preserve immutable evidence/summary history; never expose raw outcome JSON in recaps.
begin;
create function rpg_private.memory_public_recap_entry(entry jsonb) returns text
language plpgsql immutable set search_path='' as $$
declare body text:=entry->>'text'; outcomes jsonb;
begin
 if entry#>>'{ref,kind}'='event' and body like 'Validated public outcomes: %' then
  outcomes:=substring(body from char_length('Validated public outcomes: ')+1)::jsonb;
  return (select string_agg(value->>'text',E'\n' order by n) from jsonb_array_elements(outcomes) with ordinality e(value,n));
 end if;
 return body;
end $$;
revoke all on function rpg_private.memory_public_recap_entry(jsonb) from public,anon,authenticated;
create or replace function rpg_private.memory_boundary_json(b rpg_private.memory_boundaries) returns jsonb language plpgsql stable set search_path='' as $$
declare cp rpg_private.memory_checkpoints%rowtype; resume jsonb; pending rpg_private.turns%rowtype; recap text; recap_status text;
begin
 select * into cp from rpg_private.memory_checkpoints where campaign_id=b.campaign_id and boundary_id=b.id order by created_at desc,id desc limit 1;
 resume:=cp.payload->'resume';
 select * into pending from rpg_private.turns where campaign_id=b.campaign_id and id=b.pending_operation_id;
 if pending.id is null or pending.status in ('committed','cancelled') or (pending.status='failed' and not pending.retryable) then
  resume:=resume || jsonb_build_object('pendingOperationId',null,'pendingStatus',null);
 else resume:=resume || jsonb_build_object('pendingOperationId',pending.id,'pendingStatus',pending.status); end if;
 select string_agg(text,E'\n\n' order by created_at,id,n) into recap from (
  select m.created_at,m.id,e.n,rpg_private.memory_public_recap_entry(e.value) text,
    sum(octet_length(rpg_private.memory_public_recap_entry(e.value))) over(order by m.created_at,m.id,e.n) bytes
  from public.rpg_memory_summaries m cross join lateral jsonb_array_elements(m.entries) with ordinality e(value,n)
  where m.campaign_id=b.campaign_id and m.boundary_id=b.id and m.valid and rpg_private.memory_refs_valid(b.campaign_id,m.source_refs,'public')
 ) bounded where bytes<=24000;
 recap_status:=case
  when not cp.valid then 'stale'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='failed') then 'failed'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='generating' and lease_until>now()) then 'generating'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='generating') then 'pending'
  when exists(select 1 from rpg_private.memory_jobs where campaign_id=b.campaign_id and boundary_id=b.id and visibility='public' and status='pending') then 'pending'
  when exists(select 1 from rpg_private.memory_public_sources where campaign_id=b.campaign_id and session_id=b.session_id and current and status='valid' and oversized) then 'failed'
  when exists(select 1 from rpg_private.memory_public_sources s join rpg_private.memory_state ms on ms.campaign_id=s.campaign_id where s.campaign_id=b.campaign_id and s.session_id=b.session_id and s.current and s.status='valid' and s.kind in ('scene','document','event') and s.sequence>ms.public_watermark) then 'pending'
  else 'ready' end;
 return jsonb_build_object('id',b.id,'campaign_id',b.campaign_id,'sessionId',b.session_id,'endedAt',b.ended_at,'state',b.state,'nextSessionId',b.next_session_id,
  'checkpointStatus',case when cp.valid then 'ready' else 'rebuild_required' end,'resume',resume,
  'recap',jsonb_build_object('status',recap_status,'text',recap,'canRetry',recap_status in ('pending','failed','stale')));
end $$;
commit;
