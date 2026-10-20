-- Fix run after session 2: the owner's one-time corrections of his session 2 hero, after the inventory conversion
-- (migration 77) — the wallet set to what the story left him (the owner: 60 → 36 gold, 57 → 46 silver) and the healing
-- potions as one stack of the right count (3). This migration only DEFINES the function; the owner's local session
-- calls it once on the sandbox (docs/SANDBOX_LOAD_FIX_S2.md):
--   select rpg_private.fix_s2_owner_corrections('<campaign id>', 36, 46, 3);
-- It returns the values before and after. Idempotent. Only the hero's wallet and his potion stack change; it refuses a
-- campaign whose coins are not converted yet (run rpg_private.fix_s2_inventory_convert() first).
begin;

create function rpg_private.fix_s2_owner_corrections(p_campaign uuid,p_gold integer,p_silver integer,p_potions integer) returns jsonb
language plpgsql set search_path='' as $$
declare hero record; ru boolean; gold text; silver text; stack record; bag uuid; before jsonb; minutes integer; potions_before integer; n integer;
begin
 perform rpg_private.assert(p_gold between 0 and 1000000 and p_silver between 0 and 1000000 and p_potions between 0 and 99);
 select count(*) into n from public.rpg_entities e where e.campaign_id=p_campaign and e.kind='player';
 if n<>1 then raise exception 'rpg_conflict' using detail='the campaign needs exactly one hero'; end if;
 select e.*,c.language into hero from public.rpg_entities e join public.rpg_campaigns c on c.id=e.campaign_id where e.campaign_id=p_campaign and e.kind='player';
 ru:=hero.language='ru'; gold:=case when ru then 'currency_зм' else 'currency_gp' end; silver:=case when ru then 'currency_см' else 'currency_sp' end;
 if exists(select 1 from jsonb_object_keys(hero.resources) k where k like 'currency\_%' and k !~ '_(max|min)$'
     and substr(k,10)<>coalesce(rpg_private.coin_code(substr(k,10),hero.language),substr(k,10))) then
  raise exception 'rpg_conflict' using detail='run rpg_private.fix_s2_inventory_convert() first';
 end if;
 select coalesce(sum(i.quantity),0) into potions_before from public.rpg_items i
  where i.campaign_id=p_campaign and i.owner_entity_id=hero.id and i.category='consumable' and i.name ~* '(зель|potion)' and i.quantity>0;
 before:=jsonb_build_object('gold',coalesce((hero.resources->>gold)::integer,0),'silver',coalesce((hero.resources->>silver)::integer,0),'potions',potions_before);
 select coalesce(r.world_minutes,0) into minutes from rpg_private.runtime_state r where r.campaign_id=p_campaign;
 update public.rpg_entities set resources=resources||jsonb_build_object(gold,p_gold,silver,p_silver),revision=revision+1,updated_at=now()
  where id=hero.id and (coalesce((resources->>gold)::integer,-1)<>p_gold or coalesce((resources->>silver)::integer,-1)<>p_silver);
 -- The potions: the hero's healing-potion stack takes the count; other potion stacks of his are left as they are.
 select i.* into stack from public.rpg_items i where i.campaign_id=p_campaign and i.owner_entity_id=hero.id and i.category='consumable'
  and i.name ~* '(лечени|healing)' and i.equipped_entity_id is null order by i.quantity desc,i.id limit 1;
 if stack.id is not null then
  if stack.quantity<>p_potions then
   update public.rpg_items set quantity=p_potions,revision=revision+1,updated_at=now(),
     detail=jsonb_set(detail,'{history}',coalesce(detail->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object('at',coalesce(minutes,0),'event','owner_corrected',
       'note',case when ru then 'поправка владельца после сессии 2' else 'the owner''s correction after session 2' end)))
    where id=stack.id;
  end if;
 elsif p_potions>0 then
  select s.id into bag from public.rpg_storages s where s.campaign_id=p_campaign and s.entity_id=hero.id order by s.id limit 1;
  if bag is null then raise exception 'rpg_conflict' using detail='the hero has no possessions storage'; end if;
  insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,detail,revision)
   values(gen_random_uuid(),p_campaign,case when ru then 'Зелье лечения' else 'Potion of healing' end,'consumable',p_potions,'',
    case when ru then 'Восстанавливает 2к4+2 хитов; выпить — бонусное действие.' else 'Restores 2d4+2 hit points; drinking it is a bonus action.' end,
    hero.id,bag,null,null,jsonb_build_object('history',jsonb_build_array(jsonb_build_object('at',coalesce(minutes,0),'event','owner_corrected',
      'note',case when ru then 'поправка владельца после сессии 2' else 'the owner''s correction after session 2' end))),1);
 end if;
 select coalesce(sum(i.quantity),0) into potions_before from public.rpg_items i
  where i.campaign_id=p_campaign and i.owner_entity_id=hero.id and i.category='consumable' and i.name ~* '(зель|potion)' and i.quantity>0;
 return jsonb_build_object('hero',hero.name,'before',before,'after',jsonb_build_object('gold',p_gold,'silver',p_silver,'potions',potions_before));
end $$;

revoke all on function rpg_private.fix_s2_owner_corrections(uuid,integer,integer,integer) from public,anon,authenticated;

commit;
