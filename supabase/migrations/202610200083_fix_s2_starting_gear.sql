-- Fix run after session 2, stage D (items 14, 27, 33): the hero's starting things go on the doll at creation. A thing the
-- creation writes (the bootstrap's kind 'possession', which migration 76 turns into the kind its name says) is put on
-- its owner — a hero or a companion with the eleven slots — when one free slot takes it: the weapon in the main hand (a
-- second one-handed weapon or a shield in the off hand, never beside a bow, a crossbow or a staff), armour or clothing
-- on the body, a hat on the head, a cloak, gloves, boots, a belt, an amulet, rings left then right — the same slot words
-- as the model's (src/lib/inventory/model.ts). Single things only (a stack stays in the pack). Insert-only: existing
-- records and later moves are never touched; the owner takes anything off with «Снять».
begin;

create function rpg_private.starting_slot(p_owner uuid,p_kind text,p_name text) returns text language plpgsql stable set search_path='' as $$
declare slots jsonb; n text:=lower(coalesce(p_name,'')); wanted text[]; s text; taken text[];
  two constant text:='(лук|арбалет|посох|двуруч|алебард|bow|crossbow|staff|greatsword|halberd)';
begin
 select e.equipment_slots into slots from public.rpg_entities e where e.id=p_owner and e.kind in ('player','companion');
 if slots is null or jsonb_typeof(slots)<>'array' or jsonb_array_length(slots)=0 then return null; end if;
 select coalesce(array_agg(i.equipped_slot),'{}') into taken from public.rpg_items i where i.equipped_entity_id=p_owner and i.equipped_slot is not null;
 wanted:=case
  when n ~ '(кольц|перстен|ring)' then array['ring_left','ring_right']
  when n ~ '(амулет|медальон|ожерел|подвеск|талисман|клык|amulet|necklace|pendant|talisman)' then array['amulet']
  when n ~ '(плащ|накидк|cloak|cape|mantle)' then array['cloak']
  when n ~ '(перчат|наруч|рукавиц|gloves|gauntlet|bracer)' then array['gloves']
  when n ~ '(сапог|ботин|башмак|boots|shoes)' then array['boots']
  when n ~ '(шлем|шляп|капюшон|корон|диадем|очки|helm|hat|hood|crown|goggles)' then array['head']
  when n ~ '(пояс|ремен|belt)' then array['belt']
  when p_kind in ('armor','clothing') then array['body']
  when p_kind='shield' then array['offhand']
  when p_kind='weapon' then array['hand','offhand']
  else '{}'::text[] end;
 foreach s in array wanted loop
  if s=any(taken) then continue; end if;
  if s='offhand' and (n ~ two or exists(select 1 from public.rpg_items i where i.equipped_entity_id=p_owner and i.equipped_slot='hand' and lower(i.name) ~ two)) then continue; end if;
  if exists(select 1 from jsonb_array_elements(slots) x where x->>'id'=s and x->'accepts' ? p_kind) then return s; end if;
 end loop;
 return null;
end $$;

create or replace function rpg_private.item_kind_from_name() returns trigger language plpgsql set search_path='' as $$
declare slot text; begin
 if new.category='possession' then
  new.category:=rpg_private.guess_item_kind(new.name);
  if new.equipped_entity_id is null and new.owner_entity_id is not null and new.quantity=1 then
   slot:=rpg_private.starting_slot(new.owner_entity_id,new.category,new.name);
   if slot is not null then new.equipped_entity_id:=new.owner_entity_id; new.equipped_slot:=slot; end if;
  end if;
 end if;
 return new;
end $$;

revoke all on function rpg_private.starting_slot(uuid,text,text) from public,anon,authenticated;

commit;
