-- Fix run after session 2, stage D (docs/runs/fix-s2-inventory-design.md): the records and inventory model. Additive.
--  1. A storage of kind 'place': what lies at a place and nobody carries yet (a chest's coins, a body's gear left behind)
--     — found loot is recorded where it lies, never left only in the narration. Its location is detail.locationId and
--     its coins detail.wallet (as every storage's). Like the camp it belongs to no character.
--  2. The doll's eleven slots as SQL (rpg_private.universal_slots), the same set as src/lib/inventory/model.ts.
--  3. A character sheet of schema 2: the level, saves, speed, armour class, attacks and the spells as records (the
--     spells tab), the companions' sheets from their stat blocks; schema 1 stays valid as it was.
--  4. The loop's record applier accepts an entity's character_sheet (the DM's sheet path: level up, prepared spells,
--     a companion's sheet from its block; the hero's own sheet only with a reason, checked in TypeScript).
begin;

-- 1. The place storage -------------------------------------------------------------------------------------------
alter table public.rpg_storages drop constraint rpg_storages_kind_check;
alter table public.rpg_storages add constraint rpg_storages_kind_check
  check (kind in ('player','companion','camp','transport','merchant','place'));
do $$ declare c record; n integer:=0; begin
 -- Phase 1's unnamed CHECK ((kind = 'camp') = (entity_id is null)) — found by its definition, replaced by a named one.
 for c in select conname from pg_constraint where conrelid='public.rpg_storages'::regclass and contype='c'
   and pg_get_constraintdef(oid) ilike '%kind%camp%entity_id IS NULL%' loop
   execute format('alter table public.rpg_storages drop constraint %I', c.conname);
   n:=n+1;
 end loop;
 perform rpg_private.assert(n=1);
end $$;
alter table public.rpg_storages add constraint rpg_storages_owner_check
  check ((kind in ('camp','place')) = (entity_id is null));

-- 2. The doll -----------------------------------------------------------------------------------------------------
create function rpg_private.universal_slots(lang text) returns jsonb language sql immutable set search_path='' as $$
 select case when lang='ru' then jsonb_build_array(
   jsonb_build_object('id','head','label','Голова','accepts',jsonb_build_array('armor','clothing')),
   jsonb_build_object('id','amulet','label','Амулет','accepts',jsonb_build_array('jewelry','accessory')),
   jsonb_build_object('id','cloak','label','Плащ','accepts',jsonb_build_array('clothing','armor')),
   jsonb_build_object('id','body','label','Броня / одежда','accepts',jsonb_build_array('armor','clothing')),
   jsonb_build_object('id','gloves','label','Перчатки / наручи','accepts',jsonb_build_array('armor','clothing','accessory')),
   jsonb_build_object('id','belt','label','Пояс','accepts',jsonb_build_array('gear','accessory','tool','clothing')),
   jsonb_build_object('id','boots','label','Сапоги','accepts',jsonb_build_array('armor','clothing')),
   jsonb_build_object('id','ring_left','label','Кольцо (левая)','accepts',jsonb_build_array('jewelry')),
   jsonb_build_object('id','ring_right','label','Кольцо (правая)','accepts',jsonb_build_array('jewelry')),
   jsonb_build_object('id','hand','label','Основная рука','accepts',jsonb_build_array('weapon','tool')),
   jsonb_build_object('id','offhand','label','Вторая рука','accepts',jsonb_build_array('weapon','shield','tool','gear')))
 else jsonb_build_array(
   jsonb_build_object('id','head','label','Head','accepts',jsonb_build_array('armor','clothing')),
   jsonb_build_object('id','amulet','label','Amulet','accepts',jsonb_build_array('jewelry','accessory')),
   jsonb_build_object('id','cloak','label','Cloak','accepts',jsonb_build_array('clothing','armor')),
   jsonb_build_object('id','body','label','Armor / clothing','accepts',jsonb_build_array('armor','clothing')),
   jsonb_build_object('id','gloves','label','Gloves / bracers','accepts',jsonb_build_array('armor','clothing','accessory')),
   jsonb_build_object('id','belt','label','Belt','accepts',jsonb_build_array('gear','accessory','tool','clothing')),
   jsonb_build_object('id','boots','label','Boots','accepts',jsonb_build_array('armor','clothing')),
   jsonb_build_object('id','ring_left','label','Ring (left)','accepts',jsonb_build_array('jewelry')),
   jsonb_build_object('id','ring_right','label','Ring (right)','accepts',jsonb_build_array('jewelry')),
   jsonb_build_object('id','hand','label','Main hand','accepts',jsonb_build_array('weapon','tool')),
   jsonb_build_object('id','offhand','label','Off hand','accepts',jsonb_build_array('weapon','shield','tool','gear'))) end
$$;

-- 3. The sheet, schema 2 -------------------------------------------------------------------------------------------
create function rpg_private.sheet_spell_valid(x jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare k text; begin
 if jsonb_typeof(x)<>'object' or not (x ? 'name') or not (x ? 'level') then return false; end if;
 for k in select key from jsonb_object_keys(x) key loop
  if k not in ('name','level','castingTime','range','components','duration','saveOrAttack','damage','higherLevels','text','ritual','concentration','known','prepared') then return false; end if;
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
 return true;
end $$;

create function rpg_private.sheet_valid(s jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare a jsonb; k text; x jsonb; begin
 if jsonb_typeof(s)<>'object' then return false; end if;
 if s->'schemaVersion'='1'::jsonb then return rpg_private.bootstrap_sheet_valid(s); end if;
 if s->'schemaVersion'<>'2'::jsonb or octet_length(s::text)>120000 then return false; end if;
 for k in select key from jsonb_object_keys(s) key loop
  if k not in ('schemaVersion','mode','role','background','level','tier','attributes','skills','abilities','limitations',
    'saves','attacks','speed','armorClass','spells','preparedMax') then return false; end if;
 end loop;
 if s->>'mode' not in ('structured_rpg','narrative') then return false; end if;
 if not (coalesce(s->'role','null'::jsonb)='null'::jsonb or rpg_private.bootstrap_text(s->'role',1,120)) then return false; end if;
 if s ? 'background' and not (jsonb_typeof(s->'background')='string' and length(s->>'background')<=2000) then return false; end if;
 if not (coalesce(s->'level','null'::jsonb)='null'::jsonb or rpg_private.wave4_integer(s->'level',0,30)) then return false; end if;
 if not (coalesce(s->'tier','null'::jsonb)='null'::jsonb or rpg_private.bootstrap_text(s->'tier',1,60)) then return false; end if;
 if not (coalesce(s->'armorClass','null'::jsonb)='null'::jsonb or rpg_private.wave4_integer(s->'armorClass',1,40)) then return false; end if;
 if not (coalesce(s->'preparedMax','null'::jsonb)='null'::jsonb or rpg_private.wave4_integer(s->'preparedMax',0,60)) then return false; end if;
 if not (coalesce(s->'speed','null'::jsonb)='null'::jsonb or rpg_private.bootstrap_text(s->'speed',1,80)) then return false; end if;
 foreach k in array array['skills','abilities','limitations','saves','attacks'] loop
  if s ? k and not rpg_private.bootstrap_lines(s->k,40) then return false; end if;
 end loop;
 if s ? 'spells' then
  if jsonb_typeof(s->'spells')<>'array' or jsonb_array_length(s->'spells')>160 then return false; end if;
  for x in select value from jsonb_array_elements(s->'spells') loop
   if not rpg_private.sheet_spell_valid(x) then return false; end if;
  end loop;
  if (select count(*)<>count(distinct lower(value->>'name')) from jsonb_array_elements(s->'spells')) then return false; end if;
 end if;
 a:=coalesce(s->'attributes','null'::jsonb);
 if s->>'mode'='narrative' or a='null'::jsonb then return true; end if;
 if jsonb_typeof(a)<>'object' or (select array_agg(key order by key) from jsonb_object_keys(a) key) <>
    array['charisma','constitution','dexterity','intelligence','strength','wisdom'] then return false; end if;
 foreach k in array array['strength','dexterity','constitution','intelligence','wisdom','charisma'] loop
  if not rpg_private.wave4_integer(a->k,1,30) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end $$;

alter table public.rpg_entities drop constraint rpg_entities_character_sheet_valid;
alter table public.rpg_entities add constraint rpg_entities_character_sheet_valid
  check (character_sheet is null or rpg_private.sheet_valid(character_sheet));

-- 4. The loop's applier accepts an entity's character_sheet (migration 55 added public_profile the same way) ---------
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.runtime_change_before_astra_ordered(uuid,uuid,jsonb)'::regprocedure) into d;
 d:=replace(d,'extra:=array[''public_profile'']','extra:=array[''public_profile'',''character_sheet'']');
 perform rpg_private.assert(d like '%extra:=array[''public_profile'',''character_sheet'']%');
 execute d;
end $$;

revoke all on function rpg_private.universal_slots(text),rpg_private.sheet_spell_valid(jsonb),rpg_private.sheet_valid(jsonb) from public,anon,authenticated;

commit;
