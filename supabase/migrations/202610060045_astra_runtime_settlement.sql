-- Bounded post-takeover ordinary mechanics. A committed Astra turn is the
-- exact-once receipt; World authoring and historical World Events stay frozen.
begin;

-- Both columns ride in the existing save/timeline row families. Old manifests
-- restore NULL and keep their historical meaning.
alter table rpg_private.turns add column astra_settlement jsonb;
alter table public.rpg_quests add column reward_terms jsonb;
alter table public.rpg_quests add column reward_operation_id uuid;

comment on column rpg_private.turns.astra_settlement is
  'Private pinned deterministic ordinary-mechanics plan; never a browser write contract.';
comment on column public.rpg_quests.reward_terms is
  'Bounded public job terms authored by a committed Astra operation.';
comment on column public.rpg_quests.reward_operation_id is
  'The committed gameplay operation that claimed this job reward once.';

create function rpg_private.astra_settlement_text(v text, maximum integer)
returns boolean language sql immutable set search_path='' as $$
 select coalesce(v=btrim(v) and length(v) between 1 and maximum and
   v !~ '[[:cntrl:]]',false)
$$;

create function rpg_private.astra_settlement_currency(cid uuid, name text,
  may_create boolean) returns jsonb language plpgsql stable set search_path='' as $$
declare s jsonb; currencies jsonb; matching jsonb; id text; key text;
  definition jsonb; n integer;
begin
 perform rpg_private.assert(rpg_private.astra_settlement_text(name,32) and
   name ~ '^[a-z]+( [a-z]+)*$');
 select loop_state into strict s from rpg_private.world_foundations
   where campaign_id=cid;
 currencies:=s->'currencies';
 perform rpg_private.assert(jsonb_typeof(currencies)='array');
 select count(*) into n from jsonb_array_elements(currencies)
   where lower(btrim(value->>'label'))=name;
 perform rpg_private.assert(n<=1);
 if n=1 then
   select value into matching from jsonb_array_elements(currencies)
     where lower(btrim(value->>'label'))=name limit 1;
   perform rpg_private.fields(matching,
     array['id','label','resourceKey','version']);
   perform rpg_private.assert(matching->>'resourceKey' ~
     '^[A-Za-z][A-Za-z0-9_-]{0,79}$' and
     rpg_private.wave4_integer(matching->'version',1));
   return jsonb_build_object('definition',matching,'newDefinition',null);
 end if;
 perform rpg_private.assert(may_create and jsonb_array_length(currencies)<32);
 id:='currency:'||replace(name,' ','_');
 key:='currency_'||replace(name,' ','_');
 perform rpg_private.assert(not exists(select 1
   from jsonb_array_elements(currencies) c where c.value->>'id'=id or
     c.value->>'resourceKey'=key));
 definition:=jsonb_build_object('id',id,'label',name,
   'resourceKey',key,'version',1);
 return jsonb_build_object('definition',definition,
   'newDefinition',definition);
end $$;

create function rpg_private.astra_settlement_player_storage(cid uuid,
  eid uuid) returns uuid language sql stable set search_path='' as $$
 select id from public.rpg_storages where campaign_id=cid and entity_id=eid
   and kind='player' order by id limit 1
$$;

-- This function independently reconstructs the exact changes from current
-- authoritative rows. The model's intent never gains RecordChange authority.
create function rpg_private.astra_settlement_expected(
  cid uuid,t rpg_private.turns, plan jsonb) returns jsonb
language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare kind text; intent jsonb; changes jsonb:='[]'::jsonb;
  outcome jsonb; currency_definition jsonb:='null'::jsonb;
  picked jsonb; definition jsonb; currency_name text; currency_amount integer;
  item_name text; item_category text; item_description text;
  title text; description text; rewards text; terms jsonb;
  hero public.rpg_entities%rowtype; npc public.rpg_entities%rowtype;
  quest public.rpg_quests%rowtype; item public.rpg_items%rowtype;
  quest_id uuid; item_id uuid; storage_id uuid; source_id uuid;
  recipient_id uuid; amount integer; price integer;
  after_balance bigint; source_balance bigint; seller_after bigint;
  key text; has_currency boolean; has_item boolean;
  source_row jsonb; quest_row jsonb; item_row jsonb;
  policy_row jsonb; current_policy jsonb;
begin
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent',
   'changes','currencyDefinition','publicOutcome']);
 kind:=plan->>'kind'; intent:=plan->'intent';
 perform rpg_private.assert(plan->'schemaVersion'='1'::jsonb and
   kind in ('job_offer','job_complete','job_reward','mundane_grant',
     'currency_transfer','item_transfer','mundane_purchase') and
   jsonb_typeof(plan->'changes')='array' and
   jsonb_array_length(plan->'changes') between 1 and 4 and
   t.campaign_id=cid and t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and t.source->'worldTakeover' is not null and
   rpg_private.astra_takeover_active(cid) and
   jsonb_array_length(t.source#>'{runtime,configuration,controlledEntityIds}')=1);
 recipient_id:=(t.source#>>'{runtime,configuration,controlledEntityIds,0}')::uuid;
 select e.* into hero from public.rpg_entities e where e.campaign_id=cid
   and e.id=recipient_id and e.kind='player';
 perform rpg_private.assert(hero.id is not null and
   exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
     where e.value->>'id'=hero.id::text and
       e.value->>'revision'=hero.revision::text));
 outcome:=jsonb_build_object('kind',kind,'questId',null,
   'questStatus',null,'currency',null,'item',null);
 if kind='job_offer' then
   perform rpg_private.fields(intent,array['kind','issuerId','title',
     'description','currencyName','currencyAmount','itemName',
     'itemCategory','itemDescription']);
   perform rpg_private.assert(intent->>'kind'=kind and
     rpg_private.astra_settlement_text(intent->>'title',120) and
     rpg_private.astra_settlement_text(intent->>'description',500));
   source_id:=(intent->>'issuerId')::uuid;
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid
     and e.id=source_id and e.kind='npc';
   perform rpg_private.assert(npc.id is not null and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text and
     exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
       where e.value->>'id'=npc.id::text and
         e.value->>'revision'=npc.revision::text));
   has_currency:=intent->'currencyName'<>'null'::jsonb or
     intent->'currencyAmount'<>'null'::jsonb;
   has_item:=intent->'itemName'<>'null'::jsonb or
     intent->'itemCategory'<>'null'::jsonb or
     intent->'itemDescription'<>'null'::jsonb;
   perform rpg_private.assert(has_currency or has_item);
   if has_currency then
     currency_name:=intent->>'currencyName';
     currency_amount:=(intent->>'currencyAmount')::integer;
     perform rpg_private.assert(rpg_private.astra_settlement_text(currency_name,32)
       and currency_name ~ '^[a-z]+( [a-z]+)*$' and
       rpg_private.wave4_integer(intent->'currencyAmount',1,20));
   else
     perform rpg_private.assert(intent->'currencyName'='null'::jsonb and
       intent->'currencyAmount'='null'::jsonb);
   end if;
   if has_item then
     item_name:=intent->>'itemName';
     item_category:=intent->>'itemCategory';
     item_description:=coalesce(intent->>'itemDescription',
       'Ordinary '||item_name||'.');
     perform rpg_private.assert(rpg_private.astra_settlement_text(item_name,80)
       and item_category in ('food','supply','misc') and
       rpg_private.astra_settlement_text(item_description,160) and
       intent->>'itemDescription'=item_description);
   else
     perform rpg_private.assert(intent->'itemName'='null'::jsonb and
       intent->'itemCategory'='null'::jsonb and
       intent->'itemDescription'='null'::jsonb);
   end if;
   title:=intent->>'title'; description:=intent->>'description';
   rewards:=concat_ws(' and ',case when has_currency then
     currency_amount::text||' '||currency_name end,
     case when has_item then item_name end);
   quest_id:=rpg_private.wave4_id(t.id,'astra:job');
   perform rpg_private.assert(not exists(select 1 from public.rpg_quests
     where id=quest_id));
   changes:=jsonb_build_array(jsonb_build_object('family','quests',
     'id',quest_id,'expectedRevision',null,'values',
     jsonb_build_object('title',title,'description',
       description||E'\nReward: '||rewards||'.','status','open')));
   outcome:=outcome||jsonb_build_object('questId',quest_id,
     'questStatus','open');
 elsif kind='job_complete' or kind='job_reward' then
   if kind='job_complete' then
     perform rpg_private.fields(intent,array['kind','questId']);
   else
     perform rpg_private.fields(intent,array['kind','questId','recipientId']);
     perform rpg_private.assert(intent->>'recipientId'=recipient_id::text);
   end if;
   perform rpg_private.assert(intent->>'kind'=kind);
   quest_id:=(intent->>'questId')::uuid;
   select * into quest from public.rpg_quests where campaign_id=cid
     and id=quest_id;
   select value into quest_row from jsonb_array_elements(t.source#>'{snapshot,quests}')
     where value->>'id'=quest_id::text;
   perform rpg_private.assert(quest.id is not null and quest.reward_terms is not null
     and quest.reward_operation_id is null and quest_row is not null and
     quest_row->>'revision'=quest.revision::text and
     exists(select 1 from jsonb_array_elements(t.source->'astraSettlementJobs') j
       where j.value->>'questId'=quest_id::text and
         j.value->'rewardTerms'=quest.reward_terms and
         j.value->'rewardOperationId'='null'::jsonb));
   outcome:=outcome||jsonb_build_object('questId',quest_id,
     'questStatus','complete');
   if kind='job_complete' then
     perform rpg_private.assert(quest.status='open');
   else
     perform rpg_private.assert(quest.status='complete');
     terms:=quest.reward_terms;
     source_id:=(terms->>'issuerId')::uuid;
     select e.* into npc from public.rpg_entities e where e.campaign_id=cid
       and e.id=source_id and e.kind='npc';
     perform rpg_private.assert(npc.id is not null and
       t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
     if terms->'currencyName'<>'null'::jsonb then
       currency_name:=terms->>'currencyName';
       currency_amount:=(terms->>'currencyAmount')::integer;
       perform rpg_private.assert(rpg_private.wave4_integer(
         terms->'currencyAmount',1,20));
       picked:=rpg_private.astra_settlement_currency(cid,currency_name,true);
       definition:=picked->'definition';
       currency_definition:=picked->'newDefinition';
       key:=definition->>'resourceKey';
       after_balance:=coalesce((hero.resources->>key)::bigint,0)+currency_amount;
       perform rpg_private.assert(after_balance between 0 and 1000000);
       changes:=changes||jsonb_build_array(jsonb_build_object('family','entities',
         'id',hero.id,'expectedRevision',hero.revision,'values',
         jsonb_build_object('resources',hero.resources||
           jsonb_build_object(key,after_balance))));
       outcome:=jsonb_set(outcome,'{currency}',jsonb_build_object(
         'name',currency_name,'amount',currency_amount,
         'resourceKey',key,'after',after_balance));
     end if;
     if terms->'itemName'<>'null'::jsonb then
       item_name:=terms->>'itemName';
       item_category:=terms->>'itemCategory';
       item_description:=terms->>'itemDescription';
       perform rpg_private.assert(rpg_private.astra_settlement_text(item_name,80)
         and item_category in ('food','supply','misc') and
         rpg_private.astra_settlement_text(item_description,160));
       storage_id:=rpg_private.astra_settlement_player_storage(cid,hero.id);
       perform rpg_private.assert(storage_id is not null);
       item_id:=rpg_private.wave4_id(t.id,'astra:reward-item:'||quest.id::text);
       perform rpg_private.assert(not exists(select 1 from public.rpg_items
         where id=item_id));
       changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
         'id',item_id,'expectedRevision',null,'values',jsonb_build_object(
           'name',item_name,'category',item_category,'quantity',1,
           'description',item_description,'mechanics','',
           'owner_entity_id',hero.id,'storage_id',storage_id,
           'equipped_entity_id',null,'equipped_slot',null)));
       outcome:=jsonb_set(outcome,'{item}',jsonb_build_object('id',item_id,
         'name',item_name,'quantity',1));
     end if;
   end if;
   changes:=changes||jsonb_build_array(jsonb_build_object('family','quests',
     'id',quest.id,'expectedRevision',quest.revision,
     'values',jsonb_build_object('status','complete')));
 elsif kind='mundane_grant' then
   perform rpg_private.fields(intent,array['kind','issuerId','recipientId',
     'currencyName','currencyAmount','itemName','itemCategory',
     'itemDescription']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'recipientId'=recipient_id::text);
   source_id:=(intent->>'issuerId')::uuid;
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid
     and e.id=source_id and e.kind='npc';
   select value into source_row from jsonb_array_elements(
     t.source#>'{snapshot,entities}') where value->>'id'=source_id::text;
   perform rpg_private.assert(npc.id is not null and source_row is not null
     and source_row->>'revision'=npc.revision::text and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
   has_currency:=intent->'currencyName'<>'null'::jsonb or
     intent->'currencyAmount'<>'null'::jsonb;
   has_item:=intent->'itemName'<>'null'::jsonb or
     intent->'itemCategory'<>'null'::jsonb or
     intent->'itemDescription'<>'null'::jsonb;
   perform rpg_private.assert(has_currency or has_item);
   if has_currency then
     currency_name:=intent->>'currencyName';
     currency_amount:=(intent->>'currencyAmount')::integer;
     perform rpg_private.assert(rpg_private.wave4_integer(
       intent->'currencyAmount',1,20));
     picked:=rpg_private.astra_settlement_currency(cid,currency_name,true);
     definition:=picked->'definition';
     currency_definition:=picked->'newDefinition';
     key:=definition->>'resourceKey';
     -- If the visible issuer already has recorded funds, this must be an
     -- authoritative transfer, not a new mint of the same stock.
     perform rpg_private.assert(coalesce((npc.resources->>key)::bigint,0)=0);
     after_balance:=coalesce((hero.resources->>key)::bigint,0)+currency_amount;
     perform rpg_private.assert(after_balance between 0 and 1000000);
     changes:=changes||jsonb_build_array(jsonb_build_object('family','entities',
       'id',hero.id,'expectedRevision',hero.revision,'values',
       jsonb_build_object('resources',hero.resources||
         jsonb_build_object(key,after_balance))));
     outcome:=jsonb_set(outcome,'{currency}',jsonb_build_object(
       'name',currency_name,'amount',currency_amount,
       'resourceKey',key,'after',after_balance));
   else
     perform rpg_private.assert(intent->'currencyName'='null'::jsonb and
       intent->'currencyAmount'='null'::jsonb);
   end if;
   if has_item then
     item_name:=intent->>'itemName';
     item_category:=intent->>'itemCategory';
     item_description:=coalesce(intent->>'itemDescription',
       'Ordinary '||item_name||'.');
     perform rpg_private.assert(rpg_private.astra_settlement_text(item_name,80)
       and item_category in ('food','supply','misc') and
       rpg_private.astra_settlement_text(item_description,160) and
       intent->>'itemDescription'=item_description);
     storage_id:=rpg_private.astra_settlement_player_storage(cid,hero.id);
     perform rpg_private.assert(storage_id is not null);
     perform rpg_private.assert(not exists(select 1 from public.rpg_items i
       where i.campaign_id=cid and i.owner_entity_id=npc.id and
         i.quantity>0 and i.category=item_category and
         lower(btrim(i.name))=lower(item_name)));
     item_id:=rpg_private.wave4_id(t.id,'astra:grant-item');
     perform rpg_private.assert(not exists(select 1 from public.rpg_items
       where id=item_id));
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',item_id,'expectedRevision',null,'values',jsonb_build_object(
         'name',item_name,'category',item_category,'quantity',1,
         'description',item_description,'mechanics','',
         'owner_entity_id',hero.id,'storage_id',storage_id,
         'equipped_entity_id',null,'equipped_slot',null)));
     outcome:=jsonb_set(outcome,'{item}',jsonb_build_object('id',item_id,
       'name',item_name,'quantity',1));
   else
     perform rpg_private.assert(intent->'itemName'='null'::jsonb and
       intent->'itemCategory'='null'::jsonb and
       intent->'itemDescription'='null'::jsonb);
   end if;
 elsif kind='currency_transfer' then
   perform rpg_private.fields(intent,array['kind','sourceEntityId',
     'recipientId','currencyName','amount']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'recipientId'=recipient_id::text and
     rpg_private.wave4_integer(intent->'amount',1,20));
   source_id:=(intent->>'sourceEntityId')::uuid;
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid and
     e.id=source_id and e.kind='npc';
   select value into source_row from jsonb_array_elements(t.source#>'{snapshot,entities}')
     where value->>'id'=source_id::text;
   perform rpg_private.assert(npc.id is not null and source_row is not null and
     source_row->>'revision'=npc.revision::text and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
   amount:=(intent->>'amount')::integer;
   currency_name:=intent->>'currencyName';
   picked:=rpg_private.astra_settlement_currency(cid,currency_name,false);
   definition:=picked->'definition'; key:=definition->>'resourceKey';
   source_balance:=coalesce((npc.resources->>key)::bigint,0);
   after_balance:=coalesce((hero.resources->>key)::bigint,0)+amount;
   perform rpg_private.assert(source_balance>=amount and
     after_balance between 0 and 1000000);
   changes:=jsonb_build_array(
     jsonb_build_object('family','entities','id',npc.id,
       'expectedRevision',npc.revision,'values',
       jsonb_build_object('resources',npc.resources||
         jsonb_build_object(key,source_balance-amount))),
     jsonb_build_object('family','entities','id',hero.id,
       'expectedRevision',hero.revision,'values',
       jsonb_build_object('resources',hero.resources||
         jsonb_build_object(key,after_balance))));
   outcome:=jsonb_set(outcome,'{currency}',jsonb_build_object(
     'name',currency_name,'amount',amount,'resourceKey',key,
     'after',after_balance));
 elsif kind='item_transfer' then
   perform rpg_private.fields(intent,array['kind','sourceEntityId',
     'recipientId','itemId','quantity']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'recipientId'=recipient_id::text and
     rpg_private.wave4_integer(intent->'quantity',1,20));
   source_id:=(intent->>'sourceEntityId')::uuid;
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid and
     e.id=source_id and e.kind='npc';
   perform rpg_private.assert(npc.id is not null and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
   select * into item from public.rpg_items where campaign_id=cid and
     id=(intent->>'itemId')::uuid and owner_entity_id=source_id;
   select value into item_row from jsonb_array_elements(t.source#>'{snapshot,items}')
     where value->>'id'=item.id::text;
   select value into policy_row from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=item.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into current_policy from rpg_private.world_foundations w,
       jsonb_array_elements(w.loop_state->'itemPolicies') p
     where w.campaign_id=cid and p.value->>'itemId'=item.id::text;
   amount:=(intent->>'quantity')::integer;
   perform rpg_private.assert(item.id is not null and item_row is not null and
     item_row->>'revision'=item.revision::text and
     policy_row is not distinct from current_policy and
     (policy_row is null or (policy_row->>'visibility'='public' and
       policy_row->>'trade'='allowed')) and
     item.quantity>=amount and item.equipped_entity_id is null and
     item.equipped_slot is null and item.category in ('food','supply','misc')
     and btrim(item.mechanics)='');
   storage_id:=rpg_private.astra_settlement_player_storage(cid,hero.id);
   perform rpg_private.assert(storage_id is not null);
   item_id:=case when item.quantity=amount then item.id else
     rpg_private.wave4_id(t.id,'astra:transfer-item:'||item.id::text) end;
   if item_id=item.id then
     changes:=jsonb_build_array(jsonb_build_object('family','items',
       'id',item.id,'expectedRevision',item.revision,'values',
       jsonb_build_object('quantity',amount,'owner_entity_id',hero.id,
         'storage_id',storage_id,'equipped_entity_id',null,
         'equipped_slot',null)));
   else
     perform rpg_private.assert(not exists(select 1 from public.rpg_items
       where id=item_id));
     changes:=jsonb_build_array(
       jsonb_build_object('family','items','id',item.id,
         'expectedRevision',item.revision,'values',
         jsonb_build_object('quantity',item.quantity-amount)),
       jsonb_build_object('family','items','id',item_id,
         'expectedRevision',null,'values',jsonb_build_object(
           'name',item.name,'category',item.category,
           'description',item.description,'mechanics',item.mechanics,
           'quantity',amount,'owner_entity_id',hero.id,
           'storage_id',storage_id,'equipped_entity_id',null,
           'equipped_slot',null)));
   end if;
   outcome:=jsonb_set(outcome,'{item}',jsonb_build_object('id',item_id,
     'name',item.name,'quantity',amount));
 elsif kind='mundane_purchase' then
   perform rpg_private.fields(intent,array['kind','sellerId','recipientId',
     'itemId','quantity','currencyName','price']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'recipientId'=recipient_id::text and
     rpg_private.wave4_integer(intent->'quantity',1,20) and
     rpg_private.wave4_integer(intent->'price',1,20));
   source_id:=(intent->>'sellerId')::uuid;
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid
     and e.id=source_id and e.kind='npc';
   select value into source_row from jsonb_array_elements(
     t.source#>'{snapshot,entities}') where value->>'id'=source_id::text;
   perform rpg_private.assert(npc.id is not null and source_row is not null and
     source_row->>'revision'=npc.revision::text and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text and
     exists(select 1 from jsonb_array_elements(t.source#>'{worldTakeover,actors}') a
       where a.value->>'entityId'=source_id::text and
         jsonb_typeof(a.value->'publicName')='string' and
         length(a.value->>'publicName')>0));
   price:=(intent->>'price')::integer;
   currency_name:=intent->>'currencyName';
   picked:=rpg_private.astra_settlement_currency(cid,currency_name,false);
   definition:=picked->'definition'; key:=definition->>'resourceKey';
   source_balance:=coalesce((hero.resources->>key)::bigint,0);
   seller_after:=coalesce((npc.resources->>key)::bigint,0)+price;
   perform rpg_private.assert(source_balance>=price and
     seller_after between 0 and 1000000);
   select * into item from public.rpg_items where campaign_id=cid and
     id=(intent->>'itemId')::uuid and owner_entity_id=source_id;
   select value into item_row from jsonb_array_elements(t.source#>'{snapshot,items}')
     where value->>'id'=item.id::text;
   select value into policy_row from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=item.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into current_policy from rpg_private.world_foundations w,
       jsonb_array_elements(w.loop_state->'itemPolicies') p
     where w.campaign_id=cid and p.value->>'itemId'=item.id::text;
   amount:=(intent->>'quantity')::integer;
   perform rpg_private.assert(item.id is not null and item_row is not null and
     item_row->>'revision'=item.revision::text and
     policy_row is not distinct from current_policy and
     (policy_row is null or (policy_row->>'visibility'='public' and
       policy_row->>'trade'='allowed')) and
     item.quantity>=amount and item.equipped_entity_id is null and
     item.equipped_slot is null and item.category in ('food','supply','misc')
     and btrim(item.mechanics)='');
   storage_id:=rpg_private.astra_settlement_player_storage(cid,hero.id);
   perform rpg_private.assert(storage_id is not null);
   item_id:=case when item.quantity=amount then item.id else
     rpg_private.wave4_id(t.id,'astra:purchase-item:'||item.id::text) end;
   changes:=jsonb_build_array(
     jsonb_build_object('family','entities','id',hero.id,
       'expectedRevision',hero.revision,'values',
       jsonb_build_object('resources',hero.resources||
         jsonb_build_object(key,source_balance-price))),
     jsonb_build_object('family','entities','id',npc.id,
       'expectedRevision',npc.revision,'values',
       jsonb_build_object('resources',npc.resources||
         jsonb_build_object(key,seller_after))));
   if item_id=item.id then
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',item.id,'expectedRevision',item.revision,'values',
       jsonb_build_object('quantity',amount,'owner_entity_id',hero.id,
         'storage_id',storage_id,'equipped_entity_id',null,
         'equipped_slot',null)));
   else
     perform rpg_private.assert(not exists(select 1 from public.rpg_items
       where id=item_id));
     changes:=changes||jsonb_build_array(
       jsonb_build_object('family','items','id',item.id,
         'expectedRevision',item.revision,'values',
         jsonb_build_object('quantity',item.quantity-amount)),
       jsonb_build_object('family','items','id',item_id,
         'expectedRevision',null,'values',jsonb_build_object(
           'name',item.name,'category',item.category,
           'description',item.description,'mechanics',item.mechanics,
           'quantity',amount,'owner_entity_id',hero.id,
           'storage_id',storage_id,'equipped_entity_id',null,
           'equipped_slot',null)));
   end if;
   outcome:=jsonb_set(outcome,'{currency}',jsonb_build_object(
     'name',currency_name,'amount',-price,'resourceKey',key,
     'after',source_balance-price));
   outcome:=jsonb_set(outcome,'{item}',jsonb_build_object('id',item_id,
     'name',item.name,'quantity',amount));
 end if;
 return jsonb_build_object('schemaVersion',1,'kind',kind,'intent',intent,
   'changes',changes,'currencyDefinition',currency_definition,
   'publicOutcome',outcome);
end $$;

revoke all on function rpg_private.astra_settlement_text(text,integer)
  from public,anon,authenticated;
revoke all on function rpg_private.astra_settlement_currency(uuid,text,boolean)
  from public,anon,authenticated;
revoke all on function rpg_private.astra_settlement_player_storage(uuid,uuid)
  from public,anon,authenticated;
revoke all on function rpg_private.astra_settlement_expected(uuid,rpg_private.turns,jsonb)
  from public,anon,authenticated;

-- Permit exactly one mechanics currency definition append while the old World
-- Foundation's authored world, topology, actors, policies and events remain
-- frozen. The caller must already have committed the matching pinned turn in
-- this same database transaction. Timeline restoration keeps its old path.
create or replace function rpg_private.astra_takeover_freeze_world()
returns trigger language plpgsql set search_path='' as $$
declare op text:=current_setting('rpg.astra_settlement_operation',true);
  pinned jsonb; expected jsonb;
begin
 if tg_op='DELETE' then
   if old.astra_takeover is not null and
     not rpg_private.timeline_restoring(old.campaign_id) then
     raise exception 'rpg_conflict'; end if;
   return old;
 end if;
 if old.astra_takeover is not null and
   not rpg_private.timeline_restoring(old.campaign_id) and
   (to_jsonb(new)-'revision'-'updated_at') is distinct from
   (to_jsonb(old)-'revision'-'updated_at') then
   if op ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
     select t.astra_settlement into pinned from rpg_private.turns t
       where t.campaign_id=old.campaign_id and t.id=op::uuid
         and t.runtime_identity='astra-primary-v1' and t.status='committed';
     if pinned->'currencyDefinition'<>'null'::jsonb and
       new.campaign_id=old.campaign_id and
       new.revision=old.revision+1 and
       new.loop_state is not null and old.loop_state is not null and
       new.loop_state->'currencies'=old.loop_state->'currencies'||
         jsonb_build_array(pinned->'currencyDefinition') and
       new.loop_state->'version'=to_jsonb((old.loop_state->>'version')::integer+1)
       then
       expected:=jsonb_set(jsonb_set(old.loop_state,'{currencies}',
         old.loop_state->'currencies'||jsonb_build_array(
           pinned->'currencyDefinition')),'{version}',
         to_jsonb((old.loop_state->>'version')::integer+1));
       if new.loop_state=expected and
         (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
         (to_jsonb(old)-'revision'-'updated_at'-'loop_state') then
         perform rpg_private.wave4_state(old.campaign_id,new.loop_state,
           old.ruleset);
         return new;
       end if;
     end if;
   end if;
   raise exception 'rpg_conflict';
 end if;
 return new;
end $$;

-- The existing turn wrapper autosaves during its delegated commit. A
-- settlement must be included in that save, so only its inner autosave is
-- delayed; the outer wrapper creates the same turn:key save after all rows
-- are changed. No immutable manifest is rewritten.
alter function rpg_private.timeline_save(uuid,text,text,text)
  rename to timeline_save_before_astra_settlement;
-- The original PL/pgSQL body qualifies its trigger_key argument with its
-- function name; adjust that qualification after the rename, without changing
-- its save behavior.
do $$ declare d text; begin
 d:=pg_get_functiondef(
   'rpg_private.timeline_save_before_astra_settlement(uuid,text,text,text)'::regprocedure);
 perform rpg_private.assert(position('timeline_save.trigger_key' in d)>0);
 execute replace(d,'timeline_save.trigger_key',
   'timeline_save_before_astra_settlement.trigger_key');
end $$;

create function rpg_private.timeline_save(cid uuid, kind text, name text,
  trigger_key text default null) returns uuid language plpgsql set search_path='' as $$
declare op text:=current_setting('rpg.astra_settlement_operation',true);
begin
 if kind='autosave' and op ~
   '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' and
   trigger_key='turn:'||op and exists(
     select 1 from rpg_private.turns t where t.campaign_id=cid
       and t.id=op::uuid and t.status='committed'
       and t.runtime_identity='astra-primary-v1'
       and t.astra_settlement is not null) then
   return null;
 end if;
 return rpg_private.timeline_save_before_astra_settlement(cid,kind,name,
   trigger_key);
end $$;

revoke all on function rpg_private.timeline_save(uuid,text,text,text)
  from public,anon,authenticated;
revoke all on function rpg_private.timeline_save_before_astra_settlement(uuid,text,text,text)
  from public,anon,authenticated;

-- Preserve all existing runtime guards. This wrapper owns only the new
-- private settlement pin and the final deterministic append after the
-- existing Astra commit guard has accepted the unchanged base packet.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_settlement;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,
  p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; result jsonb; clean_payload jsonb;
  source jsonb; currencies jsonb; jobs jsonb; policies jsonb; incoming jsonb;
  expected jsonb; v jsonb; pair record; terms jsonb;
  op uuid; old_currency jsonb; next_currency jsonb;
begin
 if p_action not in ('claim','checkpoint','commit') then
   return public.rpg_runtime_before_astra_settlement(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry
   where user_id=p_owner_id) then
   raise exception 'rpg_forbidden' using errcode='42501';
 end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 op:=(p_payload->>'operationId')::uuid;
 select * into t from rpg_private.turns where campaign_id=p_campaign_id
   and owner_id=p_owner_id and id=op for update;
 if t.id is null then raise exception 'rpg_not_found'; end if;
 if p_action='claim' then
   result:=public.rpg_runtime_before_astra_settlement(p_owner_id,
     p_campaign_id,p_action,p_payload,p_timeline);
   if result is null then return null; end if;
   select * into strict t from rpg_private.turns where id=op
     and campaign_id=p_campaign_id for update;
   if t.runtime_identity<>'astra-primary-v1' or
     not rpg_private.astra_takeover_active(p_campaign_id) then
     return result;
   end if;
   perform rpg_private.assert((t.source ? 'astraSettlementCurrencies')=
     (t.source ? 'astraSettlementJobs') and
     (t.source ? 'astraSettlementCurrencies')=
     (t.source ? 'astraSettlementItemPolicies'));
   source:=t.source;
   if not source ? 'astraSettlementCurrencies' then
     select coalesce(loop_state->'currencies','[]'::jsonb) into currencies
       from rpg_private.world_foundations where campaign_id=p_campaign_id;
     select coalesce(jsonb_agg(jsonb_build_object('questId',q.id,
       'issuerId',q.reward_terms->'issuerId',
       'rewardTerms',q.reward_terms,
       'rewardOperationId',q.reward_operation_id) order by q.id),'[]'::jsonb)
       into jobs from public.rpg_quests q where q.campaign_id=p_campaign_id
         and q.reward_terms is not null;
     select coalesce(jsonb_agg(jsonb_build_object('itemId',p.value->'itemId',
       'visibility',p.value->'visibility','trade',p.value->'trade')
       order by p.value->>'itemId'),'[]'::jsonb) into policies
       from rpg_private.world_foundations w,
         jsonb_array_elements(w.loop_state->'itemPolicies') p
       where w.campaign_id=p_campaign_id;
     source:=source||jsonb_build_object(
       'astraSettlementCurrencies',currencies,
       'astraSettlementJobs',jobs,
       'astraSettlementItemPolicies',policies);
     update rpg_private.turns set source=source where id=op and
       campaign_id=p_campaign_id;
   end if;
   result:=jsonb_set(result,'{source}',source);
   if t.astra_settlement is not null then
     result:=jsonb_set(result,'{turn,checkpoint,astraSettlement}',
       t.astra_settlement,true);
   end if;
   return result;
 end if;
 if p_action='checkpoint' then
   incoming:=coalesce(p_payload#>'{checkpoint,astraSettlement}',
     'null'::jsonb);
   if incoming<>'null'::jsonb and t.astra_settlement is null then
     perform rpg_private.assert(t.runtime_identity='astra-primary-v1' and
       rpg_private.astra_takeover_active(p_campaign_id) and
       t.source->'astraSettlementCurrencies' is not null and
       t.source->'astraSettlementJobs' is not null and
       t.source->'astraSettlementItemPolicies' is not null and
       p_payload#>>'{checkpoint,astraPrimary,finalProposal,schemaVersion}'='1' and
       t.checkpoint#>'{astraPrimary,finalProposal}'='null'::jsonb);
   end if;
   if t.astra_settlement is not null then
     if incoming<>t.astra_settlement then raise exception 'rpg_conflict'; end if;
   elsif incoming<>'null'::jsonb then
     -- Validate its exact shape at pin time, then revalidate against current
     -- revisions at commit. A failure cannot leave a partial pin.
     expected:=rpg_private.astra_settlement_expected(
       p_campaign_id,t,incoming);
     perform rpg_private.assert(expected=incoming);
   end if;
   clean_payload:=jsonb_set(p_payload,'{checkpoint}',
     (p_payload->'checkpoint')-'astraSettlement');
   result:=public.rpg_runtime_before_astra_settlement(p_owner_id,
     p_campaign_id,p_action,clean_payload,p_timeline);
   if incoming<>'null'::jsonb and t.astra_settlement is null then
     update rpg_private.turns set astra_settlement=incoming where id=op
       and campaign_id=p_campaign_id;
   end if;
   return result;
 end if;
 if t.astra_settlement is null or t.status='committed' then
   return public.rpg_runtime_before_astra_settlement(p_owner_id,
     p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 perform rpg_private.assert(t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and
   t.checkpoint#>'{astraPrimary,finalProposal}'<>'null'::jsonb and
   t.astra_settlement->'publicOutcome' is not null and
   t.astra_settlement->'changes' is not null);
 expected:=rpg_private.astra_settlement_expected(p_campaign_id,t,
   t.astra_settlement);
 perform rpg_private.assert(expected=t.astra_settlement);
 -- The existing guarded base proposal and this narrow settlement may not
 -- write the same row, including the same Quest/Item/Entity revision.
 perform rpg_private.assert(not exists(
   select 1 from jsonb_array_elements(t.astra_settlement->'changes') extra
   join jsonb_array_elements(p_payload#>'{packet,resolution,changes}') base
     on extra.value->>'family'=base.value->>'family' and
       extra.value->>'id'=base.value->>'id'));
 -- Existing commit guard, timeline fence, lease and source revision run first.
 -- Any later validation failure rolls this entire RPC statement back.
 perform set_config('rpg.astra_settlement_operation',op::text,true);
 result:=public.rpg_runtime_before_astra_settlement(p_owner_id,
   p_campaign_id,p_action,p_payload,p_timeline);
 perform rpg_private.assert(result->>'status'='committed');
 if t.astra_settlement->'currencyDefinition'<>'null'::jsonb then
   select loop_state into old_currency from rpg_private.world_foundations
     where campaign_id=p_campaign_id for update;
   next_currency:=jsonb_set(jsonb_set(old_currency,'{currencies}',
     old_currency->'currencies'||jsonb_build_array(
       t.astra_settlement->'currencyDefinition')),'{version}',
     to_jsonb((old_currency->>'version')::integer+1));
   update rpg_private.world_foundations set loop_state=next_currency,
     revision=revision+1 where campaign_id=p_campaign_id;
 end if;
 for v in select value from jsonb_array_elements(
   t.astra_settlement->'changes') loop
   perform rpg_private.runtime_change(p_campaign_id,op,v);
 end loop;
 if t.astra_settlement->>'kind'='job_offer' then
   terms:=jsonb_build_object('issuerId',t.astra_settlement#>'{intent,issuerId}',
     'currencyName',t.astra_settlement#>'{intent,currencyName}',
     'currencyAmount',t.astra_settlement#>'{intent,currencyAmount}',
     'itemName',t.astra_settlement#>'{intent,itemName}',
     'itemCategory',t.astra_settlement#>'{intent,itemCategory}',
     'itemDescription',t.astra_settlement#>'{intent,itemDescription}');
   update public.rpg_quests set reward_terms=terms
     where campaign_id=p_campaign_id and
       id=(t.astra_settlement#>>'{publicOutcome,questId}')::uuid;
 elsif t.astra_settlement->>'kind'='job_reward' then
   update public.rpg_quests set reward_operation_id=op
     where campaign_id=p_campaign_id and
       id=(t.astra_settlement#>>'{publicOutcome,questId}')::uuid and
       reward_operation_id is null;
   perform rpg_private.assert(found);
 end if;
 -- The delegated base commit records its revision before these exact
 -- settlement RecordChanges. Keep the committed turn's public revision equal
 -- to the final authoritative runtime revision, including in the autosave.
 update rpg_private.turns set committed_revision=(select revision
   from rpg_private.runtime_state where campaign_id=p_campaign_id)
   where id=op and campaign_id=p_campaign_id and status='committed'
   returning * into t;
 perform rpg_private.assert(t.id=op);
 -- Preserve the timeline metadata attached by the earlier runtime wrapper.
 result:=result||rpg_private.runtime_public_turn(t);
 perform set_config('rpg.astra_settlement_operation','',true);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns
   where campaign_id=p_campaign_id) then
   perform rpg_private.timeline_save(p_campaign_id,'autosave',
     'After action','turn:'||op::text);
 end if;
 return result;
end $$;

revoke all on function public.rpg_runtime_before_astra_settlement(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;

commit;
