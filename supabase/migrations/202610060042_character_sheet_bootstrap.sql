-- An explicitly reviewed public character profile, co-located with the
-- authoritative Entity. Old entities and old save manifests restore NULL.
-- Combat, inventory, progression and World Actor authority are unchanged.
begin;

create function rpg_private.bootstrap_sheet_valid(s jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare a jsonb; k text; begin
 if jsonb_typeof(s)<>'object' then return false; end if;
 if (select array_agg(key order by key) from jsonb_object_keys(s) key) <>
    array['abilities','attributes','background','level','limitations','mode','role','schemaVersion','skills','spells','tier'] then return false; end if;
 if s->'schemaVersion'<>'1'::jsonb or s->>'mode' not in ('structured_rpg','narrative') then return false; end if;
 if not (s->'role'='null'::jsonb or (jsonb_typeof(s->'role')='string' and length(btrim(s->>'role')) between 1 and 120)) then return false; end if;
 if jsonb_typeof(s->'background')<>'string' or length(s->>'background')>2000 then return false; end if;
 if s->'level'<>'null'::jsonb or s->'tier'<>'null'::jsonb or s->'spells'<>'[]'::jsonb then return false; end if;
 if not rpg_private.bootstrap_lines(s->'skills',12) or not rpg_private.bootstrap_lines(s->'abilities',12) or not rpg_private.bootstrap_lines(s->'limitations',12) then return false; end if;
 a:=s->'attributes';
 if s->>'mode'='narrative' then return a='null'::jsonb; end if;
 if jsonb_typeof(a)<>'object' or
    (select array_agg(key order by key) from jsonb_object_keys(a) key) <>
    array['charisma','constitution','dexterity','intelligence','strength','wisdom'] then return false; end if;
 foreach k in array array['strength','dexterity','constitution','intelligence','wisdom','charisma'] loop
  if not rpg_private.wave4_integer(a->k,1,20) then return false; end if;
 end loop;
 return true;
exception when others then return false;
end $$;

alter table public.rpg_entities add column character_sheet jsonb;
alter table public.rpg_entities add constraint rpg_entities_character_sheet_valid
 check (character_sheet is null or rpg_private.bootstrap_sheet_valid(character_sheet));

-- The original v1 proposal validator retains the verbatim owner-description
-- grounding for World Actor facts, possessions and resources.
alter function rpg_private.bootstrap_proposal(text,jsonb,jsonb) rename to bootstrap_proposal_before_sheet;
create function rpg_private.bootstrap_proposal(kind text,p jsonb,input jsonb) returns void
language plpgsql set search_path='' as $$
declare base jsonb; m jsonb; begin
 if kind<>'creation' or p->'schemaVersion'='1'::jsonb then
  perform rpg_private.bootstrap_proposal_before_sheet(kind,p,input); return;
 end if;
 perform rpg_private.assert(p->'schemaVersion'='2'::jsonb);
 perform rpg_private.fields(p,array['schemaVersion','capabilities','limitations','possessions','resources','questions','sheet','mechanics'],array['equipmentProfile']);
 perform rpg_private.assert(rpg_private.bootstrap_sheet_valid(p->'sheet'));
 if p ? 'equipmentProfile' then
  perform rpg_private.assert(p->>'equipmentProfile' in ('standard_humanoid','none'));
  perform rpg_private.assert(p->>'equipmentProfile'<>'standard_humanoid' or p#>>'{sheet,mode}'='structured_rpg');
 end if;
 m:=p->'mechanics';
 perform rpg_private.assert(jsonb_typeof(m) in ('object','null'));
 perform rpg_private.assert((p#>>'{sheet,mode}'='structured_rpg')=(jsonb_typeof(m)='object'));
 if jsonb_typeof(m)='object' then
  perform rpg_private.fields(m,array['hp','attack','defense','skill','weaponName','weaponDamage']);
  perform rpg_private.assert(rpg_private.wave4_integer(m->'hp',1,10000) and rpg_private.wave4_integer(m->'attack',-20,20) and rpg_private.wave4_integer(m->'defense',1,40) and rpg_private.wave4_integer(m->'skill',-20,20));
  perform rpg_private.assert((m->'weaponName'='null'::jsonb and m->'weaponDamage'='null'::jsonb) or
    (rpg_private.bootstrap_text(m->'weaponName',1,200) and rpg_private.wave4_integer(m->'weaponDamage',1,20) and
     exists(select 1 from jsonb_array_elements(p->'possessions') x where x->'name'=m->'weaponName' and x->'quantity'<>'null'::jsonb)));
  perform rpg_private.assert(p->>'equipmentProfile' is distinct from 'none' or m->'weaponName'='null'::jsonb);
 end if;
 base:=(p-'sheet'-'mechanics'-'equipmentProfile')||'{"schemaVersion":1}'::jsonb;
 perform rpg_private.bootstrap_proposal_before_sheet(kind,base,input);
end $$;

-- A v2 reviewed sheet may be edited by the owner. It remains public descriptive
-- profile only; the existing mechanics reviewer alone authorizes numeric play.
alter function rpg_private.bootstrap_review(text,jsonb,jsonb) rename to bootstrap_review_before_sheet;
create function rpg_private.bootstrap_review(kind text,r jsonb,proposal jsonb) returns void
language plpgsql set search_path='' as $$
begin
 if kind='creation' and proposal->'schemaVersion'='2'::jsonb then
  perform rpg_private.assert(r ? 'sheet' and rpg_private.bootstrap_sheet_valid(r->'sheet'));
  if proposal ? 'equipmentProfile' then perform rpg_private.assert(r ? 'equipmentProfile'); end if;
  perform rpg_private.assert((r#>>'{sheet,mode}'='structured_rpg')=(r ? 'mechanics'));
  if r ? 'equipmentProfile' then
   perform rpg_private.assert(r->>'equipmentProfile' in ('standard_humanoid','none'));
   perform rpg_private.assert(r->>'equipmentProfile'<>'standard_humanoid' or r#>>'{sheet,mode}'='structured_rpg');
   perform rpg_private.assert(r->>'equipmentProfile'<>'none' or r#>'{mechanics,weaponName}' is null or r#>'{mechanics,weaponName}'='null'::jsonb);
  end if;
  perform rpg_private.bootstrap_review_before_sheet(kind,r-'sheet'-'equipmentProfile',proposal);
 else
  perform rpg_private.assert(not (r ? 'sheet') and not (r ? 'equipmentProfile'));
  perform rpg_private.bootstrap_review_before_sheet(kind,r,proposal);
 end if;
end $$;

-- The same authoritative Entity slot array supports the reviewed ordinary
-- humanoid profile. It is not added to narrative or unclassified protagonists.
create function rpg_private.bootstrap_humanoid_slots(lang text) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_array(
  jsonb_build_object('id','head','label',case when lang='ru' then 'Голова' else 'Head' end,'accepts',jsonb_build_array('armor','clothing')),
  jsonb_build_object('id','neck','label',case when lang='ru' then 'Шея / амулет' else 'Neck / Amulet' end,'accepts',jsonb_build_array('accessory','jewelry','gear')),
  jsonb_build_object('id','body','label',case when lang='ru' then 'Броня / плащ' else 'Armor / Coat' end,'accepts',jsonb_build_array('armor','clothing')),
  jsonb_build_object('id','hand','label',case when lang='ru' then 'Основная рука' else 'Main Hand' end,'accepts',jsonb_build_array('weapon')),
  jsonb_build_object('id','offhand','label',case when lang='ru' then 'Вторая рука' else 'Off Hand' end,'accepts',jsonb_build_array('weapon','shield')),
  jsonb_build_object('id','belt','label',case when lang='ru' then 'Пояс' else 'Belt' end,'accepts',jsonb_build_array('gear','clothing')),
  jsonb_build_object('id','legs','label',case when lang='ru' then 'Ноги' else 'Legs' end,'accepts',jsonb_build_array('armor','clothing')),
  jsonb_build_object('id','boots','label',case when lang='ru' then 'Сапоги' else 'Boots' end,'accepts',jsonb_build_array('armor','clothing'))
 )
$$;

-- The creation transaction attaches the approved profile before capture of
-- the first playable timeline manifest. No ordinary runtime patch can write it.
do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('public.rpg_bootstrap(uuid,uuid,text,jsonb)'::regprocedure);
 needle:=$n$result:=jsonb_build_object('requestId',p_payload->'requestId','campaignId',cid,'heroId',hero);$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('bootstrap:sheet' in d)=0);
 d:=replace(d,$n$'equipment_slots',case when review#>'{mechanics,weaponName}' is not null and review#>'{mechanics,weaponName}'<>'null' then '[{"id":"hand","label":"Hand","accepts":["weapon"]}]'::jsonb else '[]'::jsonb end$n$,
   $r$'equipment_slots',case when completed#>>'{result,result,output,schemaVersion}'='2' and review->>'equipmentProfile'='standard_humanoid' then rpg_private.bootstrap_humanoid_slots(lang) when completed#>>'{result,result,output,schemaVersion}'='2' and review ? 'equipmentProfile' then '[]'::jsonb when review#>'{mechanics,weaponName}' is not null and review#>'{mechanics,weaponName}'<>'null' then '[{"id":"hand","label":"Hand","accepts":["weapon"]}]'::jsonb else '[]'::jsonb end$r$);
 perform rpg_private.assert(position('bootstrap_humanoid_slots' in d)>0);
 d:=replace(d,needle,$r$if completed#>>'{result,result,output,schemaVersion}'='2' then
   update public.rpg_entities set character_sheet=review->'sheet',revision=revision+1 where campaign_id=cid and id=hero and kind='player' and character_sheet is null;
   perform rpg_private.assert(found);
  end if;
  result:=jsonb_build_object('requestId',p_payload->'requestId','campaignId',cid,'heroId',hero);$r$);
 execute d;
end $$;

-- Extend only the public Entity projection of the established source reader.
-- Private Character Model fields do not enter this projection.
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_sheet;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_sheet(cid,uid,mode); entities jsonb; begin
 select coalesce(jsonb_agg(x.value||jsonb_build_object('character_sheet',e.character_sheet) order by x.ordinality),'[]'::jsonb)
 into entities
 from jsonb_array_elements(result#>'{snapshot,entities}') with ordinality x(value,ordinality)
 join public.rpg_entities e on e.campaign_id=cid and e.id=(x.value->>'id')::uuid;
 return jsonb_set(result,'{snapshot,entities}',entities);
end $$;

revoke all on function rpg_private.bootstrap_sheet_valid(jsonb),rpg_private.bootstrap_humanoid_slots(text),rpg_private.bootstrap_proposal_before_sheet(text,jsonb,jsonb),rpg_private.bootstrap_proposal(text,jsonb,jsonb),rpg_private.bootstrap_review_before_sheet(text,jsonb,jsonb),rpg_private.bootstrap_review(text,jsonb,jsonb),rpg_private.runtime_source_before_sheet(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;
commit;
