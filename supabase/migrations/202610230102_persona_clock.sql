-- Persona memory 2, Part E (docs/stages/PERSONA_MEMORY_2.md): the clock with a memory — the persona's timers and its
-- calibration table (predicted vs actual). Additive only: two new tables in the persona_memory schema and a second
-- RPC, public.persona_clock, beside public.persona_memory (unchanged). A timer is closed once and otherwise never
-- changes; a calibration row is never updated or deleted (a miss is never forgotten) — the triggers refuse it. The
-- RPC is executable by service_role only.
begin;

create table persona_memory.timers (
  id text primary key check (id ~ '^tm_[a-z0-9_]{6,80}$'),
  owner_id uuid not null references auth.users(id),
  name text not null check (length(btrim(name)) between 1 and 80),
  started_at timestamptz not null,
  predicted_finish timestamptz not null,
  time_zone text not null check (length(time_zone) between 1 and 64),
  note jsonb not null default '[]' check (persona_memory.lines_valid(note,0,1,1000,false)),
  recorded_at timestamptz not null,
  finished_at timestamptz,
  source text not null check (length(source) between 1 and 200),
  check (predicted_finish > started_at),
  check (finished_at is null or finished_at >= started_at)
);
-- One running timer per name.
create unique index persona_timers_running on persona_memory.timers(owner_id, lower(name)) where finished_at is null;

create table persona_memory.calibration (
  id text primary key check (id ~ '^cal_[a-z0-9_]{6,80}$'),
  owner_id uuid not null references auth.users(id),
  timer_id text unique references persona_memory.timers(id),
  name text not null check (length(btrim(name)) between 1 and 80),
  text text not null check (length(btrim(text)) between 1 and 1000),
  author text not null check (author in ('self','background','owner')),
  tag text not null check (tag in ('stated','observed','inferred')),
  started_at timestamptz,
  predicted_finish timestamptz,
  actual_finish timestamptz,
  predicted_minutes numeric not null check (predicted_minutes > 0),
  actual_minutes numeric not null check (actual_minutes >= 0),
  notes jsonb not null default '[]' check (persona_memory.lines_valid(notes,0,3,1200,false)),
  recorded_at timestamptz not null,
  source text not null check (length(source) between 1 and 200),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  -- A timed row has the timer's moments; a seeded row (from the owner's notes) has none.
  check ((timer_id is null and started_at is null and predicted_finish is null and actual_finish is null)
    or (timer_id is not null and started_at is not null and predicted_finish is not null and actual_finish is not null and actual_finish >= started_at))
);
create index persona_calibration_moment on persona_memory.calibration(owner_id, recorded_at);

alter table persona_memory.timers enable row level security;
alter table persona_memory.calibration enable row level security;
revoke all on persona_memory.timers, persona_memory.calibration from public, anon, authenticated;

-- A timer is finished once; nothing else about it changes.
create function persona_memory.timer_close_only() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.finished_at is not null or new.finished_at is null or (to_jsonb(new) - 'finished_at') is distinct from (to_jsonb(old) - 'finished_at')
 then raise exception 'persona_immutable' using errcode='22023'; end if;
 return new;
end $$;
create trigger persona_timer_close_only before update on persona_memory.timers for each row execute function persona_memory.timer_close_only();

-- The calibration table only grows: a row is never updated or deleted.
create function persona_memory.calibration_append_only() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'persona_immutable' using errcode='22023'; end $$;
create trigger persona_calibration_append_only before update or delete on persona_memory.calibration for each row execute function persona_memory.calibration_append_only();

create function persona_memory.timer_json(t persona_memory.timers) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',t.id,'name',t.name,'startedAt',persona_memory.iso(t.started_at),'predictedFinish',persona_memory.iso(t.predicted_finish),
  'timeZone',t.time_zone,'note',case when jsonb_array_length(t.note)=0 then null else t.note->0 end,'recordedAt',persona_memory.iso(t.recorded_at),
  'finishedAt',persona_memory.iso(t.finished_at),'source',t.source)
$$;

create function persona_memory.calibration_json(c persona_memory.calibration) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',c.id,'timerId',c.timer_id,'name',c.name,'text',c.text,'author',c.author,'tag',c.tag,'startedAt',persona_memory.iso(c.started_at),
  'predictedFinish',persona_memory.iso(c.predicted_finish),'actualFinish',persona_memory.iso(c.actual_finish),'predictedMinutes',c.predicted_minutes,
  'actualMinutes',c.actual_minutes,'notes',c.notes,'recordedAt',persona_memory.iso(c.recorded_at),'source',c.source,'sha256',c.sha256)
$$;

create function persona_memory.calibration_insert(p_owner_id uuid, v jsonb) returns void
language sql set search_path='' as $$
 insert into persona_memory.calibration(id,owner_id,timer_id,name,text,author,tag,started_at,predicted_finish,actual_finish,predicted_minutes,actual_minutes,notes,recorded_at,source,sha256)
 values(v->>'id',p_owner_id,v->>'timerId',v->>'name',v->>'text',v->>'author',v->>'tag',(v->>'startedAt')::timestamptz,(v->>'predictedFinish')::timestamptz,
  (v->>'actualFinish')::timestamptz,(v->>'predictedMinutes')::numeric,(v->>'actualMinutes')::numeric,coalesce(v->'notes','[]'::jsonb),(v->>'recordedAt')::timestamptz,v->>'source',v->>'sha256')
$$;

create function public.persona_clock(p_owner_id uuid, p_action text, p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
 v jsonb;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'persona_forbidden' using errcode='42501'; end if;
 -- The same per-owner lock as the memory's RPC: one writer at a time.
 perform pg_advisory_xact_lock(hashtext('persona_memory:'||p_owner_id::text)::bigint);

 if p_action='clock.timers.list' then
  return coalesce((select jsonb_agg(persona_memory.timer_json(t) order by t.started_at, t.id) from persona_memory.timers t where t.owner_id=p_owner_id),'[]'::jsonb);
 end if;

 if p_action='clock.timer.insert' then
  v:=p_payload->'timer';
  insert into persona_memory.timers(id,owner_id,name,started_at,predicted_finish,time_zone,note,recorded_at,finished_at,source)
  values(v->>'id',p_owner_id,v->>'name',(v->>'startedAt')::timestamptz,(v->>'predictedFinish')::timestamptz,v->>'timeZone',
   case when jsonb_typeof(v->'note')='object' then jsonb_build_array(v->'note') else '[]'::jsonb end,(v->>'recordedAt')::timestamptz,null,v->>'source');
  return jsonb_build_object('ok',true);
 end if;

 -- Closing a timer and writing its row are one step: both or neither.
 if p_action='clock.timer.finish' then
  v:=p_payload->'row';
  if v->>'timerId' is distinct from p_payload->>'timerId' then raise exception 'persona_validation' using errcode='22023'; end if;
  update persona_memory.timers set finished_at=(p_payload->>'finishedAt')::timestamptz where id=p_payload->>'timerId' and owner_id=p_owner_id and finished_at is null;
  if not found then
   if exists(select 1 from persona_memory.timers t where t.id=p_payload->>'timerId' and t.owner_id=p_owner_id)
    then raise exception 'persona_conflict' using errcode='40001';
    else raise exception 'persona_not_found' using errcode='P0002'; end if;
  end if;
  perform persona_memory.calibration_insert(p_owner_id, v);
  return jsonb_build_object('ok',true);
 end if;

 if p_action='clock.calibration.list' then
  return coalesce((select jsonb_agg(persona_memory.calibration_json(c) order by coalesce(c.actual_finish,c.recorded_at), c.id) from persona_memory.calibration c where c.owner_id=p_owner_id),'[]'::jsonb);
 end if;

 if p_action='clock.calibration.insert' then
  v:=p_payload->'row';
  if v->>'timerId' is not null then raise exception 'persona_validation' using errcode='22023'; end if;
  perform persona_memory.calibration_insert(p_owner_id, v);
  return jsonb_build_object('ok',true);
 end if;

 raise exception 'persona_validation' using errcode='22023';
end $$;

revoke all on function persona_memory.timer_close_only(), persona_memory.calibration_append_only(), persona_memory.timer_json(persona_memory.timers),
 persona_memory.calibration_json(persona_memory.calibration), persona_memory.calibration_insert(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.persona_clock(uuid,text,jsonb) from public, anon, authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant execute on function public.persona_clock(uuid,text,jsonb) to service_role;
end if; end $$;
commit;
