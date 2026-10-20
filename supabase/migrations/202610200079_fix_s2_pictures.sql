-- Fix run after session 2, stage E (docs/stages/FIX_S2_CDEF.md «Stage E», items 77–79): pictures.
--   * A frame's caption: the shot's own moment in the campaign language (item 78b — the lightbox showed the
--     turn's first sentence while the picture showed another moment). Set with the picture or with its
--     brief while it is not drawn yet; public (the frame, the lightbox and the gallery show it).
--   * A frame's review: the cheap vision check after the picture is drawn (extra or missing limbs, gear the
--     person does not have, open eyes at 0 HP). Set once by the server on a ready picture; a failed check
--     queues one automatic redraw or marks the frame for the owner.
--   * The daily picture count from the owner's local midnight, not UTC's (17:00 for him): the picture
--     settings carry the time zone of the owner's device (sent with «Сохранить», 'UTC' until then).
-- Additive only: two nullable columns and a column with a default; the functions patched in place.
begin;

alter table rpg_private.pictures add column caption text check (caption is null or length(caption) between 1 and 300);
alter table rpg_private.pictures add column review jsonb check (review is null or (jsonb_typeof(review)='object' and length(review::text)<=4000));
alter table rpg_private.picture_settings add column time_zone text not null default 'UTC' check (time_zone ~ '^[A-Za-z][A-Za-z0-9_+/-]{0,63}$');

-- A zone name the database knows, else UTC (a zone removed from the tz data never breaks the count).
create function rpg_private.picture_zone(tz text) returns text language plpgsql stable set search_path='' as $$
begin
 if tz is null or tz !~ '^[A-Za-z][A-Za-z0-9_+/-]{0,63}$' then return 'UTC'; end if;
 perform now() at time zone tz;
 return tz;
exception when others then return 'UTC';
end $$;

-- Today's pictures of the campaign, from midnight in the owner's zone: every attempt counts, so a crash never
-- repeats a paid request past the cap. `since` is that midnight (the screens say when the count starts again).
create or replace function rpg_private.picture_today(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 with z as (select rpg_private.picture_zone((select s.time_zone from rpg_private.picture_settings s where s.campaign_id=cid)) tz),
  d as (select date_trunc('day', now() at time zone z.tz) at time zone z.tz since from z)
 select jsonb_build_object('count',count(p.id),'costUsdMicros',coalesce(sum(p.cost_usd_micros),0),'since',(select d.since from d))
 from rpg_private.pictures p where p.campaign_id=cid and p.created_at >= (select d.since from d)
$$;

create or replace function rpg_private.picture_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('frames',s.frames,'quality',s.quality,'dailyCap',s.daily_cap,'autopilot',s.autopilot,'models',s.models,'director',s.director,
     'timeZone',s.time_zone,'revision',s.revision)
   from rpg_private.picture_settings s where s.campaign_id=cid),
  jsonb_build_object('frames','every','quality','fast','dailyCap',60,
   'autopilot','{"enabled":false,"items":true,"portraits":true,"figures":true,"places":true,"holdings":true,"autoAccept":true,"provider":"fal"}'::jsonb,'models','{}'::jsonb,'director',false,
   'timeZone','UTC','revision',0))
$$;

create or replace function rpg_private.picture_json(p rpg_private.pictures) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object('id',p.id,'kind',p.kind,'subjectKind',p.subject_kind,'subjectId',p.subject_id,'composition',p.composition,
  'timeline',p.timeline,'version',p.version,'status',p.status,'hidden',p.hidden,'model',p.model,'tier',p.tier,'trigger',p.trigger,
  'styleVersionId',p.style_version_id,'width',p.width,'height',p.height,'costUsdMicros',p.cost_usd_micros,'elapsedMs',p.elapsed_ms,
  'error',p.error,'createdAt',p.created_at,'readyAt',p.ready_at,'caption',p.caption,'review',p.review)
$$;

-- A queued or generating picture may take its brief (prompt, shot, references, caption) until it is drawn; a
-- ready one takes its review once; otherwise a drawn or failed picture changes only its hidden flag.
create or replace function rpg_private.picture_immutable() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op = 'DELETE' then raise exception 'rpg_conflict'; end if;
 if old.status in ('ready','failed') and (to_jsonb(old) - 'hidden' - 'review') <> (to_jsonb(new) - 'hidden' - 'review') then raise exception 'rpg_conflict'; end if;
 if old.review is not null and new.review is distinct from old.review then raise exception 'rpg_conflict'; end if;
 if new.review is not null and new.status <> 'ready' then raise exception 'rpg_conflict'; end if;
 if old.status = 'generating' and new.status = 'queued' then raise exception 'rpg_conflict'; end if;
 if (to_jsonb(old) - 'status' - 'hidden' - 'storage_path' - 'content_type' - 'width' - 'height' - 'bytes' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at' - 'model' - 'prompt' - 'shot' - 'reference_ids' - 'caption' - 'review')
    <> (to_jsonb(new) - 'status' - 'hidden' - 'storage_path' - 'content_type' - 'width' - 'height' - 'bytes' - 'sha256' - 'cost_usd_micros' - 'request_id' - 'elapsed_ms' - 'error' - 'ready_at' - 'model' - 'prompt' - 'shot' - 'reference_ids' - 'caption' - 'review') then raise exception 'rpg_conflict'; end if;
 if old.status not in ('queued','generating') and (old.prompt <> new.prompt or old.shot is distinct from new.shot or old.reference_ids <> new.reference_ids or old.caption is distinct from new.caption) then raise exception 'rpg_conflict'; end if;
 return new;
end $$;

-- rpg_pictures: settings.save takes an optional «timeZone»; picture.create and picture.brief an optional
-- «caption»; picture.review sets a ready picture's review once.
do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_pictures(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot'],array['models','director']);$a$,
  $b$  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot'],array['models','director','timeZone']);
  if p_payload ? 'timeZone' then
   perform rpg_private.assert(jsonb_typeof(p_payload->'timeZone')='string' and rpg_private.picture_zone(p_payload->>'timeZone')=p_payload->>'timeZone');
  end if;$b$);
 d:=replace(d,',models,director,revision)',',models,director,time_zone,revision)');
 d:=replace(d,$a$coalesce((p_payload->>'director')::boolean,false),1)$a$,$b$coalesce((p_payload->>'director')::boolean,false),coalesce(p_payload->>'timeZone','UTC'),1)$b$);
 d:=replace(d,'director=excluded.director,revision=',
  $b$director=excluded.director,time_zone=case when p_payload ? 'timeZone' then excluded.time_zone else rpg_private.picture_settings.time_zone end,revision=$b$);
 d:=replace(d,
  $a$array['id','kind','subjectKind','subjectId','composition','timeline','tier','trigger','model','styleVersionId','shot','prompt','referenceIds']);$a$,
  $b$array['id','kind','subjectKind','subjectId','composition','timeline','tier','trigger','model','styleVersionId','shot','prompt','referenceIds'],array['caption']);
  perform rpg_private.assert(not (p_payload ? 'caption') or jsonb_typeof(p_payload->'caption') in ('string','null'));$b$);
 d:=replace(d,'style_version_id,shot,prompt,reference_ids)','style_version_id,shot,prompt,reference_ids,caption)');
 d:=replace(d,$a$nullif(p_payload->'shot','null'::jsonb),p_payload->>'prompt',p_payload->'referenceIds')$a$,
  $b$nullif(p_payload->'shot','null'::jsonb),p_payload->>'prompt',p_payload->'referenceIds',left(nullif(btrim(coalesce(p_payload->>'caption','')),''),300))$b$);
 d:=replace(d,
  $a$  perform rpg_private.fields(p_payload,array['id','prompt','shot','referenceIds']);$a$,
  $b$  perform rpg_private.fields(p_payload,array['id','prompt','shot','referenceIds'],array['caption']);
  perform rpg_private.assert(not (p_payload ? 'caption') or jsonb_typeof(p_payload->'caption') in ('string','null'));$b$);
 d:=replace(d,
  $a$reference_ids=p_payload->'referenceIds' where id=p.id returning * into p;$a$,
  $b$reference_ids=p_payload->'referenceIds',
    caption=case when p_payload ? 'caption' then left(nullif(btrim(coalesce(p_payload->>'caption','')),''),300) else p.caption end where id=p.id returning * into p;$b$);
 d:=replace(d,
  $a$ if p_action='picture.hide' then$a$,
  $b$ if p_action='picture.review' then
  perform rpg_private.fields(p_payload,array['id','review']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'review')='object' and length((p_payload->'review')::text)<=4000);
  select * into p from rpg_private.pictures x where x.id=(p_payload->>'id')::uuid and x.campaign_id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  if p.status<>'ready' or p.review is not null then raise exception 'rpg_conflict'; end if;
  update rpg_private.pictures set review=p_payload->'review' where id=p.id returning * into p;
  return rpg_private.picture_json(p);
 end if;

 if p_action='picture.hide' then$b$);
 perform rpg_private.assert(d like '%array[''models'',''director'',''timeZone'']%' and d like '%,models,director,time_zone,revision)%'
   and d like '%coalesce(p_payload->>''timeZone'',''UTC''),1)%' and d like '%time_zone=case when p_payload ? ''timeZone''%'
   and d like '%''referenceIds''],array[''caption'']);%' and d like '%reference_ids,caption)%' and d like '%''referenceIds'',left(nullif(btrim(%'
   and d like '%array[''id'',''prompt'',''shot'',''referenceIds''],array[''caption'']);%' and d like '%else p.caption end where id=p.id%'
   and d like '%p_action=''picture.review''%');
 execute d;
end $m$;

revoke all on function rpg_private.picture_zone(text) from public,anon,authenticated;

commit;
