-- Additive ordered Astra effects and existing-mechanics bridge. Historical
-- single settlements and migration-47 bundles retain their original path.
begin;

alter table rpg_private.turns add column astra_ordered_effects jsonb;
comment on column rpg_private.turns.astra_ordered_effects is
  'Private schema-2 ordered intent and independently reconstructed result pin; NULL preserves historical checkpoints.';

create function rpg_private.astra_shadow_rows(s jsonb,family text)
returns jsonb language plpgsql immutable set search_path='' as $$
declare path text[]; result jsonb;
begin
 path:=case family
   when 'entities' then array['snapshot','entities']
   when 'items' then array['snapshot','items']
   when 'storages' then array['snapshot','storages']
   when 'quests' then array['snapshot','quests']
   when 'locations' then array['snapshot','locations']
   when 'rest_records' then array['runtime','restRecords']
   when 'recipes' then array['runtime','recipes']
   when 'effects' then array['runtime','effects']
   when 'encounters' then array['runtime','encounters']
   when 'encounter_participants' then array['runtime','participants']
   when 'pending_actions' then array['runtime','pendingActions']
   when 'provenance' then array['runtime','provenance']
   else null end;
 perform rpg_private.assert(path is not null);
 result:=coalesce(s#>path,'[]'::jsonb);
 if family='quests' then
   select coalesce(jsonb_agg(q.value||jsonb_build_object(
     'reward_terms',j.value->'rewardTerms',
     'reward_operation_id',j.value->'rewardOperationId') order by q.n),'[]')
     into result from jsonb_array_elements(result) with ordinality q(value,n)
     left join lateral (select value from jsonb_array_elements(
       coalesce(s->'astraSettlementJobs','[]')) where value->>'questId'=q.value->>'id'
       limit 1) j on true;
 end if;
 return result;
end $$;

create function rpg_private.astra_shadow_row(s jsonb,family text,rid uuid)
returns jsonb language sql immutable set search_path='' as $$
 select case when family='public_state' then s#>'{snapshot,publicState}'
   else (select value from jsonb_array_elements(
     rpg_private.astra_shadow_rows(s,family)) where value->>'id'=rid::text limit 1) end
$$;

create function rpg_private.astra_shadow_apply(s jsonb,change_row jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare family text:=change_row->>'family'; rid uuid:=(change_row->>'id')::uuid;
 old_row jsonb; next_row jsonb; rows jsonb; path text[]; idx integer;
begin
 perform rpg_private.fields(change_row,array['family','id','expectedRevision','values']);
 perform rpg_private.assert(rid is not null and jsonb_typeof(change_row->'values')='object');
 old_row:=rpg_private.astra_shadow_row(s,family,rid);
 if family in ('entities','items','quests','locations','public_state','storages') then
   perform rpg_private.assert(change_row->'expectedRevision'=
     coalesce(old_row->'revision','null'::jsonb));
 else perform rpg_private.assert(change_row->'expectedRevision'='null'::jsonb); end if;
 next_row:=coalesce(old_row,'{}')||(change_row->'values')||jsonb_build_object(
   'id',rid,'campaign_id',s#>'{snapshot,campaign,id}');
 if old_row is null and family in ('entities','items','quests','locations','storages') then
   next_row:=next_row||jsonb_build_object('revision',0,'updated_at',''); end if;
 if family='rest_records' and old_row is null then
   next_row:=next_row||jsonb_build_object('created_at',''); end if;
 if family='public_state' then
   return jsonb_set(s,'{snapshot,publicState}',next_row-'id'); end if;
 path:=case family
   when 'entities' then array['snapshot','entities'] when 'items' then array['snapshot','items']
   when 'storages' then array['snapshot','storages'] when 'quests' then array['snapshot','quests']
   when 'locations' then array['snapshot','locations'] when 'rest_records' then array['runtime','restRecords']
   when 'recipes' then array['runtime','recipes'] when 'effects' then array['runtime','effects']
   when 'encounters' then array['runtime','encounters']
   when 'encounter_participants' then array['runtime','participants']
   when 'pending_actions' then array['runtime','pendingActions']
   when 'provenance' then array['runtime','provenance'] else null end;
 perform rpg_private.assert(path is not null);
 rows:=coalesce(s#>path,'[]');
 select n::integer-1 into idx from jsonb_array_elements(rows) with ordinality x(value,n)
   where x.value->>'id'=rid::text limit 1;
 if idx is null then rows:=rows||jsonb_build_array(next_row);
 else rows:=jsonb_set(rows,array[idx::text],next_row); end if;
 return jsonb_set(s,path,rows);
end $$;

-- Collapse only independently validated sequential writes. The earliest
-- original revision survives; later field values come from a validated shadow.
create function rpg_private.astra_shadow_collapse(changes jsonb,extra jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare c jsonb; prior jsonb; idx integer;
begin
 for c in select value from jsonb_array_elements(extra) loop
   idx:=null; prior:=null;
   select value,n::integer-1 into prior,idx from jsonb_array_elements(changes)
     with ordinality x(value,n) where x.value->>'family'=c->>'family'
       and x.value->>'id'=c->>'id' limit 1;
   if idx is null then changes:=changes||jsonb_build_array(c);
   else changes:=jsonb_set(changes,array[idx::text],prior||jsonb_build_object(
     'values',(prior->'values')||(c->'values'))); end if;
 end loop;
 return changes;
end $$;

-- Timestamp presentation is irrelevant to deterministic shadow authority.
-- Newly derived application rows use empty timestamp placeholders; omit
-- those before populating typed SQL composites (which otherwise reject '').
create function rpg_private.astra_shadow_typed_rows(s jsonb,family text)
returns jsonb language sql immutable set search_path='' as $$
 select coalesce(jsonb_agg(value-array['created_at','updated_at','timeline']),'[]')
   from jsonb_array_elements(rpg_private.astra_shadow_rows(s,family))
$$;
create function rpg_private.astra_shadow_entities(cid uuid,s jsonb)
returns setof public.rpg_entities language sql immutable set search_path='' as $$
 select * from jsonb_populate_recordset(null::public.rpg_entities,
   rpg_private.astra_shadow_typed_rows(s,'entities')) where campaign_id=cid
$$;
create function rpg_private.astra_shadow_items(cid uuid,s jsonb)
returns setof public.rpg_items language sql immutable set search_path='' as $$
 select * from jsonb_populate_recordset(null::public.rpg_items,
   rpg_private.astra_shadow_typed_rows(s,'items')) where campaign_id=cid
$$;
create function rpg_private.astra_shadow_quests(cid uuid,s jsonb)
returns setof public.rpg_quests language sql immutable set search_path='' as $$
 select * from jsonb_populate_recordset(null::public.rpg_quests,
   rpg_private.astra_shadow_typed_rows(s,'quests')) where campaign_id=cid
$$;
create function rpg_private.astra_shadow_storages(cid uuid,s jsonb)
returns setof public.rpg_storages language sql immutable set search_path='' as $$
 select * from jsonb_populate_recordset(null::public.rpg_storages,
   rpg_private.astra_shadow_typed_rows(s,'storages')) where campaign_id=cid
$$;
create function rpg_private.astra_shadow_foundations(cid uuid,s jsonb)
returns setof rpg_private.world_foundations language sql stable set search_path='' as $$
 select jsonb_populate_record(null::rpg_private.world_foundations,
   to_jsonb(f)||jsonb_build_object('loop_state',s->'astraProgressionState'))
 from rpg_private.world_foundations f where f.campaign_id=cid
$$;

create function rpg_private.astra_shadow_currency(cid uuid,s jsonb,name text,
 may_create boolean) returns jsonb language plpgsql immutable set search_path='' as $$
declare currencies jsonb:=s->'astraSettlementCurrencies'; matching jsonb; n integer;
 definition jsonb; key text; identity text;
begin
 perform rpg_private.assert(rpg_private.astra_settlement_text(name,32) and
   name ~ '^[a-z]+( [a-z]+)*$' and jsonb_typeof(currencies)='array');
 select count(*),jsonb_agg(value)->0 into n,matching from jsonb_array_elements(currencies)
   where lower(btrim(value->>'label'))=name;
 perform rpg_private.assert(n<=1);
 if n=1 then
   perform rpg_private.fields(matching,array['id','label','resourceKey','version']);
   perform rpg_private.assert(matching->>'resourceKey' ~ '^[A-Za-z][A-Za-z0-9_-]{0,79}$'
     and rpg_private.wave4_integer(matching->'version',1));
   return jsonb_build_object('definition',matching,'newDefinition',null);
 end if;
 perform rpg_private.assert(may_create and jsonb_array_length(currencies)<32);
 identity:='currency:'||replace(name,' ','_'); key:='currency_'||replace(name,' ','_');
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(currencies)
   where value->>'id'=identity or value->>'resourceKey'=key));
 definition:=jsonb_build_object('id',identity,'label',name,'resourceKey',key,'version',1);
 return jsonb_build_object('definition',definition,'newDefinition',definition);
end $$;
create function rpg_private.astra_shadow_player_storage(cid uuid,s jsonb,eid uuid)
returns uuid language sql immutable set search_path='' as $$
 select id from rpg_private.astra_shadow_storages(cid,s)
   where entity_id=eid and kind='player' order by id limit 1
$$;

create function rpg_private.astra_mechanic_write(work jsonb,family text,rid uuid,values_row jsonb)
returns jsonb language plpgsql immutable set search_path='' as $$
declare old_row jsonb; change_row jsonb;
begin
 old_row:=rpg_private.astra_shadow_row(work->'source',family,rid);
 change_row:=jsonb_build_object('family',family,'id',rid,'expectedRevision',
   case when family in ('entities','items','quests','locations','public_state','storages')
     then old_row->'revision' else null end,'values',values_row);
 return jsonb_build_object('source',rpg_private.astra_shadow_apply(work->'source',change_row),
   'changes',rpg_private.astra_shadow_collapse(work->'changes',jsonb_build_array(change_row)));
end $$;

create function rpg_private.astra_mechanic_tagged(s jsonb,rid uuid,tag text)
returns boolean language sql immutable set search_path='' as $$
 select exists(select 1 from jsonb_array_elements(s#>'{runtime,configuration,itemRules}')
   where value->>'itemId'=rid::text and value->>'tag'=tag)
$$;
create function rpg_private.astra_mechanic_entity(s jsonb,rid uuid)
returns jsonb language plpgsql immutable set search_path='' as $$
declare rowdata jsonb:=rpg_private.astra_shadow_row(s,'entities',rid);
begin
 perform rpg_private.assert(rowdata is not null and
   s#>'{runtime,configuration,presentEntityIds}' ? rid::text and
   s#>'{runtime,configuration,controlledEntityIds}' ? rid::text and
   s#>'{worldTakeover,presentEntityIds}' ? rid::text and
   not rowdata->'conditions' ? 'dead' and not rowdata->'conditions' ? 'withdrawn');
 return rowdata;
end $$;
create function rpg_private.astra_mechanic_storage(s jsonb,rid uuid,deposit boolean default false)
returns jsonb language plpgsql immutable set search_path='' as $$
declare rowdata jsonb:=rpg_private.astra_shadow_row(s,'storages',rid);
begin
 perform rpg_private.assert(rowdata is not null);
 if rowdata->>'kind'='camp' then
   perform rpg_private.assert(deposit or exists(select 1 from jsonb_array_elements(
     s#>'{runtime,restRecords}') where value->>'status'='planned' and value->>'kind'='long'));
 elsif rowdata->>'kind'='transport' then
   perform rpg_private.assert(s#>'{runtime,configuration,nearbyStorageIds}' ? rid::text);
 else
   perform rpg_private.assert(s#>'{runtime,configuration,presentEntityIds}' ? (rowdata->>'entity_id')
     and s#>'{runtime,configuration,controlledEntityIds}' ? (rowdata->>'entity_id'));
 end if;
 return rowdata;
end $$;
create function rpg_private.astra_mechanic_item(s jsonb,rid uuid,quantity integer default 1)
returns jsonb language plpgsql immutable set search_path='' as $$
declare rowdata jsonb:=rpg_private.astra_shadow_row(s,'items',rid);
begin
 perform rpg_private.assert(rowdata is not null and quantity>=1 and
   (rowdata->>'quantity')::integer>=quantity and
   not exists(select 1 from jsonb_array_elements(coalesce(s->'astraSettlementItemPolicies','[]'))
     where value->>'itemId'=rid::text and value->>'visibility'='private') and
   (rowdata->>'owner_entity_id' is null or
     s#>'{runtime,configuration,controlledEntityIds}' ? (rowdata->>'owner_entity_id')));
 perform rpg_private.astra_mechanic_storage(s,(rowdata->>'storage_id')::uuid);
 return rowdata;
end $$;
create function rpg_private.astra_mechanic_consume(work jsonb,rid uuid,quantity integer)
returns jsonb language plpgsql immutable set search_path='' as $$
declare rowdata jsonb:=rpg_private.astra_mechanic_item(work->'source',rid,quantity);
 values_row jsonb;
begin
 values_row:=jsonb_build_object('quantity',(rowdata->>'quantity')::integer-quantity);
 if (rowdata->>'quantity')::integer=quantity then values_row:=values_row||
   jsonb_build_object('equipped_entity_id',null,'equipped_slot',null); end if;
 return rpg_private.astra_mechanic_write(work,'items',rid,values_row);
end $$;

-- Independent house-profile reconstruction of the check-free existing actions.
-- The application calls its existing mechanicPlanForActions/resolveMechanics;
-- this guard calculates the same result without trusting those returned rows.
create function rpg_private.astra_mechanics_expected(cid uuid,t rpg_private.turns,plan jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare intent jsonb:=plan->'intent'; kind text:=plan->>'kind'; actions jsonb:=plan->'actions';
 safety jsonb:=plan->'safety'; work jsonb:=jsonb_build_object('source',t.source,'changes','[]'::jsonb);
 action jsonb; action_kind text; s jsonb; config jsonb; actor jsonb; item jsonb; rest jsonb;
 destination jsonb; part jsonb; effect jsonb; definition jsonb; settings jsonb;
 participants jsonb; supplies jsonb; outcomes jsonb:='[]'; ids jsonb; item_ids jsonb;
 minutes integer:=(t.source#>>'{runtime,worldMinutes}')::integer; idx integer:=0;
 rid uuid; actor_id uuid; item_id uuid; rest_id uuid; location_id uuid;
 quantity integer; cost integer; remaining integer; supplied integer; recovery numeric;
 text_outcome text; recipe text; tag text; required text[]; seen text[]; n integer;
 completed boolean:=false; outcome_rest uuid; expected_actions jsonb; extra jsonb;
 new_item jsonb; provenance_inputs jsonb; key text; amount integer;
begin
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent','actions','resolution','safety','publicOutcome']);
 perform rpg_private.assert(plan->'schemaVersion'='1' and kind in ('mechanic_actions','formal_rest')
   and intent->>'kind'=kind and t.runtime_identity='astra-primary-v1' and t.input->>'mode'='game'
   and jsonb_typeof(actions)='array' and jsonb_array_length(actions) between 1 and 6
   and t.source#>>'{runtime,configuration,profile}'='console-basic-v1');
 if kind='mechanic_actions' then
   perform rpg_private.fields(intent,array['kind','actions','restSafety']);
   perform rpg_private.assert(intent->'actions'=actions and
     (intent->'restSafety'='null'::jsonb or exists(select 1 from jsonb_array_elements(actions)
       where value->>'kind' in ('rest.enter','rest.leave','rest.complete'))));
 else
   perform rpg_private.fields(intent,array['kind','restKind','restSafety']);
   perform rpg_private.assert(intent->>'restKind' in ('short','long'));
 end if;
 if intent->'restSafety'='null'::jsonb then
   perform rpg_private.assert(safety='null'::jsonb);
 else
   perform rpg_private.fields(intent->'restSafety',array['locationId','suitable']);
   location_id:=(intent#>>'{restSafety,locationId}')::uuid;
   perform rpg_private.assert(jsonb_typeof(intent#>'{restSafety,suitable}')='boolean' and
     t.source#>>'{snapshot,publicState,current_location_id}'=location_id::text and
     exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,locations}')
       where value->>'id'=location_id::text and value->>'status' in ('known','visited')) and
     safety=jsonb_build_object('campaignId',cid,'operationId',t.id,
       'timeline',coalesce(t.checkpoint#>'{astraPrimary,createdTimeline}','null'::jsonb),'locationId',location_id,
       'suitable',intent#>'{restSafety,suitable}'));
 end if;
 -- Formal rest convenience must expand to the server-selected exact actions.
 if kind='formal_rest' then
   select value into rest from jsonb_array_elements(t.source#>'{runtime,restRecords}')
     where value->>'status'='planned' limit 1;
   if rest is null then
     select coalesce(jsonb_agg(c.value order by c.n),'[]') into participants
       from jsonb_array_elements(t.source#>'{runtime,configuration,controlledEntityIds}')
         with ordinality c(value,n) where
         t.source#>'{runtime,configuration,presentEntityIds}' ? (c.value#>>'{}') and
         t.source#>'{worldTakeover,presentEntityIds}' ? (c.value#>>'{}') and
         exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
           where e.value->'id'=c.value and e.value->>'kind' in ('player','companion') and
             not e.value->'conditions' ? 'dead' and not e.value->'conditions' ? 'withdrawn');
     perform rpg_private.assert(jsonb_array_length(participants)>0);
     rest_id:=rpg_private.wave4_id(t.id,'rest:0');
     expected_actions:=jsonb_build_array(jsonb_build_object('kind','rest.enter',
       'restKind',intent->'restKind','participantIds',participants));
     settings:=t.source#>'{snapshot,settings,values}';
   else
     perform rpg_private.assert(rest->'kind'=intent->'restKind');
     participants:=rest#>'{public_outcome,participantIds}'; rest_id:=(rest->>'id')::uuid;
     expected_actions:='[]';
     settings:=case when rest->'settings_revision'=t.source#>'{snapshot,settings,revision}'
       then t.source#>'{snapshot,settings,values}' else (select value->'values'
         from jsonb_array_elements(t.source#>'{snapshot,settingsHistory}')
         where value->'revision'=rest->'settings_revision' limit 1) end;
   end if;
   cost:=(settings#>>array['difficulty',case when intent->>'restKind'='long'
     then 'longRestSupplyCost' else 'shortRestSupplyCost' end])::integer*jsonb_array_length(participants);
   remaining:=cost; supplies:='[]';
   for item in select value from jsonb_array_elements(t.source#>'{snapshot,items}')
     order by value->>'id' loop
     if remaining=0 then exit; end if;
     if (item->>'quantity')::integer<=0 or
       exists(select 1 from jsonb_array_elements(coalesce(t.source->'astraSettlementItemPolicies','[]'))
         where value->'itemId'=item->'id' and value->>'visibility'='private') or
       not rpg_private.astra_mechanic_tagged(t.source,(item->>'id')::uuid,'supply') or
       rpg_private.astra_mechanic_tagged(t.source,(item->>'id')::uuid,'meal-serving') or
       rpg_private.astra_mechanic_tagged(t.source,(item->>'id')::uuid,'coffee-serving') then continue; end if;
     -- The convenience selector considers only controllable, accessible stock.
     if item->>'owner_entity_id' is not null and
       not t.source#>'{runtime,configuration,controlledEntityIds}' ? (item->>'owner_entity_id')
       then continue; end if;
     destination:=rpg_private.astra_shadow_row(t.source,'storages',(item->>'storage_id')::uuid);
     if destination->>'kind'='camp' then
       if intent->>'restKind'<>'long' then continue; end if;
     elsif destination->>'kind'='transport' then
       if not t.source#>'{runtime,configuration,nearbyStorageIds}' ? (destination->>'id') then continue; end if;
     elsif not t.source#>'{runtime,configuration,presentEntityIds}' ? (destination->>'entity_id') or
       not t.source#>'{runtime,configuration,controlledEntityIds}' ? (destination->>'entity_id')
       then continue; end if;
     quantity:=least(remaining,(item->>'quantity')::integer);
     supplies:=supplies||jsonb_build_array(jsonb_build_object('itemId',item->'id','quantity',quantity));
     remaining:=remaining-quantity;
   end loop;
   perform rpg_private.assert(remaining=0);
   expected_actions:=expected_actions||jsonb_build_array(jsonb_build_object('kind','rest.complete',
     'restId',rest_id,'supplies',supplies));
   perform rpg_private.assert(actions=expected_actions);
 end if;
 for action in select value from jsonb_array_elements(actions) loop
   s:=work->'source'; config:=s#>'{runtime,configuration}'; action_kind:=action->>'kind';
   actor:=null; item:=null; rest:=null; ids:='[]'; item_ids:='[]'; text_outcome:=null;
   select value into rest from jsonb_array_elements(s#>'{runtime,restRecords}')
     where value->>'status'='planned' limit 1;
   case action_kind
   when 'resource.spend' then
     perform rpg_private.fields(action,array['kind','entityId','resource','amount']);
     actor_id:=(action->>'entityId')::uuid; actor:=rpg_private.astra_mechanic_entity(s,actor_id);
     key:=action->>'resource'; amount:=(action->>'amount')::integer;
     perform rpg_private.assert(key ~ '^[a-z][a-z0-9_-]{0,39}$' and
       rpg_private.wave4_integer(action->'amount',1) and actor->'resources' ? key and
       (actor#>>array['resources',key])::integer>=amount);
     work:=rpg_private.astra_mechanic_write(work,'entities',actor_id,
       jsonb_build_object('resources',actor->'resources'||jsonb_build_object(key,
         (actor#>>array['resources',key])::integer-amount)));
     ids:=jsonb_build_array(actor_id); text_outcome:='The recorded resource cost was spent.';
   when 'item.consume' then
     perform rpg_private.fields(action,array['kind','actorId','itemId','quantity']);
     actor_id:=(action->>'actorId')::uuid; actor:=rpg_private.astra_mechanic_entity(s,actor_id);
     item_id:=(action->>'itemId')::uuid; item:=rpg_private.astra_mechanic_item(s,item_id,1);
     perform rpg_private.assert(action->'quantity'='1'::jsonb and
       rpg_private.astra_mechanic_tagged(s,item_id,'healing') and
       not exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') where value->>'status'='active')
       and actor->>'hp' is not null and actor->>'max_hp' is not null);
     work:=rpg_private.astra_mechanic_consume(work,item_id,1);
     work:=rpg_private.astra_mechanic_write(work,'entities',actor_id,jsonb_build_object('hp',
       least((actor->>'max_hp')::integer,(actor->>'hp')::integer+4)));
     ids:=jsonb_build_array(actor_id); item_ids:=jsonb_build_array(item_id);
     text_outcome:='One healing item was consumed and recovery was applied.';
   when 'item.transfer' then
     perform rpg_private.fields(action,array['kind','actorId','itemId','quantity','destinationStorageId']);
     actor_id:=(action->>'actorId')::uuid; perform rpg_private.astra_mechanic_entity(s,actor_id);
     perform rpg_private.assert(rpg_private.wave4_integer(action->'quantity',1));
     quantity:=(action->>'quantity')::integer; item_id:=(action->>'itemId')::uuid;
     item:=rpg_private.astra_mechanic_item(s,item_id,quantity);
     destination:=rpg_private.astra_mechanic_storage(s,(action->>'destinationStorageId')::uuid,true);
     perform rpg_private.assert(item->'storage_id'<>action->'destinationStorageId');
     if (item->>'quantity')::integer=quantity then
       work:=rpg_private.astra_mechanic_write(work,'items',item_id,jsonb_build_object(
         'storage_id',action->'destinationStorageId','equipped_entity_id',null,'equipped_slot',null));
     else
       work:=rpg_private.astra_mechanic_consume(work,item_id,quantity);
       rid:=rpg_private.wave4_id(t.id,'split:'||idx::text);
       perform rpg_private.assert(rpg_private.astra_shadow_row(work->'source','items',rid) is null);
       new_item:=item-array['id','campaign_id','revision','updated_at','created_at'];
       new_item:=new_item||jsonb_build_object('quantity',quantity,'storage_id',action->'destinationStorageId',
         'equipped_entity_id',null,'equipped_slot',null);
       work:=rpg_private.astra_mechanic_write(work,'items',rid,new_item);
       select coalesce(jsonb_agg(value||jsonb_build_object('itemId',rid)),'[]') into extra
         from jsonb_array_elements(config->'itemRules') where value->>'itemId'=item_id::text;
       work:=jsonb_set(work,'{source,runtime,configuration,itemRules}',config->'itemRules'||extra);
       work:=rpg_private.astra_mechanic_write(work,'provenance',rpg_private.wave4_id(t.id,'provenance:'||idx::text),
         jsonb_build_object('operation_id',t.id,'session_id',s#>'{snapshot,publicState,current_session_id}',
           'inputs',jsonb_build_array(jsonb_build_object('itemId',item_id,'quantity',quantity,'disposition','retained')),
           'outputItemIds',jsonb_build_array(rid)));
     end if;
     item_ids:=jsonb_build_array(item_id); text_outcome:='The requested quantity was transferred.';
   when 'item.equip' then
     perform rpg_private.fields(action,array['kind','actorId','itemId','slot']);
     actor_id:=(action->>'actorId')::uuid; actor:=rpg_private.astra_mechanic_entity(s,actor_id);
     item_id:=(action->>'itemId')::uuid; item:=rpg_private.astra_mechanic_item(s,item_id);
     destination:=rpg_private.astra_mechanic_storage(s,(item->>'storage_id')::uuid);
     perform rpg_private.assert(destination->>'entity_id'=actor_id::text or destination->>'kind'='camp');
     if action->'slot'<>'null'::jsonb then
       perform rpg_private.assert(exists(select 1 from jsonb_array_elements(actor->'equipment_slots')
         where value->'id'=action->'slot' and value->'accepts' ? (item->>'category')) and
         not exists(select 1 from jsonb_array_elements(s#>'{snapshot,items}') where value->>'id'<>item_id::text
           and value->>'equipped_entity_id'=actor_id::text and value->'equipped_slot'=action->'slot'));
       select value into destination from jsonb_array_elements(s#>'{snapshot,storages}')
         where value->>'entity_id'=actor_id::text and value->>'kind' in ('player','companion') limit 1;
       perform rpg_private.assert(destination is not null);
       work:=rpg_private.astra_mechanic_write(work,'items',item_id,jsonb_build_object('storage_id',destination->'id',
         'equipped_entity_id',actor_id,'equipped_slot',action->'slot'));
     else work:=rpg_private.astra_mechanic_write(work,'items',item_id,jsonb_build_object(
       'equipped_entity_id',null,'equipped_slot',null)); end if;
     ids:=jsonb_build_array(actor_id); item_ids:=jsonb_build_array(item_id);
     text_outcome:='Equipment assignment was updated.';
   when 'quest.transition' then
     perform rpg_private.fields(action,array['kind','questId','status']);
     rid:=(action->>'questId')::uuid; item:=rpg_private.astra_shadow_row(s,'quests',rid);
     perform rpg_private.assert(item is not null and item->>'status'='open'
       and action->>'status' in ('complete','archived'));
     work:=rpg_private.astra_mechanic_write(work,'quests',rid,jsonb_build_object('status',action->'status'));
     text_outcome:='The quest status changed prospectively.';
   when 'location.move' then
     perform rpg_private.fields(action,array['kind','locationId']); rid:=(action->>'locationId')::uuid;
     item:=rpg_private.astra_shadow_row(s,'locations',rid);
     perform rpg_private.assert(item is not null and item->>'status' in ('known','visited') and rest is null
       and s#>'{worldTakeover,routeLocationIds}' ? rid::text
       and not exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') where value->>'status'='active'));
     work:=rpg_private.astra_mechanic_write(work,'public_state',cid,jsonb_build_object('current_location_id',rid));
     work:=rpg_private.astra_mechanic_write(work,'locations',rid,jsonb_build_object('status','visited'));
     text_outcome:='The party reached the selected known location.';
   when 'rest.enter' then
     perform rpg_private.fields(action,array['kind','restKind','participantIds']);
     perform rpg_private.assert(rest is null and action->>'restKind' in ('short','long') and
       not exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') where value->>'status'='active') and
       case when safety='null'::jsonb then config->'safeLocationIds' ? (s#>>'{snapshot,publicState,current_location_id}')
         else safety->'suitable'='true'::jsonb and safety->>'locationId'=s#>>'{snapshot,publicState,current_location_id}' end);
     participants:=action->'participantIds';
     perform rpg_private.assert(jsonb_typeof(participants)='array' and jsonb_array_length(participants)>0 and
       (select count(*)=count(distinct value) from jsonb_array_elements(participants)));
     for part in select value from jsonb_array_elements(participants) loop
       perform rpg_private.astra_mechanic_entity(s,(part#>>'{}')::uuid); end loop;
     rest_id:=rpg_private.wave4_id(t.id,'rest:'||idx::text);
     perform rpg_private.assert(rpg_private.astra_shadow_row(s,'rest_records',rest_id) is null);
     work:=rpg_private.astra_mechanic_write(work,'rest_records',rest_id,jsonb_build_object(
       'kind',action->'restKind','status','planned','settings_revision',s#>'{snapshot,settings,revision}',
       'public_outcome',jsonb_build_object('participantIds',participants,'startedAtMinutes',minutes)));
     if outcome_rest is null then outcome_rest:=rest_id; end if;
     ids:=participants; text_outcome:='Rest began. Recovery requires explicit completion.';
   when 'rest.leave' then
     perform rpg_private.fields(action,array['kind','restId']);
     perform rpg_private.assert(rest is not null and rest->'id'=action->'restId');
     work:=rpg_private.astra_mechanic_write(work,'rest_records',(rest->>'id')::uuid,jsonb_build_object('status','interrupted'));
     if not completed then outcome_rest:=(rest->>'id')::uuid; end if;
     for effect in select value from jsonb_array_elements(s#>'{runtime,effects}')
       where value#>'{definition,creatingRestId}'=rest->'id' and value#>>'{definition,status}'='pending' loop
       work:=rpg_private.astra_mechanic_write(work,'effects',(effect->>'id')::uuid,
         jsonb_build_object('definition',effect->'definition'||jsonb_build_object('status','expired')));
     end loop;
     text_outcome:='Rest ended without recovery. Completed transfers and preparation remain saved.';
   when 'rest.complete' then
     perform rpg_private.fields(action,array['kind','restId','supplies']);
     perform rpg_private.assert(rest is not null and rest->'id'=action->'restId' and
       not exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') where value->>'status'='active') and
       case when safety='null'::jsonb then config->'safeLocationIds' ? (s#>>'{snapshot,publicState,current_location_id}')
         else safety->'suitable'='true'::jsonb and safety->>'locationId'=s#>>'{snapshot,publicState,current_location_id}' end);
     participants:=rest#>'{public_outcome,participantIds}';
     perform rpg_private.assert(jsonb_typeof(participants)='array');
     settings:=case when rest->'settings_revision'=s#>'{snapshot,settings,revision}' then s#>'{snapshot,settings,values}'
       else (select value->'values' from jsonb_array_elements(s#>'{snapshot,settingsHistory}')
         where value->'revision'=rest->'settings_revision' limit 1) end;
     perform rpg_private.assert(settings#>>'{rulesSystem,id}' in ('console-basic-v1','world-logic-v1'));
     cost:=(settings#>>array['difficulty',case when rest->>'kind'='long'
       then 'longRestSupplyCost' else 'shortRestSupplyCost' end])::integer*jsonb_array_length(participants);
     supplies:=action->'supplies'; supplied:=0; seen:='{}';
     perform rpg_private.assert(jsonb_typeof(supplies)='array' and jsonb_array_length(supplies)<=50);
     for part in select value from jsonb_array_elements(supplies) loop
       perform rpg_private.fields(part,array['itemId','quantity']); item_id:=(part->>'itemId')::uuid;
       perform rpg_private.assert(rpg_private.wave4_integer(part->'quantity',1) and
         not item_id::text=any(seen) and rpg_private.astra_mechanic_tagged(s,item_id,'supply') and
         not rpg_private.astra_mechanic_tagged(s,item_id,'meal-serving') and
         not rpg_private.astra_mechanic_tagged(s,item_id,'coffee-serving'));
       seen:=array_append(seen,item_id::text); quantity:=(part->>'quantity')::integer;
       work:=rpg_private.astra_mechanic_consume(work,item_id,quantity); supplied:=supplied+quantity;
       item_ids:=item_ids||jsonb_build_array(item_id);
     end loop;
     perform rpg_private.assert(supplied=cost);
     recovery:=case rest->>'kind' when 'short' then case settings#>>'{difficulty,recovery}'
       when 'forgiving' then 0.5 when 'standard' then 0.25 when 'restrictive' then 0 end
       when 'long' then case settings#>>'{difficulty,recovery}' when 'forgiving' then 1
         when 'standard' then 0.5 when 'restrictive' then 0.25 end end;
     perform rpg_private.assert(recovery is not null);
     for part in select value from jsonb_array_elements(participants) loop
       actor_id:=(part#>>'{}')::uuid; actor:=rpg_private.astra_mechanic_entity(work->'source',actor_id);
       perform rpg_private.assert(actor->>'hp' is not null and actor->>'max_hp' is not null);
       work:=rpg_private.astra_mechanic_write(work,'entities',actor_id,jsonb_build_object('hp',
         least((actor->>'max_hp')::integer,(actor->>'hp')::integer+ceil((actor->>'max_hp')::integer*recovery)::integer)));
     end loop;
     minutes:=minutes+case rest->>'kind' when 'long' then 480 else 60 end;
     work:=rpg_private.astra_mechanic_write(work,'rest_records',(rest->>'id')::uuid,jsonb_build_object(
       'status','complete','public_outcome',rest->'public_outcome'||jsonb_build_object(
         'completedAtMinutes',minutes,'supplies',supplies,'recovery',recovery)));
     if rest->>'kind'='long' then
       for effect in select value from jsonb_array_elements(work#>'{source,runtime,effects}') loop
         if effect#>'{definition,creatingRestId}'=rest->'id' and effect#>>'{definition,status}'='pending' then
           definition:=effect->'definition'||jsonb_build_object('status','active');
         elsif effect#>>'{definition,status}'='active' then
           definition:=effect->'definition'||jsonb_build_object('status','expired');
         else continue; end if;
         work:=rpg_private.astra_mechanic_write(work,'effects',(effect->>'id')::uuid,jsonb_build_object('definition',definition));
       end loop;
     end if;
     completed:=true; outcome_rest:=(rest->>'id')::uuid; ids:=participants;
     text_outcome:='The rest completed with its recorded supply costs and recovery.';
   when 'recipe.prepare' then
     perform rpg_private.fields(action,array['kind','actorId','recipe','ingredients','outputStorageId']);
     actor_id:=(action->>'actorId')::uuid; perform rpg_private.astra_mechanic_entity(s,actor_id);
     perform rpg_private.astra_mechanic_storage(s,(action->>'outputStorageId')::uuid);
     recipe:=action->>'recipe'; required:=case recipe when 'meal' then array['meat']
       when 'coffee' then array['coffee','water'] else null end;
     perform rpg_private.assert(rest->>'kind'='long' and required is not null and
       jsonb_typeof(action->'ingredients')='array' and jsonb_array_length(action->'ingredients')=cardinality(required));
     seen:='{}'; provenance_inputs:='[]';
     for part in select value from jsonb_array_elements(action->'ingredients') loop
       perform rpg_private.fields(part,array['itemId','quantity']); item_id:=(part->>'itemId')::uuid;
       perform rpg_private.assert(part->'quantity'='1'::jsonb and not item_id::text=any(seen));
       seen:=array_append(seen,item_id::text);
       work:=rpg_private.astra_mechanic_consume(work,item_id,1);
       provenance_inputs:=provenance_inputs||jsonb_build_array(part||jsonb_build_object('disposition','consumed'));
     end loop;
     foreach tag in array required loop
       select count(*) into n from jsonb_array_elements(action->'ingredients')
         where rpg_private.astra_mechanic_tagged(s,(value->>'itemId')::uuid,tag);
       perform rpg_private.assert(n=1);
     end loop;
     rid:=rpg_private.wave4_id(t.id,'prepared:'||idx::text);
     perform rpg_private.assert(rpg_private.astra_shadow_row(work->'source','items',rid) is null);
     work:=rpg_private.astra_mechanic_write(work,'items',rid,jsonb_build_object('name',
       case recipe when 'meal' then 'Prepared meal' else 'Prepared coffee' end,'category','consumable','quantity',1,
       'description','Prepared under the configured house rules.',
       'mechanics','Requires explicit serving; preparation grants no effect.','owner_entity_id',actor_id,
       'storage_id',action->'outputStorageId','equipped_entity_id',null,'equipped_slot',null));
     work:=jsonb_set(work,'{source,runtime,configuration,itemRules}',config->'itemRules'||
       jsonb_build_array(jsonb_build_object('itemId',rid,'tag',recipe||'-serving','damage',null)));
     work:=rpg_private.astra_mechanic_write(work,'provenance',rpg_private.wave4_id(t.id,'provenance:'||idx::text),
       jsonb_build_object('operation_id',t.id,'session_id',s#>'{snapshot,publicState,current_session_id}',
         'inputs',provenance_inputs,'outputItemIds',jsonb_build_array(rid)));
     ids:=jsonb_build_array(actor_id); item_ids:=jsonb_build_array(rid);
     text_outcome:='Ingredients were consumed to prepare one serving. No benefit has been applied.';
   when 'recipe.serve' then
     perform rpg_private.fields(action,array['kind','actorId','itemId','recipientIds']);
     actor_id:=(action->>'actorId')::uuid; perform rpg_private.astra_mechanic_entity(s,actor_id);
     participants:=action->'recipientIds';
     perform rpg_private.assert(rest->>'kind'='long' and jsonb_typeof(participants)='array' and
       jsonb_array_length(participants)>0 and (select count(*)=count(distinct value) from jsonb_array_elements(participants)));
     item_id:=(action->>'itemId')::uuid;
     item:=rpg_private.astra_mechanic_item(s,item_id,jsonb_array_length(participants));
     recipe:=case when rpg_private.astra_mechanic_tagged(s,item_id,'meal-serving') then 'meal'
       when rpg_private.astra_mechanic_tagged(s,item_id,'coffee-serving') then 'coffee' else null end;
     perform rpg_private.assert(recipe is not null);
     for part in select value from jsonb_array_elements(participants) loop
       actor_id:=(part#>>'{}')::uuid; perform rpg_private.astra_mechanic_entity(work->'source',actor_id);
       perform rpg_private.assert(rest#>'{public_outcome,participantIds}' ? actor_id::text);
       for effect in select value from jsonb_array_elements(work#>'{source,runtime,effects}')
         where value->>'entity_id'=actor_id::text and value#>>'{definition,kind}'=recipe and
           value#>>'{definition,status}'<>'expired' loop
         work:=rpg_private.astra_mechanic_write(work,'effects',(effect->>'id')::uuid,
           jsonb_build_object('definition',effect->'definition'||jsonb_build_object('status','expired')));
       end loop;
       rid:=rpg_private.wave4_id(t.id,'effect:'||idx::text||':'||actor_id::text);
       perform rpg_private.assert(rpg_private.astra_shadow_row(work->'source','effects',rid) is null);
       work:=rpg_private.astra_mechanic_write(work,'effects',rid,jsonb_build_object('entity_id',actor_id,'recipe_id',null,
         'definition',jsonb_build_object('kind',recipe,'status','pending','creatingRestId',rest->'id',
           'remaining',case recipe when 'meal' then 2 else 1 end)));
     end loop;
     work:=rpg_private.astra_mechanic_consume(work,item_id,jsonb_array_length(participants));
     ids:=participants; item_ids:=jsonb_build_array(item_id);
     text_outcome:='Servings were consumed. Benefits activate after this long rest and never stack.';
   else raise exception 'rpg_validation';
   end case;
   outcomes:=outcomes||jsonb_build_array(jsonb_build_object('kind',action_kind,'text',text_outcome,
     'entityIds',ids,'itemIds',item_ids)); idx:=idx+1;
 end loop;
 -- World takeover travel closes local NPC and cargo access using the same
 -- deterministic projection as the existing Astra travel path.
 if exists(select 1 from jsonb_array_elements(work->'changes') c
   where c.value->>'family'='public_state' and c.value#>'{values,current_location_id}'<>
     t.source#>'{snapshot,publicState,current_location_id}') then
   select coalesce(jsonb_agg(p.value order by p.n),'[]') into participants
     from jsonb_array_elements(work#>'{source,runtime,configuration,presentEntityIds}') with ordinality p(value,n)
     where work#>'{source,runtime,configuration,controlledEntityIds}' ? (p.value#>>'{}') or
       exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') e
         where e.value->'id'=p.value and e.value->>'kind'='companion');
   work:=jsonb_set(jsonb_set(work,'{source,runtime,configuration,presentEntityIds}',participants),
     '{source,runtime,configuration,nearbyStorageIds}','[]'::jsonb);
 end if;
 return jsonb_build_object('schemaVersion',1,'kind',kind,'intent',intent,'actions',actions,
   'safety',safety,'resolution',jsonb_build_object('changes',work->'changes',
     'worldMinutes',minutes,'configuration',work#>'{source,runtime,configuration}','outcomes',outcomes),
   'publicOutcome',jsonb_build_object('kind',kind,'completedRest',completed,'restId',outcome_rest));
end $$;

-- Independent existing effect algorithm over the evolving authoritative shadow.
create function rpg_private.astra_shadow_legacy_expected(
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
 select e.* into hero from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid
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
   perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_quests(cid,t.source)
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
   select * into quest from rpg_private.astra_shadow_quests(cid,t.source) where campaign_id=cid
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
     select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid
       and e.id=source_id and e.kind='npc';
     perform rpg_private.assert(npc.id is not null and
       t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
     if terms->'currencyName'<>'null'::jsonb then
       currency_name:=terms->>'currencyName';
       currency_amount:=(terms->>'currencyAmount')::integer;
       perform rpg_private.assert(rpg_private.wave4_integer(
         terms->'currencyAmount',1,20));
       picked:=rpg_private.astra_shadow_currency(cid,t.source,currency_name,true);
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
       storage_id:=rpg_private.astra_shadow_player_storage(cid,t.source,hero.id);
       perform rpg_private.assert(storage_id is not null);
       item_id:=rpg_private.wave4_id(t.id,'astra:reward-item:'||quest.id::text);
       perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid
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
     picked:=rpg_private.astra_shadow_currency(cid,t.source,currency_name,true);
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
     storage_id:=rpg_private.astra_shadow_player_storage(cid,t.source,hero.id);
     perform rpg_private.assert(storage_id is not null);
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source) i
       where i.campaign_id=cid and i.owner_entity_id=npc.id and
         i.quantity>0 and i.category=item_category and
         lower(btrim(i.name))=lower(item_name)));
     item_id:=rpg_private.wave4_id(t.id,'astra:grant-item');
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid and
     e.id=source_id and e.kind='npc';
   select value into source_row from jsonb_array_elements(t.source#>'{snapshot,entities}')
     where value->>'id'=source_id::text;
   perform rpg_private.assert(npc.id is not null and source_row is not null and
     source_row->>'revision'=npc.revision::text and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
   amount:=(intent->>'amount')::integer;
   currency_name:=intent->>'currencyName';
   picked:=rpg_private.astra_shadow_currency(cid,t.source,currency_name,false);
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid and
     e.id=source_id and e.kind='npc';
   perform rpg_private.assert(npc.id is not null and
     t.source#>'{worldTakeover,presentEntityIds}' ? source_id::text);
   select * into item from rpg_private.astra_shadow_items(cid,t.source) where campaign_id=cid and
     id=(intent->>'itemId')::uuid and owner_entity_id=source_id;
   select value into item_row from jsonb_array_elements(t.source#>'{snapshot,items}')
     where value->>'id'=item.id::text;
   select value into policy_row from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=item.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into current_policy from rpg_private.astra_shadow_foundations(cid,t.source) w,
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
   storage_id:=rpg_private.astra_shadow_player_storage(cid,t.source,hero.id);
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
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid
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
   picked:=rpg_private.astra_shadow_currency(cid,t.source,currency_name,false);
   definition:=picked->'definition'; key:=definition->>'resourceKey';
   source_balance:=coalesce((hero.resources->>key)::bigint,0);
   seller_after:=coalesce((npc.resources->>key)::bigint,0)+price;
   perform rpg_private.assert(source_balance>=price and
     seller_after between 0 and 1000000);
   select * into item from rpg_private.astra_shadow_items(cid,t.source) where campaign_id=cid and
     id=(intent->>'itemId')::uuid and owner_entity_id=source_id;
   select value into item_row from jsonb_array_elements(t.source#>'{snapshot,items}')
     where value->>'id'=item.id::text;
   select value into policy_row from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=item.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into current_policy from rpg_private.astra_shadow_foundations(cid,t.source) w,
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
   storage_id:=rpg_private.astra_shadow_player_storage(cid,t.source,hero.id);
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
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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

-- Independent existing effect algorithm over the evolving authoritative shadow.
create function rpg_private.astra_shadow_general_expected(cid uuid,
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
 select e.* into hero from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid and
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid and
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
   select s.id into storage_id from rpg_private.astra_shadow_storages(cid,t.source) s where s.campaign_id=cid
     and s.entity_id=npc.id and s.kind='merchant' order by s.id limit 1;
   if storage_id is not null then
     perform rpg_private.assert(exists(
       select 1 from jsonb_array_elements(t.source#>'{snapshot,storages}') s
       where s.value->>'id'=storage_id::text));
   else
     storage_id:=rpg_private.wave4_id(t.id,
       'astra:sale-storage:'||npc.id::text);
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_storages(cid,t.source)
       where id=storage_id));
   end if;
   currency:=rpg_private.astra_shadow_currency(cid,t.source,
     intent->>'currencyName',false);
   definition:=currency->'definition'; key:=definition->>'resourceKey';
   price:=(intent->>'price')::integer; amount:=(intent->>'quantity')::integer;
   hero_before:=coalesce((hero.resources->>key)::bigint,0);
   npc_before:=coalesce((npc.resources->>key)::bigint,0);
   perform rpg_private.assert(npc_before>=price and
     hero_before+price<=1000000);
   select * into item from rpg_private.astra_shadow_items(cid,t.source) where campaign_id=cid and
     id=(intent->>'itemId')::uuid and owner_entity_id=hero.id;
   select value into item_snapshot from jsonb_array_elements(
     t.source#>'{snapshot,items}') where value->>'id'=item.id::text;
   select value into policy_snapshot from jsonb_array_elements(
     t.source->'astraSettlementItemPolicies') p
     where p.value->>'itemId'=item.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into policy_current from rpg_private.astra_shadow_foundations(cid,t.source) w,
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
   if not exists(select 1 from rpg_private.astra_shadow_storages(cid,t.source) where id=storage_id) then
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
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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
   select e.* into npc from rpg_private.astra_shadow_entities(cid,t.source) e where e.campaign_id=cid and
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
   select s.id into storage_id from rpg_private.astra_shadow_storages(cid,t.source) s where s.campaign_id=cid
     and s.entity_id=npc.id and s.kind='merchant' order by s.id limit 1;
   if storage_id is not null then
     perform rpg_private.assert(exists(select 1 from
       jsonb_array_elements(t.source#>'{snapshot,storages}') s
       where s.value->>'id'=storage_id::text));
   else
     storage_id:=rpg_private.wave4_id(t.id,
       'astra:sale-storage:'||npc.id::text);
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_storages(cid,t.source)
       where id=storage_id));
     changes:=changes||jsonb_build_array(jsonb_build_object('family','storages',
       'id',storage_id,'expectedRevision',null,'values',jsonb_build_object(
         'name',left('Inventory of '||public_name,160),
         'kind','merchant','entity_id',npc.id)));
   end if;
   select * into given from rpg_private.astra_shadow_items(cid,t.source) where campaign_id=cid and
     id=(intent->>'giveItemId')::uuid and owner_entity_id=hero.id;
   select * into received from rpg_private.astra_shadow_items(cid,t.source) where campaign_id=cid and
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
     into given_current_policy from rpg_private.astra_shadow_foundations(cid,t.source) w,
       jsonb_array_elements(w.loop_state->'itemPolicies') p
     where w.campaign_id=cid and p.value->>'itemId'=given.id::text;
   select jsonb_build_object('itemId',p.value->'itemId',
     'visibility',p.value->'visibility','trade',p.value->'trade')
     into received_current_policy from rpg_private.astra_shadow_foundations(cid,t.source) w,
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
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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
   item_id:=rpg_private.astra_shadow_player_storage(cid,t.source,hero.id);
   perform rpg_private.assert(item_id is not null);
   if receive_id=received.id then
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items',
       'id',received.id,'expectedRevision',received.revision,'values',
       jsonb_build_object('quantity',receive_quantity,'owner_entity_id',hero.id,
         'storage_id',item_id,'equipped_entity_id',null,'equipped_slot',null)));
   else
     perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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
     select * into item from rpg_private.astra_shadow_items(cid,t.source) where campaign_id=cid and
       id=(entry->>'itemId')::uuid and owner_entity_id=hero.id;
     select value into item_snapshot from jsonb_array_elements(
       t.source#>'{snapshot,items}') where value->>'id'=item.id::text;
     select value into policy_snapshot from jsonb_array_elements(
       t.source->'astraSettlementItemPolicies') p
       where p.value->>'itemId'=item.id::text;
     select jsonb_build_object('itemId',p.value->'itemId',
       'visibility',p.value->'visibility','trade',p.value->'trade')
       into policy_current from rpg_private.astra_shadow_foundations(cid,t.source) w,
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
   select s.id into storage_id from rpg_private.astra_shadow_storages(cid,t.source) s where s.campaign_id=cid
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
   perform rpg_private.assert(not exists(select 1 from rpg_private.astra_shadow_items(cid,t.source)
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

-- Independent existing effect algorithm over the evolving authoritative shadow.
create function rpg_private.astra_shadow_effect_expected(
  cid uuid,t rpg_private.turns,plan jsonb
) returns jsonb language plpgsql stable set search_path='' as $$
declare intent jsonb; f rpg_private.world_foundations%rowtype;
  next_state jsonb; progress jsonb; pending_ids jsonb; hero uuid;
begin
 if plan->>'kind'<>'progression_award' then
   if plan->>'kind' in ('mundane_sale','mundane_craft','item_exchange') then
     return rpg_private.astra_shadow_general_expected(cid,t,plan);
   end if;
   return rpg_private.astra_shadow_legacy_expected(cid,t,plan);
 end if;
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent',
   'changes','currencyDefinition','publicOutcome','progressionState']);
 intent:=plan->'intent';
 perform rpg_private.fields(intent,array['kind','recipientId','trackId','amount']);
 hero:=(intent->>'recipientId')::uuid;
 perform rpg_private.assert(plan->'schemaVersion'='1'::jsonb and
   intent->>'kind'='progression_award' and plan->'changes'='[]'::jsonb and
   plan->'currencyDefinition'='null'::jsonb and t.campaign_id=cid and
   t.runtime_identity='astra-primary-v1' and t.input->>'mode'='game' and
   t.source->'worldTakeover' is not null and
   rpg_private.astra_takeover_active(cid) and
   jsonb_array_length(t.source#>'{runtime,configuration,controlledEntityIds}')=1
   and t.source#>>'{runtime,configuration,controlledEntityIds,0}'=hero::text);
 select * into strict f from rpg_private.astra_shadow_foundations(cid,t.source) where campaign_id=cid;
 perform rpg_private.assert(t.source->'astraProgressionState'=f.loop_state and
   t.source->'astraProgressionBaseline'=coalesce((
     select a.value->'capabilities' from jsonb_array_elements(f.world->'actors') a
       where a.value->>'entityId'=hero::text limit 1),'[]'::jsonb));
 next_state:=rpg_private.astra_progression_after(cid,t.id,f.loop_state,
   t.source->'astraProgressionBaseline',intent);
 select value into progress from jsonb_array_elements(next_state->'progress') p
   where p.value->>'entityId'=hero::text and
     p.value->>'trackId'=intent->>'trackId';
 select coalesce(jsonb_agg(p.value->'id' order by p.n),'[]'::jsonb)
   into pending_ids from jsonb_array_elements(next_state->'pending')
   with ordinality p(value,n) where p.value->>'entityId'=hero::text and
     p.value->>'trackId'=intent->>'trackId';
 return jsonb_build_object('schemaVersion',1,'kind','progression_award',
   'intent',intent,'changes','[]'::jsonb,'currencyDefinition',null,
   'progressionState',next_state,'publicOutcome',jsonb_build_object(
     'kind','progression_award','questId',null,'questStatus',null,
     'currency',null,'item',null,'progression',jsonb_build_object(
       'trackId',intent->>'trackId','value',progress->'value',
       'rank',progress->'rank','pendingIds',pending_ids)));
end $$;

-- Revisions alone cover mutable public rows; nonrevisioned runtime rows and
-- the pinned Foundation state are also checked by their actual source fields.
create function rpg_private.astra_ordered_origin_assert(cid uuid,t rpg_private.turns)
returns void language plpgsql stable set search_path='' as $$
declare family text; rowdata jsonb; current_row jsonb; tab text; runtime_key text;
begin
 perform rpg_private.assert(t.campaign_id=cid and t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and rpg_private.astra_takeover_active(cid) and
   t.source#>>'{snapshot,campaign,id}'=cid::text and
   t.source#>>'{runtime,revision}'=t.expected_revision::text and
   exists(select 1 from rpg_private.runtime_state where campaign_id=cid and revision=t.expected_revision
     and world_minutes=(t.source#>>'{runtime,worldMinutes}')::integer
     and configuration=t.source#>'{runtime,configuration}'));
 foreach family in array array['entities','items','storages','quests','locations'] loop
   for rowdata in select value from jsonb_array_elements(t.source#>array['snapshot',family]) loop
     execute format('select to_jsonb(q) from public.%I q where campaign_id=$1 and id=$2','rpg_'||family)
       into current_row using cid,(rowdata->>'id')::uuid;
     perform rpg_private.assert(current_row is not null and not exists(
       select 1 from jsonb_each(rowdata-array['updated_at','created_at','timeline']) p
         where current_row->p.key is distinct from p.value));
   end loop;
 end loop;
 select to_jsonb(p) into current_row from public.rpg_public_state p where campaign_id=cid;
 rowdata:=t.source#>'{snapshot,publicState}';
 perform rpg_private.assert(current_row is not null and not exists(
   select 1 from jsonb_each(rowdata-array['updated_at','created_at','timeline']) p
     where current_row->p.key is distinct from p.value));
 foreach family in array array['rest_records','effects','recipes','encounters','encounter_participants','provenance'] loop
   for rowdata in select value from jsonb_array_elements(rpg_private.astra_shadow_rows(t.source,family)) loop
     execute format('select to_jsonb(q) from public.%I q where campaign_id=$1 and id=$2','rpg_'||family)
       into current_row using cid,(rowdata->>'id')::uuid;
     perform rpg_private.assert(current_row is not null and not exists(
       select 1 from jsonb_each(rowdata-array['updated_at','created_at','timeline']) p
         where current_row->p.key is distinct from p.value));
   end loop;
 end loop;
 perform rpg_private.assert(exists(select 1 from rpg_private.world_foundations
   where campaign_id=cid and loop_state=t.source->'astraProgressionState'
     and coalesce(loop_state->'currencies','[]')=t.source->'astraSettlementCurrencies'));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(t.source->'astraSettlementJobs') j
   where not exists(select 1 from public.rpg_quests q where q.campaign_id=cid and
     q.id=(j.value->>'questId')::uuid and q.reward_terms=j.value->'rewardTerms'
     and to_jsonb(q.reward_operation_id) is not distinct from nullif(j.value->'rewardOperationId','null'))));
end $$;

create function rpg_private.astra_ordered_assert(cid uuid,t rpg_private.turns,bundle jsonb,base jsonb)
returns void language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare shadow rpg_private.turns:=t; effect jsonb; expected jsonb; change_row jsonb;
 changes jsonb:='[]'; outcomes jsonb:=base->'outcomes'; rejected jsonb;
 foundation_touched boolean:=false; state jsonb; currencies jsonb; jobs jsonb; terms jsonb;
 index_value integer; prior_index integer:=-1; ordinal integer:=0; rejected_indices integer[]:='{}';
begin
 perform rpg_private.fields(bundle,array['schemaVersion','effects','rejected','indices','intents','resolution','foundationState']);
 perform rpg_private.assert(bundle->'schemaVersion'='2'::jsonb and jsonb_typeof(bundle->'effects')='array'
   and jsonb_typeof(bundle->'rejected')='array' and jsonb_typeof(bundle->'indices')='array'
   and jsonb_typeof(bundle->'intents')='array' and jsonb_array_length(bundle->'intents') between 1 and 6
   and jsonb_array_length(bundle->'effects')=jsonb_array_length(bundle->'indices') and
   jsonb_array_length(bundle->'effects')+jsonb_array_length(bundle->'rejected')=jsonb_array_length(bundle->'intents'));
 perform rpg_private.assert(jsonb_typeof(bundle#>'{resolution,changes}')='array' and
   jsonb_array_length(bundle#>'{resolution,changes}')<=100 and
   rpg_private.wave4_integer(bundle#>'{resolution,worldMinutes}',
     (t.source#>>'{runtime,worldMinutes}')::integer,(t.source#>>'{runtime,worldMinutes}')::integer+1440));
 perform rpg_private.astra_ordered_origin_assert(cid,t);
 perform rpg_private.fields(base,array['changes','worldMinutes','configuration','outcomes']);
 for change_row in select value from jsonb_array_elements(base->'changes') loop
   shadow.source:=rpg_private.astra_shadow_apply(shadow.source,change_row);
 end loop;
 changes:=rpg_private.astra_shadow_collapse(changes,base->'changes');
 shadow.source:=jsonb_set(jsonb_set(shadow.source,'{runtime,worldMinutes}',base->'worldMinutes'),
   '{runtime,configuration}',base->'configuration');
 shadow.source:=jsonb_set(shadow.source,'{worldTakeover,presentEntityIds}',base#>'{configuration,presentEntityIds}');
 for effect in select value from jsonb_array_elements(bundle->'effects') loop
   perform rpg_private.assert(rpg_private.wave4_integer((bundle->'indices')->ordinal,0,5));
   index_value:=((bundle->'indices')->>ordinal)::integer;
   perform rpg_private.assert(index_value>prior_index and index_value<jsonb_array_length(bundle->'intents')
     and (bundle->'intents')->index_value=effect->'intent');
   prior_index:=index_value;
   if effect->>'kind' in ('mechanic_actions','formal_rest') then
     expected:=rpg_private.astra_mechanics_expected(cid,shadow,effect);
   else expected:=rpg_private.astra_shadow_effect_expected(cid,shadow,effect); end if;
   perform rpg_private.assert(expected=effect);
   for change_row in select value from jsonb_array_elements(case when effect ? 'resolution'
     then effect#>'{resolution,changes}' else effect->'changes' end) loop
     shadow.source:=rpg_private.astra_shadow_apply(shadow.source,change_row);
   end loop;
   changes:=rpg_private.astra_shadow_collapse(changes,case when effect ? 'resolution'
     then effect#>'{resolution,changes}' else effect->'changes' end);
   if effect ? 'resolution' then
     outcomes:=outcomes||(effect#>'{resolution,outcomes}');
     shadow.source:=jsonb_set(jsonb_set(shadow.source,'{runtime,worldMinutes}',effect#>'{resolution,worldMinutes}'),
       '{runtime,configuration}',effect#>'{resolution,configuration}');
     shadow.source:=jsonb_set(shadow.source,'{worldTakeover,presentEntityIds}',effect#>'{resolution,configuration,presentEntityIds}');
   else
     if effect->'currencyDefinition'<>'null'::jsonb then
       state:=shadow.source->'astraProgressionState';
       currencies:=state->'currencies'||jsonb_build_array(effect->'currencyDefinition');
       state:=jsonb_set(jsonb_set(state,'{currencies}',currencies),'{version}',to_jsonb((state->>'version')::integer+1));
       shadow.source:=jsonb_set(jsonb_set(shadow.source,'{astraProgressionState}',state),'{astraSettlementCurrencies}',currencies);
       foundation_touched:=true;
     end if;
     if effect ? 'progressionState' then
       shadow.source:=jsonb_set(shadow.source,'{astraProgressionState}',effect->'progressionState');
       foundation_touched:=true;
     end if;
     jobs:=shadow.source->'astraSettlementJobs';
     if effect->>'kind'='job_offer' then
       terms:=jsonb_build_object('issuerId',effect#>'{intent,issuerId}',
         'currencyName',effect#>'{intent,currencyName}','currencyAmount',effect#>'{intent,currencyAmount}',
         'itemName',effect#>'{intent,itemName}','itemCategory',effect#>'{intent,itemCategory}',
         'itemDescription',effect#>'{intent,itemDescription}');
       jobs:=jobs||jsonb_build_array(jsonb_build_object('questId',effect#>'{publicOutcome,questId}',
         'issuerId',effect#>'{intent,issuerId}','rewardTerms',terms,'rewardOperationId',null));
     elsif effect->>'kind'='job_reward' then
       select coalesce(jsonb_agg(case when value->'questId'=effect#>'{intent,questId}'
         then value||jsonb_build_object('rewardOperationId',t.id) else value end order by n),'[]') into jobs
         from jsonb_array_elements(jobs) with ordinality x(value,n);
     end if;
     shadow.source:=jsonb_set(shadow.source,'{astraSettlementJobs}',jobs);
   end if;
   ordinal:=ordinal+1;
 end loop;
 for rejected in select value from jsonb_array_elements(bundle->'rejected') loop
   perform rpg_private.fields(rejected,array['index','reason']);
   perform rpg_private.assert(rpg_private.wave4_integer(rejected->'index',0,5)
     and rejected->>'reason'='not_authorized');
   index_value:=(rejected->>'index')::integer;
   perform rpg_private.assert(index_value<jsonb_array_length(bundle->'intents') and
     not index_value=any(rejected_indices) and not bundle->'indices' @>jsonb_build_array(index_value));
   rejected_indices:=array_append(rejected_indices,index_value);
 end loop;
 perform rpg_private.assert(bundle->'resolution'=jsonb_build_object('changes',changes,
   'worldMinutes',shadow.source#>'{runtime,worldMinutes}',
   'configuration',shadow.source#>'{runtime,configuration}','outcomes',outcomes) and
   bundle->'foundationState'=case when foundation_touched then shadow.source->'astraProgressionState' else 'null'::jsonb end);
end $$;

-- Only the leased, pinned schema-2 base commit may defer its own exact raw
-- changes. Its established Astra tool and source guards still run beforehand.
alter function rpg_private.runtime_change(uuid,uuid,jsonb) rename to runtime_change_before_astra_ordered;
create function rpg_private.runtime_change(cid uuid,opid uuid,change jsonb)
returns void language plpgsql set search_path='' as $$
declare defer_op text:=current_setting('rpg.astra_ordered_defer',true); t rpg_private.turns%rowtype;
begin
 if defer_op=opid::text then
   select * into strict t from rpg_private.turns where campaign_id=cid and id=opid;
   perform rpg_private.assert(t.astra_ordered_effects->'schemaVersion'='2'::jsonb and
     t.runtime_identity='astra-primary-v1' and t.status='generating' and
     t.lease_token is not null and t.lease_until>now() and
     exists(select 1 from jsonb_array_elements(t.checkpoint#>'{astraPrimary,finalProposal,resolution,changes}')
       where value=change));
   return;
 end if;
 perform rpg_private.runtime_change_before_astra_ordered(cid,opid,change);
end $$;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_astra_ordered;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
 p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; op uuid; incoming jsonb; result jsonb; clean_payload jsonb;
 base jsonb; change_row jsonb; effect jsonb; terms jsonb; f rpg_private.world_foundations%rowtype;
begin
 if p_action not in ('claim','checkpoint','commit') then
   return public.rpg_runtime_before_astra_ordered(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline); end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 op:=(p_payload->>'operationId')::uuid;
 select * into t from rpg_private.turns where id=op and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
 if t.id is null then raise exception 'rpg_not_found'; end if;
 if p_action='claim' then
   result:=public.rpg_runtime_before_astra_ordered(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
   if result is not null and t.astra_ordered_effects is not null then
     -- A restored failed schema-2 operation starts a new leased execution
     -- attempt using its exact checkpoint. Legacy claims leave failed status
     -- unchanged, which prevents the existing diagnostic lifecycle resuming.
     -- Diagnostics describe an attempt and are cleared; outcome pins remain.
     if t.status='failed' then
       update rpg_private.turns set status='generating',failure=null,retryable=false,
         astra_diagnostic=null where campaign_id=p_campaign_id and id=op
           and lease_token=(result#>>'{lease,token}')::uuid and lease_until>now()
           and status='failed' returning * into t;
       perform rpg_private.assert(t.id=op);
       result:=jsonb_set(result,'{turn,public}',rpg_private.timeline_stamp(
         rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(p_campaign_id)));
     end if;
     result:=jsonb_set(result,'{turn,checkpoint,astraEffects}',t.astra_ordered_effects,true); end if;
   return result;
 end if;
 if p_action='checkpoint' then
   incoming:=coalesce(p_payload#>'{checkpoint,astraEffects}','null'::jsonb);
   if t.astra_ordered_effects is null and incoming->'schemaVersion'<>'2'::jsonb or incoming='null'::jsonb
     and t.astra_ordered_effects is null then
     return public.rpg_runtime_before_astra_ordered(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline); end if;
   perform rpg_private.assert(incoming->'schemaVersion'='2'::jsonb and
     t.astra_effects is null and t.astra_settlement is null and
     coalesce(p_payload#>'{checkpoint,astraSettlement}','null'::jsonb)='null'::jsonb);
   if t.astra_ordered_effects is not null and t.astra_ordered_effects<>incoming then raise exception 'rpg_conflict'; end if;
   if t.astra_ordered_effects is null then
     perform rpg_private.assert(t.checkpoint#>'{astraPrimary,finalProposal}'='null'::jsonb and
       p_payload#>>'{checkpoint,astraPrimary,finalProposal,schemaVersion}'='1');
     perform rpg_private.astra_ordered_assert(p_campaign_id,t,incoming,
       p_payload#>'{checkpoint,astraPrimary,finalProposal,resolution}');
   end if;
   clean_payload:=jsonb_set(p_payload,'{checkpoint}',(p_payload->'checkpoint')-'astraEffects');
   result:=public.rpg_runtime_before_astra_ordered(p_owner_id,p_campaign_id,p_action,clean_payload,p_timeline);
   if t.astra_ordered_effects is null then update rpg_private.turns set astra_ordered_effects=incoming
     where campaign_id=p_campaign_id and id=op; end if;
   return result;
 end if;
 if t.astra_ordered_effects is null or t.status='committed' then
   return public.rpg_runtime_before_astra_ordered(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline); end if;
 perform rpg_private.assert(t.astra_effects is null and t.astra_settlement is null);
 base:=t.checkpoint#>'{astraPrimary,finalProposal,resolution}';
 perform rpg_private.astra_ordered_assert(p_campaign_id,t,t.astra_ordered_effects,base);
 perform set_config('rpg.astra_ordered_defer',op::text,true);
 perform set_config('rpg.astra_effects_operation',op::text,true);
 result:=public.rpg_runtime_before_astra_ordered(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 perform rpg_private.assert(result->>'status'='committed');
 perform set_config('rpg.astra_ordered_defer','',true);
 for change_row in select value from jsonb_array_elements(t.astra_ordered_effects#>'{resolution,changes}') loop
   if change_row->>'family'='public_state' then
     -- The delegated core has inserted narration and advanced this system row
     -- once. The original owner revision was independently checked above.
     perform rpg_private.assert(exists(select 1 from public.rpg_public_state where campaign_id=p_campaign_id and
       revision=(change_row->>'expectedRevision')::integer+1 and current_session_id=t.session_id));
     change_row:=jsonb_set(change_row,'{expectedRevision}',to_jsonb((change_row->>'expectedRevision')::integer+1));
   end if;
   perform rpg_private.runtime_change_before_astra_ordered(p_campaign_id,op,change_row);
 end loop;
 for effect in select value from jsonb_array_elements(t.astra_ordered_effects->'effects') loop
   if effect->>'kind'='job_offer' then
     terms:=jsonb_build_object('issuerId',effect#>'{intent,issuerId}',
       'currencyName',effect#>'{intent,currencyName}','currencyAmount',effect#>'{intent,currencyAmount}',
       'itemName',effect#>'{intent,itemName}','itemCategory',effect#>'{intent,itemCategory}',
       'itemDescription',effect#>'{intent,itemDescription}');
     update public.rpg_quests set reward_terms=terms where campaign_id=p_campaign_id and
       id=(effect#>>'{publicOutcome,questId}')::uuid; perform rpg_private.assert(found);
   elsif effect->>'kind'='job_reward' then
     update public.rpg_quests set reward_operation_id=op where campaign_id=p_campaign_id and
       id=(effect#>>'{publicOutcome,questId}')::uuid and reward_operation_id is null;
     perform rpg_private.assert(found);
   end if;
 end loop;
 if t.astra_ordered_effects->'foundationState'<>'null'::jsonb then
   select * into strict f from rpg_private.world_foundations where campaign_id=p_campaign_id for update;
   perform rpg_private.assert(f.loop_state=t.source->'astraProgressionState');
   perform set_config('rpg.astra_ordered_foundation',op::text,true);
   update rpg_private.world_foundations set loop_state=t.astra_ordered_effects->'foundationState',revision=revision+1
     where campaign_id=p_campaign_id;
   perform set_config('rpg.astra_ordered_foundation','',true);
 end if;
 update rpg_private.runtime_state set world_minutes=(t.astra_ordered_effects#>>'{resolution,worldMinutes}')::integer,
   configuration=t.astra_ordered_effects#>'{resolution,configuration}' where campaign_id=p_campaign_id;
 update rpg_private.turns set committed_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id)
   where campaign_id=p_campaign_id and id=op returning * into t;
 result:=result||rpg_private.runtime_public_turn(t);
 perform set_config('rpg.astra_effects_operation','',true);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then
   perform rpg_private.timeline_save(p_campaign_id,'autosave','After action','turn:'||op::text); end if;
 return result;
end $$;

-- Frozen World authoring survives the independently reconstructed combined mechanics state.
create or replace function rpg_private.astra_takeover_freeze_world()
returns trigger language plpgsql set search_path='' as $$
declare op text:=current_setting('rpg.astra_settlement_operation',true);
  progress_op text:=current_setting('rpg.astra_progression_operation',true);
  pinned jsonb; expected jsonb; ordered_op text:=current_setting('rpg.astra_ordered_foundation',true);
begin
 if tg_op='UPDATE' and old.astra_takeover is not null and
   not rpg_private.timeline_restoring(old.campaign_id) and
   ordered_op ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
   select t.astra_ordered_effects into pinned from rpg_private.turns t
     where t.campaign_id=old.campaign_id and t.id=ordered_op::uuid
       and t.runtime_identity='astra-primary-v1' and t.status='committed';
   if pinned->'schemaVersion'='2'::jsonb and
     pinned->'foundationState'<>'null'::jsonb and
     new.loop_state=pinned->'foundationState' and new.revision=old.revision+1 and
     (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
       (to_jsonb(old)-'revision'-'updated_at'-'loop_state') and
     (new.loop_state-'currencies'-'progress'-'pending'-'version')=
       (old.loop_state-'currencies'-'progress'-'pending'-'version') then
     perform rpg_private.wave4_state(old.campaign_id,new.loop_state,old.ruleset);
     return new;
   end if;
   raise exception 'rpg_conflict';
 end if;
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
   if progress_op ~
     '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
     select t.astra_settlement into pinned from rpg_private.turns t
       where t.campaign_id=old.campaign_id and t.id=progress_op::uuid
         and t.runtime_identity='astra-primary-v1' and t.status='committed';
     if pinned->>'kind'='progression_award' and
       new.loop_state=pinned->'progressionState' and
       (new.loop_state-'progress'-'pending'-'version')=
         (old.loop_state-'progress'-'pending'-'version') and
       new.loop_state->'version'=to_jsonb((old.loop_state->>'version')::integer+1)
       and new.revision=old.revision+1 and
       (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
         (to_jsonb(old)-'revision'-'updated_at'-'loop_state') then
       perform rpg_private.wave4_state(old.campaign_id,new.loop_state,
         old.ruleset);
       return new;
     end if;
   end if;
   if current_setting('rpg.astra_advancement_request',true) ~
     '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
     expected:=rpg_private.astra_advancement_after(old.campaign_id,
       old.loop_state,coalesce((select a.value->'capabilities'
         from jsonb_array_elements(old.world->'actors') a
         where a.value->>'entityId'=
           current_setting('rpg.astra_advancement_hero',true) limit 1),
         '[]'::jsonb),
       current_setting('rpg.astra_advancement_pending',true)::uuid,
       current_setting('rpg.astra_advancement_option',true),
       current_setting('rpg.astra_advancement_track_version',true)::integer,
       current_setting('rpg.astra_advancement_hero',true)::uuid);
     if new.loop_state=expected and new.revision=old.revision+1 and
       (to_jsonb(new)-'revision'-'updated_at'-'loop_state')=
         (to_jsonb(old)-'revision'-'updated_at'-'loop_state') then
       return new;
     end if;
   end if;
   raise exception 'rpg_conflict';
 end if;
 return new;
end $$;
-- None of the reconstruction or deferral helpers is a browser or RPC surface.
do $$ declare entry record; begin
 for entry in select p.oid::regprocedure signature from pg_proc p
   join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and
   (p.proname like 'astra_shadow_%' or p.proname like 'astra_mechanic_%' or
    p.proname in ('astra_mechanics_expected','astra_ordered_origin_assert',
      'astra_ordered_assert','runtime_change_before_astra_ordered','runtime_change')) loop
   execute format('revoke all on function %s from public,anon,authenticated',entry.signature);
 end loop;
end $$;
revoke all on function public.rpg_runtime_before_astra_ordered(uuid,uuid,text,jsonb,jsonb)
 from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
commit;
