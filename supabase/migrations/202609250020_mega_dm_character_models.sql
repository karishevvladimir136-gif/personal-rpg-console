-- Character Model v1 is a bounded namespace in the existing DM-private state.
-- Ordinary turns reuse the existing atomic runtime commit and save/timeline vault.
begin;

create function rpg_private.character_model_valid(cid uuid,actor uuid,model jsonb,previous jsonb,owner_correction boolean default false)
returns void language plpgsql stable set search_path='' as $$
declare x jsonb; y jsonb; ref jsonb; bucket text; entry jsonb; target uuid; source_visibility text; begin
 perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=actor and kind in ('npc','companion')));
 perform rpg_private.assert(jsonb_typeof(model)='object' and octet_length(model::text)<=2000);
 perform rpg_private.fields(model,array['schemaVersion','actorId','basisOperationId','identity','current','beliefs','relationships','episodes']);
 perform rpg_private.assert(model->'schemaVersion'='1'::jsonb and model->>'actorId'=actor::text);
 perform rpg_private.assert(model->'basisOperationId'='null'::jsonb or ((model->>'basisOperationId')::uuid is not null));
 x:=model->'identity'; perform rpg_private.fields(x,array['values','wants','boundaries','loyalties','signatures','observableVoice']);
 perform rpg_private.assert(jsonb_typeof(x->'observableVoice')='string' and length(btrim(x->>'observableVoice')) between 1 and 180);
 for bucket in select unnest(array['values','wants','boundaries','loyalties','signatures']) loop
  perform rpg_private.assert(jsonb_typeof(x->bucket)='array' and jsonb_array_length(x->bucket)<=case bucket when 'values' then 3 when 'signatures' then 3 else 2 end);
  for y in select value from jsonb_array_elements(x->bucket) loop
   perform rpg_private.assert(jsonb_typeof(y)='string' and length(btrim(y#>>'{}')) between 1 and 120);
  end loop;
 end loop;
 if not owner_correction then
  perform rpg_private.assert(previous is not null and jsonb_typeof(previous)='object' and previous->'identity'=model->'identity');
 end if;
 x:=model->'current'; perform rpg_private.fields(x,array['goal','stress','preoccupation','obligation']);
 perform rpg_private.assert(x->>'stress' in ('settled','strained','acute'));
 for bucket in select unnest(array['goal','preoccupation','obligation']) loop
  perform rpg_private.assert(x->bucket='null'::jsonb or (jsonb_typeof(x->bucket)='string' and length(btrim(x->>bucket)) between 1 and 120));
 end loop;
 perform rpg_private.assert(jsonb_typeof(model->'beliefs')='array' and jsonb_array_length(model->'beliefs')<=3 and jsonb_typeof(model->'relationships')='array' and jsonb_array_length(model->'relationships')<=2 and jsonb_typeof(model->'episodes')='array' and jsonb_array_length(model->'episodes')<=3);
 for bucket in select unnest(array['beliefs','relationships','episodes']) loop
  for entry in select value from jsonb_array_elements(model->bucket) loop
   if bucket='beliefs' then
    perform rpg_private.fields(entry,array['text','confidence','aboutActorId','evidence']);
    perform rpg_private.assert(jsonb_typeof(entry->'text')='string' and length(btrim(entry->>'text')) between 1 and 160 and entry->>'confidence' in ('tentative','supported'));
    if entry->'aboutActorId'<>'null'::jsonb then
     target:=(entry->>'aboutActorId')::uuid;
     perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=cid and id=target));
    end if;
   elsif bucket='relationships' then
    perform rpg_private.fields(entry,array['actorId','affection','trust','respect','unresolvedHurt','evidence']);
    target:=(entry->>'actorId')::uuid;
    perform rpg_private.assert(target<>actor and exists(select 1 from public.rpg_entities where campaign_id=cid and id=target));
    perform rpg_private.assert(entry->>'affection' in ('distant','open','close') and entry->>'trust' in ('low','guarded','earned') and entry->>'respect' in ('low','mixed','high'));
    perform rpg_private.assert(entry->'unresolvedHurt'='null'::jsonb or (jsonb_typeof(entry->'unresolvedHurt')='string' and length(btrim(entry->>'unresolvedHurt')) between 1 and 120));
   else
    perform rpg_private.fields(entry,array['evidence','meaning','cue']);
    perform rpg_private.assert(jsonb_typeof(entry->'meaning')='string' and length(btrim(entry->>'meaning')) between 1 and 160);
    perform rpg_private.assert(entry->'cue'='null'::jsonb or (jsonb_typeof(entry->'cue')='string' and length(btrim(entry->>'cue')) between 1 and 80));
   end if;
   ref:=entry->'evidence'; perform rpg_private.fields(ref,array['kind','id','version','part','visibility']);
   perform rpg_private.assert(ref->>'kind' in ('scene','event','private_event') and ref->>'visibility' in ('public','private') and jsonb_typeof(ref->'version')='string' and length(btrim(ref->>'version')) between 1 and 80 and jsonb_typeof(ref->'part')='number' and (ref->>'part')::integer between 0 and 20);
   source_visibility:=ref->>'visibility';
   perform rpg_private.assert(exists(
    select 1 from rpg_private.memory_sources(cid,source_visibility) s
    where s.kind=ref->>'kind' and s.source_id=(ref->>'id')::uuid and s.version=ref->>'version' and s.part=(ref->>'part')::integer
      and s.current and s.status='valid' and actor=any(s.known_by) and not s.oversized
      and rpg_private.memory_refs_valid(cid,s.source_refs,source_visibility)
   ));
  end loop;
 end loop;
 perform rpg_private.assert((select count(*)=count(distinct e->>'actorId') from jsonb_array_elements(model->'relationships') e));
end $$;

-- Existing atomic turn commit remains the sole model-generated write path.
-- Only the special character_ namespace receives extra validation.
alter function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) rename to rpg_runtime_before_character_models;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare entry jsonb; prior jsonb; current_contents jsonb; current_revision integer; t rpg_private.turns%rowtype; actor uuid; was_unpinned boolean:=false; result jsonb; scoped_source jsonb; begin
 if p_action='claim' then
  select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id and owner_id=p_owner_id;
  was_unpinned:=found and t.source is null and t.input->>'mode' in ('game','companion');
 end if;
 if p_action='commit' and jsonb_typeof(p_payload#>'{packet,privatePatches}')='array' then
  select * into t from rpg_private.turns where id=(p_payload->>'operationId')::uuid and campaign_id=p_campaign_id and owner_id=p_owner_id;
  if not found then raise exception 'rpg_not_found'; end if;
  if t.status='committed' then
   -- The accepted runtime receipt compares the exact original packet. Do not
   -- revalidate old evidence against a later correction on an idempotent retry.
   return public.rpg_runtime_before_character_models(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
  end if;
  insert into rpg_private.dm_state(campaign_id,contents) values(p_campaign_id,'{}'::jsonb) on conflict do nothing;
  select contents,revision into current_contents,current_revision from rpg_private.dm_state where campaign_id=p_campaign_id for update;
  for entry in select value from jsonb_array_elements(p_payload#>'{packet,privatePatches}') loop
   if entry->>'kind'<>'npc' or left(entry->>'key',10)<>'character_' then continue; end if;
   perform rpg_private.assert((t.source->>'privateStateRevision')::integer=current_revision);
   perform rpg_private.assert(t.input->>'mode' in ('game','companion') and entry->>'operation'='set' and jsonb_typeof(entry->'value')='string' and entry->'amount'='null'::jsonb);
   actor:=substring(entry->>'key' from 11)::uuid;
   perform rpg_private.assert(entry->>'key'='character_'||actor::text and octet_length(entry->>'value')<=2000);
   perform rpg_private.assert((entry->>'value')::jsonb->>'basisOperationId'=t.id::text);
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements_text(t.source#>'{runtime,configuration,controlledEntityIds}') controlled where controlled.value=actor::text));
   perform rpg_private.assert(case when t.input->>'mode'='companion' then actor::text=t.input->>'companionId'
    else exists(select 1 from jsonb_array_elements_text(t.source#>'{runtime,configuration,presentEntityIds}') present where present.value=actor::text) end);
   perform rpg_private.assert(exists(select 1 from jsonb_array_elements(t.checkpoint#>'{plan,privatePatches}') saved where saved.value=entry));
   prior:=(current_contents#>>array['npc',entry->>'key'])::jsonb;
   perform rpg_private.character_model_valid(p_campaign_id,actor,(entry->>'value')::jsonb,prior,false);
   perform rpg_private.assert((select count(*)=1 from jsonb_array_elements(p_payload#>'{packet,privatePatches}') duplicate where duplicate->>'key'=entry->>'key'));
  end loop;
 end if;
 result:=public.rpg_runtime_before_character_models(p_owner_id,p_campaign_id,p_action,p_payload,p_timeline);
 if was_unpinned and result is not null then
  select contents,revision into current_contents,current_revision from rpg_private.dm_state where campaign_id=p_campaign_id;
  scoped_source:=result->'source'||jsonb_build_object('privateStateRevision',coalesce(current_revision,0));
  if t.input->>'mode'='companion' then
   -- Pin only the speaking companion's own model. No other NPC interpretation.
   actor:=(t.input->>'companionId')::uuid;
   if current_contents#>>array['npc','character_'||actor::text] is not null then
    scoped_source:=jsonb_set(scoped_source,'{privateState}',jsonb_build_object('npc',jsonb_build_object('character_'||actor::text,current_contents#>>array['npc','character_'||actor::text])));
   end if;
  end if;
  update rpg_private.turns set source=scoped_source where id=t.id and campaign_id=p_campaign_id;
  result:=jsonb_set(result,'{source}',scoped_source);
 end if;
 return result;
end $$;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;

-- Explicit owner correction is versioned by the existing dm_state revision and
-- an immutable receipt. It is timeline-fenced and never runs through model text.
create table rpg_private.character_model_corrections (
 request_id uuid primary key,
 campaign_id uuid not null references public.rpg_campaigns(id),
 owner_id uuid not null references auth.users(id),
 actor_id uuid not null,
 timeline_id uuid not null,
 epoch integer not null,
 before_revision integer not null,
 after_revision integer not null,
 before_value jsonb,
 after_value jsonb not null,
 created_at timestamptz not null default now(),
 -- No FK to the active entity projection: timeline activation replaces those
 -- rows, while immutable correction receipts must survive every load/fork.
 foreign key(campaign_id,timeline_id) references rpg_private.timelines(campaign_id,id)
);
create trigger immutable_character_model_corrections before update or delete on rpg_private.character_model_corrections for each row execute function rpg_private.timeline_immutable();
alter table rpg_private.character_model_corrections enable row level security;

create function public.rpg_character_model(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb,p_timeline jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid; rid uuid; expected integer; state_row rpg_private.dm_state%rowtype; old_model jsonb; new_model jsonb; saved rpg_private.character_model_corrections%rowtype; fence jsonb; contents jsonb; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
 if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
 fence:=rpg_private.timeline_fence(p_campaign_id);
 perform rpg_private.assert(p_action in ('read','correct'));
 actor:=(p_payload->>'actorId')::uuid;
 perform rpg_private.assert(exists(select 1 from public.rpg_entities where campaign_id=p_campaign_id and id=actor and kind in ('npc','companion')));
 select * into state_row from rpg_private.dm_state where campaign_id=p_campaign_id for update;
 old_model:=(state_row.contents#>>array['npc','character_'||actor::text])::jsonb;
 if p_action='read' then
  perform rpg_private.fields(p_payload,array['actorId']);
  return jsonb_build_object('campaignId',p_campaign_id,'actorId',actor,'revision',coalesce(state_row.revision,0),'model',old_model,'timeline',fence);
 end if;
 perform rpg_private.fields(p_payload,array['requestId','actorId','expectedRevision','model']);
 rid:=(p_payload->>'requestId')::uuid; expected:=(p_payload->>'expectedRevision')::integer;
 perform rpg_private.assert(rid is not null and expected>=0);
 select * into saved from rpg_private.character_model_corrections where request_id=rid;
 if found then
  if saved.owner_id<>p_owner_id or saved.campaign_id<>p_campaign_id or saved.actor_id<>actor or saved.after_value<>p_payload->'model' or saved.timeline_id::text<>fence->>'timelineId' or saved.epoch<>(fence->>'epoch')::integer then raise exception 'rpg_conflict'; end if;
  return jsonb_build_object('campaignId',p_campaign_id,'actorId',actor,'revision',saved.after_revision,'timeline',fence);
 end if;
 perform rpg_private.assert(coalesce(state_row.revision,0)=expected);
 new_model:=p_payload->'model';
 perform rpg_private.character_model_valid(p_campaign_id,actor,new_model,old_model,true);
 contents:=coalesce(state_row.contents,'{}'::jsonb);
 if not contents ? 'npc' then contents:=contents||'{"npc":{}}'::jsonb; end if;
 contents:=jsonb_set(contents,array['npc','character_'||actor::text],to_jsonb(new_model::text));
 insert into rpg_private.dm_state(campaign_id,contents,revision) values(p_campaign_id,contents,expected+1)
  on conflict(campaign_id) do update set contents=excluded.contents,revision=excluded.revision,updated_at=now();
 -- An owner correction supersedes any pending narration/character proposal
 -- drawn from the earlier private state, while fictional time stays fixed.
 update rpg_private.runtime_state set revision=revision+1,updated_at=now() where campaign_id=p_campaign_id;
 insert into rpg_private.character_model_corrections(request_id,campaign_id,owner_id,actor_id,timeline_id,epoch,before_revision,after_revision,before_value,after_value)
 values(rid,p_campaign_id,p_owner_id,actor,(fence->>'timelineId')::uuid,(fence->>'epoch')::integer,expected,expected+1,old_model,new_model);
 return jsonb_build_object('campaignId',p_campaign_id,'actorId',actor,'revision',expected+1,'timeline',fence);
end $$;
revoke all on function public.rpg_character_model(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.rpg_character_model(uuid,uuid,text,jsonb,jsonb) to service_role;
revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
