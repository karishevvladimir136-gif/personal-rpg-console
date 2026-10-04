-- Narrow World Logic / existing mechanics bridge. No existing campaign rows are changed.
begin;

-- A visible autonomous person at the current public location is a valid
-- circumstance. This grants neither their private knowledge nor an effect.
do $$ declare d text; needle text; replacement text; begin
 d:=pg_get_functiondef('rpg_private.world_validate_settlement_before_wave3(uuid,uuid,jsonb,rpg_private.turns)'::regprocedure);
 needle:=$n$or exists(select 1 from public.rpg_entities e where e.campaign_id=cid and ref='actor:'||e.id::text and (e.kind='player' or t.source#>'{runtime,configuration,controlledEntityIds}' ? (e.id::text)))$n$;
 replacement:=$r$or exists(select 1 from public.rpg_entities e where e.campaign_id=cid and ref='actor:'||e.id::text and (e.kind='player' or t.source#>'{runtime,configuration,controlledEntityIds}' ? (e.id::text) or (e.kind in ('npc','companion') and exists(select 1 from jsonb_array_elements(oldw->'actors') wa where wa->>'entityId'=e.id::text and wa->>'control'='autonomous' and wa->>'publicName'=e.name and wa->>'locationId'=t.source#>>'{snapshot,publicState,current_location_id}' and wa->>'locationId'=(select current_location_id::text from public.rpg_public_state where campaign_id=cid)) and exists(select 1 from jsonb_array_elements(t.source#>'{snapshot,entities}') se where se->>'id'=e.id::text and se->>'name'=e.name and se->>'kind'=e.kind and (se->>'revision')::integer=e.revision))))$r$;
 perform rpg_private.assert(position(needle in d)>0 and position('wa->>''publicName''' in d)=0);
 execute replace(d,needle,replacement);
end $$;

-- Configuration selects the already implemented Console Basic mechanics profile.
-- A World Logic campaign retains its World Logic ruleset and settlement authority.
do $$ declare d text; needle text; replacement text; begin
 d:=pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure);
 needle:=$n$data:=jsonb_set(data,'{rulesSystem}','{"id":"console-basic-v1","label":"Console basic house rules","enemyHpScaling":true,"enemyDamageScaling":true}');$n$;
 replacement:=$r$if data#>>'{rulesSystem,id}'<>'world-logic-v1' then data:=jsonb_set(data,'{rulesSystem}','{"id":"console-basic-v1","label":"Console basic house rules","enemyHpScaling":true,"enemyDamageScaling":true}'); else perform rpg_private.assert(exists(select 1 from rpg_private.world_foundations wf where wf.campaign_id=cid and wf.ruleset->>'id'='world-logic-v1')); end if;$r$;
 perform rpg_private.assert(position(needle in d)>0 and position('wf.ruleset->>''id''' in d)=0);
 d:=replace(d,needle,replacement);
 needle:=$n$array['worldSettlement','worldLogic','foundationAction','foundationSettlement']$n$;
 replacement:=$r$array['worldSettlement','worldLogic','foundationAction','foundationSettlement','naturalMechanic']$r$;
 perform rpg_private.assert(position(needle in d)>0 and position('naturalMechanic' in d)=0);
 execute replace(d,needle,replacement);
end $$;

-- Checkpoint identities survive save/load stamping unchanged, like World Logic.
do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('rpg_private.timeline_stamp(jsonb,jsonb,boolean)'::regprocedure);
 needle:=$n$'exactState','worldSettlement','worldLogic'$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('naturalMechanic' in d)=0);
 execute replace(d,needle,$r$'exactState','worldSettlement','worldLogic','naturalMechanic'$r$);
end $$;

-- This guard authorizes only a checkpointed semantic intent mapped to the
-- existing encounter plan. Dice and resulting changes retain the ordinary
-- runtime/check authority; no model-authored state patch is accepted here.
create function rpg_private.natural_mechanic_validate(uid uuid,cid uuid,t rpg_private.turns,packet jsonb) returns boolean
language plpgsql stable set search_path='' as $$
declare p jsonb:=t.checkpoint->'naturalMechanic'; plan jsonb:=t.checkpoint->'plan';
 source jsonb:=t.source; world jsonb; actor public.rpg_entities%rowtype; target public.rpg_entities%rowtype;
 config jsonb; current_id uuid; action jsonb; first_action jsonb; check_row jsonb; item public.rpg_items%rowtype;
 active_encounter boolean; expected_kind text; change_row jsonb;
 v_encounter_id uuid; actor_participant_id uuid; target_participant_id uuid; action_id uuid;
begin
 perform rpg_private.fields(p,array['schemaVersion','input','actorId','targetId','method','itemId','equipmentName']);
 perform rpg_private.assert(t.owner_id=uid and t.campaign_id=cid and t.input->>'mode'='game' and p->'schemaVersion'='4'::jsonb and p->'input'=t.input->'input' and p->>'method' in ('attack','improvise') and p->>'actorId'<>p->>'targetId');
 perform rpg_private.assert(nullif(t.checkpoint->'worldLogic','null') is null and nullif(t.checkpoint->'foundationAction','null') is null and nullif(t.checkpoint->'foundationSettlement','null') is null and nullif(plan->'foundationAction','null') is null and plan->'privatePatches'='[]' and packet->'privatePatches'='[]');
 perform rpg_private.assert(packet->'checks'=t.checkpoint->'checks' and packet->'resolution'=t.checkpoint->'resolution' and packet#>'{resolution,configuration}'=source#>'{runtime,configuration}' and packet#>'{resolution,worldMinutes}'=source#>'{runtime,worldMinutes}');
 perform rpg_private.assert(source->>'ownerId'=uid::text and source#>>'{snapshot,campaign,id}'=cid::text and source#>>'{snapshot,settings,values,rulesSystem,id}'='world-logic-v1');
 select wf.world into world from rpg_private.world_foundations wf where wf.campaign_id=cid and wf.ruleset->>'id'='world-logic-v1';
 perform rpg_private.assert(world is not null);
 current_id:=(source#>>'{snapshot,publicState,current_location_id}')::uuid;
 perform rpg_private.assert(current_id is not null and current_id=(select current_location_id from public.rpg_public_state where campaign_id=cid));
 select * into actor from public.rpg_entities where campaign_id=cid and id=(p->>'actorId')::uuid and kind='player';
 select * into target from public.rpg_entities where campaign_id=cid and id=(p->>'targetId')::uuid and kind='npc';
 perform rpg_private.assert(actor.id is not null and target.id is not null and actor.hp>0 and actor.max_hp>0 and target.hp>0 and target.max_hp>0);
 perform rpg_private.assert(exists(select 1 from jsonb_array_elements(world->'actors') wa where wa->>'entityId'=actor.id::text and wa->>'control'='player' and wa->>'locationId'=current_id::text) and exists(select 1 from jsonb_array_elements(world->'actors') wa where wa->>'entityId'=target.id::text and wa->>'control'='autonomous' and wa->>'publicName'=target.name and wa->>'locationId'=current_id::text));
 perform rpg_private.assert(exists(select 1 from jsonb_array_elements(source#>'{snapshot,entities}') se where se->>'id'=actor.id::text and (se->>'revision')::integer=actor.revision) and exists(select 1 from jsonb_array_elements(source#>'{snapshot,entities}') se where se->>'id'=target.id::text and (se->>'revision')::integer=target.revision));
 config:=source#>'{runtime,configuration}';
 perform rpg_private.assert(config->>'profile'='console-basic-v1' and config->'controlledEntityIds' ? actor.id::text and config->'presentEntityIds' ? actor.id::text and config->'presentEntityIds' ? target.id::text and (select configuration=config from rpg_private.runtime_state where campaign_id=cid));
 if p->'itemId'<>'null' then
  select * into item from public.rpg_items where campaign_id=cid and id=(p->>'itemId')::uuid and owner_entity_id=actor.id and equipped_entity_id=actor.id;
  perform rpg_private.assert(item.id is not null and p->>'equipmentName'=item.name and exists(select 1 from jsonb_array_elements(source#>'{snapshot,items}') si where si->>'id'=item.id::text and (si->>'revision')::integer=item.revision));
  if p->>'method'='attack' then perform rpg_private.assert(config->'itemRules'@>jsonb_build_array(jsonb_build_object('itemId',item.id,'tag','weapon','damage',coalesce((select ir->'damage' from jsonb_array_elements(config->'itemRules') ir where ir->>'itemId'=item.id::text and ir->>'tag'='weapon'),'null'::jsonb)))); end if;
 else perform rpg_private.assert(p->'equipmentName'='null'); end if;
 active_encounter:=exists(select 1 from public.rpg_encounters where campaign_id=cid and status='active');
 perform rpg_private.assert(jsonb_typeof(plan->'publicPatches')='array' and jsonb_array_length(plan->'publicPatches')=case when active_encounter then 1 else 2 end);
 if not active_encounter then
  first_action:=plan#>'{publicPatches,0}';
  perform rpg_private.assert(first_action=jsonb_build_object('kind','encounter.start','participantIds',jsonb_build_array(actor.id,target.id)));
 end if;
 action:=plan->'publicPatches'->case when active_encounter then 0 else 1 end;
 perform rpg_private.assert(action=jsonb_build_object('kind','encounter.action','actorId',actor.id,'action',case when p->>'method'='attack' then 'attack' else 'attempt' end,'targetId',target.id,'itemId',p->'itemId','position',null));
 perform rpg_private.assert(jsonb_typeof(plan->'checks')='array' and jsonb_array_length(plan->'checks')=1 and jsonb_array_length(t.checkpoint->'checks')=1);
 check_row:=t.checkpoint->'checks'->0; expected_kind:=case when p->>'method'='attack' then 'attack' else 'skill' end;
 perform rpg_private.assert(check_row->>'kind'=expected_kind and check_row->>'stat'=expected_kind and check_row->>'actorId'=actor.id::text and check_row->>'targetId'=target.id::text and (check_row->>'dc')::integer=coalesce((target.stats->>'defense')::integer,10) and check_row->>'visibility'='player' and check_row->>'index'='0' and (check_row-array['id','dice','kept','modifier','total','success','rollNumber'])=plan->'checks'->0);
 perform rpg_private.assert(check_row->>'id'=rpg_private.wave4_id(t.id,'check:0')::text and (check_row->>'success')::boolean=((check_row->>'total')::integer>=(check_row->>'dc')::integer));
 perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') change where change->>'family' not in ('entities','encounters','encounter_participants','pending_actions','effects')));
 if active_encounter then
  select e.id into v_encounter_id from public.rpg_encounters e where e.campaign_id=cid and e.status='active';
  select ep.id into actor_participant_id from public.rpg_encounter_participants ep where ep.campaign_id=cid and ep.encounter_id=v_encounter_id and ep.entity_id=actor.id;
  select ep.id into target_participant_id from public.rpg_encounter_participants ep where ep.campaign_id=cid and ep.encounter_id=v_encounter_id and ep.entity_id=target.id;
 else
  v_encounter_id:=rpg_private.wave4_id(t.id,'encounter:0');
  actor_participant_id:=rpg_private.wave4_id(t.id,'participant:0:'||actor.id::text);
  target_participant_id:=rpg_private.wave4_id(t.id,'participant:0:'||target.id::text);
 end if;
 action_id:=rpg_private.wave4_id(t.id,case when active_encounter then 'action:0' else 'action:1' end);
 perform rpg_private.assert(actor_participant_id is not null and target_participant_id is not null and
  (select count(*) from jsonb_array_elements(packet#>'{resolution,changes}') ch where ch->>'family'='pending_actions')=1 and
  (select count(*) from jsonb_array_elements(packet#>'{resolution,changes}') ch where ch->>'family'='encounters')=case when active_encounter then 0 else 1 end and
  (select count(*) from jsonb_array_elements(packet#>'{resolution,changes}') ch where ch->>'family'='encounter_participants') between 1 and 2 and
  (select count(*) from jsonb_array_elements(packet#>'{resolution,changes}') ch where ch->>'family'='entities')<=1 and
  (select count(*) from jsonb_array_elements(packet#>'{resolution,changes}') ch where ch->>'family'='effects')<=1);
 for change_row in select value from jsonb_array_elements(packet#>'{resolution,changes}') loop
  perform rpg_private.fields(change_row,array['family','id','expectedRevision','values']);
  if change_row->>'family'='entities' then
   perform rpg_private.assert(p->>'method'='attack' and check_row->'success'='true' and change_row->>'id'=target.id::text and change_row->'expectedRevision'=to_jsonb(target.revision) and (change_row->'values')-array['hp','conditions']='{}'::jsonb and change_row#>>'{values,resources}' is null and (change_row#>>'{values,hp}')::integer between 0 and target.hp);
  elsif change_row->>'family'='encounters' then
   perform rpg_private.assert(not active_encounter and change_row->>'id'=v_encounter_id::text and change_row->'expectedRevision'='null' and (change_row->'values')-array['status','round','outcome','settings_revision','public_summary']='{}'::jsonb and change_row#>>'{values,status}'='active' and change_row#>>'{values,round}'='1');
  elsif change_row->>'family'='encounter_participants' then
   perform rpg_private.assert(change_row->>'id' in (actor_participant_id::text,target_participant_id::text));
   if active_encounter then
    perform rpg_private.assert((change_row->'values')-array['public_resources']='{}'::jsonb and change_row->>'id'=actor_participant_id::text or (change_row->>'id'=target_participant_id::text and (change_row->'values')-array['public_resources']='{}'::jsonb and p->>'method'='attack' and check_row->'success'='true'));
   else
    perform rpg_private.assert(change_row->'expectedRevision'='null' and (change_row->'values')-array['encounter_id','entity_id','public_name','turn_order','public_position','public_resources']='{}'::jsonb and change_row#>>'{values,encounter_id}'=v_encounter_id::text);
   end if;
  elsif change_row->>'family'='pending_actions' then
   perform rpg_private.assert(change_row->>'id'=action_id::text and change_row->'expectedRevision'='null' and change_row->'values'=jsonb_build_object('encounter_id',v_encounter_id,'participant_id',actor_participant_id,'status','resolved','public_proposal',jsonb_build_object('action',case when p->>'method'='attack' then 'attack' else 'attempt' end,'targetId',target.id)));
  elsif change_row->>'family'='effects' then
   perform rpg_private.assert(p->>'method'='attack' and check_row->'success'='true' and (change_row->'values')-array['definition']='{}'::jsonb and exists(select 1 from public.rpg_effects e where e.campaign_id=cid and e.id=(change_row->>'id')::uuid and e.entity_id=target.id and e.definition->>'kind'='meal' and e.definition->>'status'='active' and change_row->'expectedRevision'=to_jsonb(e.revision)));
  end if;
 end loop;
 if p->>'method'='improvise' or check_row->'success'='false' then
  perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') ch where ch->>'family' in ('entities','effects')));
 end if;
 return true;
end $$;
revoke all on function rpg_private.natural_mechanic_validate(uuid,uuid,rpg_private.turns,jsonb) from public,anon,authenticated,service_role;

-- A checkpointed natural intent cannot change across retries. Its final packet
-- receives the same World settlement/atomic runtime transaction as other turns.
do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('public.rpg_runtime_wave3(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
 needle:=$n$if p_action='checkpoint' and nullif(t.checkpoint->'worldLogic','null') is not null then$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('natural_mechanic_validate' in d)=0);
 execute replace(d,needle,$r$if p_action='checkpoint' and nullif(t.checkpoint->'naturalMechanic','null') is not null then perform rpg_private.assert(p_payload#>'{checkpoint,naturalMechanic}'=t.checkpoint->'naturalMechanic'); end if; if p_action='commit' and nullif(t.checkpoint->'naturalMechanic','null') is not null then perform rpg_private.assert(rpg_private.natural_mechanic_validate(p_owner_id,p_campaign_id,t,p_payload->'packet')); end if; if p_action='checkpoint' and nullif(t.checkpoint->'worldLogic','null') is not null then$r$);
end $$;

-- New characters may explicitly approve a small combat profile in the
-- existing creation review. Historical reviews without it retain their exact
-- meaning. Reviewed possessions already become Items; only a selected one is
-- equipped and tagged as a weapon. No owner campaign rows are backfilled.
do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('rpg_private.bootstrap_review(text,jsonb,jsonb)'::regprocedure);
 needle:=$n$perform rpg_private.fields(r,array['name','description','capabilities','limitations','possessions','resources','answers']);$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('weaponDamage' in d)=0);
 d:=replace(d,needle,$r$perform rpg_private.fields(r,case when r ? 'mechanics' then array['name','description','capabilities','limitations','possessions','resources','answers','mechanics'] else array['name','description','capabilities','limitations','possessions','resources','answers'] end);
  if r ? 'mechanics' then
   perform rpg_private.fields(r->'mechanics',array['hp','attack','defense','skill','weaponName','weaponDamage']);
   perform rpg_private.assert(rpg_private.wave4_integer(r#>'{mechanics,hp}',1) and (r#>>'{mechanics,hp}')::integer<=10000 and rpg_private.wave4_integer(r#>'{mechanics,attack}',-20) and (r#>>'{mechanics,attack}')::integer<=20 and rpg_private.wave4_integer(r#>'{mechanics,defense}',1) and (r#>>'{mechanics,defense}')::integer<=40 and rpg_private.wave4_integer(r#>'{mechanics,skill}',-20) and (r#>>'{mechanics,skill}')::integer<=20);
   perform rpg_private.assert((r#>'{mechanics,weaponName}'='null' and r#>'{mechanics,weaponDamage}'='null') or (rpg_private.bootstrap_text(r#>'{mechanics,weaponName}',1,200) and rpg_private.wave4_integer(r#>'{mechanics,weaponDamage}',1) and (r#>>'{mechanics,weaponDamage}')::integer<=20 and exists(select 1 from jsonb_array_elements(r->'possessions') gear where gear->'name'=r#>'{mechanics,weaponName}' and (gear->>'quantity')::integer>=1)));
  end if;$r$);
 execute d;
end $$;

do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('public.rpg_bootstrap(uuid,uuid,text,jsonb)'::regprocedure);
 perform rpg_private.assert(position('bootstrap:mechanics' in d)=0);
 needle:=$n$'hp',null,'max_hp',null,'stats','{}'::jsonb$n$;
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,$r$'hp',coalesce(review#>'{mechanics,hp}','null'::jsonb),'max_hp',coalesce(review#>'{mechanics,hp}','null'::jsonb),'stats',case when review ? 'mechanics' then jsonb_build_object('attack',review#>'{mechanics,attack}','defense',review#>'{mechanics,defense}','skill',review#>'{mechanics,skill}') else '{}'::jsonb end$r$);
 needle:=$n$'equipment_slots','[]'::jsonb)))$n$;
 perform rpg_private.assert(position(needle in d)>0);
 d:=left(d,position(needle in d)-1)||$r$'equipment_slots',case when review#>'{mechanics,weaponName}' is not null and review#>'{mechanics,weaponName}'<>'null' then '[{"id":"hand","label":"Hand","accepts":["weapon"]}]'::jsonb else '[]'::jsonb end)))$r$||substr(d,position(needle in d)+length(needle));
 needle:=$n$'category','possession','quantity',x->'quantity'$n$;
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,$r$'category',case when x->'name'=review#>'{mechanics,weaponName}' then 'weapon' else 'possession' end,'quantity',x->'quantity'$r$);
 needle:=$n$'equipped_entity_id',null,'equipped_slot',null)))$n$;
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,$r$'equipped_entity_id',case when x->'name'=review#>'{mechanics,weaponName}' then hero else null end,'equipped_slot',case when x->'name'=review#>'{mechanics,weaponName}' then 'hand' else null end)))$r$);
 needle:=$n$perform rpg_private.world_validate_state(uid,cid,worldstate,'[]'); perform rpg_private.wave4_state(cid,loopstate,loopstate->'profile');$n$;
 perform rpg_private.assert(position(needle in d)>0);
 d:=replace(d,needle,$r$perform rpg_private.world_validate_state(uid,cid,worldstate,'[]'); perform rpg_private.wave4_state(cid,loopstate,loopstate->'profile');
  if review ? 'mechanics' then
   perform public.rpg_runtime(uid,cid,'configure',jsonb_build_object('requestId',rpg_private.wave4_id(op,'bootstrap:mechanics'),'campaignId',cid,'expectedRevision',(select revision from rpg_private.runtime_state where campaign_id=cid),'configuration',jsonb_build_object('profile','console-basic-v1','controlledEntityIds',jsonb_build_array(hero),'presentEntityIds',jsonb_build_array(hero),'nearbyStorageIds','[]'::jsonb,'safeLocationIds','[]'::jsonb,'itemRules',case when review#>'{mechanics,weaponName}' is not null and review#>'{mechanics,weaponName}'<>'null' then jsonb_build_array(jsonb_build_object('itemId',rpg_private.wave4_id(op,'bootstrap:item:'||(select ordinality::text from jsonb_array_elements(review->'possessions') with ordinality where value->'name'=review#>'{mechanics,weaponName}')),'tag','weapon','damage',review#>'{mechanics,weaponDamage}')) else '[]'::jsonb end)),rpg_private.timeline_fence(cid));
  end if;$r$);
 execute d;
end $$;

commit;
