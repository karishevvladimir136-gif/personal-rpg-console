-- Fix run after session 2, stage B (B1 the hidden layer, B2 memory hygiene). Additive only.
--  1. «Тайны (видит только ведущий)»: the owner's own DM-only text on a world and on a campaign, in rpg_private, read
--     and written only through public.rpg_dm_secrets by the service role (the owner's screens go through the server).
--  2. The turn's source carries them as `dmSecrets` (server-only, like the private state): the DM reads them; the
--     player's snapshot never does.
--  3. rpg_dossier 'private_notes': the server's background writes into the DM's private notes outside a turn — the
--     prep's hidden layer, the digest's update of it, the folds of closed notes — fenced on the timeline, per key (a
--     turn's commit merges its own patches per key, so neither erases the other), never a server-kept key.
begin;

create table rpg_private.dm_secrets(
  scope text not null check (scope in ('campaign','world')),
  subject_id uuid not null,
  body text not null default '' check (length(body)<=20000),
  revision integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key(scope,subject_id)
);
revoke all on rpg_private.dm_secrets from public,anon,authenticated;

create function public.rpg_dm_secrets(p_owner_id uuid,p_scope text,p_subject uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare row_value rpg_private.dm_secrets%rowtype; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(p_scope in ('campaign','world') and p_subject is not null and p_action in ('read','save'));
 if p_scope='campaign' and not exists(select 1 from public.rpg_campaigns c where c.id=p_subject) then raise exception 'rpg_not_found'; end if;
 if p_scope='world' and not exists(select 1 from rpg_private.adventure_world_versions w where w.id=p_subject) then raise exception 'rpg_not_found'; end if;
 if p_action='save' then
   perform rpg_private.fields(p_payload,array['body'],array['expectedRevision']);
   perform rpg_private.assert(jsonb_typeof(p_payload->'body')='string' and length(p_payload->>'body')<=20000);
   select * into row_value from rpg_private.dm_secrets s where s.scope=p_scope and s.subject_id=p_subject for update;
   if found and p_payload ? 'expectedRevision' and (p_payload->>'expectedRevision')::integer<>row_value.revision then raise exception 'rpg_conflict'; end if;
   insert into rpg_private.dm_secrets(scope,subject_id,body) values(p_scope,p_subject,btrim(p_payload->>'body'))
     on conflict(scope,subject_id) do update set body=excluded.body,revision=rpg_private.dm_secrets.revision+1,updated_at=now();
 else
   perform rpg_private.fields(p_payload,'{}');
 end if;
 select * into row_value from rpg_private.dm_secrets s where s.scope=p_scope and s.subject_id=p_subject;
 return jsonb_build_object('scope',p_scope,'subjectId',p_subject,'body',coalesce(row_value.body,''),'revision',coalesce(row_value.revision,0),
   'updatedAt',row_value.updated_at);
end $$;
revoke all on function public.rpg_dm_secrets(uuid,text,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant execute on function public.rpg_dm_secrets(uuid,text,uuid,text,jsonb) to service_role;
end if; end $$;

alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_hidden_layer;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_hidden_layer(cid,uid,mode); world_id uuid; campaign_body text; world_body text; begin
 world_id:=nullif(rpg_private.adventure_binding(cid)->>'worldId','')::uuid;
 select s.body into campaign_body from rpg_private.dm_secrets s where s.scope='campaign' and s.subject_id=cid;
 if world_id is not null then select s.body into world_body from rpg_private.dm_secrets s where s.scope='world' and s.subject_id=world_id; end if;
 return result||jsonb_build_object('dmSecrets',jsonb_build_object('campaign',coalesce(campaign_body,''),'world',coalesce(world_body,'')));
end $$;
revoke all on function rpg_private.runtime_source_before_hidden_layer(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

do $$ declare d text; begin
 select pg_get_functiondef('public.rpg_dossier(uuid,uuid,text,jsonb,jsonb)'::regprocedure) into d;
 d:=replace(d,' if p_action=''voice_read'' then',
  ' if p_action=''private_notes'' then
   -- Fix run B1/B2: {requestId, set:[{kind,key,value}], remove:[{kind,key}]} — the prep, the digest and the folds.
   perform rpg_private.fields(p_payload,array[''requestId'',''set'',''remove'']);
   perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
   perform rpg_private.assert(jsonb_typeof(p_payload->''set'')=''array'' and jsonb_typeof(p_payload->''remove'')=''array''
     and jsonb_array_length(p_payload->''set'')+jsonb_array_length(p_payload->''remove'') between 1 and 80);
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements((p_payload->''set'')||(p_payload->''remove'')) x
     where x.value->>''kind'' not in (''fact'',''clock'',''consequence'') or coalesce(x.value->>''key'','''') !~ ''^[a-zA-Z0-9_-]{1,120}$''
       or x.value->>''key'' ~ ''^(character_|quest_reward_|holding_|statblock_|plan_)'' or x.value->>''key'' in (''notebook'',''notebook_session'',''ledger'',''variety'',''metrics'',''depth_state'')));
   perform rpg_private.assert(not exists(select 1 from jsonb_array_elements(p_payload->''set'') x
     where jsonb_typeof(x.value->''value'')<>''string'' or length(x.value->>''value'') not between 1 and 6000
       or (x.value->>''kind''=''clock'' and x.value->>''value'' !~ ''^\d{1,6}$'')));
   select * into state_row from rpg_private.dm_state where campaign_id=p_campaign_id for update;
   contents:=coalesce(state_row.contents,''{}''::jsonb);
   for entry in select x.value from jsonb_array_elements(p_payload->''remove'') x loop
     if contents ? (entry->>''kind'') then contents:=jsonb_set(contents,array[entry->>''kind''],(contents->(entry->>''kind''))-(entry->>''key'')); end if;
   end loop;
   for entry in select x.value from jsonb_array_elements(p_payload->''set'') x loop
     if not contents ? (entry->>''kind'') then contents:=contents||jsonb_build_object(entry->>''kind'',''{}''::jsonb); end if;
     contents:=jsonb_set(contents,array[entry->>''kind'',entry->>''key''],
       case when entry->>''kind''=''clock'' then to_jsonb((entry->>''value'')::integer) else entry->''value'' end);
   end loop;
   insert into rpg_private.dm_state(campaign_id,contents) values(p_campaign_id,contents)
     on conflict(campaign_id) do update set contents=excluded.contents,revision=rpg_private.dm_state.revision+1,updated_at=now();
   return jsonb_build_object(''campaignId'',p_campaign_id,''set'',jsonb_array_length(p_payload->''set''),''removed'',jsonb_array_length(p_payload->''remove''));
 end if;
 if p_action=''voice_read'' then');
 perform rpg_private.assert(d like '%p_action=''private_notes''%');
 execute d;
end $$;

revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on all tables in schema rpg_private from public,anon,authenticated;

commit;
