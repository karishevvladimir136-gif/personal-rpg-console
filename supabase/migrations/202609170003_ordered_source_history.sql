-- Phase 1 foundations for MASTER_SPEC section 38, with no memory/runtime features.
-- Separate sequence domains keep private audit order out of public record numbering.
begin;

alter table public.rpg_scenes add column sequence bigint;
alter table public.rpg_dm_feedback add column sequence bigint;
alter table rpg_private.mutation_receipts add column sequence bigint;

-- Existing rows predate authoritative numeric ordering. Establish one deterministic
-- baseline without claiming to recover lost commit order from tied timestamps.
with ordered as (
  select id,row_number() over(order by created_at,id) as n from public.rpg_scenes
) update public.rpg_scenes s set sequence=o.n from ordered o where o.id=s.id;

alter table public.rpg_dm_feedback disable trigger immutable_feedback;
with ordered as (
  select id,row_number() over(order by created_at,id) as n from public.rpg_dm_feedback
) update public.rpg_dm_feedback f set sequence=o.n from ordered o where o.id=f.id;
alter table public.rpg_dm_feedback enable trigger immutable_feedback;

with ordered as (
  select request_id,row_number() over(order by created_at,request_id) as n from rpg_private.mutation_receipts
) update rpg_private.mutation_receipts r set sequence=o.n from ordered o where o.request_id=r.request_id;

do $$ declare qualified text; first_unused bigint; identity_sequence text; begin
  foreach qualified in array array['public.rpg_scenes','public.rpg_dm_feedback','rpg_private.mutation_receipts'] loop
    execute format('select coalesce(max(sequence),0)+1 from %s',qualified) into first_unused;
    execute format('alter table %s alter column sequence set not null',qualified);
    execute format('alter table %s alter column sequence add generated always as identity (start with %s)',qualified,first_unused);
    execute format('alter table %s add constraint source_sequence_safe check (sequence between 1 and 9007199254740991)',qualified);
    execute format('alter table %s add unique(sequence)',qualified);
    identity_sequence := pg_get_serial_sequence(qualified,'sequence');
    execute format('revoke all on sequence %s from public,anon,authenticated',identity_sequence);
  end loop;
end $$;

create index rpg_scenes_campaign_sequence on public.rpg_scenes(campaign_id,sequence);
create index rpg_feedback_campaign_sequence on public.rpg_dm_feedback(campaign_id,sequence);
create index rpg_receipts_campaign_sequence on rpg_private.mutation_receipts(campaign_id,sequence);

create function rpg_private.preserve_scene_sequence() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.sequence is distinct from old.sequence then
    raise exception 'rpg_immutable_source_order' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger preserve_scene_sequence before update on public.rpg_scenes for each row execute function rpg_private.preserve_scene_sequence();
create trigger immutable_mutation_receipts before update or delete on rpg_private.mutation_receipts for each row execute function rpg_private.immutable_history();
revoke all on function rpg_private.preserve_scene_sequence() from public,anon,authenticated;

-- Original/corrected manual payloads and resulting revisions remain immutable in
-- receipts, linked by campaign_id, request_id and result.id. Existing RPCs allocate
-- identities only in their INSERTs; scene updates preserve the original sequence.
-- Numeric order is not contiguous: retries/failed inserts can leave identity gaps.
commit;
