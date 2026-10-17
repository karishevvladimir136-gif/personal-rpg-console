-- Polish 2, part 3 (docs/stages/POLISH_2.md §3): the shot director.
--   * visual profiles of named people and places (a full look, drafted once by
--     the model from the records and the approved anchor, edited by the owner,
--     appended to when the story changes the look) — append-only versions;
--   * a queued or generating picture may receive its brief (the compiled prompt,
--     the shot with the brief inside, the references) before it is drawn: the
--     live frame's row is created from the first paragraph's shot at once and
--     the brief arrives when the whole turn's narration has.
-- Additive only.
begin;

create table rpg_private.visual_profiles (
  id uuid primary key,
  owner_id uuid not null references auth.users(id),
  campaign_id uuid not null references public.rpg_campaigns(id),
  subject_kind text not null check (subject_kind in ('entity','location')),
  subject_id uuid not null,
  version integer not null check (version > 0),
  look text not null check (length(look) <= 2000),
  changes jsonb not null default '[]' check (jsonb_typeof(changes)='array' and jsonb_array_length(changes) <= 12),
  source text not null check (source in ('model','owner')),
  created_at timestamptz not null default now(),
  unique (campaign_id, subject_kind, subject_id, version)
);
create index visual_profiles_campaign on rpg_private.visual_profiles(campaign_id, subject_kind, subject_id, version);
alter table rpg_private.visual_profiles enable row level security;
revoke all on rpg_private.visual_profiles from public, anon, authenticated;

-- Versions are history: a profile row never changes and is never deleted.
create function rpg_private.visual_profile_immutable() returns trigger
language plpgsql set search_path='' as $$
begin raise exception 'rpg_conflict'; end $$;
create trigger visual_profile_immutable before update or delete on rpg_private.visual_profiles for each row execute function rpg_private.visual_profile_immutable();

create function rpg_private.visual_profile_json(v rpg_private.visual_profiles) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',v.id,'subjectKind',v.subject_kind,'subjectId',v.subject_id,'version',v.version,'look',v.look,'changes',v.changes,'source',v.source,'createdAt',v.created_at)
$$;
revoke all on function rpg_private.visual_profile_immutable(),rpg_private.visual_profile_json(rpg_private.visual_profiles) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on function rpg_private.visual_profile_json(rpg_private.visual_profiles) from service_role;
end if; end $$;

-- A queued or generating picture may take its brief: prompt, shot and references change until it is drawn.
create or replace function rpg_private.picture_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op = 'DELETE' then raise exception 'rpg_conflict'; end if;
 if old.status in ('ready','failed') and (to_jsonb(old) - 'hidden') <> (to_jsonb(new) - 'hidden') then raise exception 'rpg_conflict'; end if;
 if old.status = 'generating' and new.status = 'queued' then raise exception 'rpg_conflict'; end if;
 if (to_jsonb(old) - 'status' - 'hidden' - 'storage_path' - 'content_type' - 'width' - 'height' - 'bytes' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at' - 'model' - 'prompt' - 'shot' - 'reference_ids')
    <> (to_jsonb(new) - 'status' - 'hidden' - 'storage_path' - 'content_type' - 'width' - 'height' - 'bytes' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at' - 'model' - 'prompt' - 'shot' - 'reference_ids') then raise exception 'rpg_conflict'; end if;
 if old.status not in ('queued','generating') and (old.prompt <> new.prompt or old.shot is distinct from new.shot or old.reference_ids <> new.reference_ids) then raise exception 'rpg_conflict'; end if;
 return new;
end $$;

-- rpg_pictures: `read` lists the profiles (the latest version of each subject); `profile.save`
-- writes a new version; `picture.brief` sets a queued or generating picture's prompt, shot and
-- references (the same reference rule as picture.create).
do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_pictures(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$   'pictures',coalesce((select jsonb_agg(rpg_private.picture_json(x) order by x.created_at,x.id) from ($a$,
  $b$   'profiles',coalesce((select jsonb_agg(rpg_private.visual_profile_json(v) order by v.subject_kind,v.subject_id) from rpg_private.visual_profiles v
     where v.campaign_id=p_campaign_id and v.version=(select max(y.version) from rpg_private.visual_profiles y where y.campaign_id=v.campaign_id and y.subject_kind=v.subject_kind and y.subject_id=v.subject_id)),'[]'),
   'pictures',coalesce((select jsonb_agg(rpg_private.picture_json(x) order by x.created_at,x.id) from ($b$);
 d:=replace(d,
  $a$ if p_action='picture.hide' then$a$,
  $b$ if p_action='profile.save' then
  perform rpg_private.fields(p_payload,array['id','subjectKind','subjectId','look','changes','source']);
  perform rpg_private.assert(p_payload->>'subjectKind' in ('entity','location') and jsonb_typeof(p_payload->'look')='string' and length(p_payload->>'look')<=2000
    and jsonb_typeof(p_payload->'changes')='array' and jsonb_array_length(p_payload->'changes')<=12 and p_payload->>'source' in ('model','owner'));
  for k in select jsonb_array_elements_text(p_payload->'changes') loop perform rpg_private.assert(length(k) between 1 and 300); end loop;
  if p_payload->>'subjectKind'='entity' then
   if not exists(select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id and e.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;
  else
   if not exists(select 1 from public.rpg_locations l where l.campaign_id=p_campaign_id and l.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;
  end if;
  select coalesce(max(v.version),0)+1 into ver from rpg_private.visual_profiles v where v.campaign_id=p_campaign_id and v.subject_kind=p_payload->>'subjectKind' and v.subject_id=(p_payload->>'subjectId')::uuid;
  insert into rpg_private.visual_profiles(id,owner_id,campaign_id,subject_kind,subject_id,version,look,changes,source)
   values((p_payload->>'id')::uuid,p_owner_id,p_campaign_id,p_payload->>'subjectKind',(p_payload->>'subjectId')::uuid,ver,p_payload->>'look',p_payload->'changes',p_payload->>'source')
   returning id into sid;
  return (select rpg_private.visual_profile_json(v) from rpg_private.visual_profiles v where v.id=sid);
 end if;

 if p_action='picture.brief' then
  perform rpg_private.fields(p_payload,array['id','prompt','shot','referenceIds']);
  select * into p from rpg_private.pictures x where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if p.status not in ('queued','generating') then raise exception 'rpg_conflict'; end if;
  perform rpg_private.assert(jsonb_typeof(p_payload->'prompt')='string' and length(p_payload->>'prompt') between 1 and 8000 and jsonb_typeof(p_payload->'referenceIds')='array'
    and jsonb_array_length(p_payload->'referenceIds')<=8 and (p_payload->'shot'='null'::jsonb or jsonb_typeof(p_payload->'shot')='object'));
  for k in select jsonb_array_elements_text(p_payload->'referenceIds') loop
   if not exists(select 1 from rpg_private.pictures r where r.id=k::uuid and r.campaign_id=p_campaign_id and r.status='ready')
      and not exists(select 1 from rpg_private.picture_styles r where r.id=k::uuid and r.owner_id=p_owner_id and r.reference_path is not null) then raise exception 'rpg_conflict'; end if;
  end loop;
  update rpg_private.pictures set prompt=p_payload->>'prompt',shot=nullif(p_payload->'shot','null'::jsonb),reference_ids=p_payload->'referenceIds' where id=p.id returning * into p;
  return rpg_private.picture_json(p);
 end if;

 if p_action='picture.hide' then$b$);
 perform rpg_private.assert(d like '%p_action=''profile.save''%' and d like '%p_action=''picture.brief''%' and d like '%''profiles'',coalesce(%');
 execute d;
end $m$;

commit;
