-- Private Astra-primary turn identity and recovery authority. The accepted
-- runtime chain through migration 37 remains the delegated legacy path.
begin;

-- NULL is deliberately legacy: immutable pre-38 save payloads have no column.
alter table rpg_private.turns add column runtime_identity text
  check (runtime_identity is null or runtime_identity='astra-primary-v1');

-- Checkpoints are opaque authored authority when a saved turn is rebound to a
-- new timeline. In particular, never inject a timeline key into a pinned final.
do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('rpg_private.timeline_stamp(jsonb,jsonb,boolean)'::regprocedure);
 needle:=$n$'naturalCombatTurn'$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('astraPrimary' in d)=0);
 execute replace(d,needle,$r$'naturalCombatTurn','astraPrimary'$r$);
end $$;

-- Preserve every existing post-37 wrapper and SQL guard by delegating through
-- the exact previously effective public entry point. Only service_role can
-- reach this entry point; no browser role gains a private RPC.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  rename to rpg_runtime_before_astra_primary;

create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,
  p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare t rpg_private.turns%rowtype; result jsonb; requested text;
 clean_payload jsonb; next_astra jsonb; prior_astra jsonb; final jsonb;
 receipts jsonb; call jsonb; value jsonb; receipt jsonb; prior jsonb;
 packet jsonb; changed jsonb; oldrow jsonb; entity public.rpg_entities%rowtype;
 item public.rpg_items%rowtype; place public.rpg_locations%rowtype;
 participant public.rpg_encounter_participants%rowtype;
 pos integer; check_index integer; total integer; damage integer; old_hp integer;
 action_cost integer; move_cost integer; defeated boolean;
 key text; amount integer; family text; rid uuid; seen text[]:='{}';
begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action not in ('play','get'));
 if p_action='astra_runtime' then
   perform rpg_private.fields(p_payload,array['operationId']);
   select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid
     and campaign_id=p_campaign_id and owner_id=p_owner_id;
   return case when t.id is null then 'null'::jsonb
     else to_jsonb(coalesce(t.runtime_identity,'legacy-v1')) end;
 end if;
 if p_action='begin' then
   perform rpg_private.assert(jsonb_typeof(p_payload)='object');
   requested:=p_payload->>'serverRuntime';
   perform rpg_private.assert(requested is null or requested='astra-primary-v1');
   clean_payload:=p_payload-'serverRuntime';
   select * into t from rpg_private.turns where id=(clean_payload->>'operationId')::uuid
     and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
   if t.id is not null and
       coalesce(t.runtime_identity,'legacy-v1')<>
         coalesce(requested,'legacy-v1') then
     raise exception 'rpg_conflict';
   end if;
   result:=public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,clean_payload,p_timeline);
   if t.id is null and requested='astra-primary-v1' then
     select * into strict t from rpg_private.turns where id=(clean_payload->>'operationId')::uuid
       and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
     perform rpg_private.assert(t.input->>'mode'='game' and
       t.settings#>>'{rulesSystem,id}'='console-basic-v1' and
       not exists(select 1 from rpg_private.world_foundations
        where campaign_id=p_campaign_id and
          ruleset->>'id' is distinct from 'console-basic-v1'));
     update rpg_private.turns set runtime_identity='astra-primary-v1',
       checkpoint=checkpoint||jsonb_build_object('astraPrimary',
         jsonb_build_object('schemaVersion',1,'createdTimeline',p_timeline,
           'toolReceipts','[]'::jsonb,'finalProposal',null),
         'plan',jsonb_build_object('narration','','checks','[]'::jsonb,
           'publicPatches','[]'::jsonb,'privatePatches','[]'::jsonb,
           'visualDescription','','clarification',null,'guidanceProposal',null))
       where id=t.id and campaign_id=p_campaign_id;
   end if;
   return result;
 end if;
 if p_action not in ('claim','checkpoint','astra_tool','commit','checks','reroll') then
   return public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid
   and campaign_id=p_campaign_id and owner_id=p_owner_id for update;
 if t.id is null then raise exception 'rpg_not_found'; end if;
 if p_action='claim' then
   result:=public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
   if result is null then return null; end if;
   return result||jsonb_build_object('runtimeIdentity',
     coalesce(t.runtime_identity,'legacy-v1'));
 end if;
 if t.runtime_identity is null then
   if p_action='astra_tool' or
      (p_action='checkpoint' and nullif(p_payload#>'{checkpoint,astraPrimary}','null') is not null)
      then raise exception 'rpg_validation'; end if;
   return public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 -- The neutral plan allows the established interactive Check UI reroll policy
 -- to validate and persist the replacement in runtime_commands/checks.
 -- Generic tool insertion remains a separate private append-only authority.
 if p_action='checks' then raise exception 'rpg_validation'; end if;
 prior_astra:=t.checkpoint->'astraPrimary';
 perform rpg_private.assert(prior_astra->'schemaVersion'='1' and
   jsonb_typeof(prior_astra->'createdTimeline')='object' and
   jsonb_typeof(prior_astra->'toolReceipts')='array' and
   jsonb_array_length(prior_astra->'toolReceipts')<=32);
 if p_action='reroll' then
   perform rpg_private.assert(prior_astra->'finalProposal'='null' and
     exists(select 1 from jsonb_array_elements(prior_astra->'toolReceipts') r
       where r.value#>>'{result,id}'=p_payload#>>'{command,checkId}' and
         r.value#>>'{call,kind}' in ('skill','attack','save')));
   return public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 if p_action='astra_tool' then
   perform rpg_private.fields(p_payload,array['campaignId','operationId','token',
     'expectedRevision','position','call','result']);
   perform rpg_private.assert(p_payload->>'campaignId'=p_campaign_id::text and
     t.lease_token=(p_payload->>'token')::uuid and t.lease_until>now() and
     t.status in ('pending','generating','awaiting_confirmation') and
     t.expected_revision=(p_payload->>'expectedRevision')::integer and
     t.expected_revision=(select revision from rpg_private.runtime_state
       where campaign_id=p_campaign_id));
   pos:=(p_payload->>'position')::integer;
   receipts:=prior_astra->'toolReceipts';
   perform rpg_private.assert(pos between 0 and 31 and
     pos<=jsonb_array_length(receipts));
   call:=p_payload->'call';
   if pos<jsonb_array_length(receipts) then
     prior:=receipts->pos;
     if prior->'call'<>call then raise exception 'rpg_conflict'; end if;
     return prior;
   end if;
   perform rpg_private.assert(prior_astra->'finalProposal'='null');
   perform rpg_private.fields(call,array['kind','actorId','targetId','dc',
     'itemId','scope']);
   perform rpg_private.assert(call->>'kind' in
     ('query','skill','attack','save','damage'));
   if call->>'kind'='query' then
     perform rpg_private.assert(call->>'scope'='current-public' and
       call->'actorId'='null' and call->'targetId'='null' and
       call->'dc'='null' and call->'itemId'='null');
   else
     perform rpg_private.assert(call->'scope'='null' and
       exists(select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id
         and e.id=(call->>'actorId')::uuid) and
       t.source#>'{runtime,configuration,presentEntityIds}' ? (call->>'actorId'));
     if call->>'kind' in ('attack','damage') then
       perform rpg_private.assert(call->'dc'='null' and
         exists(select 1 from public.rpg_entities e where e.campaign_id=p_campaign_id
           and e.id=(call->>'targetId')::uuid) and
         t.source#>'{runtime,configuration,presentEntityIds}' ? (call->>'targetId'));
     else
       perform rpg_private.assert(call->'targetId'='null' and
         call->'itemId'='null' and (call->>'dc')::integer between 1 and 40);
     end if;
     if call->'itemId'<>'null' then
       perform rpg_private.assert(exists(select 1 from public.rpg_items i
         where i.campaign_id=p_campaign_id and i.id=(call->>'itemId')::uuid
           and i.quantity>0 and i.owner_entity_id=(call->>'actorId')::uuid and
           i.equipped_entity_id=(call->>'actorId')::uuid) and
         exists(select 1 from jsonb_array_elements(
           t.source#>'{runtime,configuration,itemRules}') r
           where r.value->>'itemId'=call->>'itemId' and r.value->>'tag'='weapon'));
     end if;
     if call->>'kind' in ('attack','skill') and exists(
       select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e
       where e.value->>'status'='active') then
       perform rpg_private.assert(exists(
         select 1 from jsonb_array_elements(t.source#>'{runtime,participants}') p
         where p.value->>'entity_id'=call->>'actorId' and
           p.value#>'{public_resources,active}'='true' and
           p.value#>'{public_resources,withdrawn}'='false' and
           p.value#>>'{public_resources,action}'='1' and
           exists(select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e
             where e.value->>'id'=p.value->>'encounter_id' and e.value->>'status'='active')) and
         not exists(select 1 from jsonb_array_elements(receipts) used
           where used#>>'{call,kind}' in ('attack','skill') and
             used#>>'{call,actorId}'=call->>'actorId'));
       if call->>'kind'='attack' then
         perform rpg_private.assert(exists(
           select 1 from jsonb_array_elements(t.source#>'{runtime,participants}') p
           where p.value->>'entity_id'=call->>'targetId' and
             p.value#>'{public_resources,active}'='true' and
             p.value#>'{public_resources,withdrawn}'='false' and
             exists(select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e
               where e.value->>'id'=p.value->>'encounter_id' and e.value->>'status'='active')));
       end if;
     end if;
   end if;
   value:=p_payload->'result';
   perform rpg_private.assert(jsonb_typeof(value)='object' and
     value->>'kind'=call->>'kind');
   if call->>'kind'='query' then
     perform rpg_private.fields(value,array['kind','stateRevision','state']);
     perform rpg_private.assert((value->>'stateRevision')::integer=t.expected_revision and
       value->'state'=jsonb_build_object(
         'worldMinutes',t.source#>'{runtime,worldMinutes}',
         'currentLocationId',t.source#>'{snapshot,publicState,current_location_id}',
         'entities',(select coalesce(jsonb_agg(jsonb_build_object(
           'id',e.value->'id','name',e.value->'name','hp',e.value->'hp',
           'resources',e.value->'resources') order by e.value->>'id'),'[]'::jsonb)
           from jsonb_array_elements(t.source#>'{snapshot,entities}') e
           where t.source#>'{runtime,configuration,presentEntityIds}' ? (e.value->>'id')),
         'items',(select coalesce(jsonb_agg(jsonb_build_object(
           'id',i.value->'id','name',i.value->'name',
           'quantity',i.value->'quantity') order by i.value->>'id'),'[]'::jsonb)
           from jsonb_array_elements(t.source#>'{snapshot,items}') i
           where (i.value->>'owner_entity_id' is not null and
             t.source#>'{runtime,configuration,controlledEntityIds}' ? (i.value->>'owner_entity_id')) or
             (i.value->>'equipped_entity_id' is not null and
              t.source#>'{runtime,configuration,presentEntityIds}' ? (i.value->>'equipped_entity_id')) or
             (i.value->>'storage_id' is not null and
              t.source#>'{runtime,configuration,nearbyStorageIds}' ? (i.value->>'storage_id')))));
   else
     perform rpg_private.assert(value->'actorId'=call->'actorId' and
       value->'targetId'=call->'targetId' and
       jsonb_typeof(value->'dice')='array' and
       jsonb_array_length(value->'dice') between 1 and 2 and
       not exists(select 1 from jsonb_array_elements(value->'dice') d
         where jsonb_typeof(d.value)<>'number' or
           (d.value::text)::integer not between 1 and 20));
     if call->>'kind'='damage' then
       perform rpg_private.fields(value,array['kind','actorId','targetId','itemId',
         'dice','modifier','total']);
       perform rpg_private.assert(value->'itemId'=call->'itemId' and
         (value->>'modifier')::integer=0 and
         jsonb_array_length(value->'dice')=1 and
         (value#>>'{dice,0}')::integer <= coalesce((select
           (r.value->>'damage')::integer from jsonb_array_elements(
             t.source#>'{runtime,configuration,itemRules}') r
           where r.value->>'itemId'=call->>'itemId' and r.value->>'tag'='weapon'),2) and
         (value->>'total')::integer=
           (select sum((d.value::text)::integer) from jsonb_array_elements(value->'dice') d)
           +(value->>'modifier')::integer and
         (value->>'total')::integer between 0 and 100);
       perform rpg_private.assert(exists(select 1 from jsonb_array_elements(receipts) a
         where a#>>'{call,kind}'='attack' and
           a#>'{call,actorId}'=call->'actorId' and
           a#>'{call,targetId}'=call->'targetId' and
           a#>'{call,itemId}'=call->'itemId' and
           exists(select 1 from jsonb_array_elements(t.checkpoint->'checks') c
             where c.value->>'id'=a#>>'{result,id}' and c.value->'success'='true') and
           not exists(select 1 from jsonb_array_elements(receipts) used
             where used#>>'{call,kind}'='damage' and
               used#>'{call,actorId}'=call->'actorId' and
               used#>'{call,targetId}'=call->'targetId' and
               used#>'{call,itemId}'=call->'itemId')));
     else
       check_index:=jsonb_array_length(t.checkpoint->'checks');
       perform rpg_private.fields(value,array['index','actorId','targetId','kind',
         'stat','dc','dcPublic','visibility','important','uncertainty',
         'advantage','id','dice','kept','modifier','total','success','rollNumber']);
       perform rpg_private.assert((value->>'index')::integer=check_index and
         value->>'id'=rpg_private.wave4_id(t.id,'check:'||check_index::text)::text and
         value->>'stat'=case when call->>'kind'='skill' then 'skill'
           when call->>'kind'='attack' then 'attack' else 'save' end and
         (value->>'rollNumber')::integer=1 and
         value->>'advantage' in ('normal','advantage','disadvantage') and
         value->>'visibility' in ('player','private') and
         value->>'uncertainty'='meaningful' and
         value->'dc'=case when call->>'kind'='attack' then
           (select to_jsonb(coalesce((e.stats->>'defense')::integer,10)) from public.rpg_entities e
            where e.campaign_id=p_campaign_id and e.id=(call->>'targetId')::uuid)
           else call->'dc' end and
         value->>'advantage'='normal' and
         value->'dcPublic'='false' and value->'important'='true' and
         value->>'visibility'=case when t.source#>'{runtime,configuration,controlledEntityIds}'
           ? (call->>'actorId') then 'player' else 'private' end and
         (value->>'modifier')::integer between -100 and 100 and
         (value->>'modifier')::integer=coalesce((select
           (e.stats->>(value->>'stat'))::integer from public.rpg_entities e
           where e.campaign_id=p_campaign_id and e.id=(call->>'actorId')::uuid),0)
           +case when call->>'kind'='skill' and exists(select 1 from
             jsonb_array_elements(t.source#>'{runtime,effects}') ef
             where ef.value->>'entity_id'=call->>'actorId' and
               ef.value#>>'{definition,kind}'='coffee' and
               ef.value#>>'{definition,status}'='active' and
               ef.value#>>'{definition,remaining}'='1') then 1 else 0 end and
         (value->>'total')::integer=(value->>'kept')::integer+
           (value->>'modifier')::integer and
         (value->>'success')::boolean=
           ((value->>'total')::integer>=(value->>'dc')::integer));
       perform rpg_private.assert(jsonb_array_length(value->'dice')=
         case when value->>'advantage'='normal' then 1 else 2 end and
         (value->>'kept')::integer=case when value->>'advantage'='disadvantage'
           then (select min((d.value::text)::integer) from jsonb_array_elements(value->'dice') d)
           else (select max((d.value::text)::integer) from jsonb_array_elements(value->'dice') d) end);
     end if;
   end if;
   receipt:=jsonb_build_object('position',pos,'id',
     rpg_private.wave4_id(t.id,'astra:tool:'||pos::text),
     'call',call,'result',value);
   next_astra:=jsonb_set(prior_astra,'{toolReceipts}',receipts||jsonb_build_array(receipt));
   update rpg_private.turns set checkpoint=jsonb_set(
     case when call->>'kind' in ('skill','attack','save') then
       jsonb_set(checkpoint,'{checks}',checkpoint->'checks'||jsonb_build_array(value))
     else checkpoint end,'{astraPrimary}',next_astra),updated_at=now()
     where id=t.id and campaign_id=p_campaign_id;
   return receipt;
 end if;
 if p_action='checkpoint' then
   next_astra:=p_payload#>'{checkpoint,astraPrimary}';
   perform rpg_private.assert(jsonb_typeof(next_astra)='object');
   perform rpg_private.fields(next_astra,
     array['schemaVersion','createdTimeline','toolReceipts','finalProposal']);
   perform rpg_private.assert(next_astra->'schemaVersion'='1' and
     next_astra->'createdTimeline'=prior_astra->'createdTimeline' and
     next_astra->'toolReceipts'=prior_astra->'toolReceipts' and
     (prior_astra->'finalProposal'='null' or
       next_astra->'finalProposal'=prior_astra->'finalProposal'));
   if next_astra->'finalProposal'<>'null' then
     final:=next_astra->'finalProposal';
     perform rpg_private.fields(final,array['schemaVersion','campaignId',
       'operationId','expectedRevision','input','resolution','privatePatches','toolRefs']);
     perform rpg_private.assert(final->'schemaVersion'='1' and
       final->>'campaignId'=p_campaign_id::text and
       final->>'operationId'=t.id::text and
       final->>'input'=t.input->>'input' and
       ((final->>'expectedRevision')::integer=t.expected_revision or
         (prior_astra->'createdTimeline'<>p_timeline and
          (final->>'expectedRevision')::integer<t.expected_revision)) and
       jsonb_typeof(final->'toolRefs')='array' and
       final->'toolRefs'=(select coalesce(jsonb_agg(a.value->'id' order by a.n),'[]')
         from jsonb_array_elements(prior_astra->'toolReceipts') with ordinality a(value,n)
         where a.value#>>'{call,kind}'<>'query'));
   end if;
   clean_payload:=jsonb_set(p_payload,'{checkpoint}',
     (p_payload->'checkpoint')-'astraPrimary');
   result:=public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,clean_payload,p_timeline);
   update rpg_private.turns set checkpoint=checkpoint||
     jsonb_build_object('astraPrimary',next_astra) where id=t.id
       and campaign_id=p_campaign_id;
   return result;
 end if;
 if p_action='commit' and t.status='committed' then
   return public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 if p_action='commit' then
   final:=prior_astra->'finalProposal'; packet:=p_payload->'packet';
   perform rpg_private.assert(jsonb_typeof(final)='object' and
     t.input->>'mode'='game' and t.source is not null and
     t.source#>>'{runtime,revision}'=t.expected_revision::text and
     p_payload->>'campaignId'=p_campaign_id::text and
     (p_payload->>'expectedRevision')::integer=t.expected_revision and
     final->>'campaignId'=p_campaign_id::text and
     final->>'operationId'=t.id::text and
     final->>'input'=t.input->>'input' and
     ((final->>'expectedRevision')::integer=t.expected_revision or
       (prior_astra->'createdTimeline'<>p_timeline and
        (final->>'expectedRevision')::integer<t.expected_revision)) and
     packet->'resolution'=final->'resolution' and
     packet->'privatePatches'=final->'privatePatches' and
     packet->'checks'=t.checkpoint->'checks' and
     packet->>'narration'=t.checkpoint#>>'{narration,narration}' and
     packet->>'visualDescription'=t.checkpoint#>>'{narration,visualDescription}' and
     nullif(packet->'worldSettlement','null') is null and
     nullif(packet->'foundationSettlement','null') is null and
     nullif(t.checkpoint->'worldLogic','null') is null and
     nullif(t.checkpoint->'naturalMechanic','null') is null and
     nullif(t.checkpoint->'naturalCombatTurn','null') is null and
     nullif(t.checkpoint->'combatExchange','null') is null);
   perform rpg_private.assert(packet#>'{resolution,configuration}'=
     t.source#>'{runtime,configuration}' and
     (packet#>>'{resolution,worldMinutes}')::integer between
       (t.source#>>'{runtime,worldMinutes}')::integer and
       (t.source#>>'{runtime,worldMinutes}')::integer+1440);
   seen:='{}';
   for changed in select c.value from jsonb_array_elements(packet#>'{resolution,changes}') c loop
     family:=changed->>'family'; rid:=(changed->>'id')::uuid;
     perform rpg_private.assert(rid is not null and
       not (family||':'||rid::text)=any(seen));
     seen:=array_append(seen,family||':'||rid::text);
     if family='entities' then
       perform rpg_private.fields(changed->'values','{}',array['hp','resources']);
       select * into entity from public.rpg_entities where campaign_id=p_campaign_id
         and id=rid;
       select e.value into oldrow from jsonb_array_elements(
         t.source#>'{snapshot,entities}') e where e.value->>'id'=rid::text;
       perform rpg_private.assert(entity.id is not null and oldrow is not null and
         t.source#>'{runtime,configuration,presentEntityIds}' ? rid::text and
         changed->'expectedRevision'=oldrow->'revision' and
         entity.revision=(oldrow->>'revision')::integer);
       if changed#>'{values,hp}' is not null then
         old_hp:=(oldrow->>'hp')::integer;
         damage:=coalesce((select sum((r.value#>>'{result,total}')::integer)
           from jsonb_array_elements(prior_astra->'toolReceipts') r
           where r.value#>>'{call,kind}'='damage' and
             r.value#>>'{call,targetId}'=rid::text),0);
         perform rpg_private.assert(damage>0 and
           (changed#>>'{values,hp}')::integer=greatest(0,old_hp-damage));
       end if;
       if changed#>'{values,resources}' is not null then
         perform rpg_private.assert(jsonb_typeof(changed#>'{values,resources}')='object');
         for key,value in select k,v from jsonb_each(changed#>'{values,resources}') q(k,v) loop
           perform rpg_private.assert(oldrow->'resources' ? key and
             jsonb_typeof(value)='number' and
             (value::text)::integer between 0 and
               (oldrow#>>array['resources',key])::integer);
         end loop;
       end if;
     elsif family='items' then
       perform rpg_private.fields(changed->'values',array['quantity']);
       select * into item from public.rpg_items where campaign_id=p_campaign_id
         and id=rid;
       select i.value into oldrow from jsonb_array_elements(
         t.source#>'{snapshot,items}') i where i.value->>'id'=rid::text;
       perform rpg_private.assert(item.id is not null and oldrow is not null and
         t.source#>'{runtime,configuration,controlledEntityIds}' ? item.owner_entity_id::text and
         changed->'expectedRevision'=oldrow->'revision' and
         item.revision=(oldrow->>'revision')::integer and
         (changed#>>'{values,quantity}')::integer between 0 and item.quantity and
         (item.equipped_entity_id is null or
           (changed#>>'{values,quantity}')::integer>=1));
     elsif family='public_state' then
       perform rpg_private.fields(changed->'values',array['current_location_id']);
       perform rpg_private.assert(rid=p_campaign_id and
         changed->'expectedRevision'=t.source#>'{snapshot,publicState,revision}' and
         (packet#>>'{resolution,worldMinutes}')::integer>
           (t.source#>>'{runtime,worldMinutes}')::integer);
       select * into place from public.rpg_locations where campaign_id=p_campaign_id
         and id=(changed#>>'{values,current_location_id}')::uuid;
       perform rpg_private.assert(place.id is not null and
         place.status in ('known','visited') and exists(
         select 1 from jsonb_array_elements(t.source#>'{snapshot,locations}') l
         where l.value->>'id'=place.id::text));
     elsif family='encounter_participants' then
       perform rpg_private.fields(changed->'values',
         array['public_position','public_resources']);
       select * into participant from public.rpg_encounter_participants
         where campaign_id=p_campaign_id and id=rid;
       select p.value into oldrow from jsonb_array_elements(
         t.source#>'{runtime,participants}') p where p.value->>'id'=rid::text;
       action_cost:=coalesce((select count(*) from jsonb_array_elements(prior_astra->'toolReceipts') r
         where r.value#>>'{call,kind}' in ('attack','skill') and
           r.value#>>'{call,actorId}'=participant.entity_id::text),0);
       move_cost:=case when changed#>'{values,public_position}'<>oldrow->'public_position'
         then 1 else 0 end;
       defeated:=exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') c
         where c.value->>'family'='entities' and
           c.value->>'id'=participant.entity_id::text and
           c.value#>'{values,hp}'='0');
       perform rpg_private.assert(participant.id is not null and oldrow is not null and
         changed->'expectedRevision'='null' and
         to_jsonb(participant)->'public_position'=oldrow->'public_position' and
         to_jsonb(participant)->'public_resources'=oldrow->'public_resources' and
         oldrow#>'{public_resources,active}'='true' and
         oldrow#>'{public_resources,withdrawn}'='false' and
         action_cost between 0 and 1 and
         action_cost+move_cost+case when defeated then 1 else 0 end>0 and
         (oldrow#>>'{public_resources,action}')::integer>=action_cost and
         (oldrow#>>'{public_resources,move}')::integer>=move_cost and
         exists(select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e
           where e.value->>'id'=participant.encounter_id::text and
             e.value->>'status'='active') and
         changed#>'{values,public_position}'=
           jsonb_build_object('position',changed#>>'{values,public_position,position}') and
         changed#>>'{values,public_position,position}' in ('nearby','far','cover') and
         changed#>'{values,public_resources}'=oldrow->'public_resources'||
           jsonb_build_object('action',
             (oldrow#>>'{public_resources,action}')::integer-action_cost,
             'move',(oldrow#>>'{public_resources,move}')::integer-move_cost,
             'withdrawn',defeated));
     else raise exception 'rpg_validation'; end if;
   end loop;
   perform rpg_private.assert(not exists(
     select 1 from jsonb_array_elements(prior_astra->'toolReceipts') r
     where r.value#>>'{call,kind}'='damage' and
       (r.value#>>'{result,total}')::integer>0 and
       not exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') c
         where c.value->>'family'='entities' and
           c.value->>'id'=r.value#>>'{call,targetId}' and
           c.value#>'{values,hp}' is not null)));
   perform rpg_private.assert(not exists(
     select 1 from jsonb_array_elements(prior_astra->'toolReceipts') r
     where r.value#>>'{call,kind}' in ('attack','skill') and
       exists(select 1 from jsonb_array_elements(t.source#>'{runtime,participants}') p
         where p.value->>'entity_id'=r.value#>>'{call,actorId}' and
           exists(select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e
             where e.value->>'id'=p.value->>'encounter_id' and e.value->>'status'='active') and
           not exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') c
             where c.value->>'family'='encounter_participants' and
               c.value->>'id'=p.value->>'id'))));
   perform rpg_private.assert(not exists(
     select 1 from jsonb_array_elements(packet#>'{resolution,changes}') c
     where c.value->>'family'='entities' and c.value#>'{values,hp}'='0' and
       exists(select 1 from jsonb_array_elements(t.source#>'{runtime,participants}') p
         where p.value->>'entity_id'=c.value->>'id' and
           exists(select 1 from jsonb_array_elements(t.source#>'{runtime,encounters}') e
             where e.value->>'id'=p.value->>'encounter_id' and e.value->>'status'='active') and
           not exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') cp
             where cp.value->>'family'='encounter_participants' and
               cp.value->>'id'=p.value->>'id'))));
   return public.rpg_runtime_before_astra_primary(p_owner_id,p_campaign_id,
     p_action,p_payload,p_timeline);
 end if;
 raise exception 'rpg_validation';
end $$;

revoke all on function public.rpg_runtime_before_astra_primary(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated,service_role;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)
  to service_role;
commit;
