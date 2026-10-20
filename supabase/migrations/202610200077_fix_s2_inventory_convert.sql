-- Fix run after session 2, stage D: the one-time conversion of existing records to the inventory model of migration 76
-- (docs/runs/fix-s2-inventory-design.md §10). This migration only DEFINES it: rpg_private.fix_s2_inventory_convert()
-- changes data, so the owner's local session runs it once, after the database dump (docs/SANDBOX_LOAD_FIX_S2.md);
-- applying migrations never changes game state. New campaigns need none of it (migration 76: the eleven slots at
-- creation, a 'possession' gets its kind on insert). Idempotent: a converted record is left as it is; it returns what
-- it changed. Only these rows change — scenes, turns, saves and private state are never touched.
--  1. Kinds: an item of a kind the model does not know (the bootstrap's 'possession') gets the kind its name says
--     (rpg_private.guess_item_kind of migration 76, the same stems as guessKind in the model), else 'gear'.
--  2. The doll: a person record (hero, companion, NPC) with the older slots gets the eleven; what it wears stays on —
--     neck and talisman → Амулет, ring1/ring2 → the left and right ring, the rest by the same id; a thing whose new slot
--     does not take its kind takes the slot's kind; «Ноги» is gone, so a thing worn there comes off (kept in the
--     inventory), as does a second thing for one slot.
--  3. Potion counters → items: a counter named a potion or an elixir becomes that many potion items in the owner's
--     possessions (added to an identical stack when there is one); the counter and its bounds go. Never touched: hit
--     points, spell slots, hit dice, other counters.
--  4. Mounts carry saddlebags, not riders: a mount's passenger list is emptied (item 35).
--  5. Coins: a wallet entry named by a 5e coin word («золотые», «Зм», «gold») is kept under the coin's code (зм / gp),
--     two entries of one coin summed — so the DM's «золотые» and an older «зм» are one balance (coinOf in the model).
begin;

create function rpg_private.coin_code(label text,lang text) returns text language plpgsql immutable set search_path='' as $$
declare w text:=btrim(regexp_replace(replace(lower(label),'_',' '),'[«»"''“”.]','','g')); ru boolean:=lang='ru'; c record; s text; begin
 for c in select * from (values
   (1,case when ru then 'пм' else 'pp' end,array['пм','платин','pp','platinum']),
   (2,case when ru then 'зм' else 'gp' end,array['зм','золот','gp','gold']),
   (3,case when ru then 'эм' else 'ep' end,array['эм','электр','ep','electrum']),
   (4,case when ru then 'см' else 'sp' end,array['см','серебр','sp','silver']),
   (5,case when ru then 'мм' else 'cp' end,array['мм','медн','медяк','cp','copper'])) v(n,code,words) order by n loop
  foreach s in array c.words loop
   if (length(s)<=2 and (w=s or w like s||' %')) or (length(s)>2 and (w like s||'%' or w like '% '||s||'%')) then return c.code; end if;
  end loop;
 end loop;
 return null;
end $$;

create function rpg_private.fix_s2_inventory_convert() returns jsonb language plpgsql set search_path='' as $$
declare e record; i record; k text; v integer; slots jsonb; target text; slot jsonb; used text[]; bag uuid; item_name text; stack uuid;
  ru boolean; code text; next jsonb;
  kinds integer:=0; dolls integer:=0; worn_off integer:=0; potions integer:=0; coins integer:=0; mounts integer:=0;
  remap constant jsonb:='{"neck":"amulet","talisman":"amulet","ring1":"ring_left","ring2":"ring_right"}';
  eleven constant text[]:=array['amulet','belt','body','boots','cloak','gloves','hand','head','offhand','ring_left','ring_right'];
begin
 -- 1. Kinds.
 update public.rpg_items set category=rpg_private.guess_item_kind(name),revision=revision+1,updated_at=now()
  where category not in ('weapon','shield','armor','clothing','jewelry','accessory','ammunition','consumable','tool','gear','misc');
 get diagnostics kinds = row_count;

 -- 2. The doll.
 for e in select en.id,en.campaign_id,en.equipment_slots,c.language from public.rpg_entities en
   join public.rpg_campaigns c on c.id=en.campaign_id
   where en.kind in ('player','companion','npc') and jsonb_array_length(en.equipment_slots)>0 loop
  if (select array_agg(s->>'id' order by s->>'id') from jsonb_array_elements(e.equipment_slots) s)=eleven then continue; end if;
  slots:=rpg_private.universal_slots(case when e.language='ru' then 'ru' else 'en' end);
  used:='{}';
  for i in select it.id,it.category,it.equipped_slot from public.rpg_items it
    where it.campaign_id=e.campaign_id and it.equipped_entity_id=e.id order by it.updated_at,it.id loop
   target:=coalesce(remap->>i.equipped_slot,i.equipped_slot);
   slot:=null;
   select value into slot from jsonb_array_elements(slots) where value->>'id'=target;
   if slot is null or target=any(used) then
    update public.rpg_items set equipped_entity_id=null,equipped_slot=null,revision=revision+1,updated_at=now() where id=i.id;
    worn_off:=worn_off+1;
   else
    update public.rpg_items set equipped_slot=target,
      category=case when slot->'accepts' ? category then category else slot->'accepts'->>0 end,
      revision=revision+1,updated_at=now()
     where id=i.id and (equipped_slot<>target or not (slot->'accepts' ? category));
    used:=used||target;
   end if;
  end loop;
  update public.rpg_entities set equipment_slots=slots,revision=revision+1,updated_at=now() where id=e.id;
  dolls:=dolls+1;
 end loop;

 -- 3. Potion counters → items.
 for e in select en.id,en.campaign_id,en.kind,en.name,en.resources,c.language from public.rpg_entities en
   join public.rpg_campaigns c on c.id=en.campaign_id where en.kind in ('player','companion','npc') loop
  ru:=e.language='ru';
  for k in select key from jsonb_object_keys(e.resources) key
    where key !~ '_(max|min)$' and key ~* '((^|_)(healing_)?potions?($|_)|elixir|зель|эликсир)' loop
   v:=coalesce((e.resources->>k)::integer,0);
   if v>0 then
    bag:=null; stack:=null;
    select s.id into bag from public.rpg_storages s where s.campaign_id=e.campaign_id and s.entity_id=e.id order by s.id limit 1;
    if bag is null then
     bag:=gen_random_uuid();
     insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,detail,revision)
      values(bag,e.campaign_id,(case when ru then 'Вещи: ' else 'Possessions: ' end)||left(e.name,140),
        case e.kind when 'player' then 'player' when 'companion' then 'companion' else 'merchant' end,e.id,'{}',1);
    end if;
    item_name:=case when k ~* '(heal|лечен)' then case when ru then 'Зелье лечения' else 'Potion of healing' end
      else case when ru then 'Зелье' else 'Potion' end end;
    select it.id into stack from public.rpg_items it where it.campaign_id=e.campaign_id and it.storage_id=bag
      and it.owner_entity_id=e.id and it.category='consumable' and lower(it.name)=lower(item_name)
      and it.equipped_entity_id is null and it.quantity>0 order by it.id limit 1;
    if stack is not null then
     update public.rpg_items set quantity=quantity+v,revision=revision+1,updated_at=now() where id=stack;
    else
     insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,
       equipped_entity_id,equipped_slot,detail,revision)
      values(gen_random_uuid(),e.campaign_id,item_name,'consumable',v,'',
        case when k ~* '(heal|лечен)' then case when ru then 'Восстанавливает 2к4+2 хитов; выпить — бонусное действие.'
          else 'Restores 2d4+2 hit points; drinking it is a bonus action.' end else '' end,
        e.id,bag,null,null,
        jsonb_build_object('history',jsonb_build_array(jsonb_build_object('at',0,'event','created',
          'note',case when ru then 'перенесено из счётчика «'||k||'»' else 'moved from the counter "'||k||'"' end))),1);
    end if;
    potions:=potions+v;
   end if;
   update public.rpg_entities set resources=resources-k-(k||'_max')-(k||'_min'),revision=revision+1,updated_at=now() where id=e.id;
  end loop;
 end loop;

 -- 4. Mounts carry saddlebags, not riders.
 update public.rpg_entities set public_profile=jsonb_set(public_profile,'{holding,passengers}','[]'::jsonb),revision=revision+1,updated_at=now()
  where kind='mount' and jsonb_typeof(public_profile#>'{holding,passengers}')='array'
    and jsonb_array_length(public_profile#>'{holding,passengers}')>0;
 get diagnostics mounts = row_count;

 -- 5. Coins under their codes.
 for e in select en.id,en.resources,c.language from public.rpg_entities en join public.rpg_campaigns c on c.id=en.campaign_id
   where exists(select 1 from jsonb_object_keys(en.resources) key where key like 'currency\_%') loop
  next:=e.resources;
  for k in select key from jsonb_object_keys(e.resources) key where key like 'currency\_%' and key !~ '_(max|min)$' loop
   code:=rpg_private.coin_code(substr(k,10),e.language);
   if code is null or k='currency_'||code then continue; end if;
   v:=coalesce((next->>k)::integer,0);
   next:=(next-k)||jsonb_build_object('currency_'||code,coalesce((next->>('currency_'||code))::integer,0)+v);
  end loop;
  if next<>e.resources then
   update public.rpg_entities set resources=next,revision=revision+1,updated_at=now() where id=e.id;
   coins:=coins+1;
  end if;
 end loop;

 return jsonb_build_object('itemKinds',kinds,'dolls',dolls,'takenOff',worn_off,'potionItems',potions,'mounts',mounts,'wallets',coins);
end $$;

revoke all on function rpg_private.coin_code(text,text),rpg_private.fix_s2_inventory_convert() from public,anon,authenticated;

commit;
