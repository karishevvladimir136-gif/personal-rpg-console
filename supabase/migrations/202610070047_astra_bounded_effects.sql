-- Additive Astra ordinary-play effects. Existing single-settlement turns and
-- immutable saves keep their migration-45/46 authority unchanged.
alter table rpg_private.turns add column astra_effects jsonb;
comment on column rpg_private.turns.astra_effects is
  'Private ordered effects receipt for new Astra turns; NULL means historical single-settlement authority.';

-- Two reusable transformations over existing public authority: owned Item +
-- bounded currency exchange, and owned mundane ingredients -> one mundane Item.
-- No model-authored RecordChange is trusted; all rows are reconstructed here.
create function rpg_private.astra_general_effect_expected(cid uuid,
  t rpg_private.turns, plan jsonb) returns jsonb language plpgsql stable
  set search_path='' as $$
#variable_conflict use_variable
declare kind text:=plan->>'kind'; intent jsonb:=plan->'intent';
  changes jsonb:='[]'::jsonb; outcome jsonb; inputs jsonb:='[]'::jsonb;
  entry jsonb; item_snapshot jsonb; policy_snapshot jsonb; policy_current jsonb;
  hero public.rpg_entities%rowtype; npc public.rpg_entities%rowtype;
  item public.rpg_items%rowtype; currency jsonb; definition jsonb;
  given public.rpg_items%rowtype; received public.rpg_items%rowtype;
  given_snapshot jsonb; received_snapshot jsonb;
  given_policy jsonb; received_policy jsonb;
  given_current_policy jsonb; received_current_policy jsonb;
  give_id uuid; receive_id uuid; give_quantity integer; receive_quantity integer;
  key text; amount integer; price integer; hero_before bigint;
  npc_before bigint; output_id uuid; provenance_id uuid; storage_id uuid;
  item_id uuid; session_id uuid; seen uuid[]:=array[]::uuid[];
  description text; public_name text;
begin
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent',
   'changes','currencyDefinition','publicOutcome']);
 perform rpg_private.assert(plan->'schemaVersion'='1'::jsonb and
   kind in ('mundane_sale','mundane_craft','item_exchange') and
   plan->'currencyDefinition'='null'::jsonb and
   jsonb_typeof(plan->'changes')='array' and
   jsonb_array_length(plan->'changes') between 2 and 5 and
   t.campaign_id=cid and t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and t.source->'worldTakeover' is not null and
   rpg_private.astra_takeover_active(cid) and
   jsonb_array_length(t.source#>'{runtime,configuration,controlledEntityIds}')=1);
 select e.* into hero from public.rpg_entities e where e.campaign_id=cid and
   id=(t.source#>>'{runtime,configuration,controlledEntityIds,0}')::uuid and
   e.kind='player';
 perform rpg_private.assert(hero.id is not null and exists(
   select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
   where e.value->>'id'=hero.id::text and
     e.value->>'revision'=hero.revision::text));
 outcome:=jsonb_build_object('kind',kind,'questId',null,
   'questStatus',null,'currency',null,'item',null);
 if kind='mundane_sale' then
   perform rpg_private.fields(intent,array['kind','buyerId','sellerId',
     'itemId','quantity','currencyName','price']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'sellerId'=hero.id::text and
     rpg_private.wave4_integer(intent->'quantity',1,20) and
     rpg_private.wave4_integer(intent->'price',1,20));
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid and
     e.id=(intent->>'buyerId')::uuid and e.kind='npc';
   select a.value->>'publicName' into public_name from
     jsonb_array_elements(t.source#>'{worldTakeover,actors}') a
     where a.value->>'entityId'=npc.id::text and
       jsonb_typeof(a.value->'publicName')='string' and
       length(a.value->>'publicName')>0 limit 1;
   perform rpg_private.assert(npc.id is not null and
     t.source#>'{worldTakeover,presentEntityIds}' ? npc.id::text and
     public_name is not null and
     exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
       where e.value->>'id'=npc.id::text and
         e.value->>'revision'=npc.revision::text));
   select s.id into storage_id from public.rpg_storages s where s.campaign_id=cid
     and s.entity_id=npc.id and s.kind='merchant' order by s.id limit 1;
   if storage_id is not null then
     perform rpg_private.assert(exists(
       select 1 from jsonb_array_elements(t.source#>'{snapshot,storages}') s
       where s.value->>'id'=storage_id::text));
   else
     storage_id:=rpg_private.wave4_id(t.id,
       'astra:sale-storage:'||npc.id::text);
     perform rpg_private.assert(not exists(select 1 from public.rpg_storages
       where id=storage_id));
   end if;
   currency:=rpg_private.astra_settlement_currency(cid,
     intent->>'currencyName',false);
   definition:=currency->'definition'; key:=definition->>'resourceKey';
   price:=(intent->>'price')::integer; amount:=(intent->>'quantity')::integer;
   hero_before:=coalesce((hero.resources->>key)::bigint,0);
   npc_before:=coalesce((npc.resources->>key)::bigint,0);
   perform rpg_private.assert(npc_before>=price and
     hero_before+price<=1000000);
   select * into item from public.rpg_items where campaign_id=cid and
     id=(intent->>'itemId')::uuid and owner_entity_id=hero.id;
   select value into item_snapshot from jsonb_array_elements(
     t.source#>'{snapshot,items}') where value->>'id'=item.id::text;
   select value into policy_snapshot from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=item.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into policy_current from rpg_private.world_foundations w,
       jsonb_array_elements(w.loop_state->'itemPolicies') p
     where w.campaign_id=cid and p.value->>'itemId'=item.id::text;
   perform rpg_private.assert(item.id is not null and item_snapshot is not null and
     item_snapshot->>'revision'=item.revision::text and
     policy_snapshot is not distinct from policy_current and
     (policy_snapshot is null or
       (policy_snapshot->>'visibility'='public' and
        policy_snapshot->>'trade'='allowed')) and
     item.quantity>=amount and item.equipped_entity_id is null and
     item.equipped_slot is null);
   item_id:=case when item.quantity=amount then item.id else
     rpg_private.wave4_id(t.id,'astra:sale-item:'||item.id::text) end;
   changes:=jsonb_build_array(
     jsonb_build_object('family','entities','id',npc.id,
       'expectedRevision',npc.revision,'values',jsonb_build_object(
         'resources',npc.resources||jsonb_build_object(key,npc_before-price))),
     jsonb_build_object('family','entities','id',hero.id,
       'expectedRevision',hero.revision,'values',jsonb_build_object(
         'resources',hero.resources||jsonb_build_object(key,hero_before+price))));
   if not exists(select 1 from public.rpg_storages where id=storage_id) then
     changes:=changes||jsonb_build_array(jsonb_build_object('family','storages',
       'id',storage_id,'expectedRevision',null,'values',jsonb_build_object(
         'name',left('Inventory of '||public_name,160),
         'kind','merchant','entity_id',npc.id)));
   end if;
   if item_id=item.id then
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',item.id,'expectedRevision',item.revision,'values',
       jsonb_build_object('quantity',amount,'owner_entity_id',npc.id,
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
           'quantity',amount,'owner_entity_id',npc.id,
           'storage_id',storage_id,'equipped_entity_id',null,
           'equipped_slot',null)));
   end if;
   outcome:=jsonb_set(outcome,'{currency}',jsonb_build_object(
     'name',intent->>'currencyName','amount',price,'resourceKey',key,
     'after',hero_before+price));
   outcome:=jsonb_set(outcome,'{item}',jsonb_build_object(
     'id',item_id,'name',item.name,'quantity',amount));
 elsif kind='item_exchange' then
   perform rpg_private.fields(intent,array['kind','playerId','counterpartyId',
     'giveItemId','giveQuantity','receiveItemId','receiveQuantity']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'playerId'=hero.id::text and
     rpg_private.wave4_integer(intent->'giveQuantity',1,20) and
     rpg_private.wave4_integer(intent->'receiveQuantity',1,20));
   select e.* into npc from public.rpg_entities e where e.campaign_id=cid and
     e.id=(intent->>'counterpartyId')::uuid and e.kind='npc';
   select a.value->>'publicName' into public_name from
     jsonb_array_elements(t.source#>'{worldTakeover,actors}') a
     where a.value->>'entityId'=npc.id::text and
       jsonb_typeof(a.value->'publicName')='string' and
       length(a.value->>'publicName')>0 limit 1;
   perform rpg_private.assert(npc.id is not null and public_name is not null and
     t.source#>'{worldTakeover,presentEntityIds}' ? npc.id::text and
     exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
       where e.value->>'id'=npc.id::text and
         e.value->>'revision'=npc.revision::text));
   select s.id into storage_id from public.rpg_storages s where s.campaign_id=cid
     and s.entity_id=npc.id and s.kind='merchant' order by s.id limit 1;
   if storage_id is not null then
     perform rpg_private.assert(exists(select 1 from
       jsonb_array_elements(t.source#>'{snapshot,storages}') s
       where s.value->>'id'=storage_id::text));
   else
     storage_id:=rpg_private.wave4_id(t.id,
       'astra:sale-storage:'||npc.id::text);
     perform rpg_private.assert(not exists(select 1 from public.rpg_storages
       where id=storage_id));
     changes:=changes||jsonb_build_array(jsonb_build_object('family','storages',
       'id',storage_id,'expectedRevision',null,'values',jsonb_build_object(
         'name',left('Inventory of '||public_name,160),
         'kind','merchant','entity_id',npc.id)));
   end if;
   select * into given from public.rpg_items where campaign_id=cid and
     id=(intent->>'giveItemId')::uuid and owner_entity_id=hero.id;
   select * into received from public.rpg_items where campaign_id=cid and
     id=(intent->>'receiveItemId')::uuid and owner_entity_id=npc.id;
   select value into given_snapshot from jsonb_array_elements(
     t.source#>'{snapshot,items}') where value->>'id'=given.id::text;
   select value into received_snapshot from jsonb_array_elements(
     t.source#>'{snapshot,items}') where value->>'id'=received.id::text;
   select value into given_policy from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=given.id::text;
   select value into received_policy from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=received.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into given_current_policy from rpg_private.world_foundations w,
       jsonb_array_elements(w.loop_state->'itemPolicies') p
     where w.campaign_id=cid and p.value->>'itemId'=given.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into received_current_policy from rpg_private.world_foundations w,
       jsonb_array_elements(w.loop_state->'itemPolicies') p
     where w.campaign_id=cid and p.value->>'itemId'=received.id::text;
   give_quantity:=(intent->>'giveQuantity')::integer;
   receive_quantity:=(intent->>'receiveQuantity')::integer;
   perform rpg_private.assert(given.id is not null and received.id is not null
     and given.id<>received.id and given_snapshot is not null and
     received_snapshot is not null and
     given_snapshot->>'revision'=given.revision::text and
     received_snapshot->>'revision'=received.revision::text and
     given_policy is not distinct from given_current_policy and
     received_policy is not distinct from received_current_policy and
     (given_policy is null or (given_policy->>'visibility'='public' and
       given_policy->>'trade'='allowed')) and
     (received_policy is null or
       (received_policy->>'visibility'='public' and
        received_policy->>'trade'='allowed')) and
     given.quantity>=give_quantity and received.quantity>=receive_quantity and
     given.equipped_entity_id is null and given.equipped_slot is null and
     received.equipped_entity_id is null and received.equipped_slot is null and
     received.category in ('food','supply','misc') and
     btrim(received.mechanics)='');
   give_id:=case when given.quantity=give_quantity then given.id else
     rpg_private.wave4_id(t.id,'astra:barter-give:'||given.id::text) end;
   receive_id:=case when received.quantity=receive_quantity then received.id else
     rpg_private.wave4_id(t.id,'astra:barter-receive:'||received.id::text) end;
   if give_id=given.id then
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',given.id,'expectedRevision',given.revision,'values',
       jsonb_build_object('quantity',give_quantity,'owner_entity_id',npc.id,
         'storage_id',storage_id,'equipped_entity_id',null,'equipped_slot',null)));
   else
     perform rpg_private.assert(not exists(select 1 from public.rpg_items
       where id=give_id));
     changes:=changes||jsonb_build_array(
       jsonb_build_object('family','items','id',given.id,
         'expectedRevision',given.revision,'values',
         jsonb_build_object('quantity',given.quantity-give_quantity)),
       jsonb_build_object('family','items','id',give_id,
         'expectedRevision',null,'values',jsonb_build_object(
           'name',given.name,'category',given.category,
           'description',given.description,'mechanics',given.mechanics,
           'quantity',give_quantity,'owner_entity_id',npc.id,
           'storage_id',storage_id,'equipped_entity_id',null,
           'equipped_slot',null)));
   end if;
   item_id:=rpg_private.astra_settlement_player_storage(cid,hero.id);
   perform rpg_private.assert(item_id is not null);
   if receive_id=received.id then
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',received.id,'expectedRevision',received.revision,'values',
       jsonb_build_object('quantity',receive_quantity,'owner_entity_id',hero.id,
         'storage_id',item_id,'equipped_entity_id',null,'equipped_slot',null)));
   else
     perform rpg_private.assert(not exists(select 1 from public.rpg_items
       where id=receive_id));
     changes:=changes||jsonb_build_array(
       jsonb_build_object('family','items','id',received.id,
         'expectedRevision',received.revision,'values',
         jsonb_build_object('quantity',received.quantity-receive_quantity)),
       jsonb_build_object('family','items','id',receive_id,
         'expectedRevision',null,'values',jsonb_build_object(
           'name',received.name,'category',received.category,
           'description',received.description,'mechanics',received.mechanics,
           'quantity',receive_quantity,'owner_entity_id',hero.id,
           'storage_id',item_id,'equipped_entity_id',null,
           'equipped_slot',null)));
   end if;
   outcome:=jsonb_set(outcome,'{item}',jsonb_build_object('id',receive_id,
     'name',received.name,'quantity',receive_quantity))||jsonb_build_object(
     'givenItem',jsonb_build_object('id',give_id,'name',given.name,
       'quantity',give_quantity));
 else
   perform rpg_private.fields(intent,array['kind','crafterId','inputs',
     'itemName','itemCategory','itemDescription']);
   perform rpg_private.assert(intent->>'kind'=kind and
     intent->>'crafterId'=hero.id::text and
     jsonb_typeof(intent->'inputs')='array' and
     jsonb_array_length(intent->'inputs') between 1 and 2 and
     rpg_private.astra_settlement_text(intent->>'itemName',80) and
     intent->>'itemCategory' in ('food','supply','misc'));
   description:=coalesce(intent->>'itemDescription',
     'Ordinary '||(intent->>'itemName')||'.');
   perform rpg_private.assert(rpg_private.astra_settlement_text(description,160)
     and intent->>'itemDescription'=description);
   for entry in select value from jsonb_array_elements(intent->'inputs') loop
     perform rpg_private.fields(entry,array['itemId','quantity']);
     perform rpg_private.assert(rpg_private.wave4_integer(entry->'quantity',1,20)
       and not (entry->>'itemId')::uuid=any(seen));
     select * into item from public.rpg_items where campaign_id=cid and
       id=(entry->>'itemId')::uuid and owner_entity_id=hero.id;
     select value into item_snapshot from jsonb_array_elements(
       t.source#>'{snapshot,items}') where value->>'id'=item.id::text;
     select value into policy_snapshot from jsonb_array_elements(
       t.source->'astraSettlementItemPolicies') p
       where p.value->>'itemId'=item.id::text;
     select jsonb_build_object('itemId',p.value->'itemId',
       'visibility',p.value->'visibility','trade',p.value->'trade')
       into policy_current from rpg_private.world_foundations w,
         jsonb_array_elements(w.loop_state->'itemPolicies') p
       where w.campaign_id=cid and p.value->>'itemId'=item.id::text;
     amount:=(entry->>'quantity')::integer;
     perform rpg_private.assert(item.id is not null and item_snapshot is not null
       and item_snapshot->>'revision'=item.revision::text and
       policy_snapshot is not distinct from policy_current and
       (policy_snapshot is null or policy_snapshot->>'visibility'='public') and
       item.quantity>=amount and item.equipped_entity_id is null and
       item.equipped_slot is null and item.category in ('food','supply','misc')
       and btrim(item.mechanics)='');
     seen:=array_append(seen,item.id);
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',item.id,'expectedRevision',item.revision,'values',
       jsonb_build_object('quantity',item.quantity-amount)));
     inputs:=inputs||jsonb_build_array(jsonb_build_object('itemId',item.id,
       'quantity',amount,'disposition','consumed'));
   end loop;
   select s.id into storage_id from public.rpg_storages s where s.campaign_id=cid
     and s.entity_id=hero.id and s.kind='player' order by s.id limit 1;
   perform rpg_private.assert(storage_id is not null and exists(
     select 1 from jsonb_array_elements(t.source#>'{snapshot,storages}') s
     where s.value->>'id'=storage_id::text));
   select current_session_id into session_id from public.rpg_public_state
     where campaign_id=cid;
   perform rpg_private.assert(session_id is not null and
     t.source#>>'{snapshot,publicState,current_session_id}'=session_id::text);
   output_id:=rpg_private.wave4_id(t.id,'astra:craft-item');
   provenance_id:=rpg_private.wave4_id(t.id,'astra:craft-provenance');
   perform rpg_private.assert(not exists(select 1 from public.rpg_items
     where id=output_id) and not exists(select 1 from public.rpg_provenance
       where id=provenance_id));
   changes:=changes||jsonb_build_array(
     jsonb_build_object('family','items','id',output_id,
       'expectedRevision',null,'values',jsonb_build_object(
         'name',intent->>'itemName','category',intent->>'itemCategory',
         'description',description,'mechanics','','quantity',1,
         'owner_entity_id',hero.id,'storage_id',storage_id,
         'equipped_entity_id',null,'equipped_slot',null)),
     jsonb_build_object('family','provenance','id',provenance_id,
       'expectedRevision',null,'values',jsonb_build_object(
         'operation_id',t.id,'session_id',session_id,
         'inputs',inputs,'outputItemIds',jsonb_build_array(output_id))));
   outcome:=jsonb_set(outcome,'{item}',jsonb_build_object(
     'id',output_id,'name',intent->>'itemName','quantity',1));
 end if;
 return jsonb_build_object('schemaVersion',1,'kind',kind,'intent',intent,
   'changes',changes,'currencyDefinition',null,'publicOutcome',outcome);
end $$;
revoke all on function rpg_private.astra_general_effect_expected(
  uuid,rpg_private.turns,jsonb) from public,anon,authenticated;

create function rpg_private.astra_effects_assert(cid uuid,t rpg_private.turns,
  bundle jsonb, base_changes jsonb) returns void language plpgsql stable
  set search_path='' as $$
declare effect jsonb; rejected jsonb; change_row jsonb; key text;
  seen text[]:=array[]::text[]; foundation_count integer:=0;
  ordinal integer:=0; rejected_indices integer[]:=array[]::integer[];
begin
 perform rpg_private.fields(bundle,array['schemaVersion','effects','rejected']);
 perform rpg_private.assert(bundle->'schemaVersion'='1'::jsonb and
   jsonb_typeof(bundle->'effects')='array' and
   jsonb_typeof(bundle->'rejected')='array' and
   jsonb_array_length(bundle->'effects')+
     jsonb_array_length(bundle->'rejected') between 1 and 6 and
   jsonb_typeof(base_changes)='array' and
   t.campaign_id=cid and t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and
   rpg_private.astra_takeover_active(cid));
 for change_row in select value from jsonb_array_elements(base_changes) loop
   key:=(change_row->>'family')||':'||(change_row->>'id');
   perform rpg_private.assert(not key=any(seen));
   seen:=array_append(seen,key);
 end loop;
 for effect in select value from jsonb_array_elements(bundle->'effects') loop
   perform rpg_private.assert(effect=case when effect->>'kind' in
     ('mundane_sale','mundane_craft','item_exchange') then
       rpg_private.astra_general_effect_expected(cid,t,effect)
     else rpg_private.astra_settlement_expected(cid,t,effect) end);
   if effect->'currencyDefinition'<>'null'::jsonb or
     effect ? 'progressionState' then
     foundation_count:=foundation_count+1;
     perform rpg_private.assert(ordinal=0 and foundation_count=1);
   end if;
   for change_row in select value from jsonb_array_elements(effect->'changes') loop
     key:=(change_row->>'family')||':'||(change_row->>'id');
     perform rpg_private.assert(not key=any(seen));
     seen:=array_append(seen,key);
   end loop;
   ordinal:=ordinal+1;
 end loop;
 for rejected in select value from jsonb_array_elements(bundle->'rejected') loop
   perform rpg_private.fields(rejected,array['index','reason']);
   perform rpg_private.assert(jsonb_typeof(rejected->'index')='number' and
     (rejected->>'index')::integer between 0 and 5 and
     rejected->>'reason'='not_authorized' and
     not (rejected->>'index')::integer=any(rejected_indices));
   rejected_indices:=array_append(rejected_indices,(rejected->>'index')::integer);
 end loop;
end $$;

revoke all on function rpg_private.astra_effects_assert(uuid,rpg_private.turns,jsonb,jsonb)
  from public,anon,authenticated;

-- The underlying 45/46 wrappers autosave after one settlement. Suppress that
-- intermediate save while a bounded effect bundle is still being applied.
alter function rpg_private.timeline_save(uuid,text,text,text)
  rename to timeline_save_before_astra_effects;
create function rpg_private.timeline_save(cid uuid,kind text,name text,
  trigger_key text default null) returns uuid language plpgsql
  set search_path='' as $$
declare op text:=current_setting('rpg.astra_effects_operation',true);
begin
 if kind='autosave' and op ~
   '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   and trigger_key='turn:'||op then return null; end if;
 return rpg_private.timeline_save_before_astra_effects(cid,kind,name,trigger_key);
end $$;
revoke all on function rpg_private.timeline_save(uuid,text,text,text),
  rpg_private.timeline_save_before_astra_effects(uuid,text,text,text)
  from public,anon,authenticated;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_effects;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,
  p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; result jsonb; incoming jsonb;
  first_effect jsonb; clean_payload jsonb; op uuid; effect jsonb;
  change_row jsonb; terms jsonb;
begin
 if p_action not in ('claim','checkpoint','commit') then
   return public.rpg_runtime_before_astra_effects(p_owner_id,p_campaign_id,
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
   result:=public.rpg_runtime_before_astra_effects(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
   if result is not null and t.astra_effects is not null then
     result:=jsonb_set(result,'{turn,checkpoint,astraEffects}',
       t.astra_effects,true);
   end if;
   return result;
 end if;
 if p_action='checkpoint' then
   incoming:=coalesce(p_payload#>'{checkpoint,astraEffects}','null'::jsonb);
   if t.astra_effects is not null and incoming<>t.astra_effects then
     raise exception 'rpg_conflict'; end if;
   if incoming<>'null'::jsonb and t.astra_effects is null then
     perform rpg_private.assert(t.runtime_identity='astra-primary-v1' and
       p_payload#>>'{checkpoint,astraPrimary,finalProposal,schemaVersion}'='1' and
       t.checkpoint#>'{astraPrimary,finalProposal}'='null'::jsonb);
     first_effect:=coalesce(incoming#>'{effects,0}','null'::jsonb);
     perform rpg_private.assert(coalesce(
       p_payload#>'{checkpoint,astraSettlement}','null'::jsonb)=
       case when first_effect->>'kind' in ('mundane_sale','mundane_craft','item_exchange')
         then 'null'::jsonb else first_effect end);
     perform rpg_private.astra_effects_assert(p_campaign_id,t,incoming,
       p_payload#>'{checkpoint,astraPrimary,finalProposal,resolution,changes}');
   end if;
   clean_payload:=jsonb_set(p_payload,'{checkpoint}',
     (p_payload->'checkpoint')-'astraEffects');
   result:=public.rpg_runtime_before_astra_effects(p_owner_id,p_campaign_id,
     p_action,clean_payload,p_timeline);
   if incoming<>'null'::jsonb and t.astra_effects is null then
     update rpg_private.turns set astra_effects=incoming where id=op
       and campaign_id=p_campaign_id;
   end if;
   return result;
 end if;
 if t.astra_effects is null or t.status='committed' then
   return public.rpg_runtime_before_astra_effects(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 perform rpg_private.assert(t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and
   t.checkpoint#>'{astraPrimary,finalProposal}'<>'null'::jsonb and
   t.astra_settlement is not distinct from nullif(
     case when t.astra_effects#>>'{effects,0,kind}' in
       ('mundane_sale','mundane_craft','item_exchange') then 'null'::jsonb
       else t.astra_effects#>'{effects,0}' end,'null'::jsonb));
 perform rpg_private.astra_effects_assert(p_campaign_id,t,t.astra_effects,
   t.checkpoint#>'{astraPrimary,finalProposal,resolution,changes}');
 -- All earlier lease, timeline, source-revision, receipt, final-proposal and
 -- legacy settlement guards run unchanged. A later error rolls back this RPC.
 perform set_config('rpg.astra_effects_operation',op::text,true);
 result:=public.rpg_runtime_before_astra_effects(p_owner_id,p_campaign_id,
   p_action,p_payload,p_timeline);
 perform rpg_private.assert(result->>'status'='committed');
 -- A legacy first effect was handled by the existing 45/46 guard. A general
 -- first effect is applied here after that guard has committed the base turn.
 for effect in select value from jsonb_array_elements(t.astra_effects->'effects')
   with ordinality e(value,n) where e.n>1 or t.astra_settlement is null
   order by e.n loop
   perform rpg_private.assert(effect->'currencyDefinition'='null'::jsonb and
     not effect ? 'progressionState');
   perform set_config('rpg.astra_settlement_operation',op::text,true);
   for change_row in select value from jsonb_array_elements(effect->'changes') loop
     perform rpg_private.runtime_change(p_campaign_id,op,change_row);
   end loop;
   if effect->>'kind'='job_offer' then
     terms:=jsonb_build_object('issuerId',effect#>'{intent,issuerId}',
       'currencyName',effect#>'{intent,currencyName}',
       'currencyAmount',effect#>'{intent,currencyAmount}',
       'itemName',effect#>'{intent,itemName}',
       'itemCategory',effect#>'{intent,itemCategory}',
       'itemDescription',effect#>'{intent,itemDescription}');
     update public.rpg_quests set reward_terms=terms
       where campaign_id=p_campaign_id and
         id=(effect#>>'{publicOutcome,questId}')::uuid;
     perform rpg_private.assert(found);
   elsif effect->>'kind'='job_reward' then
     update public.rpg_quests set reward_operation_id=op
       where campaign_id=p_campaign_id and
         id=(effect#>>'{publicOutcome,questId}')::uuid and
         reward_operation_id is null;
     perform rpg_private.assert(found);
   end if;
   perform set_config('rpg.astra_settlement_operation','',true);
 end loop;
 update rpg_private.turns set committed_revision=(select revision
   from rpg_private.runtime_state where campaign_id=p_campaign_id)
   where id=op and campaign_id=p_campaign_id and status='committed'
   returning * into t;
 perform rpg_private.assert(t.id=op);
 result:=result||rpg_private.runtime_public_turn(t);
 perform set_config('rpg.astra_effects_operation','',true);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns
   where campaign_id=p_campaign_id) then
   perform rpg_private.timeline_save(p_campaign_id,'autosave',
     'After action','turn:'||op::text);
 end if;
 return result;
end $$;

revoke all on function public.rpg_runtime_before_astra_effects(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;
