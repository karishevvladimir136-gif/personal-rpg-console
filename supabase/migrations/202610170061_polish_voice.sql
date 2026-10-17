-- Polish stage, group 7 (docs/stages/POLISH.md «In scope from group 7», items 7, 8, 23):
-- the mechanics for the Russian voice and the context budgets. Additive only.
--   * a Character Model may carry a speech profile (optional key `speech`) and may
--     hold 160 000 bytes (64 000 characters; item 8);
--   * «Образцы голоса»: the owner's passages, private, per campaign with an account
--     default (rpg_private.voice_samples; rpg_dossier voice_read / voice_save);
--   * the campaign's switch that lets the voice layer quote them (dm_settings.voice_examples,
--     off by default; the voice stage turns it on);
--   * the turn's source carries both (runtime_source: voiceSamples, voiceExamplesOn).
begin;

-- 1. The Character Model: the speech profile and the larger bound ------------
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.character_model_valid(uuid,uuid,jsonb,jsonb,boolean)'::regprocedure) into d;
 d:=replace(d,'perform rpg_private.fields(model,array[''schemaVersion'',''actorId'',''basisOperationId'',''identity'',''current'',''beliefs'',''relationships'',''episodes'']);',
  'perform rpg_private.fields(model,array[''schemaVersion'',''actorId'',''basisOperationId'',''identity'',''current'',''beliefs'',''relationships'',''episodes''],array[''speech'']);
 if model ? ''speech'' and model->''speech''<>''null''::jsonb then
   perform rpg_private.fields(model->''speech'',array[''register'',''sentenceLength'',''tics'',''neverSays'',''address'']);
   perform rpg_private.assert(jsonb_typeof(model#>''{speech,register}'')=''string'' and length(model#>>''{speech,register}'') between 1 and 600
     and model#>>''{speech,sentenceLength}'' in (''short'',''mixed'',''long'')
     and jsonb_typeof(model#>''{speech,tics}'')=''array'' and jsonb_array_length(model#>''{speech,tics}'')<=12
     and jsonb_typeof(model#>''{speech,neverSays}'')=''array'' and jsonb_array_length(model#>''{speech,neverSays}'')<=12
     and jsonb_typeof(model#>''{speech,address}'')=''array'' and jsonb_array_length(model#>''{speech,address}'')<=12);
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(model#>''{speech,tics}'') t
     where jsonb_typeof(t.value->''phrase'')<>''string'' or length(t.value->>''phrase'') not between 1 and 400 or t.value->>''frequency'' not in (''rare'',''sometimes'',''often'')));
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(model#>''{speech,address}'') a
     where (a.value->>''actorId'')::uuid is null or a.value->>''form'' not in (''ты'',''вы'')));
 end if;');
 d:=replace(d,'octet_length(model::text)<=80000','octet_length(model::text)<=160000');
 perform rpg_private.assert(d like '%array[''speech'']%' and d like '%<=160000%');
 execute d;
end $$;
-- The loop's private note limit for a Character Model note (migrations 53 and 55): 160 000 bytes.
do $$ declare r record; d text; n integer:=0; begin
 for r in select p.oid from pg_proc p join pg_namespace s on s.oid=p.pronamespace
   where s.nspname in ('public','rpg_private') and p.prosrc like '%then 80000 else 6000 end%' loop
  select pg_get_functiondef(r.oid) into d;
  d:=replace(d,'then 80000 else 6000 end','then 160000 else 6000 end');
  execute d;
  n:=n+1;
 end loop;
 perform rpg_private.assert(n>=1);
end $$;

-- 2. «Образцы голоса» -----------------------------------------------------------
-- The owner's passages: the campaign's own (campaign_id set) or the account default
-- (campaign_id null). Private: never in a public DTO, a log or a fixture.
create table rpg_private.voice_samples (
  owner_id uuid not null references auth.users(id),
  campaign_id uuid references public.rpg_campaigns(id),
  scope_key text generated always as (coalesce(campaign_id::text,'account')) stored,
  samples text not null default '' check (length(samples)<=40000),
  updated_at timestamptz not null default now(),
  primary key (owner_id, scope_key)
);
alter table rpg_private.voice_samples enable row level security;
revoke all on rpg_private.voice_samples from public,anon,authenticated;

create function rpg_private.voice_samples_read(uid uuid,cid uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('campaignId',cid,
   'campaign',coalesce((select v.samples from rpg_private.voice_samples v where v.owner_id=uid and v.campaign_id=cid),''),
   'account',coalesce((select v.samples from rpg_private.voice_samples v where v.owner_id=uid and v.campaign_id is null),''))
$$;

-- rpg_dossier: voice_read {} and voice_save {requestId, scope: campaign|account, samples}.
do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,' if p_action=''source'' then',
  ' if p_action=''voice_read'' then
   perform rpg_private.fields(p_payload,''{}'');
   return rpg_private.voice_samples_read(p_owner_id,p_campaign_id);
 end if;
 if p_action=''voice_save'' then
   perform rpg_private.fields(p_payload,array[''requestId'',''scope'',''samples'']);
   perform rpg_private.assert(p_payload->>''scope'' in (''campaign'',''account'') and jsonb_typeof(p_payload->''samples'')=''string'' and length(p_payload->>''samples'')<=40000);
   insert into rpg_private.voice_samples(owner_id,campaign_id,samples)
     values(p_owner_id,case when p_payload->>''scope''=''campaign'' then p_campaign_id else null end,p_payload->>''samples'')
     on conflict(owner_id,scope_key) do update set samples=excluded.samples,updated_at=now();
   return rpg_private.voice_samples_read(p_owner_id,p_campaign_id);
 end if;
 if p_action=''source'' then');
 perform rpg_private.assert(d like '%p_action=''voice_read''%' and d like '%p_action=''voice_save''%');
 execute d;
end $$;

-- 3. The campaign's switch ------------------------------------------------------
alter table rpg_private.dm_settings add column voice_examples boolean not null default false;
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.dm_settings_read(uuid)'::regprocedure) into d;
 d:=replace(d,'''notebookVisible'',s.notebook_visible,''boostNext'',s.boost_next,','''notebookVisible'',s.notebook_visible,''boostNext'',s.boost_next,''voiceExamples'',s.voice_examples,');
 d:=replace(d,'''notebookVisible'',false,''boostNext'',false,''revision'',0','''notebookVisible'',false,''boostNext'',false,''voiceExamples'',false,''revision'',0');
 perform rpg_private.assert(d like '%''voiceExamples'',s.voice_examples%' and d like '%''voiceExamples'',false%');
 execute d;
 select pg_get_functiondef('public.rpg_dm_settings(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,'array[''limits'',''depth'',''notebookVisible'',''boostNext'']','array[''limits'',''depth'',''notebookVisible'',''boostNext'',''voiceExamples'']');
 d:=replace(d,' perform rpg_private.assert(next_notebook is not null and next_boost is not null);',
  ' perform rpg_private.assert(next_notebook is not null and next_boost is not null);
 next_voice:=case when p_payload ? ''voiceExamples'' then (p_payload->>''voiceExamples'')::boolean else coalesce(stored.voice_examples,false) end;
 perform rpg_private.assert(next_voice is not null);');
 d:=replace(d,' insert into rpg_private.dm_settings(campaign_id,runtime,dm_turn,limits,depth,notebook_visible,boost_next,revision)
   values(p_campaign_id,requested,nullif(selection,''null''::jsonb),next_limits,next_depth,next_notebook,next_boost,1)
   on conflict(campaign_id) do update set runtime=excluded.runtime,dm_turn=excluded.dm_turn,
     limits=excluded.limits,depth=excluded.depth,notebook_visible=excluded.notebook_visible,boost_next=excluded.boost_next,',
  ' insert into rpg_private.dm_settings(campaign_id,runtime,dm_turn,limits,depth,notebook_visible,boost_next,voice_examples,revision)
   values(p_campaign_id,requested,nullif(selection,''null''::jsonb),next_limits,next_depth,next_notebook,next_boost,next_voice,1)
   on conflict(campaign_id) do update set runtime=excluded.runtime,dm_turn=excluded.dm_turn,
     limits=excluded.limits,depth=excluded.depth,notebook_visible=excluded.notebook_visible,boost_next=excluded.boost_next,voice_examples=excluded.voice_examples,');
 -- the variable: declared next to next_boost
 d:=regexp_replace(d,'next_boost boolean;','next_boost boolean; next_voice boolean;');
 perform rpg_private.assert(d like '%''voiceExamples'']%' and d like '%next_voice:=%' and d like '%voice_examples=excluded.voice_examples%' and d like '%next_voice boolean;%');
 execute d;
end $$;

-- 4. The turn's source: the samples (campaign's, else the account default) and the switch
alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_polish_voice;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_polish_voice(cid,uid,mode); samples text; begin
 select coalesce(nullif((select v.samples from rpg_private.voice_samples v where v.owner_id=uid and v.campaign_id=cid),''),
                 (select v.samples from rpg_private.voice_samples v where v.owner_id=uid and v.campaign_id is null)) into samples;
 result:=result||jsonb_build_object('voiceSamples',nullif(samples,''),
   'voiceExamplesOn',coalesce((select s.voice_examples from rpg_private.dm_settings s where s.campaign_id=cid),false));
 return result;
end $$;
revoke all on function rpg_private.runtime_source_before_polish_voice(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

commit;
