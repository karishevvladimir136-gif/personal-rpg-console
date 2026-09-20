-- Wave 4. Additive state on the existing save family; no seed, network or real-data execution.
begin;
alter table rpg_private.world_foundations add column loop_state jsonb;
alter table public.rpg_storages drop constraint rpg_storages_kind_check;
alter table public.rpg_storages add constraint rpg_storages_kind_check check(kind in ('player','companion','camp','transport','merchant'));

-- Ordinary storage remains the only inventory container authority.
do $$ declare d text; begin
 d:=pg_get_functiondef('rpg_private.runtime_change(uuid,uuid,jsonb)'::regprocedure);
 d:=replace(d, 'when ''entities'' then fields:=', 'when ''storages'' then fields:=array[''name'',''kind'',''entity_id'']; revisioned:=true; when ''entities'' then fields:=');
 execute d;
 d:=pg_get_functiondef('rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb)'::regprocedure);
 d:=replace(d, 'or s.kind=p_payload->>''kind''', 'or (s.kind=''merchant'' and p_payload->>''kind''=''npc'') or s.kind=p_payload->>''kind''');
 d:=replace(d, 'or p_payload->>''kind''=entity->>''kind''', 'or (p_payload->>''kind''=''merchant'' and entity->>''kind''=''npc'') or p_payload->>''kind''=entity->>''kind''');
 execute d;
end $$;

create function public.rpg_item_visible(cid uuid,rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.rpg_items where campaign_id=cid and id=rid)
 and (coalesce(current_setting('role',true),'none')<>'authenticated' or exists(select 1 from rpg_private.owner_registry where user_id=auth.uid()))
 and not exists(select 1 from rpg_private.world_foundations f,jsonb_array_elements(coalesce(f.loop_state->'itemPolicies','[]')) p where f.campaign_id=cid and p->>'itemId'=rid::text and p->>'visibility'='private')
 and not exists(select 1 from public.rpg_items i left join public.rpg_storages s on s.campaign_id=i.campaign_id and s.id=i.storage_id join rpg_private.world_foundations f on f.campaign_id=i.campaign_id cross join lateral jsonb_array_elements(coalesce(f.world->'actors','[]')) a where i.campaign_id=cid and i.id=rid and a->'publicName'='null' and (a->>'entityId'=i.owner_entity_id::text or a->>'entityId'=s.entity_id::text))
$$;
revoke all on function public.rpg_item_visible(uuid,uuid) from public,anon;
grant execute on function public.rpg_item_visible(uuid,uuid) to authenticated,service_role;
create policy wave4_private_stock on public.rpg_items as restrictive for select to authenticated using (public.rpg_item_visible(campaign_id,id));

alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_wave3;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_wave3(cid,uid,mode); begin
 return jsonb_set(result,'{snapshot,items}',coalesce((select jsonb_agg(x) from jsonb_array_elements(result#>'{snapshot,items}') x where public.rpg_item_visible(cid,(x->>'id')::uuid)),'[]'));
end $$;

-- Restrictive stock changes invalidate derivatives. The source reader additionally
-- checks current visibility so an old index/summary cannot reveal hidden stock.
alter function rpg_private.memory_sources(uuid,text) rename to memory_sources_wave3;
create function rpg_private.memory_sources(cid uuid,visibility text) returns setof rpg_private.memory_public_sources language sql stable set search_path='' as $$
 select s.* from rpg_private.memory_sources_wave3(cid,visibility) s where visibility<>'public' or s.kind<>'item' or public.rpg_item_visible(cid,s.source_id)
$$;

create function rpg_private.wave4_integer(v jsonb,minimum bigint default 0,maximum bigint default 1000000) returns boolean language sql immutable set search_path='' as $$
 select coalesce(jsonb_typeof(v)='number' and (v::text)::numeric between minimum and maximum and mod((v::text)::numeric,1)=0,false)
$$;

create function rpg_private.wave4_state(cid uuid,s jsonb,profile jsonb) returns void language plpgsql stable set search_path='' as $$
declare field text; v jsonb; c jsonb; begin
 perform rpg_private.fields(s,array['schemaVersion','version','profile','progression','currencies','itemPolicies','merchants','tracks','rewards','progress','pending','preparations']);
 perform rpg_private.assert(s->>'schemaVersion'='1' and rpg_private.wave4_integer(s->'version') and s->'profile'=profile and s->>'progression' in ('off','on') and octet_length(s::text)<=1048576);
 foreach field in array array['currencies','itemPolicies','merchants','tracks','rewards','progress','pending','preparations'] loop
  perform rpg_private.assert(jsonb_typeof(s->field)='array' and jsonb_array_length(s->field)<=512);
 end loop;
 foreach field in array array['currencies','tracks','rewards','pending'] loop
  perform rpg_private.assert((select count(*)=count(distinct value->>'id') from jsonb_array_elements(s->field)));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'itemId') from jsonb_array_elements(s->'itemPolicies')));
 perform rpg_private.assert((select count(*)=count(distinct value->>'actorId') from jsonb_array_elements(s->'merchants')));
 perform rpg_private.assert((select count(*)=count(distinct (value->>'entityId',value->>'trackId')) from jsonb_array_elements(s->'progress')));
 for v in select value from jsonb_array_elements(s->'currencies') loop
  perform rpg_private.fields(v,array['id','label','resourceKey','version']);
  perform rpg_private.assert(length(v->>'id') between 1 and 80 and v->>'resourceKey' ~ '^[A-Za-z][A-Za-z0-9_-]{0,79}$' and v->>'resourceKey' not in ('constructor','prototype','__proto__') and length(btrim(v->>'label')) between 1 and 200 and rpg_private.wave4_integer(v->'version',1));
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct value->>'resourceKey') from jsonb_array_elements(s->'currencies')));
 for v in select value from jsonb_array_elements(s->'itemPolicies') loop
  perform rpg_private.fields(v,array['itemId','version','currencyId','unitValue','trade','origin','visibility']);
  perform rpg_private.assert(exists(select 1 from public.rpg_items where campaign_id=cid and id=(v->>'itemId')::uuid) and rpg_private.wave4_integer(v->'version',1) and rpg_private.wave4_integer(v->'unitValue') and v->>'trade' in ('allowed','restricted','quest') and v->>'origin' in ('legitimate','stolen') and v->>'visibility' in ('public','private') and exists(select 1 from jsonb_array_elements(s->'currencies') x where x->>'id'=v->>'currencyId'));
 end loop;
 for v in select value from jsonb_array_elements(s->'merchants') loop
  perform rpg_private.fields(v,array['actorId','entityId','version','label','storageId','currencyIds','available','acceptsStolen','usesFunds','capacity','buyBasisPoints','sellBasisPoints','haggleLimitBasisPoints']);
  perform rpg_private.assert(v->>'actorId'=v->>'entityId' and rpg_private.wave4_integer(v->'version',1) and length(btrim(v->>'label')) between 1 and 200 and exists(select 1 from public.rpg_entities where campaign_id=cid and id=(v->>'entityId')::uuid and kind='npc') and exists(select 1 from public.rpg_storages where campaign_id=cid and id=(v->>'storageId')::uuid and entity_id=(v->>'entityId')::uuid));
  perform rpg_private.assert(jsonb_typeof(v->'available')='boolean' and jsonb_typeof(v->'acceptsStolen')='boolean' and jsonb_typeof(v->'usesFunds')='boolean' and (v->'capacity'='null' or rpg_private.wave4_integer(v->'capacity')) and rpg_private.wave4_integer(v->'buyBasisPoints',0,50000) and rpg_private.wave4_integer(v->'sellBasisPoints',0,50000) and rpg_private.wave4_integer(v->'haggleLimitBasisPoints',0,2500));
  perform rpg_private.assert((v->>'buyBasisPoints')::integer+(v->>'haggleLimitBasisPoints')::integer<=(v->>'sellBasisPoints')::integer-(v->>'haggleLimitBasisPoints')::integer);
  for c in select value from jsonb_array_elements(v->'currencyIds') loop perform rpg_private.assert(exists(select 1 from jsonb_array_elements(s->'currencies') x where x->'id'=c)); end loop;
 end loop;
 for v in select value from jsonb_array_elements(s->'tracks') loop
  perform rpg_private.fields(v,array['id','version','label','kind','thresholds','choices']);
  perform rpg_private.assert(rpg_private.wave4_integer(v->'version',1) and length(btrim(v->>'label')) between 1 and 200 and v->>'kind' in ('classic_xp','milestone','generic') and jsonb_typeof(v->'thresholds')='array' and jsonb_array_length(v->'thresholds')<=100 and jsonb_typeof(v->'choices')='array' and jsonb_array_length(v->'choices')<=100);
  for c in select value from jsonb_array_elements(v->'thresholds') loop perform rpg_private.assert(rpg_private.wave4_integer(c,1,1000000000)); end loop;
  for c in select value from jsonb_array_elements(v->'choices') loop perform rpg_private.fields(c,array['id','label','capability']); perform rpg_private.assert(length(btrim(c->>'label')) between 1 and 200 and length(btrim(c->>'capability')) between 1 and 200); end loop;
 end loop;
 for v in select value from jsonb_array_elements(s->'rewards') loop
  perform rpg_private.fields(v,array['id','version','label','source','distribution','recipientIds','entries']);
  perform rpg_private.assert(rpg_private.wave4_integer(v->'version',1) and length(btrim(v->>'label')) between 1 and 200 and v->>'distribution' in ('actor','party_equal') and v#>>'{source,kind}' in ('quest','thread','event') and (v#>>'{source,id}')::uuid is not null);
  perform rpg_private.uuid_array(v->'recipientIds',32);
  for c in select value from jsonb_array_elements(v->'recipientIds') loop perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(c#>>'{}')::uuid and kind in ('player','companion'))); end loop;
  for c in select value from jsonb_array_elements(v->'entries') loop
   perform rpg_private.assert(c->>'kind' in ('progression','currency','item'));
   if c->>'kind'='item' then perform rpg_private.fields(c,array['kind','itemId','quantity']); perform rpg_private.assert(rpg_private.wave4_integer(c->'quantity',1) and exists(select 1 from public.rpg_items where campaign_id=cid and id=(c->>'itemId')::uuid));
   elsif c->>'kind'='currency' then perform rpg_private.fields(c,array['kind','currencyId','amount']); perform rpg_private.assert(rpg_private.wave4_integer(c->'amount',1) and exists(select 1 from jsonb_array_elements(s->'currencies') x where x->>'id'=c->>'currencyId'));
   else perform rpg_private.fields(c,array['kind','trackId','amount']); perform rpg_private.assert(rpg_private.wave4_integer(c->'amount',1,1000000000) and exists(select 1 from jsonb_array_elements(s->'tracks') x where x->>'id'=c->>'trackId')); end if;
  end loop;
 end loop;
 for v in select value from jsonb_array_elements(s->'progress') loop
  perform rpg_private.fields(v,array['entityId','trackId','value','rank','unlocks']);
  perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(v->>'entityId')::uuid) and rpg_private.wave4_integer(v->'value',0,1000000000) and rpg_private.wave4_integer(v->'rank',0,100) and jsonb_typeof(v->'unlocks')='array');
 end loop;
 for v in select value from jsonb_array_elements(s->'pending') loop
  perform rpg_private.fields(v,array['id','entityId','trackId','trackVersion','rank','options']);
  perform rpg_private.assert((v->>'id')::uuid is not null and exists(select 1 from public.rpg_entities where campaign_id=cid and id=(v->>'entityId')::uuid) and rpg_private.wave4_integer(v->'trackVersion',1) and rpg_private.wave4_integer(v->'rank',1,100) and jsonb_typeof(v->'options')='array');
 end loop;
end $$;

create function rpg_private.wave4_events(cid uuid) returns jsonb language sql stable set search_path='' as $$
 select coalesce(jsonb_agg(event order by (event->>'sequence')::bigint,event->>'id'),'[]') from (
  select e.event||jsonb_build_object('sequence',e.sequence) as event from rpg_private.world_events e where e.campaign_id=cid
  union
  select (v.payload->'event')||jsonb_build_object('sequence',v.payload->'sequence') from rpg_private.timeline_versions v where v.campaign_id=cid and v.table_name='rpg_private.world_events' and v.payload#>>'{event,kind}'='reward.granted' and v.payload#>>'{event,originTimelineId}'=(rpg_private.timeline_fence(cid)->>'timelineId')
 ) events
$$;

create function rpg_private.wave4_read(uid uuid,cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('foundation',rpg_private.foundation_read(uid,cid),'state',(select loop_state from rpg_private.world_foundations where campaign_id=cid),'snapshot',jsonb_set(rpg_private.timeline_campaign_json(cid,uid),'{items}',coalesce((select jsonb_agg(to_jsonb(i)) from public.rpg_items i where campaign_id=cid),'[]')),'events',rpg_private.wave4_events(cid))
$$;

create function rpg_private.wave4_money(cid uuid,plan jsonb,eid uuid,key text,delta bigint) returns void language plpgsql stable set search_path='' as $$
declare before jsonb; expected jsonb; change jsonb; balance bigint; begin
 select resources into before from public.rpg_entities where campaign_id=cid and id=eid;
 perform rpg_private.assert(before is not null);
 balance:=coalesce((before->>key)::bigint,0)+delta;
 perform rpg_private.assert(balance between 0 and 1000000);
 expected:=jsonb_set(before,array[key],to_jsonb(balance));
 select value into change from jsonb_array_elements(plan->'changes') x where x->>'family'='entities' and x->>'id'=eid::text;
 if delta<>0 then perform rpg_private.assert(change#>'{values,resources}'=expected);
 elsif change is not null then perform rpg_private.assert(change#>'{values,resources}'=before); end if;
end $$;

create function rpg_private.wave4_id(op uuid,key text) returns uuid language plpgsql immutable set search_path='' as $$
declare h text; begin
 h:=substr(encode(sha256(convert_to('rpg-v1:'||op::text||':'||key,'UTF8')),'hex'),1,32);
 h:=overlay(h placing '5' from 13 for 1); h:=overlay(h placing to_hex((get_byte(decode(substr(h,17,2),'hex'),0)>>4 & 3)|8) from 17 for 1); return h::uuid;
end $$;

-- One ordinary stack transfer; clones retain every public item mechanic/label.
create function rpg_private.wave4_transfer_guard(cid uuid,changes jsonb,source_id uuid,target_id uuid,destination uuid,storage uuid,quantity integer) returns void language plpgsql stable set search_path='' as $$
declare item public.rpg_items%rowtype; expected jsonb; change jsonb; begin
 select * into item from public.rpg_items where campaign_id=cid and id=source_id;
 perform rpg_private.assert(item.id is not null and public.rpg_item_visible(cid,source_id) and quantity between 1 and item.quantity and item.equipped_entity_id is null and item.owner_entity_id is distinct from destination);
 perform rpg_private.assert(exists(select 1 from public.rpg_storages where campaign_id=cid and id=storage and entity_id=destination));
 expected:=jsonb_build_object('quantity',quantity,'owner_entity_id',destination,'storage_id',storage,'equipped_entity_id',null,'equipped_slot',null);
 if target_id<>source_id then
  expected:=expected||jsonb_build_object('name',item.name,'category',item.category,'description',item.description,'mechanics',item.mechanics);
  perform rpg_private.assert(not exists(select 1 from public.rpg_items where id=target_id));
 end if;
 select value into change from jsonb_array_elements(changes) x where x->>'family'='items' and x->>'id'=target_id::text;
 perform rpg_private.assert(change->'values'=expected and change->'expectedRevision'=case when target_id=source_id then to_jsonb(item.revision) else 'null'::jsonb end);
end $$;

create function rpg_private.wave4_trade_guard(cid uuid,s jsonb,intent jsonb,plan jsonb) returns void language plpgsql stable set search_path='' as $$
declare m jsonb; currency jsonb; p jsonb; line jsonb; direction text; amount bigint:=0; unit bigint; modifier integer:=0; receipt jsonb; item public.rpg_items%rowtype; destination uuid; transfer jsonb; afterrow jsonb; remaining bigint; ids jsonb:='[]'; policies jsonb:=s->'itemPolicies'; begin
 select value into m from jsonb_array_elements(s->'merchants') x where x->>'actorId'=intent->>'merchantActorId';
 select value into currency from jsonb_array_elements(s->'currencies') x where x->>'id'=intent->>'currencyId';
 perform rpg_private.assert(m is not null and currency is not null and m->>'available'='true' and m->'currencyIds' ? (currency->>'id'));
 perform rpg_private.assert(plan->'world'=(select world from rpg_private.world_foundations where campaign_id=cid));
 perform rpg_private.assert(((plan->'state')-array['version','itemPolicies'])=(s-array['version','itemPolicies']));
 perform rpg_private.assert(exists(select 1 from rpg_private.world_foundations f,jsonb_array_elements(f.world->'actors') a where f.campaign_id=cid and a->>'id'=m->>'actorId' and a->'publicName'<>'null' and a->>'control'='autonomous'));
 perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=(intent->>'playerEntityId')::uuid and kind='player'));
 select value->'payload' into receipt from jsonb_array_elements(plan->'events') x where x->>'kind'='commerce.trade';
 perform rpg_private.assert(receipt is not null and receipt->>'playerEntityId'=intent->>'playerEntityId' and receipt->>'merchantActorId'=m->>'actorId' and receipt->>'currencyId'=currency->>'id');
 if intent->>'haggle'='favorable' then
  modifier:=(m->>'haggleLimitBasisPoints')::integer;
  perform rpg_private.assert(exists(select 1 from rpg_private.world_events e where e.campaign_id=cid and e.id=(receipt->>'haggleEventId')::uuid and e.event->>'kind'='commerce.haggle_granted' and e.event#>'{payload,stateVersion}'=s->'version' and e.event#>>'{payload,merchantActorId}'=m->>'actorId' and e.event#>>'{payload,playerEntityId}'=intent->>'playerEntityId' and e.event#>'{payload,timeline}'=rpg_private.timeline_fence(cid)));
  perform rpg_private.assert(not exists(select 1 from rpg_private.world_events e where e.campaign_id=cid and e.event#>>'{payload,haggleEventId}'=receipt->>'haggleEventId'));
 else perform rpg_private.assert(intent->>'haggle'='none'); end if;
 foreach direction in array array['take','give'] loop
  for line in select value from jsonb_array_elements(intent->direction) loop
   select value into p from jsonb_array_elements(s->'itemPolicies') x where x->>'itemId'=line->>'itemId';
   select * into item from public.rpg_items where campaign_id=cid and id=(line->>'itemId')::uuid;
   perform rpg_private.assert(public.rpg_item_visible(cid,item.id));
   perform rpg_private.assert(p->>'visibility'='public' and p->>'trade'='allowed' and p->>'currencyId'=currency->>'id' and item.id is not null and item.quantity>=(line->>'quantity')::integer and item.equipped_entity_id is null and rpg_private.wave4_integer(line->'quantity',1));
   perform rpg_private.assert(item.owner_entity_id::text=case when direction='take' then m->>'entityId' else intent->>'playerEntityId' end);
   if direction='give' then perform rpg_private.assert(p->>'origin'<>'stolen' or m->>'acceptsStolen'='true'); end if;
   unit:=case when direction='take' then ceil((p->>'unitValue')::numeric*((m->>'sellBasisPoints')::integer-modifier)/10000) else floor((p->>'unitValue')::numeric*((m->>'buyBasisPoints')::integer+modifier)/10000) end;
   amount:=amount+(case when direction='take' then 1 else -1 end)*unit*(line->>'quantity')::integer;
   select value into transfer from jsonb_array_elements(receipt->'lines') x where x->>'itemId'=item.id::text and x->>'direction'=direction;
   perform rpg_private.assert(transfer->'quantity'=line->'quantity' and (transfer->>'unitValue')::bigint=unit and (transfer->>'totalValue')::bigint=unit*(line->>'quantity')::integer);
   destination:=(case when direction='take' then intent->>'playerEntityId' else m->>'entityId' end)::uuid;
   select value->'values' into afterrow from jsonb_array_elements(plan->'changes') x where x->>'family'='items' and x->>'id'=transfer->>'transferredItemId';
   perform rpg_private.assert(afterrow->>'owner_entity_id'=destination::text and afterrow->'quantity'=line->'quantity' and exists(select 1 from public.rpg_storages where campaign_id=cid and id=(afterrow->>'storage_id')::uuid and entity_id=destination));
   perform rpg_private.wave4_transfer_guard(cid,plan->'changes',item.id,(transfer->>'transferredItemId')::uuid,destination,(afterrow->>'storage_id')::uuid,(line->>'quantity')::integer);
   ids:=ids||jsonb_build_array(item.id,transfer->>'transferredItemId');
   remaining:=item.quantity-(line->>'quantity')::integer;
   if remaining>0 then perform rpg_private.assert(transfer->>'transferredItemId'<>item.id::text and exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'id'=item.id::text and x->>'family'='items' and x->'values'=jsonb_build_object('quantity',remaining)));
    policies:=policies||jsonb_build_array(p||jsonb_build_object('itemId',transfer->>'transferredItemId','version',1));
   else perform rpg_private.assert(transfer->>'transferredItemId'=item.id::text); end if;
  end loop;
 end loop;
 perform rpg_private.assert((receipt->>'payment')::bigint=amount);
 perform rpg_private.assert((plan#>'{state,itemPolicies}') @> policies and policies @> (plan#>'{state,itemPolicies}'));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(plan->'changes') x where (x->>'family'='items' and not(ids ? (x->>'id'))) or (x->>'family'='entities' and x->>'id'<>intent->>'playerEntityId' and (x->>'id'<>m->>'entityId' or m->>'usesFunds'<>'true'))));
 perform rpg_private.wave4_money(cid,plan,(intent->>'playerEntityId')::uuid,currency->>'resourceKey',-amount);
 if m->>'usesFunds'='true' then perform rpg_private.wave4_money(cid,plan,(m->>'entityId')::uuid,currency->>'resourceKey',amount); end if;
end $$;

create function rpg_private.wave4_reward_guard(cid uuid,s jsonb,definition jsonb,plan jsonb) returns void language plpgsql stable set search_path='' as $$
declare receipt jsonb; recipient record; entry jsonb; before jsonb; afterrow jsonb; expected jsonb; share bigint; key text; n integer; track jsonb; progress jsonb:=s->'progress'; pending jsonb:=s->'pending'; policies jsonb:=s->'itemPolicies'; row jsonb; earned integer; rank integer; options jsonb; entitlement uuid; item public.rpg_items%rowtype; transfer jsonb; target uuid; storage uuid; ids jsonb:='[]'; remaining integer; portions integer; policy jsonb; begin
 select value->'payload' into receipt from jsonb_array_elements(plan->'events') x where x->>'kind'='reward.granted' and x->>'visibility'='private';
 perform rpg_private.assert(receipt is not null and receipt->'source'=definition->'source' and receipt->'rewardId'=definition->'id' and receipt->'rewardVersion'=definition->'version');
 perform rpg_private.assert(plan->'world'=(select world from rpg_private.world_foundations where campaign_id=cid));
 entitlement:=rpg_private.wave4_id(cid,'reward-entitlement-v1:'||(definition#>>'{source,kind}')||':'||(definition#>>'{source,id}'));
 perform rpg_private.assert(receipt->>'entitlementId'=entitlement::text and receipt->'profile'=s->'profile');
 perform rpg_private.assert(((plan->'state')-array['version','itemPolicies','progress','pending'])=(s-array['version','itemPolicies','progress','pending']));
 n:=jsonb_array_length(definition->'recipientIds'); perform rpg_private.assert(n>0);
 for recipient in select value#>>'{}' as id,row_number() over(order by value#>>'{}') as ordinal from jsonb_array_elements(definition->'recipientIds') loop
  select resources into before from public.rpg_entities where campaign_id=cid and id=recipient.id::uuid; expected:=before;
  for entry in select value from jsonb_array_elements(definition->'entries') where value->>'kind'='currency' loop
   select x->>'resourceKey' into key from jsonb_array_elements(s->'currencies') x where x->>'id'=entry->>'currencyId';
   share:=(entry->>'amount')::bigint/n+case when recipient.ordinal<=mod((entry->>'amount')::bigint,n) then 1 else 0 end;
   if share>0 then expected:=jsonb_set(expected,array[key],to_jsonb(coalesce((expected->>key)::bigint,0)+share)); end if;
  end loop;
  select x#>'{values,resources}' into afterrow from jsonb_array_elements(plan->'changes') x where x->>'family'='entities' and x->>'id'=recipient.id;
  if expected<>before then perform rpg_private.assert(afterrow=expected); elsif afterrow is not null then perform rpg_private.assert(afterrow=before); end if;
 end loop;
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'family'='entities' and not(definition->'recipientIds' ? (x->>'id'))));
 for entry in select value from jsonb_array_elements(definition->'entries') loop
  if entry->>'kind'='progression' and s->>'progression'='on' then
   select value into track from jsonb_array_elements(s->'tracks') x where x->>'id'=entry->>'trackId';
   for recipient in select value#>>'{}' as id,row_number() over(order by value#>>'{}') as ordinal from jsonb_array_elements(definition->'recipientIds') loop
    share:=(entry->>'amount')::bigint/n+case when recipient.ordinal<=mod((entry->>'amount')::bigint,n) then 1 else 0 end;
    if share=0 then continue; end if;
    select value into row from jsonb_array_elements(progress) x where x->>'entityId'=recipient.id and x->>'trackId'=track->>'id';
    row:=coalesce(row,jsonb_build_object('entityId',recipient.id,'trackId',track->>'id','value',0,'rank',0,'unlocks','[]'::jsonb));
    row:=jsonb_set(row,'{value}',to_jsonb((row->>'value')::bigint+share));
    select count(*) into earned from jsonb_array_elements(track->'thresholds') threshold where (threshold::text)::bigint<=(row->>'value')::bigint;
    if track->'choices'='[]' then row:=jsonb_set(row,'{rank}',to_jsonb(greatest((row->>'rank')::integer,earned)));
    else
     perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(pending) x where x->>'entityId'=recipient.id and x->>'trackId'=track->>'id' and x->'trackVersion'<>track->'version'));
     select coalesce(jsonb_agg(choice),'[]') into options from jsonb_array_elements(track->'choices') choice where not exists(select 1 from jsonb_array_elements(progress) pr where pr->>'entityId'=recipient.id and pr->'unlocks' ? (choice->>'capability')) and not exists(select 1 from jsonb_array_elements(plan#>'{world,actors}') actor where actor->>'entityId'=recipient.id and actor->'capabilities' ? (choice->>'capability'));
     for rank in ((row->>'rank')::integer+1)..earned loop
      if exists(select 1 from jsonb_array_elements(pending) x where x->>'entityId'=recipient.id and x->>'trackId'=track->>'id' and (x->>'rank')::integer=rank) then continue; end if;
      pending:=pending||jsonb_build_array(jsonb_build_object('id',rpg_private.wave4_id(entitlement,'advancement-v1:'||recipient.id||':'||(track->>'id')||':'||rank::text),'entityId',recipient.id,'trackId',track->>'id','trackVersion',track->'version','rank',rank,'options',options));
     end loop;
    end if;
    progress:=(select coalesce(jsonb_agg(x),'[]') from jsonb_array_elements(progress) x where not(x->>'entityId'=recipient.id and x->>'trackId'=track->>'id'))||jsonb_build_array(row);
   end loop;
  elsif entry->>'kind'='item' then
   select * into item from public.rpg_items where campaign_id=cid and id=(entry->>'itemId')::uuid;
   perform rpg_private.assert(item.id is not null and not(definition->'recipientIds' ? item.owner_entity_id::text) and item.quantity>=(entry->>'quantity')::integer and public.rpg_item_visible(cid,item.id));
   remaining:=item.quantity-(entry->>'quantity')::integer; portions:=least(n,(entry->>'quantity')::integer);
   ids:=ids||jsonb_build_array(item.id);
   if remaining>0 then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'family'='items' and x->>'id'=item.id::text and x->'values'=jsonb_build_object('quantity',remaining))); end if;
   for recipient in select value#>>'{}' as id,row_number() over(order by value#>>'{}') as ordinal from jsonb_array_elements(definition->'recipientIds') loop
    share:=(entry->>'quantity')::integer/n+case when recipient.ordinal<=mod((entry->>'quantity')::integer,n) then 1 else 0 end;
    if share=0 then continue; end if;
    target:=case when remaining=0 and recipient.ordinal=portions then item.id else rpg_private.wave4_id(entitlement,'reward-item-v1:'||item.id::text||':'||recipient.id) end;
    select id into storage from public.rpg_storages where campaign_id=cid and entity_id=recipient.id::uuid order by id limit 1;
    perform rpg_private.wave4_transfer_guard(cid,plan->'changes',item.id,target,recipient.id::uuid,storage,share::integer);
    ids:=ids||jsonb_build_array(target);
    if target<>item.id then
     select value into policy from jsonb_array_elements(s->'itemPolicies') x where x->>'itemId'=item.id::text;
     if policy is not null then policies:=policies||jsonb_build_array(policy||jsonb_build_object('itemId',target,'version',1)); end if;
    end if;
   end loop;
  end if;
 end loop;
 perform rpg_private.assert((plan#>'{state,progress}') @> progress and progress @> (plan#>'{state,progress}') and jsonb_array_length(plan#>'{state,progress}')=jsonb_array_length(progress));
 perform rpg_private.assert((plan#>'{state,pending}')=pending and (plan#>'{state,itemPolicies}') @> policies and policies @> (plan#>'{state,itemPolicies}'));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'family'='items' and not(ids ? (x->>'id'))));
end $$;

-- Shared domain settlement: server validators supply a bounded plan; SQL owns
-- locking, exact fences, ordinary row validators, atomic history and save capture.
alter function public.rpg_world(uuid,uuid,text,jsonb,jsonb) rename to rpg_world_wave3;
create function public.rpg_world(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_column
declare cid uuid:=p_campaign_id; command jsonb; snap jsonb; op uuid; saved rpg_private.world_commands%rowtype; request jsonb; plan jsonb; s jsonb; oldstate jsonb; v jsonb; event jsonb; event_id uuid; idx integer:=0; result jsonb; rev integer; mid uuid; kind text; definition jsonb; receipt jsonb;
begin
 if p_action not in ('loop_read','loop_receipt','loop_commit') then
  if p_action='owner_configure' then
   perform 1 from public.rpg_campaigns where id=cid for update;
   if exists(select 1 from rpg_private.world_foundations where campaign_id=cid and loop_state is not null and loop_state->'profile'<>p_payload->'ruleset') then raise exception 'rpg_conflict'; end if;
  end if;
  return public.rpg_world_wave3(p_owner_id,cid,p_action,p_payload,p_timeline);
 end if;
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_timeline,p_action='loop_commit');
 if p_action='loop_read' then perform rpg_private.fields(p_payload,'{}'); return rpg_private.wave4_read(p_owner_id,cid); end if;
 command:=p_payload->'command'; op:=(command->>'operationId')::uuid; kind:=p_payload->>'kind';
 perform rpg_private.fields(command,array['operationId','campaignId','timeline','expectedRevision','expectedRuntimeRevision','expectedHeadId']);
 perform rpg_private.assert(command->>'campaignId'=cid::text and command->'timeline'=p_timeline and op is not null);
 request:=jsonb_build_object('action','loop_commit','payload',p_payload-'plan');
 select * into saved from rpg_private.world_commands where id=op;
 if found then if saved.campaign_id<>cid or saved.request<>request then raise exception 'rpg_conflict'; end if; return saved.result; end if;
 if exists(select 1 from rpg_private.timeline_command_ids where id=op) then raise exception 'rpg_conflict'; end if;
 if p_action='loop_receipt' then perform rpg_private.fields(p_payload,array['command','kind','input']); return null; end if;
 perform rpg_private.fields(p_payload,array['command','kind','input','plan']);
 snap:=rpg_private.foundation_fence(p_owner_id,cid,command);
 if exists(select 1 from rpg_private.turns where campaign_id=cid and (status in ('pending','generating','awaiting_confirmation') or (status='failed' and retryable))) then raise exception 'rpg_conflict'; end if;
 perform rpg_private.assert(kind in ('commerce.configure','progression.configure','progression.correct','reward','advancement','trade','prepare'));
 plan:=p_payload->'plan'; perform rpg_private.fields(plan,array['state','world','changes','events']);
 s:=plan->'state'; select loop_state into oldstate from rpg_private.world_foundations where campaign_id=cid;
 perform rpg_private.assert((select count(*)=count(distinct (x->>'family',x->>'id')) from jsonb_array_elements(plan->'changes') x));
 if kind='prepare' and s=oldstate and plan->'world'=snap->'world' and plan->'changes'='[]' and plan->'events'='[]' then
  result:=jsonb_build_object('committed',true,'operationId',op);
  insert into rpg_private.timeline_command_ids values('world',op,cid);
  insert into rpg_private.world_commands values(op,cid,request,result);
  return result;
 end if;
 perform rpg_private.assert((s->>'version')::integer=coalesce((oldstate->>'version')::integer,0)+1 and jsonb_array_length(plan->'changes')<=128 and jsonb_array_length(plan->'events') between 1 and 32);
 if kind in ('commerce.configure','progression.configure') then perform rpg_private.assert(plan->'changes'='[]' and (snap->'world'='null' or ((plan->'world')-'actors')=((snap->'world')-'actors'))); end if;
 if kind='commerce.configure' then perform rpg_private.assert((s-array['version','currencies','itemPolicies','merchants'])=(oldstate-array['version','currencies','itemPolicies','merchants']) or oldstate is null); end if;
 if kind='progression.configure' then perform rpg_private.assert((s-array['version','progression','tracks','rewards'])=(oldstate-array['version','progression','tracks','rewards']) or oldstate is null); end if;
 -- Rewards can only claim one already committed source, never a generated amount.
 if kind='reward' then
  select value into definition from jsonb_array_elements(oldstate->'rewards') x where x->>'id'=p_payload#>>'{input,rewardId}' and x->'version'=p_payload#>'{input,expectedRewardVersion}';
  perform rpg_private.assert(definition is not null);
  if definition#>>'{source,kind}'='quest' then perform rpg_private.assert(exists(select 1 from public.rpg_quests where campaign_id=cid and id=(definition#>>'{source,id}')::uuid and status='complete'));
  elsif definition#>>'{source,kind}'='thread' then perform rpg_private.assert(exists(select 1 from jsonb_array_elements(snap#>'{world,threads}') t where t->>'id'=definition#>>'{source,id}' and t->>'status'='resolved'));
  else perform rpg_private.assert(exists(select 1 from rpg_private.world_events where campaign_id=cid and id=(definition#>>'{source,id}')::uuid and event->>'kind' not like 'reward.%' and event->>'kind' not like 'progression.%')); end if;
  for receipt in select value from jsonb_array_elements(rpg_private.wave4_events(cid)) where value->>'kind'='reward.granted' loop
   perform rpg_private.assert(receipt#>'{payload,source}' is distinct from definition->'source');
  end loop;
  perform rpg_private.wave4_reward_guard(cid,oldstate,definition,plan);
 end if;
 if kind='trade' then perform rpg_private.wave4_trade_guard(cid,oldstate,p_payload#>'{input,intent}',plan); end if;
 -- Parent is an ordinary committed operation in the existing turn history.
 insert into rpg_private.turns(id,campaign_id,owner_id,session_id,input,status,expected_revision,committed_revision,settings_revision,settings,guide_revision,narration,visual_description)
 select op,cid,p_owner_id,null,jsonb_build_object('operationId',op,'campaignId',cid,'timeline',p_timeline,'mode',case when kind in ('trade','reward','advancement') then 'mechanic' else 'ooc' end,'input',case when kind in ('trade','reward','advancement') then 'Reviewed action' else 'Owner configuration' end,'companionId',null,'listenerIds','[]'::jsonb,'foundationKind',kind),'committed',(snap->>'runtimeRevision')::integer,(snap->>'runtimeRevision')::integer+1,st.revision,st.values,0,coalesce((select string_agg(x->>'text',E'\n\n') from jsonb_array_elements(plan->'events') x where x->>'visibility'='public'),'Owner configuration saved.'),'' from public.rpg_settings st where st.campaign_id=cid;
 -- New entities precede their normal storages; item moves use existing validators.
 for v in select value from jsonb_array_elements(plan->'changes') order by case value->>'family' when 'entities' then 0 when 'locations' then 1 when 'storages' then 2 when 'items' then 3 else 4 end loop
  perform rpg_private.assert(v->>'family' in ('entities','items','storages','locations','quests','public_state'));
  if kind<>'prepare' then perform rpg_private.assert(v->>'family' in ('entities','items')); end if;
  if kind not in ('prepare','progression.correct','advancement') and v->>'family'='entities' then perform rpg_private.fields(v->'values',array['resources']); end if;
  perform rpg_private.runtime_change(cid,op,v);
 end loop;
 perform rpg_private.wave4_state(cid,s,snap->'ruleset');
 perform rpg_private.world_validate_state(p_owner_id,cid,plan->'world',snap->'bindings');
 insert into rpg_private.world_foundations(campaign_id,world,loop_state) values(cid,plan->'world',s) on conflict(campaign_id) do update set world=excluded.world,loop_state=excluded.loop_state,revision=rpg_private.world_foundations.revision+1;
 for v in select value from jsonb_array_elements(plan->'events') loop
  perform rpg_private.fields(v,array['kind','visibility','text','actorIds','threadIds','payload']);
  perform rpg_private.assert(v->>'visibility' in ('public','private') and length(v->>'text') between 1 and 4000 and jsonb_typeof(v->'payload')='object');
  event_id:=rpg_private.world_event_id(op,'wave4',idx::text,v->>'visibility'); idx:=idx+1;
  event:=jsonb_build_object('schemaVersion',1,'id',event_id,'campaignId',cid,'originTimelineId',p_timeline->>'timelineId','operationId',op,'worldMinutes',snap->'worldMinutes','kind',v->>'kind','actorIds',v->'actorIds','threadIds',v->'threadIds','visibility',v->>'visibility','text',v->>'text','evidence','[]'::jsonb,'payload',v->'payload');
  insert into rpg_private.world_events(id,campaign_id,operation_id,event) values(event_id,cid,op,event);
  perform rpg_private.memory_index(cid,case when v->>'visibility'='public' then 'event' else 'private_event' end,event_id,'1',v->>'text',v->>'visibility',null,'{}','{}','history','record');
  update rpg_private.memory_public_sources set valid_from=(snap->>'worldMinutes')::integer where campaign_id=cid and source_id=event_id and kind='event';
  update rpg_private.memory_private_sources set valid_from=(snap->>'worldMinutes')::integer where campaign_id=cid and source_id=event_id and kind='private_event';
 end loop;
 update rpg_private.runtime_state set revision=revision+1 where campaign_id=cid returning revision into rev;
 perform rpg_private.wave4_item_rules(cid,plan);
 update rpg_private.turns set committed_revision=rev where id=op;
 perform rpg_private.memory_invalidate(cid);
 result:=jsonb_build_object('committed',true,'operationId',op);
 insert into rpg_private.timeline_command_ids values('world',op,cid);
 insert into rpg_private.world_commands values(op,cid,request,result);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=cid) then perform rpg_private.timeline_save(cid,'autosave','After action','turn:'||op::text);
 else mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(p_timeline->>'timelineId')::uuid; end if;
 return result;
end $$;
-- Retain existing house-profile item mechanics on a validated partial transfer.
create function rpg_private.wave4_item_rules(cid uuid,plan jsonb) returns void language plpgsql set search_path='' as $$
declare config jsonb; pair jsonb; pairs jsonb:='[]'; event jsonb; entry jsonb; rule jsonb; source_id text; target_id text; begin
 select configuration into config from rpg_private.runtime_state where campaign_id=cid;
 if config is null or config='null' then return; end if;
 for event in select value from jsonb_array_elements(plan->'events') loop
  if event->>'kind'='commerce.trade' then pairs:=pairs||(event#>'{payload,lines}');
  elsif event->>'kind'='foundation.action_resolved' then pairs:=pairs||coalesce(event#>'{payload,transfers}','[]');
  elsif event->>'kind'='reward.granted' then
   for entry in select value from jsonb_array_elements(event#>'{payload,entries}') where value->>'kind'='item' loop pairs:=pairs||(entry->'transfers'); end loop;
  end if;
 end loop;
 for pair in select value from jsonb_array_elements(pairs) loop
  source_id:=coalesce(pair->>'sourceItemId',pair->>'itemId'); target_id:=coalesce(pair->>'transferredItemId',pair->>'itemId');
  if source_id=target_id or not exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'family'='items' and x->>'id'=target_id and x->'expectedRevision'='null') then continue; end if;
  select value into rule from jsonb_array_elements(config->'itemRules') x where x->>'itemId'=source_id;
  if rule is not null and not exists(select 1 from jsonb_array_elements(config->'itemRules') x where x->>'itemId'=target_id) then config:=jsonb_set(config,'{itemRules}',(config->'itemRules')||jsonb_build_array(rule||jsonb_build_object('itemId',target_id))); end if;
 end loop;
 perform rpg_private.assert(jsonb_array_length(config->'itemRules')<=500);
 update rpg_private.runtime_state set configuration=config where campaign_id=cid;
end $$;

-- Extend the original checkpoint/packet envelope, never the public Turn DTO.
do $$ declare d text; old text; begin
 d:=pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure); old:=d;
 d:=replace(d,'array[''worldSettlement'',''worldLogic'']','array[''worldSettlement'',''worldLogic'',''foundationAction'',''foundationSettlement'']');
 perform rpg_private.assert(d<>old); execute d;
 d:=pg_get_functiondef('rpg_private.runtime_before_wave1(uuid,uuid,text,jsonb,jsonb)'::regprocedure); old:=d;
 d:=replace(d,'if p_action=''commit'' and not coalesce(was_committed,false)', 'if coalesce(current_setting(''rpg.wave4_settlement'',true),'''')<>''on'' and p_action=''commit'' and not coalesce(was_committed,false)');
 perform rpg_private.assert(d<>old); execute d;
end $$;

create function rpg_private.wave4_action_guard(cid uuid,t rpg_private.turns,settlement jsonb) returns void language plpgsql stable set search_path='' as $$
declare proposal jsonb:=settlement->'proposal'; plan jsonb:=settlement->'plan'; s jsonb; actor jsonb; merchant jsonb; m jsonb; checkrow jsonb; success boolean; caps jsonb; line jsonb; policy jsonb; transfer jsonb; afterrow jsonb; currency jsonb; ids jsonb:='[]'; policies jsonb; expectedstate jsonb; actorid text; merchantid text; prefix text; remaining integer; begin
 select loop_state into s from rpg_private.world_foundations where campaign_id=cid;
 actorid:=coalesce(proposal->>'playerEntityId',proposal#>>'{intent,playerEntityId}'); merchantid:=coalesce(proposal->>'merchantActorId',proposal#>>'{intent,merchantActorId}');
 perform rpg_private.assert(t.input->>'mode'='game' and proposal->>'schemaVersion'='1' and proposal->>'input'=t.input->>'input' and settlement->>'schemaVersion'='1');
 perform rpg_private.assert(plan->'world'=(select world from rpg_private.world_foundations where campaign_id=cid));
 select a into actor from jsonb_array_elements(plan#>'{world,actors}') a where a->>'id'=actorid and a->>'entityId'=actorid and a->>'control'='player' and a->'publicName'<>'null';
 select a into merchant from jsonb_array_elements(plan#>'{world,actors}') a where a->>'id'=merchantid and a->>'control'='autonomous' and a->'publicName'<>'null';
 select value into m from jsonb_array_elements(s->'merchants') x where x->>'actorId'=merchantid;
 perform rpg_private.assert(actor is not null and merchant is not null and m is not null and m->>'available'='true' and actor->'locationId'<>'null' and actor->'locationId'=merchant->'locationId' and exists(select 1 from public.rpg_public_state where campaign_id=cid and current_location_id::text=actor->>'locationId'));
 perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=actorid::uuid and kind in ('player','companion') and (hp is null or hp>0)) and exists(select 1 from public.rpg_entities where campaign_id=cid and id=(m->>'entityId')::uuid and kind='npc' and (hp is null or hp>0) and not(conditions ?| array['dead','absent','unconscious'])));
 perform rpg_private.assert((select count(*)=count(distinct (x->>'family',x->>'id')) from jsonb_array_elements(plan->'changes') x));
 if proposal->>'action'='quote' then
  perform rpg_private.assert(plan->'state'=s and plan->'changes'='[]' and jsonb_array_length(plan->'events')=1 and plan#>>'{events,0,kind}'='commerce.quote' and plan#>>'{events,0,visibility}'='public'); return;
 end if;
 perform rpg_private.assert((plan#>>'{state,version}')::integer=(s->>'version')::integer+1);
 if proposal->>'action'='trade' then
  perform rpg_private.wave4_trade_guard(cid,s,proposal->'intent',plan);
  if proposal->'expectedPayment'<>'null' then perform rpg_private.assert(proposal->'expectedPayment'=plan#>'{events,0,payload,payment}'); end if; return;
 end if;
 perform rpg_private.assert(proposal->>'action' in ('haggle','theft','robbery'));
 if nullif(t.checkpoint->'worldLogic','null') is not null then
  perform rpg_private.assert(t.checkpoint#>>'{worldLogic,actorId}'=actorid and t.checkpoint#>>'{worldLogic,uncertainty}'='resolved' and t.checkpoint->'checks'='[]' and proposal->'checkIndex'='null');
  caps:=t.checkpoint#>'{worldLogic,capabilityRefs}'; success:=t.checkpoint#>>'{worldLogic,outcome}'='completed';
  perform rpg_private.assert((actor->'capabilities') @> caps);
 else
  caps:=actor->'capabilities';
  perform rpg_private.assert(t.source#>'{runtime,configuration,controlledEntityIds}' ? actorid);
  select value into checkrow from jsonb_array_elements(t.checkpoint->'checks') x where x->'index'=proposal->'checkIndex';
  perform rpg_private.assert(checkrow is not null and checkrow->>'actorId'=actorid and checkrow->>'targetId'=merchantid and checkrow->>'kind'='skill' and checkrow->>'stat'='skill' and checkrow->>'visibility'='player' and checkrow->>'uncertainty'='meaningful' and checkrow->>'id'=rpg_private.wave4_id(t.id,'check:'||(proposal->>'checkIndex'))::text);
  success:=(checkrow->>'success')::boolean;
 end if;
 expectedstate:=jsonb_set(s,'{version}',plan#>'{state,version}');
 if proposal->>'action'='haggle' then
  if nullif(t.checkpoint->'worldLogic','null') is not null then perform rpg_private.assert(caps ? ('foundation.haggle:'||merchantid)); end if;
  perform rpg_private.assert((m->>'haggleLimitBasisPoints')::integer>0 and plan->'state'=expectedstate and plan->'changes'='[]');
  if success then perform rpg_private.assert(plan#>>'{events,0,kind}'='commerce.haggle_granted' and plan#>'{events,0,payload,stateVersion}'=plan#>'{state,version}' and plan#>'{events,0,payload,merchantVersion}'=m->'version' and plan#>'{events,0,payload,timeline}'=rpg_private.timeline_fence(cid) and plan#>'{events,0,payload,worldMinutes}'=settlement->'worldMinutes'); end if;
 elsif success then
  policies:=s->'itemPolicies';
  for line in select value from jsonb_array_elements(proposal->'take') loop
   if nullif(t.checkpoint->'worldLogic','null') is not null then
    prefix:='foundation.'||(proposal->>'action')||'.item:'||merchantid||':'||(line->>'itemId')||':';
    perform rpg_private.assert(exists(select 1 from jsonb_array_elements_text(caps) cap where left(cap,length(prefix))=prefix and substring(cap from length(prefix)+1) ~ '^[0-9]+$' and substring(cap from length(prefix)+1)::integer>=(line->>'quantity')::integer));
   end if;
   select value into policy from jsonb_array_elements(s->'itemPolicies') x where x->>'itemId'=line->>'itemId';
   perform rpg_private.assert(policy->>'visibility'='public' and policy->>'trade'='allowed' and exists(select 1 from public.rpg_items where campaign_id=cid and id=(line->>'itemId')::uuid and owner_entity_id=(m->>'entityId')::uuid and storage_id=(m->>'storageId')::uuid));
   select value into transfer from jsonb_array_elements(plan#>'{events,0,payload,transfers}') x where x->>'itemId'=line->>'itemId';
   select x->'values' into afterrow from jsonb_array_elements(plan->'changes') x where x->>'family'='items' and x->>'id'=transfer->>'transferredItemId';
   perform rpg_private.wave4_transfer_guard(cid,plan->'changes',(line->>'itemId')::uuid,(transfer->>'transferredItemId')::uuid,actorid::uuid,(afterrow->>'storage_id')::uuid,(line->>'quantity')::integer);
   select quantity-(line->>'quantity')::integer into remaining from public.rpg_items where campaign_id=cid and id=(line->>'itemId')::uuid;
   if remaining>0 then
    perform rpg_private.assert(transfer->>'transferredItemId'<>line->>'itemId' and exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'family'='items' and x->>'id'=line->>'itemId' and x->'values'=jsonb_build_object('quantity',remaining)));
    policies:=policies||jsonb_build_array(policy||jsonb_build_object('itemId',transfer->>'transferredItemId','origin','stolen','version',1));
   else
    perform rpg_private.assert(transfer->>'transferredItemId'=line->>'itemId');
    policies:=(select jsonb_agg(case when x->>'itemId'=line->>'itemId' then x||jsonb_build_object('origin','stolen','version',(x->>'version')::integer+1) else x end) from jsonb_array_elements(policies) x);
   end if;
   ids:=ids||jsonb_build_array(line->>'itemId',transfer->>'transferredItemId');
  end loop;
  expectedstate:=jsonb_set(expectedstate,'{itemPolicies}',policies);
  if proposal->'currency'<>'null' then
   select value into currency from jsonb_array_elements(s->'currencies') x where x->>'id'=proposal#>>'{currency,currencyId}';
   perform rpg_private.assert(currency is not null and m->>'usesFunds'='true' and m->'currencyIds' ? (currency->>'id'));
   if nullif(t.checkpoint->'worldLogic','null') is not null then
    prefix:='foundation.'||(proposal->>'action')||'.currency:'||merchantid||':'||(currency->>'id')||':';
    perform rpg_private.assert(exists(select 1 from jsonb_array_elements_text(caps) cap where left(cap,length(prefix))=prefix and substring(cap from length(prefix)+1) ~ '^[0-9]+$' and substring(cap from length(prefix)+1)::integer>=(proposal#>>'{currency,amount}')::integer));
   end if;
   perform rpg_private.wave4_money(cid,plan,actorid::uuid,currency->>'resourceKey',(proposal#>>'{currency,amount}')::integer);
   perform rpg_private.wave4_money(cid,plan,(m->>'entityId')::uuid,currency->>'resourceKey',-(proposal#>>'{currency,amount}')::integer);
  else perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(plan->'changes') x where x->>'family'='entities')); end if;
  if proposal->>'merchantUnavailable'='true' then
   perform rpg_private.assert(proposal->>'action'='robbery' and caps ? ('foundation.merchant.unavailable:'||merchantid));
   expectedstate:=jsonb_set(expectedstate,'{merchants}',(select jsonb_agg(case when x->>'actorId'=merchantid then x||jsonb_build_object('available',false,'version',(x->>'version')::integer+1) else x end) from jsonb_array_elements(s->'merchants') x));
  end if;
  perform rpg_private.assert(plan->'state'=expectedstate and not exists(select 1 from jsonb_array_elements(plan->'changes') x where (x->>'family'='items' and not(ids ? (x->>'id'))) or (x->>'family'='entities' and x->>'id'<>actorid and x->>'id'<>m->>'entityId')));
 end if;
 if not success then
  if proposal->>'merchantUnavailable'='true' then
   perform rpg_private.assert(proposal->>'action'='robbery' and caps ? ('foundation.merchant.unavailable:'||merchantid));
   expectedstate:=jsonb_set(expectedstate,'{merchants}',(select jsonb_agg(case when x->>'actorId'=merchantid then x||jsonb_build_object('available',false,'version',(x->>'version')::integer+1) else x end) from jsonb_array_elements(s->'merchants') x));
  end if;
  perform rpg_private.assert(plan->'changes'='[]' and plan->'state'=expectedstate and plan#>>'{events,0,kind}'='foundation.action_resolved' and plan#>>'{events,0,payload,outcome}'='blocked');
 end if;
end $$;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_wave3;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare cid uuid:=p_campaign_id; t rpg_private.turns%rowtype; settlement jsonb; plan jsonb; command jsonb; result jsonb; v jsonb; event jsonb; eid uuid; idx integer:=0; rev integer; mid uuid; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=cid for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(cid,p_timeline,p_action not in ('play','get'));
 select * into t from rpg_private.turns where campaign_id=cid and id=(p_payload->>'operationId')::uuid;
 if p_action='checkpoint' then
  if nullif(t.checkpoint->'foundationAction','null') is not null then perform rpg_private.assert(t.checkpoint->'foundationAction'=p_payload#>'{checkpoint,foundationAction}'); end if;
  if nullif(t.checkpoint->'foundationSettlement','null') is not null then perform rpg_private.assert(t.checkpoint->'foundationSettlement'=p_payload#>'{checkpoint,foundationSettlement}'); end if;
 end if;
 settlement:=nullif(p_payload#>'{packet,foundationSettlement}','null');
 if p_action<>'commit' or settlement is null then
  if p_action='commit' then perform rpg_private.assert(nullif(t.checkpoint->'foundationSettlement','null') is null and nullif(t.checkpoint->'foundationAction','null') is null and nullif(t.checkpoint#>'{plan,foundationAction}','null') is null); end if;
  return public.rpg_runtime_wave3(p_owner_id,cid,p_action,p_payload,p_timeline);
 end if;
 perform rpg_private.assert(settlement=t.checkpoint->'foundationSettlement' and settlement->'proposal'=coalesce(nullif(t.checkpoint->'foundationAction','null'),t.checkpoint#>'{plan,foundationAction}') and settlement->'worldMinutes'=p_payload#>'{packet,resolution,worldMinutes}');
 if t.status='committed' then return public.rpg_runtime_wave3(p_owner_id,cid,p_action,p_payload,p_timeline); end if;
 perform rpg_private.fields(settlement,array['schemaVersion','command','proposal','worldMinutes','plan']);
 command:=settlement->'command'; plan:=settlement->'plan';
 perform rpg_private.assert(command->>'operationId'=t.id::text and command->>'campaignId'=cid::text and command->'timeline'=p_timeline and (command->>'expectedRuntimeRevision')::integer=t.expected_revision);
 perform rpg_private.foundation_fence(p_owner_id,cid,command);
 perform rpg_private.fields(plan,array['state','world','changes','events']);
 perform rpg_private.assert(jsonb_array_length(plan->'changes')<=128 and jsonb_array_length(plan->'events') between 1 and 32);
 perform set_config('rpg.wave4_settlement','on',true);
 result:=public.rpg_runtime_wave3(p_owner_id,cid,p_action,p_payload,p_timeline);
 perform set_config('rpg.wave4_settlement','',true);
 perform rpg_private.wave4_action_guard(cid,t,settlement);
 for v in select value from jsonb_array_elements(plan->'changes') loop
  perform rpg_private.assert(v->>'family' in ('entities','items'));
  if v->>'family'='entities' then perform rpg_private.fields(v->'values',array['resources']); end if;
  perform rpg_private.runtime_change(cid,t.id,v);
 end loop;
 perform rpg_private.wave4_state(cid,plan->'state',(select ruleset from rpg_private.world_foundations where campaign_id=cid));
 update rpg_private.world_foundations set loop_state=plan->'state',revision=revision+1 where campaign_id=cid;
 perform rpg_private.wave4_item_rules(cid,plan);
 for v in select value from jsonb_array_elements(plan->'events') loop
  perform rpg_private.fields(v,array['kind','visibility','text','actorIds','threadIds','payload']);
  perform rpg_private.assert(v->>'visibility'='public' and length(v->>'text') between 1 and 4000 and jsonb_typeof(v->'payload')='object');
  eid:=rpg_private.world_event_id(t.id,'wave4',idx::text,v->>'visibility'); idx:=idx+1;
  event:=jsonb_build_object('schemaVersion',1,'id',eid,'campaignId',cid,'originTimelineId',p_timeline->>'timelineId','operationId',t.id,'worldMinutes',settlement->'worldMinutes','kind',v->>'kind','actorIds',v->'actorIds','threadIds',v->'threadIds','visibility',v->>'visibility','text',v->>'text','evidence','[]'::jsonb,'payload',v->'payload');
  insert into rpg_private.world_events(id,campaign_id,operation_id,event) values(eid,cid,t.id,event);
  perform rpg_private.memory_index(cid,'event',eid,'1',v->>'text','public',t.session_id,'{}','{}','history','record');
  update rpg_private.memory_public_sources set valid_from=(settlement->>'worldMinutes')::integer where campaign_id=cid and source_id=eid and kind='event';
 end loop;
 update rpg_private.runtime_state set revision=revision+1 where campaign_id=cid returning revision into rev;
 update rpg_private.turns set committed_revision=rev where id=t.id returning * into t;
 perform rpg_private.memory_invalidate(cid);
 if (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=cid) then perform rpg_private.timeline_save(cid,'autosave','After action','turn:'||t.id::text);
 else mid:=rpg_private.timeline_capture(cid); update rpg_private.timelines set head_manifest_id=mid,head_public=rpg_private.timeline_public_metadata(cid) where campaign_id=cid and id=(p_timeline->>'timelineId')::uuid; end if;
 return rpg_private.timeline_stamp(rpg_private.runtime_public_turn(t),rpg_private.timeline_fence(cid));
end $$;
revoke all on function public.rpg_runtime_wave3(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on function public.rpg_world_wave3(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.rpg_world(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_world(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
