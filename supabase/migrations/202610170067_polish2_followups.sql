-- Polish 2, part 6 (docs/stages/POLISH_2.md §6) and the shot director's switch. Additive only.
--   * the hero's equipment slots backfilled for existing records: a player without slots gets
--     the standard humanoid set in the campaign's language (the equip tool healed them on use;
--     now the paper doll shows them at once);
--   * the drawn atlas comes back as a Stage V composition («atlas»: a map of the current level
--     in the campaign's style, no text on the picture);
--   * the picture settings carry «director» (the visual brief by the shot director, on by
--     default) so the owner can draw from the one-clause shot alone.
begin;

update public.rpg_entities e set equipment_slots=rpg_private.bootstrap_humanoid_slots(coalesce(c.language,'ru'))
 from public.rpg_campaigns c
 where c.id=e.campaign_id and e.kind='player' and (e.equipment_slots is null or jsonb_typeof(e.equipment_slots)<>'array' or jsonb_array_length(e.equipment_slots)=0);

alter table rpg_private.pictures drop constraint pictures_composition_check;
alter table rpg_private.pictures add constraint pictures_composition_check check (composition in ('frame','portrait','figure','item','location','holding','atlas'));

alter table rpg_private.picture_settings add column director boolean not null default true;

create or replace function rpg_private.picture_settings_json(cid uuid) returns jsonb
language sql stable set search_path='' as $$
 select coalesce((select jsonb_build_object('frames',s.frames,'quality',s.quality,'dailyCap',s.daily_cap,'autopilot',s.autopilot,'models',s.models,'director',s.director,'revision',s.revision)
   from rpg_private.picture_settings s where s.campaign_id=cid),
  jsonb_build_object('frames','every','quality','fast','dailyCap',60,
   'autopilot','{"enabled":false,"items":true,"portraits":true,"figures":true,"places":true,"holdings":true,"autoAccept":true,"provider":"fal"}'::jsonb,'models','{}'::jsonb,'director',true,'revision',0))
$$;

do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_pictures(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot'],array['models']);$a$,
  $b$  perform rpg_private.fields(p_payload,array['expectedRevision','frames','quality','dailyCap','autopilot'],array['models','director']);
  if p_payload ? 'director' then perform rpg_private.assert(jsonb_typeof(p_payload->'director')='boolean'); end if;$b$);
 d:=replace(d,
  $a$  insert into rpg_private.picture_settings(campaign_id,frames,quality,daily_cap,autopilot,models,revision)
   values(p_campaign_id,p_payload->>'frames',p_payload->>'quality',(p_payload->>'dailyCap')::integer,p_payload->'autopilot',coalesce(p_payload->'models','{}'::jsonb),1)
   on conflict(campaign_id) do update set frames=excluded.frames,quality=excluded.quality,daily_cap=excluded.daily_cap,
    autopilot=excluded.autopilot,models=excluded.models,revision=rpg_private.picture_settings.revision+1,updated_at=now();$a$,
  $b$  insert into rpg_private.picture_settings(campaign_id,frames,quality,daily_cap,autopilot,models,director,revision)
   values(p_campaign_id,p_payload->>'frames',p_payload->>'quality',(p_payload->>'dailyCap')::integer,p_payload->'autopilot',coalesce(p_payload->'models','{}'::jsonb),coalesce((p_payload->>'director')::boolean,true),1)
   on conflict(campaign_id) do update set frames=excluded.frames,quality=excluded.quality,daily_cap=excluded.daily_cap,
    autopilot=excluded.autopilot,models=excluded.models,director=excluded.director,revision=rpg_private.picture_settings.revision+1,updated_at=now();$b$);
 perform rpg_private.assert(d like '%array[''models'',''director'']%' and d like '%director=excluded.director%');
 execute d;
end $m$;

commit;
