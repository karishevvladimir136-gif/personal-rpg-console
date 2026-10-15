-- Natural play adds bounded provisional records to the existing fenced turn.
-- Public rows exist only inside successful final commit; old operations delegate.
begin;

alter table rpg_private.turns add column astra_natural_contract text
  check(astra_natural_contract is null or (astra_natural_contract='natural-v1' and
    astra_response_contract is not distinct from 'unified-v1'));
alter table rpg_private.turns add column astra_natural_state jsonb;
alter table public.rpg_scenes add column public_continuity jsonb;
alter table public.rpg_storages add column location_id uuid;
alter table public.rpg_storages add column locale_key text;
alter table public.rpg_storages add constraint rpg_storage_ground_location
  foreign key(campaign_id,location_id) references public.rpg_locations(campaign_id,id)
  deferrable initially deferred;
alter table public.rpg_storages drop constraint rpg_storages_kind_check;
alter table public.rpg_storages add constraint rpg_storages_kind_check
  check(kind in('player','companion','camp','transport','merchant','ground'));
do $$ declare c record; begin
  for c in select conname from pg_constraint where conrelid='public.rpg_storages'::regclass
    and contype='c' and pg_get_constraintdef(oid) like '%entity_id IS NULL%'
    and pg_get_constraintdef(oid) like '%camp%' loop
    execute format('alter table public.rpg_storages drop constraint %I',c.conname);
  end loop;
end $$;
alter table public.rpg_storages add constraint rpg_storage_owner_kind
  check((kind in('camp','ground'))=(entity_id is null));
alter table public.rpg_storages add constraint rpg_storage_ground_anchor
  check((kind='ground' and location_id is not null and
    (locale_key is null or length(btrim(locale_key)) between 1 and 120)) or
    (kind<>'ground' and location_id is null and locale_key is null));

create function rpg_private.astra_natural_text(v text,n integer,empty_ok boolean default false)
returns boolean language sql immutable set search_path='' as $$
 select v is not null and v=btrim(v) and length(v) between case when empty_ok then 0 else 1 end and n
   and v !~ '[[:cntrl:]]'
$$;
create function rpg_private.astra_natural_locale(s jsonb) returns text
language sql immutable set search_path='' as $$
 select translate(sc#>>'{public_continuity,locale,name}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')
 from jsonb_array_elements(s#>'{snapshot,scenes}') sc
 where sc->>'id'=s#>>'{snapshot,publicState,current_scene_id}' and
   sc#>>'{public_continuity,parentLocationId}'=s#>>'{snapshot,publicState,current_location_id}'
$$;

-- Existing storage authority still validates all conventional values. Only the
-- new ground anchor is attached after the same runtime_change has accepted it.
alter function rpg_private.runtime_change_before_astra_ordered(uuid,uuid,jsonb)
  rename to runtime_change_before_natural_play;
create function rpg_private.runtime_change_before_astra_ordered(cid uuid,opid uuid,change_row jsonb)
returns void language plpgsql set search_path='' as $$
declare anchor jsonb; base jsonb;
begin
 if change_row->>'family'='storages' and (change_row->'values' ? 'location_id' or change_row->'values' ? 'locale_key') then
   anchor:=change_row->'values';
   perform rpg_private.assert(anchor->>'kind'='ground' and anchor->'entity_id'='null'::jsonb and
     exists(select 1 from public.rpg_locations where campaign_id=cid and id=(anchor->>'location_id')::uuid)
     and (anchor->'locale_key'='null'::jsonb or rpg_private.astra_natural_text(anchor->>'locale_key',120)));
   base:=jsonb_set(change_row,'{values}',anchor-array['location_id','locale_key']);
   -- The table anchor is a NOT NULL semantic requirement for ground; populate
   -- it inside the same runtime_change INSERT, rather than creating an invalid row.
   if not exists(select 1 from public.rpg_storages where campaign_id=cid and id=(change_row->>'id')::uuid) then
     perform rpg_private.fields(change_row,array['family','id','expectedRevision','values']);
     perform rpg_private.fields(anchor,array['name','kind','entity_id','location_id','locale_key']);
     perform rpg_private.assert(change_row->'expectedRevision'='null'::jsonb and
       not exists(select 1 from public.rpg_storages where id=(change_row->>'id')::uuid));
     insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,location_id,locale_key,revision)
       values((change_row->>'id')::uuid,cid,anchor->>'name','ground',null,
         (anchor->>'location_id')::uuid,anchor->>'locale_key',1);
   else
     perform rpg_private.assert(exists(select 1 from public.rpg_storages where campaign_id=cid and
       id=(change_row->>'id')::uuid and kind='ground' and location_id=(anchor->>'location_id')::uuid and
       locale_key is not distinct from anchor->>'locale_key'));
     perform rpg_private.runtime_change_before_natural_play(cid,opid,base);
   end if;
 else perform rpg_private.runtime_change_before_natural_play(cid,opid,change_row); end if;
end $$;

create function rpg_private.astra_natural_changes(state jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare all_changes jsonb; needed jsonb; receipt jsonb; change_row jsonb; pair record; ref jsonb;
 prior integer; result jsonb;
begin
 select coalesce(jsonb_agg(c order by rn,cn),'[]') into all_changes from
   jsonb_array_elements(state->'materializations') with ordinality r(m,rn),
   lateral jsonb_array_elements(m->'changes') with ordinality x(c,cn);
 if not state ? 'effectiveRecordIds' then return all_changes; end if;
 needed:=state->'effectiveRecordIds';
 for receipt in select value from jsonb_array_elements(state->'materializations') loop
   if needed ? (receipt->>'recordId') and receipt#>>'{request,purpose}'='combat' then
     for change_row in select value from jsonb_array_elements(receipt->'changes') loop
       if not needed ? (change_row->>'id') then needed:=needed||jsonb_build_array(change_row->'id'); end if;
     end loop;
   end if;
 end loop;
 loop
   prior:=jsonb_array_length(needed);
   for change_row in select value from jsonb_array_elements(all_changes) where needed ? (value->>'id') loop
     for pair in select key,value from jsonb_each(change_row->'values') where key like '%\_id' escape '\' or key like '%\_ids' escape '\' loop
       for ref in select value from jsonb_array_elements(case when jsonb_typeof(pair.value)='array' then pair.value else jsonb_build_array(pair.value) end) loop
         if jsonb_typeof(ref)='string' and not needed @>jsonb_build_array(ref) and exists(select 1 from jsonb_array_elements(all_changes) c where c->'id'=ref) then
           needed:=needed||jsonb_build_array(ref);
         end if;
       end loop;
     end loop;
   end loop;
   exit when jsonb_array_length(needed)=prior;
 end loop;
 select coalesce(jsonb_agg(c order by n),'[]') into result from jsonb_array_elements(all_changes) with ordinality x(c,n) where needed ? (c->>'id');
 return result;
end $$;

create function rpg_private.astra_natural_project(s jsonb,state jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare receipt jsonb; change_row jsonb; rowdata jsonb; ids jsonb; path text[];
begin
   for change_row in select value from jsonb_array_elements(rpg_private.astra_natural_changes(state)) loop
     if not exists(select 1 from jsonb_array_elements(rpg_private.astra_shadow_rows(s,change_row->>'family')) r
       where r->>'id'=change_row->>'id') then
       s:=rpg_private.astra_shadow_apply(s,change_row);
       if change_row->>'family' in('entities','storages','locations','items','quests') then
         path:=case change_row->>'family' when 'entities' then array['snapshot','entities']
           when 'storages' then array['snapshot','storages'] when 'locations' then array['snapshot','locations']
           when 'items' then array['snapshot','items'] else array['snapshot','quests'] end;
         select jsonb_agg(case when r->>'id'=change_row->>'id' then r||'{"revision":1}'::jsonb else r end order by n)
           into rowdata from jsonb_array_elements(s#>path) with ordinality x(r,n);
         s:=jsonb_set(s,path,rowdata);
       end if;
     end if;
   end loop;
 for receipt in select value from jsonb_array_elements(state->'materializations') loop
   if state ? 'effectiveRecordIds' and not state->'effectiveRecordIds' ? (receipt->>'recordId') then continue; end if;
   if receipt#>>'{request,kind}' in('npc','creature') and receipt#>>'{request,purpose}' not in('track','recurring') then
     ids:=s#>'{runtime,configuration,presentEntityIds}';
     if not ids ? (receipt->>'recordId') then s:=jsonb_set(s,'{runtime,configuration,presentEntityIds}',ids||jsonb_build_array(receipt->'recordId')); end if;
     ids:=s#>'{worldTakeover,presentEntityIds}';
     if not ids ? (receipt->>'recordId') then s:=jsonb_set(s,'{worldTakeover,presentEntityIds}',ids||jsonb_build_array(receipt->'recordId')); end if;
     if not exists(select 1 from jsonb_array_elements(s#>'{worldTakeover,actors}') a where a->>'entityId'=receipt->>'recordId') then
       select e into rowdata from jsonb_array_elements(s#>'{snapshot,entities}') e where e->>'id'=receipt->>'recordId';
       s:=jsonb_set(s,'{worldTakeover,actors}',s#>'{worldTakeover,actors}'||jsonb_build_array(jsonb_build_object(
         'entityId',receipt->'recordId','publicName',rowdata->'name','publicCapabilities','[]'::jsonb,
         'publicLimitations','[]'::jsonb,'publicKnowledge','[]'::jsonb)));
     end if;
   elsif receipt#>>'{request,kind}'='place' then
     ids:=s#>'{worldTakeover,routeLocationIds}';
     if not ids ? (receipt->>'recordId') then s:=jsonb_set(s,'{worldTakeover,routeLocationIds}',ids||jsonb_build_array(receipt->'recordId')); end if;
   end if;
 end loop;
 return s||jsonb_build_object('astraNaturalState',state);
end $$;

create function rpg_private.astra_natural_materialization(t rpg_private.turns,request jsonb,pos integer)
returns jsonb language plpgsql stable set search_path='' as $$
declare s jsonb:=rpg_private.astra_natural_project(t.source,t.astra_natural_state); ref text;
 kind text; purpose text; name text; description text; subject jsonb; current_subject boolean:=false;
 rid uuid; owner_id uuid; storage_id uuid; parent uuid; locale text; changes jsonb:='[]'; found_receipt jsonb;
 work rpg_private.turns:=t; combat jsonb; delta jsonb; existing_index integer;
begin
 perform rpg_private.fields(request,array['subjectRef','kind','purpose','ownerRef']);
 ref:=request->>'subjectRef'; kind:=request->>'kind'; purpose:=request->>'purpose';
 perform rpg_private.assert(pos between 0 and 7 and kind in('npc','creature','place','item') and
   purpose in('job','trade','inventory','combat','party','track','recurring') and
   (request->'ownerRef'='null'::jsonb or kind='item' and purpose='trade'));
 perform rpg_private.assert(case when kind='place' then purpose in('track','recurring')
   when kind='item' then purpose in('inventory','trade','track','recurring') else purpose<>'inventory' end);
 if left(ref,6)='input:' then
   name:=substr(ref,7); description:='An ordinary '||name||'.';
   perform rpg_private.assert(rpg_private.astra_natural_text(name,100) and position(name in t.input->>'input')>0);
   current_subject:=true;
 else
   select sub into subject from jsonb_array_elements(t.source#>'{snapshot,scenes}') sc,
     lateral jsonb_array_elements(coalesce(sc#>'{public_continuity,subjects}','[]')) sub
     where sc->>'campaign_id'=t.campaign_id::text and sc->>'role'='narration' and sc->>'revision'='1' and
       sc#>>'{public_continuity,schemaVersion}'='1' and sub->>'id'=ref and sub->>'kind'=kind
     order by (sc->>'id'=t.source#>>'{snapshot,publicState,current_scene_id}') desc,
       (sc->>'sequence')::integer desc limit 1;
   perform rpg_private.assert(subject is not null);
   name:=subject->>'name'; description:=subject->>'description';
   select exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,scenes}') sc,
     lateral jsonb_array_elements(coalesce(sc#>'{public_continuity,subjects}','[]')) sub where
     sc->>'id'=t.source#>>'{snapshot,publicState,current_scene_id}' and sub->>'id'=ref) into current_subject;
   current_subject:=current_subject or position(name in t.input->>'input')>0;
 end if;
 perform rpg_private.assert(rpg_private.astra_natural_text(name,100) and
   rpg_private.astra_natural_text(description,600,true) and
   (current_subject or purpose in('track','recurring')));
 parent:=(t.source#>>'{snapshot,publicState,current_location_id}')::uuid;
 perform rpg_private.assert(exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,locations}') l
   where l->>'id'=parent::text and l->>'campaign_id'=t.campaign_id::text and l->>'status' in('known','visited')));
 select m into found_receipt from jsonb_array_elements(t.astra_natural_state->'materializations') m
   where m#>>'{request,subjectRef}'=ref and m#>>'{request,kind}'=kind limit 1;
 if found_receipt is not null then rid:=(found_receipt->>'recordId')::uuid;
 elsif left(ref,6)<>'input:' then
   select (o->>'recordId')::uuid into rid from jsonb_array_elements(coalesce(t.source->'astraNaturalOrigins','[]')) o
     where o->>'subjectRef'=ref and o->>'kind'=kind limit 1;
 end if;
 if rid is null then
   rid:=rpg_private.wave4_id(t.id,'natural:'||kind||':'||ref);
   perform rpg_private.assert(not exists(select 1 from public.rpg_entities where id=rid) and
     not exists(select 1 from public.rpg_locations where id=rid) and not exists(select 1 from public.rpg_items where id=rid));
   if kind in('npc','creature') then
     changes:=jsonb_build_array(jsonb_build_object('family','entities','id',rid,'expectedRevision',null,'values',
       jsonb_build_object('kind','npc','name',name,'details',description,'hp',8,'max_hp',8,
         'stats','{"attack":0,"defense":10,"skill":0}'::jsonb,'resources','{}'::jsonb,
         'conditions','[]'::jsonb,'equipment_slots','[]'::jsonb)));
   elsif kind='place' then
     perform rpg_private.assert(purpose in('track','recurring'));
     changes:=jsonb_build_array(jsonb_build_object('family','locations','id',rid,'expectedRevision',null,'values',
       jsonb_build_object('name',name,'description',description,'status','known')));
   else
     if purpose='inventory' then
       owner_id:=(s#>>'{runtime,configuration,controlledEntityIds,0}')::uuid;
       perform rpg_private.assert(jsonb_array_length(s#>'{runtime,configuration,controlledEntityIds}')=1);
       select (x->>'id')::uuid into storage_id from jsonb_array_elements(s#>'{snapshot,storages}') x
         where x->>'kind'='player' and x->>'entity_id'=owner_id::text order by x->>'id' limit 1;
       perform rpg_private.assert(storage_id is not null);
     elsif purpose='trade' then
       perform rpg_private.assert(request->'ownerRef'<>'null'::jsonb);
       select (m->>'recordId')::uuid into owner_id from jsonb_array_elements(t.astra_natural_state->'materializations') m
         where m#>>'{request,subjectRef}'=request->>'ownerRef' and m#>>'{request,kind}' in('npc','creature') limit 1;
       owner_id:=coalesce(owner_id,(request->>'ownerRef')::uuid);
       perform rpg_private.assert(exists(select 1 from jsonb_array_elements(s#>'{snapshot,entities}') e
         where e->>'id'=owner_id::text and e->>'kind'='npc') and s#>'{runtime,configuration,presentEntityIds}' ? owner_id::text);
       select (x->>'id')::uuid into storage_id from jsonb_array_elements(s#>'{snapshot,storages}') x
         where x->>'kind'='merchant' and x->>'entity_id'=owner_id::text order by x->>'id' limit 1;
       if storage_id is null then
         storage_id:=rpg_private.wave4_id(t.id,'natural:actor-storage:'||owner_id::text);
         select x->>'name' into name from jsonb_array_elements(s#>'{snapshot,entities}') x where x->>'id'=owner_id::text;
         changes:=changes||jsonb_build_array(jsonb_build_object('family','storages','id',storage_id,'expectedRevision',null,
           'values',jsonb_build_object('name',left('Inventory of '||name,160),'kind','merchant','entity_id',owner_id)));
         name:=case when subject is not null then subject->>'name' else substr(ref,7) end;
       end if;
     else
       locale:=rpg_private.astra_natural_locale(s);
       storage_id:=rpg_private.wave4_id(t.campaign_id,'natural:ground:'||parent::text||':'||coalesce(locale,''));
       if not exists(select 1 from jsonb_array_elements(s#>'{snapshot,storages}') x where x->>'id'=storage_id::text) then
         changes:=changes||jsonb_build_array(jsonb_build_object('family','storages','id',storage_id,'expectedRevision',null,
           'values',jsonb_build_object('name','Ground','kind','ground','entity_id',null,'location_id',parent,'locale_key',locale)));
       end if;
     end if;
     changes:=changes||jsonb_build_array(jsonb_build_object('family','items','id',rid,'expectedRevision',null,'values',
       jsonb_build_object('name',name,'category','misc','quantity',1,'description',description,'mechanics','',
         'owner_entity_id',owner_id,'storage_id',storage_id,'equipped_entity_id',null,'equipped_slot',null)));
   end if;
 end if;
 if purpose='combat' then
   perform rpg_private.assert(kind in('npc','creature'));
   work.source:=rpg_private.astra_natural_project(t.source,jsonb_build_object('schemaVersion',1,
     'materializations',t.astra_natural_state->'materializations'||jsonb_build_array(jsonb_build_object(
       'position',pos,'request',request,'recordId',rid,'changes',changes))));
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(work.source#>'{runtime,encounters}') e where e->>'status'='active'));
   combat:=rpg_private.astra_natural_encounter_resolution(work,jsonb_build_array(jsonb_build_object(
     'kind','encounter.start','participantIds',jsonb_build_array(work.source#>'{runtime,configuration,controlledEntityIds,0}',rid))));
   for delta in select value from jsonb_array_elements(combat->'changes') loop
     select n::integer-1 into existing_index from jsonb_array_elements(changes) with ordinality x(c,n)
       where c->>'family'=delta->>'family' and c->>'id'=delta->>'id';
     if existing_index is not null then
       changes:=jsonb_set(changes,array[existing_index::text,'values'],
         (changes->existing_index->'values')||(delta->'values'));
     else changes:=changes||jsonb_build_array(delta); end if;
   end loop;
 end if;
 return jsonb_build_object('position',pos,'request',request,'recordId',rid,'changes',changes);
end $$;

create function rpg_private.astra_natural_validate(t rpg_private.turns) returns jsonb
language plpgsql stable set search_path='' as $$
declare work rpg_private.turns:=t; receipt jsonb; expected jsonb; pos integer:=0;
begin
 perform rpg_private.assert(t.astra_natural_contract='natural-v1' and
   t.astra_natural_state->'schemaVersion'='1'::jsonb and
   jsonb_typeof(t.astra_natural_state->'materializations')='array' and
   jsonb_array_length(t.astra_natural_state->'materializations')<=8 and
   t.astra_natural_state->>'sourceHash'=encode(sha256(convert_to(t.source::text,'UTF8')),'hex'));
 work.astra_natural_state:=jsonb_build_object('schemaVersion',1,'materializations','[]'::jsonb);
 for receipt in select value from jsonb_array_elements(t.astra_natural_state->'materializations') loop
   expected:=rpg_private.astra_natural_materialization(work,receipt->'request',pos);
   perform rpg_private.assert(receipt=expected);
   work.astra_natural_state:=jsonb_set(work.astra_natural_state,'{materializations}',
     work.astra_natural_state->'materializations'||jsonb_build_array(receipt)); pos:=pos+1;
 end loop;
 return rpg_private.astra_natural_project(t.source,t.astra_natural_state);
end $$;

create function rpg_private.astra_natural_effective_ids(t rpg_private.turns,bundle jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$
declare needed jsonb:='[]'; receipt jsonb; effect jsonb; change_row jsonb; pair record; ref jsonb;
 rid text; purpose text; accepted boolean; prior integer; all_changes jsonb; result jsonb;
begin
 for receipt in select value from jsonb_array_elements(t.astra_natural_state->'materializations') loop
   rid:=receipt->>'recordId'; purpose:=receipt#>>'{request,purpose}';
   accepted:=purpose in('track','recurring') or purpose='inventory' and receipt#>>'{request,kind}'='item';
   if purpose='combat' then accepted:=exists(select 1 from jsonb_array_elements(t.checkpoint#>'{astraPrimary,toolReceipts}') r
     where r#>>'{call,kind}'='attack' and rid in(r#>>'{call,actorId}',r#>>'{call,targetId}')); end if;
   for effect in select value from jsonb_array_elements(coalesce(bundle->'effects','[]')) loop
     if purpose='job' and effect->>'kind'='job_offer' and effect#>>'{intent,issuerId}'=rid then accepted:=true;
     elsif purpose='party' and effect->>'kind'='companion_join' and effect#>>'{intent,entityId}'=rid then accepted:=true;
     elsif purpose='trade' and effect->>'kind' in('mundane_grant','mundane_purchase','mundane_sale','item_exchange','currency_transfer','item_transfer') and
       exists(select 1 from jsonb_each(effect->'intent') p where p.key in('issuerId','sellerId','buyerId','counterpartyId','sourceEntityId','itemId','giveItemId','receiveItemId') and p.value=to_jsonb(rid)) then accepted:=true;
     end if;
   end loop;
   if accepted and not needed ? rid then needed:=needed||jsonb_build_array(rid); end if;
 end loop;
 select coalesce(jsonb_agg(c),'[]') into all_changes from jsonb_array_elements(t.astra_natural_state->'materializations') m,
   lateral jsonb_array_elements(m->'changes') c;
 loop
   prior:=jsonb_array_length(needed);
   for receipt in select value from jsonb_array_elements(t.astra_natural_state->'materializations') loop
     if not needed ? (receipt->>'recordId') then continue; end if;
     if receipt#>'{request,ownerRef}'<>'null'::jsonb then
       for ref in select m->'recordId' from jsonb_array_elements(t.astra_natural_state->'materializations') m where
         m#>'{request,subjectRef}'=receipt#>'{request,ownerRef}' or m->'recordId'=receipt#>'{request,ownerRef}' loop
         if not needed @>jsonb_build_array(ref) then needed:=needed||jsonb_build_array(ref); end if;
       end loop;
     end if;
     if receipt#>>'{request,purpose}'='combat' then
       for change_row in select value from jsonb_array_elements(receipt->'changes') loop
         if not needed ? (change_row->>'id') then needed:=needed||jsonb_build_array(change_row->'id'); end if;
       end loop;
     end if;
   end loop;
   for change_row in select value from jsonb_array_elements(all_changes) where needed ? (value->>'id') loop
     for pair in select key,value from jsonb_each(change_row->'values') where key like '%\_id' escape '\' or key like '%\_ids' escape '\' loop
       for ref in select value from jsonb_array_elements(case when jsonb_typeof(pair.value)='array' then pair.value else jsonb_build_array(pair.value) end) loop
         if jsonb_typeof(ref)='string' and not needed @>jsonb_build_array(ref) and exists(select 1 from jsonb_array_elements(all_changes) c where c->'id'=ref) then
           needed:=needed||jsonb_build_array(ref);
         end if;
       end loop;
     end loop;
   end loop;
   exit when jsonb_array_length(needed)=prior;
 end loop;
 select coalesce(jsonb_agg(q.record_id order by q.first_n),'[]') into result from (
   select m->'recordId' record_id,min(n) first_n from jsonb_array_elements(t.astra_natural_state->'materializations') with ordinality x(m,n)
     where needed ? (m->>'recordId') group by m->'recordId') q;
 return result;
end $$;

create function rpg_private.astra_natural_insert(t rpg_private.turns) returns void
language plpgsql set search_path='' as $$
declare receipt jsonb; change_row jsonb; seen text[]:='{}'; prior text:=current_setting('rpg.astra_natural_inserting',true);
begin
 perform set_config('rpg.astra_natural_inserting',t.id::text,true);
   for change_row in select value from jsonb_array_elements(rpg_private.astra_natural_changes(t.astra_natural_state)) loop
     perform rpg_private.assert(change_row->'expectedRevision'='null'::jsonb and
       not ((change_row->>'family')||':'||(change_row->>'id'))=any(seen));
     seen:=array_append(seen,(change_row->>'family')||':'||(change_row->>'id'));
     perform rpg_private.runtime_change_before_astra_ordered(t.campaign_id,t.id,change_row);
   end loop;
 perform set_config('rpg.astra_natural_inserting',coalesce(prior,''),true);
end $$;

create function rpg_private.astra_natural_insert_revision(cid uuid,table_name text,rowdata jsonb)
returns boolean language plpgsql stable set search_path='' as $$
declare op text:=current_setting('rpg.astra_natural_inserting',true); t rpg_private.turns%rowtype; c jsonb;
begin
 if op is null or op='' then return false; end if;
 select * into t from rpg_private.turns where campaign_id=cid and id::text=op;
 perform rpg_private.assert(t.astra_natural_contract='natural-v1' and t.runtime_identity='astra-primary-v1' and
   t.status in('pending','generating','awaiting_confirmation') and t.lease_token is not null and t.lease_until>now() and
   t.expected_revision=(select revision from rpg_private.runtime_state where campaign_id=cid) and
   t.astra_natural_state->>'sourceHash'=encode(sha256(convert_to(t.source::text,'UTF8')),'hex'));
 select value into c from jsonb_array_elements(rpg_private.astra_natural_changes(t.astra_natural_state)) where
   'rpg_'||(value->>'family')=table_name and value->>'id'=rowdata->>'id';
 perform rpg_private.assert(c is not null and c->'expectedRevision'='null'::jsonb and rowdata->>'campaign_id'=cid::text and
   not exists(select 1 from jsonb_each(c->'values') p where rowdata->p.key is distinct from p.value));
 return true;
end $$;
do $$ declare d text; old text; begin
 select pg_get_functiondef('rpg_private.runtime_revision()'::regprocedure) into d; old:=d;
 d:=replace(d,E'begin\n',E'begin\n if tg_op=''INSERT'' and rpg_private.astra_natural_insert_revision(cid,tg_table_name,to_jsonb(new)) then return new; end if;\n');
 perform rpg_private.assert(d<>old); execute d;
end $$;

-- Validate the unchanged claim before insertion and again through delegated
-- reconstruction. Transaction-local original JSON is authenticated by its pin.
alter function rpg_private.astra_ordered_origin_assert(uuid,rpg_private.turns)
  rename to astra_ordered_origin_assert_before_natural_play;
create function rpg_private.astra_ordered_origin_assert(cid uuid,t rpg_private.turns)
returns void language plpgsql stable set search_path='' as $$
declare original jsonb:=nullif(current_setting('rpg.astra_natural_source',true),'')::jsonb;
 op text:=current_setting('rpg.astra_natural_operation',true); base rpg_private.turns:=t;
begin
 if op=t.id::text and t.astra_natural_contract='natural-v1' and original is not null then
   perform rpg_private.assert(t.campaign_id=cid and t.astra_natural_state->>'sourceHash'=
     encode(sha256(convert_to(original::text,'UTF8')),'hex'));
   base.source:=original;
   perform rpg_private.assert(t.source=rpg_private.astra_natural_project(original,t.astra_natural_state));
   perform rpg_private.astra_ordered_origin_assert_before_natural_play(cid,base);
 else perform rpg_private.astra_ordered_origin_assert_before_natural_play(cid,t); end if;
end $$;

alter function rpg_private.timeline_save(uuid,text,text,text) rename to timeline_save_before_natural_play;
create function rpg_private.timeline_save(cid uuid,kind text,name text,trigger_key text default null)
returns uuid language plpgsql set search_path='' as $$
declare op text:=current_setting('rpg.astra_natural_operation',true);
begin
 if kind='autosave' and trigger_key='turn:'||op and exists(select 1 from rpg_private.turns
   where campaign_id=cid and id::text=op and astra_natural_contract='natural-v1') then return null; end if;
 return rpg_private.timeline_save_before_natural_play(cid,kind,name,trigger_key);
end $$;

-- Only the existing, fully validated save activation may rebind a claim's
-- technical revision/fence. Immutable manifests and their original hash stay
-- unchanged; the active restored envelope receives the exact rebased hash.
alter function rpg_private.timeline_activate(uuid,uuid,uuid) rename to timeline_activate_before_natural_play;
create function rpg_private.timeline_activate(cid uuid,mid uuid,target uuid) returns void
language plpgsql set search_path='' as $$
declare saved jsonb; active rpg_private.turns%rowtype; expected jsonb; fence jsonb; rev integer; oldhash text;
begin
 perform rpg_private.timeline_activate_before_natural_play(cid,mid,target);
 fence:=rpg_private.timeline_fence(cid);
 select revision into strict rev from rpg_private.runtime_state where campaign_id=cid;
 for saved in select v.payload from rpg_private.timeline_manifests m,
   lateral jsonb_array_elements_text(m.refs->'rpg_private.turns') ref
   join rpg_private.timeline_versions v on v.id=ref::uuid and v.campaign_id=cid
   where m.campaign_id=cid and m.id=mid and v.payload->>'astra_natural_contract'='natural-v1'
     and v.payload->'source' is not null and v.payload->'source'<>'null'::jsonb loop
   select * into strict active from rpg_private.turns where campaign_id=cid and id=(saved->>'id')::uuid;
   oldhash:=saved#>>'{astra_natural_state,sourceHash}';
   perform rpg_private.assert(oldhash=encode(sha256(convert_to((saved->'source')::text,'UTF8')),'hex') and
     active.astra_natural_state=saved->'astra_natural_state');
   if active.source is distinct from saved->'source' then
     perform rpg_private.assert(active.expected_revision=rev and active.lease_token is null and
       (active.status in('pending','generating','awaiting_confirmation') or active.status='failed' and active.retryable));
     expected:=rpg_private.timeline_stamp(jsonb_set(saved->'source','{runtime,revision}',to_jsonb(rev)),fence,false);
     expected:=jsonb_set(expected,'{snapshot}',(expected->'snapshot')||jsonb_build_object('timeline',fence));
     if expected->'memory' is not null then expected:=jsonb_set(expected,'{memory,stateRevision}',to_jsonb(rev)); end if;
     perform rpg_private.assert(active.source=expected);
     update rpg_private.turns set astra_natural_state=jsonb_set(astra_natural_state,'{sourceHash}',
       to_jsonb(encode(sha256(convert_to(source::text,'UTF8')),'hex'))) where campaign_id=cid and id=active.id;
   end if;
 end loop;
end $$;

-- Runtime sources retain public Scene capsules and standard ground anchors.
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_natural_play;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare s jsonb; rows jsonb; origins jsonb;
begin
 s:=rpg_private.runtime_source_before_natural_play(cid,uid,mode);
 select coalesce(jsonb_agg(sc||jsonb_build_object('public_continuity',p.public_continuity) order by n),'[]') into rows
   from jsonb_array_elements(s#>'{snapshot,scenes}') with ordinality x(sc,n)
   join public.rpg_scenes p on p.campaign_id=cid and p.id=(sc->>'id')::uuid;
 s:=jsonb_set(s,'{snapshot,scenes}',rows);
 select coalesce(jsonb_agg(st||jsonb_build_object('location_id',p.location_id,'locale_key',p.locale_key) order by n),'[]') into rows
   from jsonb_array_elements(s#>'{snapshot,storages}') with ordinality x(st,n)
   join public.rpg_storages p on p.campaign_id=cid and p.id=(st->>'id')::uuid;
 s:=jsonb_set(s,'{snapshot,storages}',rows);
 select coalesce(jsonb_agg(o order by o->>'subjectRef'),'[]') into origins from (
   select distinct jsonb_build_object('subjectRef',m#>>'{request,subjectRef}',
     'kind',m#>>'{request,kind}','recordId',m->'recordId',
     'parentLocationId',t.source#>'{snapshot,publicState,current_location_id}') o
   from rpg_private.turns t,lateral jsonb_array_elements(coalesce(t.astra_natural_state->'materializations','[]')) m
   where t.campaign_id=cid and t.status='committed' and left(m#>>'{request,subjectRef}',6)<>'input:'
     and (not t.astra_natural_state ? 'effectiveRecordIds' or t.astra_natural_state->'effectiveRecordIds' ? (m->>'recordId'))
   union
   select distinct jsonb_build_object('subjectRef',sub->>'id','kind',sub->>'kind','recordId',m->'recordId',
     'parentLocationId',t.source#>'{snapshot,publicState,current_location_id}')
   from rpg_private.turns t,lateral jsonb_array_elements(coalesce(t.astra_natural_state->'materializations','[]')) m,
     public.rpg_scenes sc,lateral jsonb_array_elements(coalesce(sc.public_continuity->'subjects','[]')) sub
   where t.campaign_id=cid and t.status='committed' and sc.campaign_id=cid and
     (not t.astra_natural_state ? 'effectiveRecordIds' or t.astra_natural_state->'effectiveRecordIds' ? (m->>'recordId')) and
     sub->>'originOperationId'=t.id::text and sub->>'kind'=m#>>'{request,kind}' and
     (m#>>'{request,subjectRef}')=('input:'||(sub->>'name'))
 ) q;
 return s||jsonb_build_object('astraNaturalOrigins',origins);
end $$;

-- Current public capsules and durable companions supplement historical actors;
-- a historical mention alone does not keep an NPC present forever.
alter function rpg_private.astra_takeover_context(uuid,jsonb) rename to astra_takeover_context_before_natural_play;
create function rpg_private.astra_takeover_context(cid uuid,s jsonb) returns jsonb
language plpgsql stable set search_path='' as $$
declare w jsonb:=rpg_private.astra_takeover_context_before_natural_play(cid,s); origin jsonb; actor jsonb;
 current_capsule jsonb; current_place text:=s#>>'{snapshot,publicState,current_location_id}'; eligible boolean;
begin
 select sc->'public_continuity' into current_capsule from jsonb_array_elements(s#>'{snapshot,scenes}') sc
   where sc->>'id'=s#>>'{snapshot,publicState,current_scene_id}' and sc->>'revision'='1';
 for origin in select value from jsonb_array_elements(coalesce(s->'astraNaturalOrigins','[]')) loop
   if origin->>'kind' in('npc','creature') then
     select e into actor from jsonb_array_elements(s#>'{snapshot,entities}') e where e->>'id'=origin->>'recordId';
     eligible:=actor is not null and (actor->>'kind'='companion' and
       s#>'{runtime,configuration,presentEntityIds}' ? (actor->>'id') or
       current_capsule->>'parentLocationId'=current_place and exists(select 1 from
         jsonb_array_elements(coalesce(current_capsule->'subjects','[]')) sub where sub->>'id'=origin->>'subjectRef'));
     if eligible and not w->'presentEntityIds' ? (actor->>'id') then
       w:=jsonb_set(w,'{presentEntityIds}',w->'presentEntityIds'||jsonb_build_array(actor->'id'));
       w:=jsonb_set(w,'{actors}',w->'actors'||jsonb_build_array(jsonb_build_object('entityId',actor->'id',
         'publicName',actor->'name','publicCapabilities','[]'::jsonb,'publicLimitations','[]'::jsonb,'publicKnowledge','[]'::jsonb)));
     end if;
   elsif origin->>'kind'='place' and origin->>'parentLocationId'=current_place and
     exists(select 1 from jsonb_array_elements(s#>'{snapshot,locations}') l where l->>'id'=origin->>'recordId' and l->>'status' in('known','visited'))
     and not w->'routeLocationIds' ? (origin->>'recordId') then
       w:=jsonb_set(w,'{routeLocationIds}',w->'routeLocationIds'||jsonb_build_array(origin->'recordId'));
   elsif origin->>'kind'='place' and origin->>'recordId'=current_place and
     not w->'routeLocationIds' ? (origin->>'parentLocationId') then
       w:=jsonb_set(w,'{routeLocationIds}',w->'routeLocationIds'||jsonb_build_array(origin->'parentLocationId'));
   end if;
 end loop;
 -- A durable NPC's public Entity identity remains available to bounded
 -- mechanics while the standard presence configuration says it is present.
 -- Clearing a scene-only capsule must not erase its merchant identity.
 for actor in select e from jsonb_array_elements(s#>'{snapshot,entities}') e where
   e->>'kind' in('npc','companion') and s#>'{runtime,configuration,presentEntityIds}' ? (e->>'id') loop
   if not exists(select 1 from jsonb_array_elements(w->'actors') a where a->>'entityId'=actor->>'id') then
     w:=jsonb_set(w,'{actors}',w->'actors'||jsonb_build_array(jsonb_build_object('entityId',actor->'id',
       'publicName',actor->'name','publicCapabilities','[]'::jsonb,'publicLimitations','[]'::jsonb,'publicKnowledge','[]'::jsonb)));
   end if;
 end loop;
 return w;
end $$;

alter function rpg_private.living_world_local_route(uuid,uuid,uuid,uuid,uuid)
  rename to living_world_local_route_before_natural_play;
create function rpg_private.living_world_local_route(uid uuid,cid uuid,controller uuid,from_id uuid,to_id uuid)
returns boolean language plpgsql stable set search_path='' as $$
declare op text:=current_setting('rpg.astra_natural_operation',true); t rpg_private.turns%rowtype; origin jsonb;
begin
 if op is not null and op<>'' then
   select * into t from rpg_private.turns where campaign_id=cid and owner_id=uid and id::text=op and astra_natural_contract='natural-v1';
   if t.id is not null and t.source#>>'{runtime,configuration,controlledEntityIds,0}'=controller::text then
     for origin in select value from jsonb_array_elements(coalesce(t.source->'astraNaturalOrigins','[]')) loop
       if origin->>'kind'='place' and (origin->>'parentLocationId'=from_id::text and origin->>'recordId'=to_id::text or
         origin->>'recordId'=from_id::text and origin->>'parentLocationId'=to_id::text) then return true; end if;
     end loop;
     if from_id::text=t.source#>>'{snapshot,publicState,current_location_id}' and exists(select 1 from
       jsonb_array_elements(t.astra_natural_state->'materializations') m where m#>>'{request,kind}'='place' and
       m->>'recordId'=to_id::text and t.astra_natural_state->'effectiveRecordIds' ? (m->>'recordId')) then return true; end if;
   end if;
 end if;
 return rpg_private.living_world_local_route_before_natural_play(uid,cid,controller,from_id,to_id);
end $$;

create function rpg_private.astra_natural_capsule(t rpg_private.turns,proposal jsonb,scene_id uuid,parent uuid)
returns jsonb language plpgsql stable set search_path='' as $$
declare locale jsonb; entry jsonb; original jsonb; subject jsonb; subjects jsonb:='[]'; idx integer:=0;
 matches integer; capsule jsonb;
begin
 perform rpg_private.fields(proposal,array['locale','subjects']);
 perform rpg_private.assert(jsonb_typeof(proposal->'subjects')='array' and jsonb_array_length(proposal->'subjects')<=12);
 locale:=proposal->'locale';
 if locale<>'null'::jsonb then
   perform rpg_private.fields(locale,array['name','description']);
   perform rpg_private.assert(rpg_private.astra_natural_text(locale->>'name',120) and
     rpg_private.astra_natural_text(locale->>'description',800,true));
 end if;
 for entry in select value from jsonb_array_elements(proposal->'subjects') loop
   perform rpg_private.fields(entry,array['subjectRef','kind','name','description']);
   perform rpg_private.assert(entry->>'kind' in('npc','creature','place','item') and
     rpg_private.astra_natural_text(entry->>'name',100) and rpg_private.astra_natural_text(entry->>'description',600,true));
   original:=null;
   if entry->'subjectRef'<>'null'::jsonb then
     select sub into original from jsonb_array_elements(t.source#>'{snapshot,scenes}') sc,
       lateral jsonb_array_elements(coalesce(sc#>'{public_continuity,subjects}','[]')) sub where
       sc->>'role'='narration' and sc->>'revision'='1' and sub->>'id'=entry->>'subjectRef'
       order by (sc->>'id'=t.source#>>'{snapshot,publicState,current_scene_id}') desc,
         (sc->>'sequence')::integer desc limit 1;
     perform rpg_private.assert(original is not null and original->'kind'=entry->'kind');
   else
     select count(distinct sub->>'id') into matches from jsonb_array_elements(t.source#>'{snapshot,scenes}') sc,
       lateral jsonb_array_elements(coalesce(sc#>'{public_continuity,subjects}','[]')) sub where
       sc->>'role'='narration' and sc->>'revision'='1' and sc#>>'{public_continuity,parentLocationId}'=parent::text and
       coalesce(translate(sc#>>'{public_continuity,locale,name}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'')=
         coalesce(translate(locale->>'name','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'') and
       sub->'kind'=entry->'kind' and
       translate(sub->>'name','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=
         translate(entry->>'name','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz');
     perform rpg_private.assert(matches<=1);
     if matches=1 then select sub into original from jsonb_array_elements(t.source#>'{snapshot,scenes}') sc,
       lateral jsonb_array_elements(coalesce(sc#>'{public_continuity,subjects}','[]')) sub where
       sc->>'role'='narration' and sc->>'revision'='1' and sc#>>'{public_continuity,parentLocationId}'=parent::text and
       coalesce(translate(sc#>>'{public_continuity,locale,name}','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'')=
         coalesce(translate(locale->>'name','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'') and
       sub->'kind'=entry->'kind' and translate(sub->>'name','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')=
         translate(entry->>'name','ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')
       order by (sc->>'id'=t.source#>>'{snapshot,publicState,current_scene_id}') desc,
         (sc->>'sequence')::integer desc limit 1;
       perform rpg_private.assert(original->'name'=entry->'name');
     end if;
   end if;
   subject:=case when original is null then jsonb_build_object('id',rpg_private.wave4_id(t.id,'scene-subject:'||idx::text),
       'kind',entry->'kind','name',entry->'name','description',entry->'description','originSceneId',scene_id,'originOperationId',t.id)
     else original||jsonb_build_object('name',entry->'name','description',entry->'description') end;
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(subjects) x where x->'id'=subject->'id'));
   subjects:=subjects||jsonb_build_array(subject);idx:=idx+1;
 end loop;
 capsule:=jsonb_build_object('schemaVersion',1,'parentLocationId',parent,'locale',locale,'subjects',subjects);
 perform rpg_private.assert(octet_length(capsule::text)<=12000);
 return capsule;
end $$;

create function rpg_private.astra_natural_scene_insert() returns trigger
language plpgsql set search_path='' as $$
declare op text:=current_setting('rpg.astra_natural_operation',true); t rpg_private.turns%rowtype;
 original jsonb:=nullif(current_setting('rpg.astra_natural_source',true),'')::jsonb; parent uuid; resolution jsonb; changed jsonb;
begin
 if new.role<>'narration' or op is null or op='' then return new; end if;
 select * into strict t from rpg_private.turns where campaign_id=new.campaign_id and id::text=op;
 perform rpg_private.assert(t.astra_natural_contract='natural-v1' and t.astra_natural_state#>'{publication,continuity}'<>'null'::jsonb and
   original is not null and t.astra_natural_state->>'sourceHash'=encode(sha256(convert_to(original::text,'UTF8')),'hex'));
 parent:=(original#>>'{snapshot,publicState,current_location_id}')::uuid;
 resolution:=coalesce(t.astra_ordered_effects->'resolution',t.checkpoint#>'{astraPrimary,finalProposal,resolution}');
 for changed in select value from jsonb_array_elements(resolution->'changes') loop
   if changed->>'family'='public_state' and changed#>>'{values,current_location_id}' is not null then
     parent:=(changed#>>'{values,current_location_id}')::uuid;
   end if;
 end loop;
 t.source:=original;
 new.public_continuity:=rpg_private.astra_natural_capsule(t,t.astra_natural_state#>'{publication,continuity}',new.id,parent);
 return new;
end $$;
create trigger astra_natural_scene_insert before insert on public.rpg_scenes
  for each row execute function rpg_private.astra_natural_scene_insert();

-- Preserve every historical target-turn predicate. Natural turns alone accept
-- a live enemy target whose own initiative turn is not active.
do $$ declare d text; old text; needle text; replacement text; begin
 select pg_get_functiondef('public.rpg_runtime_before_astra_takeover(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 old:=d;
 needle:=E'p.value->>''entity_id''=call->>''targetId'' and\n             p.value#>''{public_resources,active}''=''true'' and';
 replacement:=E'p.value->>''entity_id''=call->>''targetId'' and\n             (t.astra_natural_contract=''natural-v1'' or p.value#>''{public_resources,active}''=''true'') and';
 d:=replace(d,needle,replacement);
 d:=replace(d,replace(needle,E'\n',E'\r\n'),replace(replacement,E'\n',E'\r\n'));
 needle:=E'oldrow#>''{public_resources,active}''=''true'' and';
 replacement:=E'(oldrow#>''{public_resources,active}''=''true'' or\n          (t.astra_natural_contract=''natural-v1'' and defeated and action_cost=0 and move_cost=0)) and';
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,replacement);
 perform rpg_private.assert(d<>old); execute d;
end $$;

alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_natural_play;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare t rpg_private.turns%rowtype; original rpg_private.turns%rowtype; result jsonb; requested text;
 state jsonb; receipt jsonb; pos integer; projected jsonb; captured jsonb; publication jsonb;
 previous jsonb; command_row jsonb; command_id uuid; scene_id uuid; continuity jsonb;
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then
   raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action not in('astra_natural_contract','claim','play','get'));
 select * into t from rpg_private.turns where campaign_id=p_campaign_id and owner_id=p_owner_id and
   id=(p_payload->>'operationId')::uuid for update;
 if p_action='astra_natural_contract' then
   perform rpg_private.fields(p_payload,array['operationId']);
   return case when t.id is null and rpg_private.astra_takeover_active(p_campaign_id) then 'null'::jsonb
     else to_jsonb(coalesce(t.astra_natural_contract,'legacy-natural')) end;
 elsif p_action='begin' then
   requested:=p_payload->>'serverNaturalContract';
   perform rpg_private.assert(requested is null or requested='natural-v1' and
     p_payload->>'serverAstraContract'='unified-v1' and p_payload->>'serverRuntime'='astra-primary-v1' and
     p_payload->>'mode'='game' and rpg_private.astra_takeover_active(p_campaign_id));
   if t.id is not null and t.astra_natural_contract is distinct from requested then raise exception 'rpg_conflict'; end if;
   result:=public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload-'serverNaturalContract',p_timeline);
   if t.id is null and requested is not null then
     update rpg_private.turns set astra_natural_contract=requested,
       astra_natural_state='{"schemaVersion":1,"materializations":[]}'::jsonb
       where campaign_id=p_campaign_id and id=(p_payload->>'operationId')::uuid;
   end if; return result;
 end if;
 if t.astra_natural_contract is distinct from 'natural-v1' then
   return public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 if p_action='claim' then
   result:=public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
   if result is null then return null; end if;
   select * into strict t from rpg_private.turns where campaign_id=p_campaign_id and id=t.id;
   if t.astra_natural_state->>'sourceHash' is null then
     update rpg_private.turns set astra_natural_state=astra_natural_state||jsonb_build_object('sourceHash',
       encode(sha256(convert_to(source::text,'UTF8')),'hex')) where campaign_id=p_campaign_id and id=t.id returning * into t;
   end if;
   return result||jsonb_build_object('astraNaturalContract',t.astra_natural_contract,'astraNaturalState',t.astra_natural_state);
 end if;
 if p_action not in('astra_materialize','astra_natural_publication','astra_tool','reroll','checkpoint','commit') then
   return public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 end if;
 if p_action='commit' and t.status='committed' then
   return public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline); end if;
 perform rpg_private.assert(t.source is not null and t.runtime_identity='astra-primary-v1' and
   t.astra_response_contract='unified-v1' and t.astra_response_mode in('public-unified','private-informed') and
   t.lease_token=(p_payload->>'token')::uuid and t.lease_until>now() and
   t.status in('pending','generating','awaiting_confirmation') and
   t.expected_revision=(p_payload->>'expectedRevision')::integer and
   t.expected_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id));
 if p_action='checkpoint' and p_payload ? 'astraNaturalPublication' then
   perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision',
     'checkpoint','status','astraNaturalPublication']);
   perform rpg_private.assert(nullif(p_payload#>'{checkpoint,astraPrimary,finalProposal}','null'::jsonb) is not null);
   -- Publication and its validated final/narration checkpoint are one RPC
   -- transaction. A failed guard leaves neither half pinned; an uncertain
   -- committed response leaves both available for exact checkpoint replay.
   perform public.rpg_runtime(p_owner_id,p_campaign_id,'astra_natural_publication',
     (p_payload-array['checkpoint','status','astraNaturalPublication'])||
       jsonb_build_object('publication',p_payload->'astraNaturalPublication'),p_timeline);
   return public.rpg_runtime(p_owner_id,p_campaign_id,'checkpoint',
     p_payload-'astraNaturalPublication',p_timeline);
 end if;
 projected:=rpg_private.astra_natural_validate(t);
 if p_action='astra_materialize' then
   perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','position','request']);
   perform rpg_private.assert(p_payload->>'campaignId'=p_campaign_id::text and
     t.checkpoint#>'{astraPrimary,finalProposal}'='null'::jsonb);
   pos:=(p_payload->>'position')::integer; state:=t.astra_natural_state;
   perform rpg_private.assert(pos between 0 and 7 and pos<=jsonb_array_length(state->'materializations'));
   if pos<jsonb_array_length(state->'materializations') then
     receipt:=state->'materializations'->pos;
     if receipt->'request'<>p_payload->'request' then raise exception 'rpg_conflict'; end if;
     return receipt;
   end if;
   receipt:=rpg_private.astra_natural_materialization(t,p_payload->'request',pos);
   update rpg_private.turns set astra_natural_state=jsonb_set(state,'{materializations}',
     state->'materializations'||jsonb_build_array(receipt)) where campaign_id=p_campaign_id and id=t.id;
   return receipt;
 elsif p_action='astra_natural_publication' then
   perform rpg_private.fields(p_payload,array['campaignId','operationId','token','expectedRevision','publication']);
   publication:=p_payload->'publication'; perform rpg_private.fields(publication,array['continuity','behavior','effectiveRecordIds']);
   perform rpg_private.assert(jsonb_typeof(publication->'behavior')='array' and jsonb_array_length(publication->'behavior')<=2 and
     (select count(*)=count(distinct value->>'actorId') from jsonb_array_elements(publication->'behavior')) and
     (publication->'continuity'='null'::jsonb or jsonb_typeof(publication->'continuity')='object') and
     jsonb_typeof(publication->'effectiveRecordIds')='array' and jsonb_array_length(publication->'effectiveRecordIds')<=8 and
     (select count(*)=count(distinct value) from jsonb_array_elements(publication->'effectiveRecordIds')) and
     not exists(select 1 from jsonb_array_elements(publication->'effectiveRecordIds') rid where not exists(select 1
       from jsonb_array_elements(t.astra_natural_state->'materializations') m where m->'recordId'=rid)));
   if t.astra_natural_state ? 'effectiveRecordIds' and t.astra_natural_state->'effectiveRecordIds'<>publication->'effectiveRecordIds' then raise exception 'rpg_conflict'; end if;
   for receipt in select value from jsonb_array_elements(publication->'behavior') loop
     perform rpg_private.fields(receipt,array['actorId','stance','tone','intensity']);
     perform rpg_private.assert(receipt->>'stance' in('accept','refuse','hesitate','deflect','leave','attack','offer_conditions') and
       receipt->>'tone' in('neutral','warm','firm','guarded','angry','fearful','tired') and
       rpg_private.wave4_integer(receipt->'intensity',1,3) and
       exists(select 1 from jsonb_array_elements(projected#>'{snapshot,entities}') e where e->>'id'=receipt->>'actorId' and
         e->>'kind' in('npc','companion') and projected#>'{worldTakeover,presentEntityIds}' ? (e->>'id')) and
       not projected#>'{runtime,configuration,controlledEntityIds}' ? (receipt->>'actorId'));
   end loop;
   if publication->'continuity'<>'null'::jsonb then
     perform rpg_private.astra_natural_capsule(t,publication->'continuity',t.id,
       (projected#>>'{snapshot,publicState,current_location_id}')::uuid);
   end if;
   publication:=publication-'effectiveRecordIds';
   previous:=t.astra_natural_state->'publication';
   if previous is not null and (previous->'behavior'<>publication->'behavior' or
     previous->'continuity'<>'null'::jsonb and previous->'continuity'<>publication->'continuity') then raise exception 'rpg_conflict'; end if;
   state:=t.astra_natural_state||jsonb_build_object('publication',publication,'effectiveRecordIds',p_payload#>'{publication,effectiveRecordIds}');
   update rpg_private.turns set astra_natural_state=state where campaign_id=p_campaign_id and id=t.id;
   return state;
 end if;
 original:=t;
 if p_action='commit' or p_action='checkpoint' and nullif(p_payload#>'{checkpoint,astraPrimary,finalProposal}','null'::jsonb) is not null then
   previous:=case when p_action='checkpoint' then p_payload#>'{checkpoint,astraEffects}' else t.astra_ordered_effects end;
   perform rpg_private.assert(t.astra_natural_state->'effectiveRecordIds'=rpg_private.astra_natural_effective_ids(t,previous));
 end if;
 if p_action in('astra_tool','reroll') then
   -- Local PL/pgSQL values survive the explicitly caught rollback. The real
   -- predecessor validates all dice, defense, lease, budget and replay guards.
   begin
     perform rpg_private.astra_natural_insert(t);
     update rpg_private.turns set source=projected where campaign_id=p_campaign_id and id=t.id;
     result:=public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
     select checkpoint into captured from rpg_private.turns where campaign_id=p_campaign_id and id=t.id;
     if p_action='reroll' then
       command_id:=(p_payload#>>'{command,commandId}')::uuid;
       select to_jsonb(c) into command_row from rpg_private.runtime_commands c where campaign_id=p_campaign_id and id=command_id;
     end if;
     -- Copy/de-toast while provisional rows still exist. A returned JSONB
     -- datum may otherwise retain an on-disk TOAST pointer owned by the inner
     -- transaction, which deliberately rolls back immediately below.
     captured:=(captured::text)::jsonb;
     result:=(result::text)::jsonb;
     command_row:=(command_row::text)::jsonb;
     raise exception 'natural validation rollback' using errcode='PZ052';
   exception when sqlstate 'PZ052' then null; end;
   perform rpg_private.assert(captured-array['checks','astraPrimary']=original.checkpoint-array['checks','astraPrimary'] and
     captured#>'{astraPrimary,finalProposal}'=original.checkpoint#>'{astraPrimary,finalProposal}');
   update rpg_private.turns set checkpoint=captured,updated_at=now() where campaign_id=p_campaign_id and id=t.id;
   if command_row is not null and not exists(select 1 from rpg_private.runtime_commands where campaign_id=p_campaign_id and id=command_id) then
     insert into rpg_private.runtime_commands select (jsonb_populate_record(null::rpg_private.runtime_commands,command_row)).*;
   end if;
   return result;
 end if;
 perform rpg_private.astra_ordered_origin_assert_before_natural_play(p_campaign_id,t);
 perform set_config('rpg.astra_natural_operation',t.id::text,true);
 perform set_config('rpg.astra_natural_source',t.source::text,true);
 if p_action='checkpoint' then
   -- Pure shadow reconstruction needs no public insert until commit. Origin
   -- guard authenticates original rows; effects operate on server virtual rows.
   update rpg_private.turns set source=projected where campaign_id=p_campaign_id and id=t.id;
   result:=public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 else
   perform rpg_private.astra_natural_insert(t);
   update rpg_private.turns set source=projected where campaign_id=p_campaign_id and id=t.id;
   result:=public.rpg_runtime_before_natural_play(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
   perform rpg_private.assert(result->>'status'='committed');
   publication:=t.astra_natural_state->'publication';
   perform rpg_private.assert(publication->'continuity'<>'null'::jsonb);
   scene_id:=(result->>'narrationSceneId')::uuid;
   if scene_id is null then select (e.payload->>'narrationSceneId')::uuid into scene_id
     from rpg_private.runtime_events e where e.campaign_id=p_campaign_id and e.operation_id=t.id order by e.created_at desc limit 1; end if;
   perform rpg_private.assert(exists(select 1 from public.rpg_scenes where campaign_id=p_campaign_id and id=scene_id and role='narration'));
   continuity:=rpg_private.astra_natural_capsule(original,publication->'continuity',scene_id,
     (select current_location_id from public.rpg_public_state where campaign_id=p_campaign_id));
   perform rpg_private.assert(exists(select 1 from public.rpg_scenes where campaign_id=p_campaign_id and
     id=scene_id and revision=1 and public_continuity=continuity));
   update rpg_private.turns set committed_revision=(select revision from rpg_private.runtime_state where campaign_id=p_campaign_id)
     where campaign_id=p_campaign_id and id=t.id returning * into t;
   result:=result||rpg_private.runtime_public_turn(t);
 end if;
 update rpg_private.turns set source=original.source where campaign_id=p_campaign_id and id=t.id;
 perform set_config('rpg.astra_natural_source','',true);
 perform set_config('rpg.astra_natural_operation','',true);
 if p_action='commit' and (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then
   perform rpg_private.timeline_save(p_campaign_id,'autosave','After action','turn:'||t.id::text);
 end if;
 return result;
end $$;

revoke all on function public.rpg_runtime_before_natural_play(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on function rpg_private.astra_natural_text(text,integer,boolean),
 rpg_private.astra_natural_locale(jsonb),rpg_private.astra_natural_project(jsonb,jsonb),
 rpg_private.astra_natural_changes(jsonb),rpg_private.astra_natural_effective_ids(rpg_private.turns,jsonb),
 rpg_private.astra_natural_materialization(rpg_private.turns,jsonb,integer),
 rpg_private.astra_natural_validate(rpg_private.turns),rpg_private.astra_natural_insert(rpg_private.turns),
 rpg_private.astra_natural_insert_revision(uuid,text,jsonb),
 rpg_private.astra_natural_capsule(rpg_private.turns,jsonb,uuid,uuid),rpg_private.astra_natural_scene_insert(),
 rpg_private.astra_ordered_origin_assert(uuid,rpg_private.turns),
 rpg_private.astra_ordered_origin_assert_before_natural_play(uuid,rpg_private.turns),
 rpg_private.runtime_change_before_astra_ordered(uuid,uuid,jsonb),
 rpg_private.runtime_change_before_natural_play(uuid,uuid,jsonb),
 rpg_private.timeline_save(uuid,text,text,text),rpg_private.timeline_save_before_natural_play(uuid,text,text,text),
 rpg_private.timeline_activate(uuid,uuid,uuid),rpg_private.timeline_activate_before_natural_play(uuid,uuid,uuid),
 rpg_private.runtime_source(uuid,uuid,text),rpg_private.runtime_source_before_natural_play(uuid,uuid,text)
 from public,anon,authenticated,service_role;
revoke all on function rpg_private.astra_takeover_context(uuid,jsonb),
 rpg_private.astra_takeover_context_before_natural_play(uuid,jsonb),
 rpg_private.living_world_local_route(uuid,uuid,uuid,uuid,uuid),
 rpg_private.living_world_local_route_before_natural_play(uuid,uuid,uuid,uuid,uuid)
 from public,anon,authenticated,service_role;

-- NATURAL_EFFECT_ADAPTER_BEGIN
-- Existing combat setup/end semantics, reconstructed from the same fenced
-- source. Promotion and ordered effects share this deterministic constructor.
create function rpg_private.astra_natural_encounter_resolution(t rpg_private.turns,actions jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare work jsonb:=jsonb_build_object('source',t.source,'changes','[]'::jsonb);
 s jsonb:=t.source; config jsonb:=s#>'{runtime,configuration}'; action jsonb; actor jsonb;
 encounter jsonb; part jsonb; settings jsonb:=s#>'{snapshot,settings,values}';
 outcomes jsonb:='[]'; participants jsonb; canonical jsonb; conditions jsonb;
 hero uuid:=(config#>>'{controlledEntityIds,0}')::uuid; eid uuid; pid uuid; actor_id uuid;
 idx integer:=0; ord integer; original_max numeric; new_max integer; new_hp integer;
begin
 perform rpg_private.assert(t.astra_natural_contract='natural-v1' and t.runtime_identity='astra-primary-v1' and
   t.input->>'mode'='game' and s#>>'{snapshot,campaign,id}'=t.campaign_id::text and
   s#>>'{runtime,campaignId}'=t.campaign_id::text and
   (s#>>'{runtime,revision}')::integer=t.expected_revision and s->'worldTakeover' is not null and
   jsonb_array_length(config->'controlledEntityIds')=1 and jsonb_typeof(actions)='array' and
   jsonb_array_length(actions) between 1 and 6);
 perform rpg_private.assert((rpg_private.astra_shadow_row(s,'entities',hero)->>'kind')='player' and
   (rpg_private.astra_shadow_row(s,'entities',hero)->>'campaign_id')=t.campaign_id::text);
 for action in select value from jsonb_array_elements(actions) loop
   s:=work->'source';
   select value into encounter from jsonb_array_elements(s#>'{runtime,encounters}') x
     where value->>'campaign_id'=t.campaign_id::text and value->>'status'='active' limit 1;
   if action->>'kind'='encounter.start' then
     perform rpg_private.fields(action,array['kind','participantIds']);
     participants:=action->'participantIds';
     perform rpg_private.assert(encounter is null and jsonb_typeof(participants)='array' and
       jsonb_array_length(participants) between 2 and 8 and participants ? hero::text and
       (select count(*)=count(distinct value) from jsonb_array_elements_text(participants)) and
       not exists(select 1 from jsonb_array_elements(s#>'{runtime,restRecords}') x where value->>'status'='planned'));
     select jsonb_build_array(hero::text)||coalesce(jsonb_agg(value order by value),'[]'::jsonb) into canonical
       from jsonb_array_elements_text(participants) x where value<>hero::text;
     perform rpg_private.assert(canonical=participants and exists(select 1 from jsonb_array_elements(participants) x
       join lateral (select rpg_private.astra_shadow_row(s,'entities',(x.value#>>'{}')::uuid) rowdata) a on true
       where a.rowdata->>'kind'='npc'));
     eid:=rpg_private.wave4_id(t.id,'encounter:'||idx::text);
     perform rpg_private.assert(rpg_private.astra_shadow_row(s,'encounters',eid) is null);
     work:=rpg_private.astra_mechanic_write(work,'encounters',eid,jsonb_build_object('status','active','round',1,
       'outcome',null,'settings_revision',s#>'{snapshot,settings,revision}','public_summary','Encounter active.'));
     ord:=0;
     for actor_id in select value::uuid from jsonb_array_elements_text(participants) loop
       actor:=rpg_private.astra_shadow_row(s,'entities',actor_id);
       perform rpg_private.assert(actor->>'campaign_id'=t.campaign_id::text and config->'presentEntityIds' ? actor_id::text and
         not actor->'conditions' ? 'dead' and not actor->'conditions' ? 'withdrawn' and
         (actor->>'hp')::integer>0 and (actor->>'max_hp')::integer>0);
       select (value#>>'{public_resources,originalMaxHp}')::numeric into original_max
         from jsonb_array_elements(s#>'{runtime,participants}') with ordinality x(value,ordinality)
         where value->>'entity_id'=actor_id::text and jsonb_typeof(value#>'{public_resources,originalMaxHp}')='number'
         order by ordinality desc limit 1;
       original_max:=coalesce(original_max,(actor->>'max_hp')::numeric);
       if actor->>'kind'='npc' and settings#>'{rulesSystem,enemyHpScaling}'='true'::jsonb then
         new_max:=greatest(1,ceil(original_max*(settings#>>'{difficulty,enemyHpMultiplier}')::numeric));
         new_hp:=greatest(1,ceil((actor->>'hp')::numeric/(actor->>'max_hp')::numeric*new_max));
         work:=rpg_private.astra_mechanic_write(work,'entities',actor_id,jsonb_build_object('max_hp',new_max,'hp',new_hp));
       end if;
       pid:=rpg_private.wave4_id(t.id,'participant:'||idx::text||':'||actor_id::text);
       perform rpg_private.assert(rpg_private.astra_shadow_row(s,'encounter_participants',pid) is null);
       work:=rpg_private.astra_mechanic_write(work,'encounter_participants',pid,jsonb_build_object('encounter_id',eid,
         'entity_id',actor_id,'public_name',actor->'name','turn_order',ord,
         'public_position',jsonb_build_object('position','nearby'),
         'public_resources',jsonb_build_object('action',1,'move',1,'reaction',1,'active',ord=0,
           'defending',false,'withdrawn',false,'originalMaxHp',original_max)));
       ord:=ord+1;
     end loop;
     outcomes:=outcomes||jsonb_build_array(jsonb_build_object('kind','encounter.start',
       'text','The encounter began with recorded participants and separate action, move and reaction budgets.',
       'entityIds',participants,'itemIds','[]'::jsonb));
   elsif action->>'kind'='encounter.end' then
     perform rpg_private.fields(action,array['kind','outcome']);
     perform rpg_private.assert(encounter is not null and action->>'outcome' in
       ('victory','escape','surrender','negotiation','objective-completion'));
     if action->>'outcome'='victory' then
       perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(s#>'{runtime,participants}') x
         where value->>'encounter_id'=encounter->>'id' and not config->'controlledEntityIds' ? (value->>'entity_id') and
         coalesce(value#>'{public_resources,withdrawn}','false'::jsonb)<>'true'::jsonb));
     elsif action->>'outcome'='objective-completion' then
       perform rpg_private.assert(exists(select 1 from jsonb_array_elements(s#>'{snapshot,quests}') x where value->>'status'='complete'));
     end if;
     work:=rpg_private.astra_mechanic_write(work,'encounters',(encounter->>'id')::uuid,
       jsonb_build_object('status','ended','outcome',action->'outcome',
         'public_summary','The encounter ended. No automatic recovery or loot was granted.'));
     for part in select value from jsonb_array_elements(s#>'{runtime,participants}') x where value->>'encounter_id'=encounter->>'id' loop
       work:=rpg_private.astra_mechanic_write(work,'encounter_participants',(part->>'id')::uuid,
         jsonb_build_object('public_resources',(part->'public_resources')||jsonb_build_object('active',false)));
     end loop;
     for actor in select value from jsonb_array_elements(s#>'{snapshot,entities}') x
       where config->'controlledEntityIds' ? (value->>'id') and value->'conditions' ? 'withdrawn' and not value->'conditions' ? 'dead' loop
       select coalesce(jsonb_agg(value),'[]'::jsonb) into conditions from jsonb_array_elements(actor->'conditions') x where value<>'"withdrawn"'::jsonb;
       work:=rpg_private.astra_mechanic_write(work,'entities',(actor->>'id')::uuid,jsonb_build_object('conditions',conditions));
     end loop;
     outcomes:=outcomes||jsonb_build_array(jsonb_build_object('kind','encounter.end',
       'text','The encounter ended with its recorded outcome; health and inventory remain authoritative.',
       'entityIds','[]'::jsonb,'itemIds','[]'::jsonb));
   else raise exception 'rpg_validation'; end if;
   idx:=idx+1;
 end loop;
 return jsonb_build_object('changes',work->'changes','worldMinutes',s#>'{runtime,worldMinutes}',
   'configuration',config,'outcomes',outcomes);
end $$;

create function rpg_private.astra_natural_encounter_expected(t rpg_private.turns,plan jsonb)
returns jsonb language plpgsql stable set search_path='' as $$
begin
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent','actions','resolution','safety','publicOutcome']);
 perform rpg_private.fields(plan->'intent',array['kind','actions','restSafety']);
 perform rpg_private.assert(plan->'schemaVersion'='1'::jsonb and plan->>'kind'='mechanic_actions' and
   plan#>>'{intent,kind}'='mechanic_actions' and plan#>'{intent,actions}'=plan->'actions' and
   plan#>'{intent,restSafety}'='null'::jsonb and plan->'safety'='null'::jsonb);
 return jsonb_build_object('schemaVersion',1,'kind','mechanic_actions','intent',plan->'intent',
   'actions',plan->'actions','safety',null,
   'resolution',rpg_private.astra_natural_encounter_resolution(t,plan->'actions'),
   'publicOutcome',jsonb_build_object('kind','mechanic_actions','completedRest',false,'restId',null));
end $$;
-- Independent bounded possession/party reconstruction. The effect position is
-- supplied by the existing ordered guard after validating the original index.
create function rpg_private.astra_natural_effect_expected(cid uuid,t rpg_private.turns,plan jsonb,effect_index integer)
returns jsonb language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare s jsonb:=t.source; intent jsonb:=plan->'intent'; kind text:=plan->>'kind';
 config jsonb:=s#>'{runtime,configuration}'; work jsonb:=jsonb_build_object('source',s,'changes','[]'::jsonb);
 hero uuid; actor jsonb; target jsonb; item jsonb; stored jsonb; destination jsonb;
 entity_id uuid; item_id uuid; storage_id uuid; split_id uuid; parent uuid;
 quantity integer; locale text; from_ground boolean; transferred uuid; outcome jsonb; ids jsonb;
begin
 perform rpg_private.fields(plan,array['schemaVersion','kind','intent','resolution','publicOutcome']);
 perform rpg_private.assert(t.astra_natural_contract='natural-v1' and t.runtime_identity='astra-primary-v1' and
   t.campaign_id=cid and t.input->>'mode'='game' and s#>>'{snapshot,campaign,id}'=cid::text and
   s#>>'{runtime,campaignId}'=cid::text and (s#>>'{runtime,revision}')::integer=t.expected_revision and
   jsonb_array_length(config->'controlledEntityIds')=1 and s->'worldTakeover' is not null and
   plan->'schemaVersion'='1'::jsonb and intent->>'kind'=kind and effect_index between 0 and 5 and
   not exists(select 1 from jsonb_array_elements(s#>'{runtime,encounters}') e where e.value->>'status'='active'));
 hero:=(config#>>'{controlledEntityIds,0}')::uuid;
 perform rpg_private.assert((rpg_private.astra_shadow_row(s,'entities',hero)->>'kind')='player' and
   (rpg_private.astra_shadow_row(s,'entities',hero)->>'campaign_id')=cid::text);
 if kind='companion_join' then
   perform rpg_private.fields(intent,array['kind','entityId']);
   entity_id:=(intent->>'entityId')::uuid;
   actor:=rpg_private.astra_shadow_row(s,'entities',entity_id);
   perform rpg_private.assert(actor->>'campaign_id'=cid::text and actor->>'kind' in('npc','companion') and
     entity_id<>hero and config->'presentEntityIds' ? entity_id::text);
   select value into stored from jsonb_array_elements(s#>'{snapshot,storages}') x
     where value->>'campaign_id'=cid::text and value->>'entity_id'=entity_id::text and
       value->>'kind'=case when actor->>'kind'='npc' then 'merchant' else 'companion' end
     order by value->>'id' limit 1;
   if actor->>'kind'='npc' then
     work:=rpg_private.astra_mechanic_write(work,'entities',entity_id,jsonb_build_object('kind','companion'));
     if stored is not null then work:=rpg_private.astra_mechanic_write(work,'storages',(stored->>'id')::uuid,
       jsonb_build_object('kind','companion')); end if;
   end if;
   storage_id:=coalesce((stored->>'id')::uuid,rpg_private.wave4_id(t.id,'natural:actor-storage:'||entity_id::text));
   if stored is null then
     perform rpg_private.assert(rpg_private.astra_shadow_row(s,'storages',storage_id) is null);
     work:=rpg_private.astra_mechanic_write(work,'storages',storage_id,jsonb_build_object(
       'name',left('Inventory of '||(actor->>'name'),160),'kind','companion','entity_id',entity_id));
   end if;
   outcome:=jsonb_build_object('kind',kind,'entityId',entity_id,'storageId',storage_id,'joined',true);
   ids:=jsonb_build_array(entity_id);
 elsif kind='item_relocate' then
   perform rpg_private.fields(intent,array['kind','actorId','itemId','quantity','destinationEntityId']);
   perform rpg_private.assert(intent->>'actorId'=hero::text and config->'presentEntityIds' ? hero::text and
     rpg_private.wave4_integer(intent->'quantity',1,20));
   item_id:=(intent->>'itemId')::uuid; quantity:=(intent->>'quantity')::integer;
   item:=rpg_private.astra_shadow_row(s,'items',item_id);
   parent:=(s#>>'{snapshot,publicState,current_location_id}')::uuid;
   perform rpg_private.assert(item->>'campaign_id'=cid::text and (item->>'quantity')::integer>=quantity and
     item->'equipped_entity_id'='null'::jsonb and item->'equipped_slot'='null'::jsonb and
     exists(select 1 from jsonb_array_elements(s#>'{snapshot,locations}') l where l.value->>'id'=parent::text and
       l.value->>'campaign_id'=cid::text and l.value->>'status' in('known','visited')) and
     not exists(select 1 from jsonb_array_elements(coalesce(s->'astraSettlementItemPolicies','[]')) p
       where p.value->>'itemId'=item_id::text and p.value->>'visibility'='private'));
   locale:=rpg_private.astra_natural_locale(s);
   stored:=rpg_private.astra_shadow_row(s,'storages',(item->>'storage_id')::uuid);
   perform rpg_private.assert(stored->>'campaign_id'=cid::text);
   from_ground:=stored->>'kind'='ground' and stored->'entity_id'='null'::jsonb and
     stored->>'location_id'=parent::text and (stored->>'locale_key') is not distinct from locale and item->'owner_entity_id'='null'::jsonb;
   perform rpg_private.assert(from_ground or (item->>'owner_entity_id'=hero::text and stored->>'entity_id'=hero::text and stored->>'kind' in('player','companion')));
   entity_id:=(intent->>'destinationEntityId')::uuid;
   if entity_id is null then
     perform rpg_private.assert(not from_ground);
     storage_id:=rpg_private.wave4_id(cid,'natural:ground:'||parent::text||':'||coalesce(locale,''));
     destination:=rpg_private.astra_shadow_row(s,'storages',storage_id);
     if destination is null then
       work:=rpg_private.astra_mechanic_write(work,'storages',storage_id,jsonb_build_object(
         'name','Ground','kind','ground','entity_id',null,'location_id',parent,'locale_key',locale));
     else perform rpg_private.assert(destination->>'campaign_id'=cid::text and destination->>'kind'='ground' and
       destination->'entity_id'='null'::jsonb and destination->>'location_id'=parent::text and
       (destination->>'locale_key') is not distinct from locale); end if;
   else
     target:=rpg_private.astra_shadow_row(s,'entities',entity_id);
     perform rpg_private.assert(target->>'campaign_id'=cid::text and config->'presentEntityIds' ? entity_id::text and
       (target->>'kind'<>'player' or entity_id=hero));
     select value into destination from jsonb_array_elements(s#>'{snapshot,storages}') x
       where value->>'campaign_id'=cid::text and value->>'entity_id'=entity_id::text and value->>'kind'=
         case when target->>'kind'='player' then 'player' when target->>'kind'='companion' then 'companion' else 'merchant' end
       order by value->>'id' limit 1;
     storage_id:=coalesce((destination->>'id')::uuid,rpg_private.wave4_id(t.id,'natural:actor-storage:'||entity_id::text));
     if destination is null then
       perform rpg_private.assert(rpg_private.astra_shadow_row(s,'storages',storage_id) is null);
       work:=rpg_private.astra_mechanic_write(work,'storages',storage_id,jsonb_build_object(
         'name',left('Inventory of '||(target->>'name'),160),'kind',case when target->>'kind'='player' then 'player'
           when target->>'kind'='companion' then 'companion' else 'merchant' end,'entity_id',entity_id));
     end if;
   end if;
   transferred:=item_id;
   if quantity=(item->>'quantity')::integer then
     work:=rpg_private.astra_mechanic_write(work,'items',item_id,jsonb_build_object('quantity',quantity,
       'owner_entity_id',entity_id,'storage_id',storage_id,'equipped_entity_id',null,'equipped_slot',null));
   else
     split_id:=rpg_private.wave4_id(t.id,'natural:item-relocate:'||effect_index::text||':'||item_id::text);
     perform rpg_private.assert(rpg_private.astra_shadow_row(s,'items',split_id) is null);
     work:=rpg_private.astra_mechanic_write(work,'items',item_id,jsonb_build_object('quantity',(item->>'quantity')::integer-quantity));
     work:=rpg_private.astra_mechanic_write(work,'items',split_id,jsonb_build_object('name',item->'name',
       'category',item->'category','description',item->'description','mechanics',item->'mechanics','quantity',quantity,
       'owner_entity_id',entity_id,'storage_id',storage_id,'equipped_entity_id',null,'equipped_slot',null));
     transferred:=split_id;
   end if;
   outcome:=jsonb_build_object('kind',kind,'itemId',transferred,'quantity',quantity,'destinationEntityId',entity_id,'storageId',storage_id);
   ids:=jsonb_build_array(hero)||case when entity_id is null then '[]'::jsonb else jsonb_build_array(entity_id) end;
 else raise exception 'rpg_validation'; end if;
 return jsonb_build_object('schemaVersion',1,'kind',kind,'intent',intent,'publicOutcome',outcome,
   'resolution',jsonb_build_object('changes',work->'changes','worldMinutes',s#>'{runtime,worldMinutes}',
     'configuration',config,'outcomes',jsonb_build_array(jsonb_build_object('kind',kind,'text',case when kind='companion_join'
       then 'The present NPC joined the party; no hidden relationship history was added.'
       else 'The recorded Item changed possession or ground placement without creating any new powers.' end,
       'entityIds',ids,'itemIds',case when kind='item_relocate' then jsonb_build_array(transferred) else '[]'::jsonb end))));
end $$;

-- Only this natural dispatch is inserted; the pre-existing origin, index,
-- effect, revision, collapse and final-bundle comparisons remain intact.
do $$ declare d text; needle text; replacement text; begin
 d:=pg_get_functiondef('rpg_private.astra_ordered_assert(uuid,rpg_private.turns,jsonb,jsonb)'::regprocedure);
 needle:=$needle$if effect->>'kind' in ('mechanic_actions','formal_rest') then$needle$;
 replacement:=$replacement$if t.astra_natural_contract='natural-v1' and effect->>'kind' in ('item_relocate','companion_join') then
     expected:=rpg_private.astra_natural_effect_expected(cid,shadow,effect,index_value);
   elsif t.astra_natural_contract='natural-v1' and effect->>'kind'='mechanic_actions' and
     not exists(select 1 from jsonb_array_elements(effect->'actions') a where a.value->>'kind' not in ('encounter.start','encounter.end')) then
     expected:=rpg_private.astra_natural_encounter_expected(shadow,effect);
   elsif effect->>'kind' in ('mechanic_actions','formal_rest') then$replacement$;
 perform rpg_private.assert(length(d)-length(replace(d,needle,''))=length(needle));
 execute replace(d,needle,replacement);
end $$;
revoke all on function rpg_private.astra_natural_effect_expected(uuid,rpg_private.turns,jsonb,integer)
 from public,anon,authenticated,service_role;
revoke all on function rpg_private.astra_natural_encounter_resolution(rpg_private.turns,jsonb),
 rpg_private.astra_natural_encounter_expected(rpg_private.turns,jsonb)
 from public,anon,authenticated,service_role;
-- NATURAL_EFFECT_ADAPTER_END
commit;
