-- Fix S3-accept В1 (docs/stages/FIX_S3_ACCEPT.md «В — spells as items»): a spell on the sheet is a record like a thing —
-- with its school, a stable id (its picture's subject) and a short history («выучено в Кормире», «переписано со свитка») —
-- and gets a picture drawn like an item's. Additive, function bodies and checks only; no row of any campaign changes here:
--  1. The sheet's spell (migration 76) admits `id` (a uuid), `school` (the campaign's own word for it, up to 60
--     characters) and `history` (up to 12 lines of up to 200 characters); everything else as before. The one-time turn
--     of the owner's «Умения» prose into records is TypeScript (src/lib/inventory/spell-records.ts): the spell texts and
--     the parse are logic and live once; it is saved through the owner's ordinary sheet correction (`entity.save`, a new
--     revision of the record, the receipt kept), so this migration converts nothing.
--  2. Pictures (migration 54): a new subject kind `spell` with its own composition `spell` (a sigil or the spell's
--     effect); `picture.create` takes it only for a spell id some person's sheet in the campaign holds, under the same
--     daily cap as every other picture.
begin;

-- 1. The sheet's spell ------------------------------------------------------------------------------------------
create or replace function rpg_private.sheet_spell_valid(x jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare k text; h jsonb; begin
 if jsonb_typeof(x)<>'object' or not (x ? 'name') or not (x ? 'level') then return false; end if;
 for k in select key from jsonb_object_keys(x) key loop
  if k not in ('name','level','castingTime','range','components','duration','saveOrAttack','damage','higherLevels','text','ritual','concentration','known','prepared',
    'id','school','history') then return false; end if;
 end loop;
 if not rpg_private.bootstrap_text(x->'name',1,120) or not rpg_private.wave4_integer(x->'level',0,9) then return false; end if;
 foreach k in array array['castingTime','range','components','duration','saveOrAttack','damage'] loop
  if x ? k and not (jsonb_typeof(x->k)='string' and length(x->>k)<=160) then return false; end if;
 end loop;
 if x ? 'higherLevels' and not (jsonb_typeof(x->'higherLevels')='string' and length(x->>'higherLevels')<=800) then return false; end if;
 if x ? 'text' and not (jsonb_typeof(x->'text')='string' and length(x->>'text')<=2400) then return false; end if;
 foreach k in array array['ritual','concentration','known','prepared'] loop
  if x ? k and jsonb_typeof(x->k)<>'boolean' then return false; end if;
 end loop;
 if x ? 'id' and not (jsonb_typeof(x->'id')='string' and x->>'id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') then return false; end if;
 if x ? 'school' and not rpg_private.bootstrap_text(x->'school',1,60) then return false; end if;
 if x ? 'history' then
  if jsonb_typeof(x->'history')<>'array' or jsonb_array_length(x->'history')>12 then return false; end if;
  for h in select value from jsonb_array_elements(x->'history') loop
   if not rpg_private.bootstrap_text(h,1,200) then return false; end if;
  end loop;
 end if;
 return true;
end $$;

-- 2. A spell's picture ------------------------------------------------------------------------------------------
alter table rpg_private.pictures drop constraint pictures_subject_kind_check;
alter table rpg_private.pictures add constraint pictures_subject_kind_check check (subject_kind in ('turn','entity','item','location','spell'));
alter table rpg_private.pictures drop constraint pictures_composition_check;
alter table rpg_private.pictures add constraint pictures_composition_check
  check (composition in ('frame','portrait','figure','item','location','holding','atlas','scene','region','battle','spell'));
alter table rpg_private.pictures add constraint pictures_spell_composition check ((subject_kind = 'spell') = (composition = 'spell'));

do $m$ declare d text; begin
 select pg_get_functiondef('public.rpg_pictures(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,
  $a$  elsif p_payload->>'subjectKind'='item' then
   if not exists(select 1 from public.rpg_items i where i.campaign_id=p_campaign_id and i.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;$a$,
  $b$  elsif p_payload->>'subjectKind'='item' then
   if not exists(select 1 from public.rpg_items i where i.campaign_id=p_campaign_id and i.id=(p_payload->>'subjectId')::uuid) then raise exception 'rpg_not_found'; end if;
  elsif p_payload->>'subjectKind'='spell' then
   perform rpg_private.assert(p_payload->>'composition'='spell');
   if not exists(select 1 from public.rpg_entities e
     cross join lateral jsonb_array_elements(case when jsonb_typeof(e.character_sheet->'spells')='array' then e.character_sheet->'spells' else '[]'::jsonb end) sheet_spell(spell)
     where e.campaign_id=p_campaign_id and e.kind in ('player','companion','npc') and lower(sheet_spell.spell->>'id')=lower(p_payload->>'subjectId')) then raise exception 'rpg_not_found'; end if;$b$);
 perform rpg_private.assert(d like '%p_payload->>''subjectKind''=''spell''%');
 execute d;
end $m$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;

commit;
