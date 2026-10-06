-- One bounded active-encounter turn: ordered player Move/Action, then the
-- existing autonomous continuation. Migration 36's schema-1 path is untouched.
begin;

do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure);
 needle:=$n$array['worldSettlement','worldLogic','foundationAction','foundationSettlement','naturalMechanic','combatExchange']$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('naturalCombatTurn' in d)=0);
 execute replace(d,needle,$r$array['worldSettlement','worldLogic','foundationAction','foundationSettlement','naturalMechanic','combatExchange','naturalCombatTurn']$r$);
end $$;

do $$ declare d text; needle text; begin
 d:=pg_get_functiondef('rpg_private.timeline_stamp(jsonb,jsonb,boolean)'::regprocedure);
 needle:=$n$'worldSettlement','worldLogic','naturalMechanic','combatExchange'$n$;
 perform rpg_private.assert(position(needle in d)>0 and position('naturalCombatTurn' in d)=0);
 execute replace(d,needle,$r$'worldSettlement','worldLogic','naturalMechanic','combatExchange','naturalCombatTurn'$r$);
end $$;

create function rpg_private.natural_combat_turn_validate(uid uuid,cid uuid,t rpg_private.turns,packet jsonb) returns boolean
language plpgsql stable set search_path='' as $$
#variable_conflict use_variable
declare
 turn_intent jsonb:=t.checkpoint->'naturalCombatTurn'; ex jsonb:=t.checkpoint->'combatExchange';
 source jsonb:=t.source; config jsonb; world jsonb; plan jsonb:=t.checkpoint->'plan';
 player_resolution jsonb; actions jsonb; intents jsonb; npc_checks jsonb; player_checks jsonb:=t.checkpoint->'checks';
 expected jsonb:='{}'; states jsonb:='{}'; actors jsonb:='{}'; expected_outcomes jsonb:='[]';
 row jsonb; ch jsonb; a jsonb; step jsonb; intent jsonb; check_row jsonb; resources jsonb;
 outcome_text text; outcome_ids jsonb; base jsonb; values_row jsonb; meal jsonb;
 k text; pid text; actor_id text; target_id text; current_pid text; next_pid text;
 encounter_id text; player_id text:=t.checkpoint#>>'{naturalCombatTurn,actorId}'; target_pid text;
 action_name text; target_hp integer; damage integer; absorbed integer; bonus integer; expected_adv text;
 round_number integer; old_order integer; next_order integer; action_index integer;
 step_count integer; action_count integer:=0; move_count integer:=0; intent_index integer:=0;
 check_index integer:=0; npc_check_index integer:=0; player_check_count integer:=0;
 expected_count integer; actual_count integer; candidate record; original_resources jsonb;
 wrapped boolean; must_end boolean:=false; defeat text; settings jsonb;
begin
 perform rpg_private.fields(turn_intent,array['schemaVersion','input','actorId','steps']);
 perform rpg_private.fields(ex,array['schemaVersion','resumeOnly','playerConfirmed','playerResolution','npcIntents','npcChecks','actions']);
 perform rpg_private.assert(t.owner_id=uid and t.campaign_id=cid and t.input->>'mode'='game' and
   turn_intent->'schemaVersion'='5' and turn_intent->'input'=t.input->'input' and
   ex->'schemaVersion'='2' and ex->'resumeOnly'='false' and
   jsonb_typeof(ex->'playerConfirmed')='boolean' and
   nullif(t.checkpoint->'naturalMechanic','null') is null and nullif(t.checkpoint->'worldLogic','null') is null and
   nullif(t.checkpoint->'worldSettlement','null') is null and nullif(t.checkpoint->'foundationAction','null') is null and
   nullif(t.checkpoint->'foundationSettlement','null') is null and nullif(packet->'worldSettlement','null') is null and
   plan->'privatePatches'='[]' and nullif(plan->'foundationAction','null') is null and packet->'privatePatches'='[]' and
   packet->'checks'=player_checks and packet->'resolution'=t.checkpoint->'resolution' and
   packet#>'{resolution,configuration}'=source#>'{runtime,configuration}' and
   packet#>'{resolution,worldMinutes}'=source#>'{runtime,worldMinutes}' and
   source->>'ownerId'=uid::text and source#>>'{snapshot,campaign,id}'=cid::text and
   source#>>'{snapshot,settings,values,rulesSystem,id}'='world-logic-v1');
 player_resolution:=ex->'playerResolution'; actions:=ex->'actions';
 intents:=ex->'npcIntents'; npc_checks:=ex->'npcChecks';
 perform rpg_private.assert(jsonb_typeof(turn_intent->'steps')='array' and
   jsonb_array_length(turn_intent->'steps')<=2 and jsonb_typeof(player_resolution)='object' and
   jsonb_typeof(actions)='array' and jsonb_array_length(actions) between 1 and 48 and
   jsonb_typeof(npc_checks)='array' and jsonb_array_length(npc_checks)<=12 and
   jsonb_typeof(intents) in ('array','null'));
 step_count:=jsonb_array_length(turn_intent->'steps');
 perform rpg_private.assert(jsonb_typeof(plan->'publicPatches')='array' and
   jsonb_array_length(plan->'publicPatches')=step_count and jsonb_typeof(plan->'checks')='array');
 config:=source#>'{runtime,configuration}';
 perform rpg_private.assert(config->>'profile'='console-basic-v1' and config->'controlledEntityIds' ? player_id and
   config->'presentEntityIds' ? player_id and
   (select configuration=config from rpg_private.runtime_state where campaign_id=cid) and
   (select current_location_id::text=source#>>'{snapshot,publicState,current_location_id}'
      from public.rpg_public_state where campaign_id=cid));
 select wf.world into world from rpg_private.world_foundations wf where wf.campaign_id=cid and wf.ruleset->>'id'='world-logic-v1';
 perform rpg_private.assert(world is not null and exists(select 1 from public.rpg_entities e,
   jsonb_array_elements(world->'actors') wa where e.id=player_id::uuid and e.campaign_id=cid and e.kind='player' and
   e.hp>0 and wa->>'entityId'=e.id::text and wa->>'control'='player' and
   wa->>'locationId'=source#>>'{snapshot,publicState,current_location_id}' and
   exists(select 1 from jsonb_array_elements(source#>'{snapshot,entities}') se
      where se->>'id'=e.id::text and (se->>'revision')::integer=e.revision)));
 select e.id::text,e.round into encounter_id,round_number from public.rpg_encounters e
   where e.campaign_id=cid and e.status='active';
 perform rpg_private.assert(encounter_id is not null and exists(select 1 from jsonb_array_elements(source#>'{runtime,encounters}') se
   where se->>'id'=encounter_id and (se->>'round')::integer=round_number and se->>'status'='active' and
     se->>'settings_revision'=(select e.settings_revision::text from public.rpg_encounters e where e.id=encounter_id::uuid)));
 for row in select value from jsonb_array_elements(source#>'{runtime,participants}') loop
   if row->>'campaign_id'=cid::text and row->>'encounter_id'=encounter_id then
     perform rpg_private.assert(exists(select 1 from public.rpg_encounter_participants ep
       where ep.campaign_id=cid and ep.id=(row->>'id')::uuid and ep.encounter_id=encounter_id::uuid and
         row->'public_resources'=ep.public_resources and row->'public_position'=ep.public_position));
     states:=states||jsonb_build_object(row->>'id',row);
   end if;
 end loop;
 perform rpg_private.assert((select count(*) from jsonb_each(states))=
   (select count(*) from public.rpg_encounter_participants ep where ep.campaign_id=cid and ep.encounter_id=encounter_id::uuid));
 for row in select value from jsonb_array_elements(source#>'{snapshot,entities}') loop
   if row->>'campaign_id'=cid::text then actors:=actors||jsonb_build_object(row->>'id',row); end if;
 end loop;
 select key into current_pid from jsonb_each(states) where value#>>'{public_resources,active}'='true';
 select key into pid from jsonb_each(states) where value->>'entity_id'=player_id;
 perform rpg_private.assert(pid=current_pid and pid is not null and states#>>array[pid,'public_resources','withdrawn']<>'true');
 select value into settings from jsonb_array_elements(source#>'{snapshot,settingsHistory}')
   where value->>'revision'=(select e.settings_revision::text from public.rpg_encounters e where e.id=encounter_id::uuid);
 if settings is null and source#>>'{snapshot,settings,revision}'=
   (select e.settings_revision::text from public.rpg_encounters e where e.id=encounter_id::uuid) then
   settings:=source#>'{snapshot,settings}';
 end if;
 perform rpg_private.assert(settings is not null and settings->>'campaign_id'=cid::text);
 settings:=settings->'values'; defeat:=settings#>>'{difficulty,defeat}';
 perform rpg_private.assert(defeat in ('death','injuries','setback') and round_number>=1);
 for action_index in 0..step_count-1 loop
   step:=turn_intent->'steps'->action_index;
   perform rpg_private.fields(step,array['action','targetId','itemId','equipmentName','position']);
   action_name:=step->>'action';
   perform rpg_private.assert(action_name in ('attack','attempt','defend','move'));
   if action_name='move' then move_count:=move_count+1; else action_count:=action_count+1; end if;
   perform rpg_private.assert(move_count<=1 and action_count<=1);
   if action_name in ('attack','attempt') then
     perform rpg_private.assert(step->'position'='null' and step->'targetId'<>'null' and
       config->'presentEntityIds' ? (step->>'targetId') and
       exists(select 1 from public.rpg_entities e,jsonb_array_elements(world->'actors') wa
         where e.id=(step->>'targetId')::uuid and e.campaign_id=cid and e.kind='npc' and e.hp>0 and
           wa->>'entityId'=e.id::text and wa->>'control'='autonomous' and wa->>'publicName'=e.name and
           wa->>'locationId'=source#>>'{snapshot,publicState,current_location_id}' and
           exists(select 1 from jsonb_array_elements(source#>'{snapshot,entities}') se
             where se->>'id'=e.id::text and (se->>'revision')::integer=e.revision)));
     if step->'itemId'<>'null' then
       perform rpg_private.assert(action_name='attack' and exists(select 1 from public.rpg_items wi
         where wi.id=(step->>'itemId')::uuid and wi.campaign_id=cid and wi.owner_entity_id=player_id::uuid and
           wi.equipped_entity_id=player_id::uuid and wi.quantity>0 and wi.name=step->>'equipmentName' and
           exists(select 1 from jsonb_array_elements(source#>'{snapshot,items}') si
             where si->>'id'=wi.id::text and (si->>'revision')::integer=wi.revision) and
           exists(select 1 from jsonb_array_elements(config->'itemRules') rule
             where rule->>'itemId'=wi.id::text and rule->>'tag'='weapon')));
     else perform rpg_private.assert(step->'equipmentName'='null'); end if;
     player_check_count:=player_check_count+1;
   else
     perform rpg_private.assert(step->'targetId'='null' and step->'itemId'='null' and step->'equipmentName'='null' and
       (action_name<>'move' and step->'position'='null' or action_name='move' and step->>'position' in ('nearby','far','cover')));
   end if;
   perform rpg_private.assert(plan->'publicPatches'->action_index=jsonb_build_object(
     'kind','encounter.action','actorId',player_id,'action',action_name,'targetId',step->'targetId',
     'itemId',step->'itemId','position',step->'position') and actions->action_index=plan->'publicPatches'->action_index);
 end loop;
 perform rpg_private.assert(jsonb_array_length(plan->'checks')=player_check_count and
   jsonb_array_length(player_checks)=player_check_count);
 -- The replay below compares each row and public outcome, including the player
 -- prefix before any NPC intent. It never accepts model-authored state patches.
 for action_index in 0..jsonb_array_length(actions)-1 loop
   if action_index=step_count then
     perform rpg_private.assert(player_resolution->'configuration'=source#>'{runtime,configuration}' and
       player_resolution->'worldMinutes'=source#>'{runtime,worldMinutes}' and
       player_resolution->'outcomes'=expected_outcomes and
       (select count(*) from jsonb_array_elements(player_resolution->'changes'))=
         (select count(*) from jsonb_object_keys(expected)) and
       not exists(select 1 from jsonb_array_elements(player_resolution->'changes') pc
         where expected->((pc->>'family')||':'||(pc->>'id')) is distinct from pc));
   end if;
   a:=actions->action_index;
   action_name:=a->>'action';
   if a->>'kind'='encounter.end' then
     perform rpg_private.assert(action_index=step_count and action_index=jsonb_array_length(actions)-1 and
       a->>'outcome'='victory' and intent_index=0 and
       not exists(select 1 from jsonb_each(states) s where not (config->'controlledEntityIds' ? (s.value->>'entity_id')) and s.value#>>'{public_resources,withdrawn}'<>'true'));
     k:='encounters:'||encounter_id;
     values_row:=jsonb_build_object('status','ended','outcome','victory','public_summary','The encounter ended. No automatic recovery or loot was granted.');
     base:=expected->k;
     expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounters','id',encounter_id,
       'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),
       'values',coalesce(base->'values','{}'::jsonb)||values_row));
     for candidate in select key,value from jsonb_each(states) loop
       resources:=(candidate.value->'public_resources')||jsonb_build_object('active',false);
       states:=jsonb_set(states,array[candidate.key,'public_resources'],resources);
       k:='encounter_participants:'||candidate.key; base:=expected->k;
       expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounter_participants','id',candidate.key,
         'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),'values',coalesce(base->'values','{}'::jsonb)||jsonb_build_object('public_resources',resources)));
     end loop;
     expected_outcomes:=expected_outcomes||jsonb_build_array(jsonb_build_object('kind','encounter.end',
       'text','The encounter ended with its recorded outcome; health and inventory remain authoritative.',
       'entityIds','[]'::jsonb,'itemIds','[]'::jsonb));
     continue;
   end if;
   perform rpg_private.assert(a->>'kind'='encounter.action' and a->>'actorId' is not null);
   actor_id:=a->>'actorId'; target_id:=a->>'targetId';
   select key into pid from jsonb_each(states) where value->>'entity_id'=actor_id;
   perform rpg_private.assert(pid=current_pid and states#>>array[pid,'public_resources','active']='true');
   if action_index<step_count then
     perform rpg_private.assert(actor_id=player_id and a=plan->'publicPatches'->action_index);
   elsif action_index=step_count then
     perform rpg_private.assert(actor_id=player_id and action_name='end-turn' and a->'targetId'='null' and
       a->'itemId'='null' and a->'position'='null');
   elsif config->'controlledEntityIds' ? actor_id then
     raise exception 'rpg_validation';
   elsif must_end then
     perform rpg_private.assert(action_name='end-turn' and a->'targetId'='null' and a->'position'='null');
     must_end:=false;
   else
     perform rpg_private.assert(jsonb_typeof(intents)='array' and intent_index<jsonb_array_length(intents));
     intent:=intents->intent_index; intent_index:=intent_index+1;
     perform rpg_private.fields(intent,array['actorId','action','targetId','itemId','position','description']);
     perform rpg_private.assert(intent->>'actorId'=actor_id and intent->>'action'=action_name and
       intent->'targetId'=a->'targetId' and intent->'itemId'=a->'itemId' and intent->'position'=a->'position' and
       jsonb_typeof(intent->'description')='string' and length(intent->>'description')<=240);
     if action_name<>'end-turn' then must_end:=true; end if;
   end if;
   resources:=states#>array[pid,'public_resources'];
   if action_name='attack' or action_name='attempt' then
     perform rpg_private.assert((config->'controlledEntityIds' ? actor_id) <>
       (config->'controlledEntityIds' ? target_id) and
       (resources->>'action')::integer=1 and a->'position'='null');
     if a->'itemId'<>'null' then
       perform rpg_private.assert(action_name='attack' and exists(select 1 from public.rpg_items wi
         where wi.id=(a->>'itemId')::uuid and wi.campaign_id=cid and wi.owner_entity_id=actor_id::uuid and
           wi.equipped_entity_id=actor_id::uuid and wi.quantity>0 and
           exists(select 1 from jsonb_array_elements(source#>'{snapshot,items}') si
             where si->>'id'=wi.id::text and (si->>'revision')::integer=wi.revision) and
           exists(select 1 from jsonb_array_elements(config->'itemRules') rule
             where rule->>'itemId'=wi.id::text and rule->>'tag'='weapon')));
     end if;
     select key into target_pid from jsonb_each(states) where value->>'entity_id'=target_id;
     perform rpg_private.assert(target_pid is not null and states#>>array[target_pid,'public_position','position']<>'far' and
       states#>>array[pid,'public_position','position']<>'far' and
       states#>>array[target_pid,'public_resources','withdrawn']<>'true');
     if action_index<step_count then
       perform rpg_private.assert(player_check_count=1 and check_index=0);
       check_row:=player_checks->0;
       perform rpg_private.assert((check_row-array['id','dice','kept','modifier','total','success','rollNumber'])=
         plan->'checks'->0);
     else
       perform rpg_private.assert(npc_check_index<jsonb_array_length(npc_checks));
       check_row:=npc_checks->npc_check_index; npc_check_index:=npc_check_index+1;
     end if;
     perform rpg_private.fields(check_row,array['index','actorId','targetId','kind','stat','dc','dcPublic','visibility','important','uncertainty','advantage','id','dice','kept','modifier','total','success','rollNumber']);
     expected_adv:=case when (actors#>array[actor_id,'conditions']) ? ('advantage:'||case when action_name='attack' then 'attack' else 'skill' end) and
       not ((actors#>array[actor_id,'conditions']) ? ('disadvantage:'||case when action_name='attack' then 'attack' else 'skill' end)) then 'advantage'
       when (actors#>array[actor_id,'conditions']) ? ('disadvantage:'||case when action_name='attack' then 'attack' else 'skill' end) and
       not ((actors#>array[actor_id,'conditions']) ? ('advantage:'||case when action_name='attack' then 'attack' else 'skill' end)) then 'disadvantage'
       else 'normal' end;
     bonus:=case when action_name='attempt' and exists(select 1 from jsonb_array_elements(source#>'{runtime,effects}') e
       where e.value->>'entity_id'=actor_id and e.value#>>'{definition,kind}'='coffee' and
       e.value#>>'{definition,status}'='active' and e.value#>>'{definition,remaining}'='1') then 1 else 0 end;
     perform rpg_private.assert((check_row->>'index')::integer=check_index and check_row->>'actorId'=actor_id and
       check_row->>'targetId'=target_id and check_row->>'kind'=case when action_name='attack' then 'attack' else 'skill' end and
       check_row->>'stat'=check_row->>'kind' and check_row->>'visibility'=
         case when action_index<step_count then 'player' else 'private' end and check_row->'dcPublic'='false' and
       check_row->'important'='true' and check_row->>'uncertainty'='meaningful' and check_row->>'rollNumber'='1' and
       check_row->>'id'=rpg_private.wave4_id(t.id,'check:'||check_index::text)::text and
       (check_row->>'dc')::integer=coalesce((actors#>>array[target_id,'stats','defense'])::integer,10) and
       (check_row->>'modifier')::integer=coalesce((actors#>>array[actor_id,'stats',check_row->>'stat'])::integer,0)+bonus and
       check_row->>'advantage'=expected_adv and jsonb_array_length(check_row->'dice')=case when expected_adv='normal' then 1 else 2 end and
       not exists(select 1 from jsonb_array_elements(check_row->'dice') die where (die.value::text)::integer not between 1 and 20) and
       (check_row->>'kept')::integer=case when expected_adv='disadvantage' then
         (select min((die.value::text)::integer) from jsonb_array_elements(check_row->'dice') die) else
         (select max((die.value::text)::integer) from jsonb_array_elements(check_row->'dice') die) end and
       (check_row->>'total')::integer=(check_row->>'kept')::integer+(check_row->>'modifier')::integer and
       (check_row->>'success')::boolean=((check_row->>'total')::integer>=(check_row->>'dc')::integer));
     check_index:=check_index+1;
     resources:=resources||jsonb_build_object('action',0);
     if action_name='attempt' and bonus=1 then
       select e.value into meal from jsonb_array_elements(source#>'{runtime,effects}') e
         where e.value->>'entity_id'=actor_id and e.value#>>'{definition,kind}'='coffee' and
           e.value#>>'{definition,status}'='active' and e.value#>>'{definition,remaining}'='1' limit 1;
       values_row:=jsonb_build_object('definition',(meal->'definition')||'{"remaining":0,"status":"expired"}'::jsonb);
       k:='effects:'||(meal->>'id'); base:=expected->k;
       expected:=expected||jsonb_build_object(k,jsonb_build_object('family','effects','id',meal->>'id',
         'expectedRevision',coalesce(base->'expectedRevision',meal->'revision','null'::jsonb),
         'values',coalesce(base->'values','{}'::jsonb)||values_row));
     end if;
     if action_name='attack' and check_row->'success'='true' then
       damage:=2;
       if a->'itemId'<>'null' then
         select coalesce((rule->>'damage')::integer,2) into damage from jsonb_array_elements(config->'itemRules') rule
           where rule->>'itemId'=a->>'itemId' and rule->>'tag'='weapon' limit 1;
         perform rpg_private.assert(damage between 1 and 1000000);
       end if;
       if not (config->'controlledEntityIds' ? actor_id) and settings#>'{rulesSystem,enemyDamageScaling}'='true' then
         damage:=ceil(damage*(settings#>>'{difficulty,enemyDamageMultiplier}')::numeric)::integer;
       end if;
       if states#>>array[target_pid,'public_resources','defending']='true' or
         states#>>array[target_pid,'public_position','position']='cover' then damage:=greatest(0,damage-1); end if;
       select e.value into meal from jsonb_array_elements(source#>'{runtime,effects}') e
         where e.value->>'entity_id'=target_id and e.value#>>'{definition,kind}'='meal' and e.value#>>'{definition,status}'='active' limit 1;
       if meal is not null then
         absorbed:=least(damage,(meal#>>'{definition,remaining}')::integer);
         perform rpg_private.assert(absorbed between 0 and 2);
         damage:=damage-absorbed;
         values_row:=jsonb_build_object('definition',(meal->'definition')||jsonb_build_object('remaining',(meal#>>'{definition,remaining}')::integer-absorbed));
         k:='effects:'||(meal->>'id'); base:=expected->k;
         expected:=expected||jsonb_build_object(k,jsonb_build_object('family','effects','id',meal->>'id',
           'expectedRevision',coalesce(base->'expectedRevision',meal->'revision','null'::jsonb),
           'values',coalesce(base->'values','{}'::jsonb)||values_row));
       end if;
       target_hp:=greatest(0,(actors#>>array[target_id,'hp'])::integer-damage);
       values_row:=jsonb_build_object('hp',target_hp,'conditions',actors#>array[target_id,'conditions']);
       if target_hp=0 then
         if defeat='death' then
           values_row:=jsonb_set(values_row,'{conditions}',case when (values_row->'conditions') ? 'dead' then values_row->'conditions' else values_row->'conditions'||'"dead"'::jsonb end);
         else
           values_row:=jsonb_set(values_row,'{hp}','1'::jsonb);
           values_row:=jsonb_set(values_row,'{conditions}',(values_row->'conditions')||jsonb_build_array('withdrawn',case when defeat='injuries' then 'injured' else 'setback' end));
         end if;
         original_resources:=states#>array[target_pid,'public_resources'];
         original_resources:=original_resources||jsonb_build_object('withdrawn',true);
         states:=jsonb_set(states,array[target_pid,'public_resources'],original_resources);
         k:='encounter_participants:'||target_pid; base:=expected->k;
         expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounter_participants','id',target_pid,
           'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),'values',coalesce(base->'values','{}'::jsonb)||jsonb_build_object('public_resources',original_resources)));
       end if;
       actors:=jsonb_set(actors,array[target_id],(actors->target_id)||values_row);
       k:='entities:'||target_id; base:=expected->k;
       expected:=expected||jsonb_build_object(k,jsonb_build_object('family','entities','id',target_id,
         'expectedRevision',coalesce(base->'expectedRevision',actors#>array[target_id,'revision']),'values',coalesce(base->'values','{}'::jsonb)||values_row));
     end if;
     outcome_text:=case when action_name='attack' then
       case when check_row->'success'='true' then 'The attack hit; code-validated damage was applied.'
         else 'The attack missed; its action cost was spent.' end
       else case when check_row->'success'='true' then
         'The physical attempt made contact; no condition, damage or transfer was established.'
         else 'The physical attempt failed; no condition, damage or transfer was established.' end end;
     outcome_ids:=jsonb_build_array(actor_id,target_id);
   elsif action_name='defend' then
     perform rpg_private.assert((resources->>'action')::integer=1 and a->'targetId'='null' and a->'itemId'='null' and a->'position'='null');
     resources:=resources||'{"action":0,"defending":true}'::jsonb;
     outcome_text:='The actor defends until their next turn.'; outcome_ids:=jsonb_build_array(actor_id);
   elsif action_name='move' then
     perform rpg_private.assert((resources->>'move')::integer=1 and a->'targetId'='null' and a->'itemId'='null' and a->>'position' in ('nearby','far','cover'));
     resources:=resources||'{"move":0}'::jsonb;
     states:=jsonb_set(states,array[pid,'public_position'],jsonb_build_object('position',a->>'position'));
     k:='encounter_participants:'||pid; base:=expected->k;
     expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounter_participants','id',pid,
       'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),'values',coalesce(base->'values','{}'::jsonb)||jsonb_build_object('public_position',states#>array[pid,'public_position'])));
     outcome_text:='The public position changed; the move budget was spent.'; outcome_ids:=jsonb_build_array(actor_id);
   elsif action_name='end-turn' then
     perform rpg_private.assert(a->'targetId'='null' and a->'itemId'='null' and a->'position'='null');
     old_order:=(states->pid->>'turn_order')::integer;
     select s.key,(s.value->>'turn_order')::integer into next_pid,next_order from jsonb_each(states) s
       where s.value#>>'{public_resources,withdrawn}'<>'true' and
         (actors#>>array[s.value->>'entity_id','hp'])::integer>0 and
         not ((actors#>array[s.value->>'entity_id','conditions']) ?| array['dead','withdrawn']) and
         (s.value->>'turn_order')::integer>old_order
       order by (s.value->>'turn_order')::integer limit 1;
     if next_pid is null then
       select s.key,(s.value->>'turn_order')::integer into next_pid,next_order from jsonb_each(states) s
         where s.value#>>'{public_resources,withdrawn}'<>'true' and
           (actors#>>array[s.value->>'entity_id','hp'])::integer>0 and
           not ((actors#>array[s.value->>'entity_id','conditions']) ?| array['dead','withdrawn'])
           order by (s.value->>'turn_order')::integer limit 1;
     end if;
     perform rpg_private.assert(next_pid is not null);
     wrapped:=next_order<=old_order;
     for candidate in select key,value from jsonb_each(states) s where s.value#>>'{public_resources,withdrawn}'<>'true' and
       (actors#>>array[s.value->>'entity_id','hp'])::integer>0 and
       not ((actors#>array[s.value->>'entity_id','conditions']) ?| array['dead','withdrawn']) loop
       original_resources:=(candidate.value->'public_resources')||jsonb_build_object('active',candidate.key=next_pid);
       if wrapped then original_resources:=original_resources||'{"reaction":1}'::jsonb; end if;
       if candidate.key=next_pid then original_resources:=original_resources||'{"action":1,"move":1,"defending":false}'::jsonb; end if;
       states:=jsonb_set(states,array[candidate.key,'public_resources'],original_resources);
       k:='encounter_participants:'||candidate.key; base:=expected->k;
       expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounter_participants','id',candidate.key,
         'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),'values',coalesce(base->'values','{}'::jsonb)||jsonb_build_object('public_resources',original_resources)));
     end loop;
     current_pid:=next_pid;
     if wrapped then
       round_number:=round_number+1;
       k:='encounters:'||encounter_id; base:=expected->k;
       expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounters','id',encounter_id,
         'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),
         'values',coalesce(base->'values','{}'::jsonb)||jsonb_build_object('round',round_number)));
     end if;
     outcome_text:='The next eligible participant may act.';
     outcome_ids:=jsonb_build_array(actor_id,states->next_pid->'entity_id');
   else raise exception 'rpg_validation';
   end if;
   expected_outcomes:=expected_outcomes||jsonb_build_array(jsonb_build_object('kind','encounter.action',
     'text',outcome_text,'entityIds',outcome_ids,'itemIds','[]'::jsonb));
   if action_name<>'end-turn' then
     states:=jsonb_set(states,array[pid,'public_resources'],resources);
     k:='encounter_participants:'||pid; base:=expected->k;
     expected:=expected||jsonb_build_object(k,jsonb_build_object('family','encounter_participants','id',pid,
       'expectedRevision',coalesce(base->'expectedRevision','null'::jsonb),'values',coalesce(base->'values','{}'::jsonb)||jsonb_build_object('public_resources',resources)));
   end if;
   k:='pending_actions:'||rpg_private.wave4_id(t.id,'action:'||action_index::text)::text;
   perform rpg_private.assert(not expected ? k);
   expected:=expected||jsonb_build_object(k,jsonb_build_object('family','pending_actions','id',rpg_private.wave4_id(t.id,'action:'||action_index::text),
     'expectedRevision',null,'values',jsonb_build_object('encounter_id',encounter_id,'participant_id',pid,'status','resolved',
       'public_proposal',jsonb_build_object('action',action_name,'targetId',a->'targetId'))));
 end loop;
 perform rpg_private.assert(npc_check_index=jsonb_array_length(npc_checks) and
   check_index=player_check_count+npc_check_index and
   (not must_end or not exists(select 1 from jsonb_each(states) s
     where config->'controlledEntityIds' ? (s.value->>'entity_id') and
       s.value#>>'{public_resources,withdrawn}'<>'true')));
 if jsonb_typeof(intents)='array' then
   perform rpg_private.assert(intent_index=jsonb_array_length(intents) or
     not exists(select 1 from jsonb_each(states) where config->'controlledEntityIds' ? (value->>'entity_id') and value#>>'{public_resources,withdrawn}'<>'true'));
 end if;
 perform rpg_private.assert(not exists(select 1 from jsonb_each(states) s
   where s.value#>>'{public_resources,active}'='true' and
     not (config->'controlledEntityIds' ? (s.value->>'entity_id'))) or
   not exists(select 1 from jsonb_each(states) s
     where config->'controlledEntityIds' ? (s.value->>'entity_id') and
       s.value#>>'{public_resources,withdrawn}'<>'true'));
 select count(*) into expected_count from jsonb_object_keys(expected);
 select count(*) into actual_count from jsonb_array_elements(packet#>'{resolution,changes}');
 perform rpg_private.assert(expected_count=actual_count and
   not exists(select 1 from jsonb_array_elements(packet#>'{resolution,changes}') c
     where expected->((c.value->>'family')||':'||(c.value->>'id')) is distinct from c.value));
 perform rpg_private.assert(packet#>'{resolution,outcomes}'=expected_outcomes);
 return true;
end $$;
revoke all on function rpg_private.natural_combat_turn_validate(uuid,uuid,rpg_private.turns,jsonb)
  from public,anon,authenticated,service_role;

-- Freeze the semantic interpretation before any roll, intent or final commit.
-- The migration-36 schema-1/v4 branch and its validator remain byte-identical.
do $$ declare d text; needle text; replacement text; begin
 d:=pg_get_functiondef('public.rpg_runtime_wave3(uuid,uuid,text,jsonb,jsonb)'::regprocedure);
 needle:=$n$if p_action='checkpoint' and nullif(t.checkpoint->'worldLogic','null') is not null then$n$;
 replacement:=$r$if p_action='checkpoint' and nullif(t.checkpoint->'naturalCombatTurn','null') is not null then
  perform rpg_private.assert(p_payload#>'{checkpoint,naturalCombatTurn}'=t.checkpoint->'naturalCombatTurn');
 end if;
 if p_action='commit' and nullif(t.checkpoint->'naturalCombatTurn','null') is not null then
  perform rpg_private.assert(rpg_private.natural_combat_turn_validate(p_owner_id,p_campaign_id,t,p_payload->'packet'));
 end if;
 if p_action='checkpoint' and nullif(t.checkpoint->'worldLogic','null') is not null then$r$;
 perform rpg_private.assert(position(needle in d)>0 and position('natural_combat_turn_validate' in d)=0);
 execute replace(d,needle,replacement);
end $$;

commit;
