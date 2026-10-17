-- Polish 2, part 2 (docs/stages/POLISH_2.md §2): the owner's picture model per
-- tier in the campaign's picture settings, and pictures drawn by OpenAI's GPT
-- Image next to fal's. Additive only: a new column with a default, the provider
-- check widened, the settings projection and the RPC patched in place.
begin;

alter table rpg_private.picture_settings add column models jsonb not null default '{}' check (jsonb_typeof(models)='object');
alter table rpg_private.pictures drop constraint pictures_provider_check;
alter table rpg_private.pictures add constraint pictures_provider_check check (provider in ('fal','openai'));

create or replace function rpg_private.picture_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('frames',s.frames,'quality',s.quality,'dailyCap',s.daily_cap,'autopilot',s.autopilot,'models',s.models,'revision',s.revision)
   from rpg_private.picture_settings s where s.campaign_id=cid),
  jsonb_build_object('frames','every','quality','fast','dailyCap',60,
   'autopilot','{"enabled":false,"items":true,"portraits":true,"figures":true,"places":true,"holdings":true,"autoAccept":true,"provider":"fal"}'::jsonb,'models','{}'::jsonb,'revision',0))
$$;

-- rpg_pictures: settings.save takes an optional «models» object ({fast?, quality?}: model IDs, free
-- text up to 80 characters — the catalogue lives in TypeScript); picture.create records the
-- provider from the model ID (gpt-image… is OpenAI, everything else fal).
do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_pictures(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot']);$a$,
  $b$  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot'],array['models']);
  if p_payload ? 'models' then
   perform rpg_private.assert(jsonb_typeof(p_payload->'models')='object');
   perform rpg_private.fields(p_payload->'models','{}'::text[],array['fast','quality']);
   foreach k in array array['fast','quality'] loop
    if p_payload->'models' ? k then
     perform rpg_private.assert(jsonb_typeof(p_payload->'models'->k)='string' and length(p_payload->'models'->>k) between 1 and 80);
    end if;
   end loop;
  end if;$b$);
 d:=replace(d,
  $a$  insert into rpg_private.picture_settings(campaign_id,frames,quality,daily_cap,autopilot,revision)
   values(p_campaign_id,p_payload->>'frames',p_payload->>'quality',(p_payload->>'dailyCap')::integer,p_payload->'autopilot',1)
   on conflict(campaign_id) do update set frames=excluded.frames,quality=excluded.quality,daily_cap=excluded.daily_cap,
    autopilot=excluded.autopilot,revision=rpg_private.picture_settings.revision+1,updated_at=now();$a$,
  $b$  insert into rpg_private.picture_settings(campaign_id,frames,quality,daily_cap,autopilot,models,revision)
   values(p_campaign_id,p_payload->>'frames',p_payload->>'quality',(p_payload->>'dailyCap')::integer,p_payload->'autopilot',coalesce(p_payload->'models','{}'::jsonb),1)
   on conflict(campaign_id) do update set frames=excluded.frames,quality=excluded.quality,daily_cap=excluded.daily_cap,
    autopilot=excluded.autopilot,models=excluded.models,revision=rpg_private.picture_settings.revision+1,updated_at=now();$b$);
 d:=replace(d,
  $a$    p_payload->'timeline',ver,'queued','fal',p_payload->>'model',$a$,
  $b$    p_payload->'timeline',ver,'queued',case when p_payload->>'model' like 'gpt-image%' then 'openai' else 'fal' end,p_payload->>'model',$b$);
 perform rpg_private.assert(d like '%array[''models'']%' and d like '%models=excluded.models%' and d like '%then ''openai'' else ''fal'' end%');
 execute d;
end $m$;

commit;
