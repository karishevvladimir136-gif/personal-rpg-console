-- All old mutation paths remain behind the same activation fence.
begin;
create table rpg_private.timeline_operation_ids (
 id uuid primary key, campaign_id uuid not null references public.rpg_campaigns(id)
);
insert into rpg_private.timeline_operation_ids select id,campaign_id from rpg_private.turns;
create table rpg_private.timeline_command_ids (
 category text not null, id uuid not null, campaign_id uuid not null references public.rpg_campaigns(id),
 primary key(category,id)
);
insert into rpg_private.timeline_command_ids select 'runtime',id,campaign_id from rpg_private.runtime_commands;
insert into rpg_private.timeline_command_ids select 'memory',id,campaign_id from rpg_private.memory_commands;
alter table rpg_private.timeline_operation_ids enable row level security;
alter table rpg_private.timeline_command_ids enable row level security;
create trigger immutable_operation_identity before update or delete on rpg_private.timeline_operation_ids for each row execute function rpg_private.timeline_immutable();
create trigger immutable_command_identity before update or delete on rpg_private.timeline_command_ids for each row execute function rpg_private.timeline_immutable();
create function rpg_private.timeline_record_operation() returns trigger language plpgsql set search_path='' as $$
begin insert into rpg_private.timeline_operation_ids values(new.id,new.campaign_id) on conflict do nothing; return new; end $$;
create trigger timeline_record_operation after insert on rpg_private.turns for each row execute function rpg_private.timeline_record_operation();
create function rpg_private.timeline_record_command() returns trigger language plpgsql set search_path='' as $$
begin insert into rpg_private.timeline_command_ids values(case tg_table_name when 'runtime_commands' then 'runtime' else 'memory' end,new.id,new.campaign_id) on conflict do nothing; return new; end $$;
create trigger timeline_record_command after insert on rpg_private.runtime_commands for each row execute function rpg_private.timeline_record_command();
create trigger timeline_record_command after insert on rpg_private.memory_commands for each row execute function rpg_private.timeline_record_command();
create table rpg_private.timeline_mutation_receipts (
 request_id uuid primary key references rpg_private.mutation_receipts(request_id), campaign_id uuid not null,
 timeline_id uuid not null, epoch integer not null,
 foreign key(campaign_id,timeline_id) references rpg_private.timelines(campaign_id,id)
);
insert into rpg_private.timeline_mutation_receipts select m.request_id,m.campaign_id,t.active_timeline_id,t.epoch from rpg_private.mutation_receipts m join rpg_private.timeline_campaigns t on t.campaign_id=m.campaign_id;
alter table rpg_private.timeline_mutation_receipts enable row level security;
create trigger immutable_timeline_receipt before update or delete on rpg_private.timeline_mutation_receipts for each row execute function rpg_private.timeline_immutable();
create table rpg_private.timeline_global_restrictions (
 campaign_id uuid not null references public.rpg_campaigns(id), kind text not null, source_id uuid not null,
 primary key(campaign_id,kind,source_id)
);
insert into rpg_private.timeline_global_restrictions select * from rpg_private.memory_restrictions;
alter table rpg_private.timeline_global_restrictions enable row level security;
alter function rpg_private.memory_restrict_source(uuid,text,uuid) rename to memory_restrict_source_phase3;
create function rpg_private.memory_restrict_source(cid uuid,source_kind text,rid uuid) returns void language plpgsql set search_path='' as $$
begin
 insert into rpg_private.timeline_global_restrictions values(cid,source_kind,rid) on conflict do nothing;
 update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=cid;
 perform rpg_private.memory_restrict_source_phase3(cid,source_kind,rid);
end $$;

-- Effective revisions can go backwards on load. New immutable versions never do.
do $$ declare d text; begin
 select pg_get_functiondef('rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb)'::regprocedure) into d;
 d:=replace(d,E'\r\n',E'\n');
 d:=replace(d,'rev := rev+1; rid := cid;'||chr(10)||'    update public.rpg_settings','rev := (select coalesce(max(revision),0)+1 from public.rpg_settings_revisions where campaign_id=cid); rid := cid;'||chr(10)||'    update public.rpg_settings');
 d:=replace(d,'rev := p_expected_revision+1; ver := gen_random_uuid();','rev := (select greatest(p_expected_revision+1,coalesce(max(version),0)+1) from public.rpg_document_versions where campaign_id=cid and document_id=rid); ver := gen_random_uuid();');
 execute d;
 select pg_get_functiondef('public.rpg_runtime_phase2(uuid,uuid,text,jsonb)'::regprocedure) into d;
 d:=replace(d,E'\r\n',E'\n');
 d:=replace(d,'row_revision integer;','guide_next_revision integer; row_revision integer;');
 d:=replace(d,'update public.rpg_settings set values=data,revision=row_revision+1','row_revision:=(select max(revision) from public.rpg_settings_revisions where campaign_id=cid);'||chr(10)||'    update public.rpg_settings set values=data,revision=row_revision+1');
 d:=replace(d,'token:=gen_random_uuid();'||chr(10)||'      update public.rpg_documents','guide_next_revision:=(select max(version)+1 from public.rpg_document_versions where campaign_id=cid and document_id=guide.id);'||chr(10)||'      token:=gen_random_uuid();'||chr(10)||'      update public.rpg_documents');
 d:=replace(d,'guide.revision+1','guide_next_revision');
 d:=replace(d,'guide.revision+case when p_payload->>''scope''=''campaign'' then 1 else 0 end','case when p_payload->>''scope''=''campaign'' then guide_next_revision else guide.revision end');
 execute d;
end $$;

alter function public.rpg_runtime(uuid,uuid,text,jsonb) set schema rpg_private;
alter function rpg_private.rpg_runtime(uuid,uuid,text,jsonb) rename to runtime_before_timelines;
create function public.rpg_runtime(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; was_committed boolean; mode text; payload jsonb:=p_payload-'timeline'; command_id uuid; operation_id uuid; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action not in ('play','get'));
 operation_id:=(payload->>'operationId')::uuid;
 if p_action='begin' and exists(select 1 from rpg_private.timeline_operation_ids where id=operation_id) and not exists(select 1 from rpg_private.turns where campaign_id=p_campaign_id and id=operation_id) then raise exception 'rpg_conflict'; end if;
 command_id:=coalesce((payload->>'requestId')::uuid,(payload->>'commandId')::uuid,(payload#>>'{command,commandId}')::uuid);
 if command_id is not null and exists(select 1 from rpg_private.timeline_command_ids where category='runtime' and id=command_id) and not exists(select 1 from rpg_private.runtime_commands where campaign_id=p_campaign_id and id=command_id) then raise exception 'rpg_conflict'; end if;
 if payload ? 'command' then payload:=jsonb_set(payload,'{command}',(payload->'command')-'timeline'); end if;
 select status='committed',input->>'mode' into was_committed,mode from rpg_private.turns where campaign_id=p_campaign_id and id=(payload->>'operationId')::uuid;
 result:=rpg_private.runtime_before_timelines(p_owner_id,p_campaign_id,p_action,payload);
 if p_action='commit' and not coalesce(was_committed,false) and mode in ('game','companion','mechanic') and result->>'status'='committed' and (select policy->>'autosave'='turn' from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then
  perform rpg_private.timeline_save(p_campaign_id,'autosave','After action','turn:'||(payload->>'operationId'));
 end if;
 return rpg_private.timeline_stamp(result,rpg_private.timeline_fence(p_campaign_id));
end $$;
alter function public.rpg_memory(uuid,uuid,text,jsonb) set schema rpg_private;
alter function rpg_private.rpg_memory(uuid,uuid,text,jsonb) rename to memory_before_timelines;
create function public.rpg_memory(p_owner_id uuid,p_campaign_id uuid,p_action text,p_payload jsonb default '{}',p_timeline jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; bid uuid; boundary rpg_private.memory_boundaries%rowtype; command_id uuid:=(p_payload->>'requestId')::uuid; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id) then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
 perform rpg_private.timeline_assert(p_campaign_id,p_timeline,p_action not in ('read','context','search','source'));
 if command_id is not null and exists(select 1 from rpg_private.timeline_command_ids where category='memory' and id=command_id) and not exists(select 1 from rpg_private.memory_commands where campaign_id=p_campaign_id and id=command_id) then raise exception 'rpg_conflict'; end if;
 result:=rpg_private.memory_before_timelines(p_owner_id,p_campaign_id,p_action,p_payload-'timeline');
 if p_action in ('end','continue') and (select policy->>'autosave' in ('session','turn') from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then
  bid:=case p_action when 'end' then (result#>>'{currentBoundary,id}')::uuid else (p_payload->>'boundaryId')::uuid end;
  select * into boundary from rpg_private.memory_boundaries where campaign_id=p_campaign_id and id=bid;
  if p_action='end' or boundary.state='continued' then
   perform rpg_private.timeline_save(p_campaign_id,'autosave',case p_action when 'end' then 'End of session' else 'Start of session' end,p_action||':'||bid::text);
  end if;
 end if;
 return rpg_private.timeline_stamp(result,rpg_private.timeline_fence(p_campaign_id));
end $$;
alter function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) set schema rpg_private;
alter function rpg_private.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) rename to mutation_before_timelines;
create function public.rpg_apply_mutation(p_request_id uuid,p_operation text,p_campaign_id uuid,p_expected_revision integer,p_payload jsonb,p_timeline jsonb default null,p_correction_scope text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; scope text; doc uuid; exists_before boolean; begin
 if not public.rpg_is_owner() then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 if p_campaign_id is not null then
  perform 1 from public.rpg_campaigns where id=p_campaign_id for update; if not found then raise exception 'rpg_not_found'; end if;
  perform rpg_private.timeline_assert(p_campaign_id,p_timeline);
  if exists(select 1 from rpg_private.timeline_mutation_receipts r where r.request_id=p_request_id and jsonb_build_object('timelineId',r.timeline_id,'epoch',r.epoch)<>rpg_private.timeline_fence(p_campaign_id)) then raise exception 'rpg_conflict'; end if;
  doc:=(p_payload->>'id')::uuid;
  scope:=case when p_operation in ('campaign.save','feedback.send','asset.save') then null
    when p_operation in ('document.save','document.restore') and not exists(select 1 from public.rpg_dm_guides where campaign_id=p_campaign_id and document_id=doc) then 'campaign' else 'timeline' end;
  if scope is not null and p_correction_scope is not null and p_correction_scope<>scope then raise exception 'rpg_validation'; end if;
  if scope is not null and p_correction_scope is null and (select epoch>1 from rpg_private.timeline_campaigns where campaign_id=p_campaign_id) then raise exception 'rpg_validation'; end if;
 end if;
 exists_before:=exists(select 1 from rpg_private.mutation_receipts where request_id=p_request_id);
 result:=rpg_private.mutation_before_timelines(p_request_id,p_operation,p_campaign_id,p_expected_revision,p_payload);
 if not exists_before and p_campaign_id is not null then
  insert into rpg_private.timeline_mutation_receipts select p_request_id,p_campaign_id,active_timeline_id,epoch from rpg_private.timeline_campaigns where campaign_id=p_campaign_id;
 end if;
 if not exists_before and scope='campaign' and p_operation in ('document.save','document.restore') then
  update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=p_campaign_id;
 end if;
 return case when result ? 'campaign_id' then result||jsonb_build_object('timeline',rpg_private.timeline_fence((result->>'campaign_id')::uuid)) else result end;
end $$;

revoke all on all tables in schema rpg_private from public,anon,authenticated;
revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.rpg_memory(uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb,jsonb,text) from public,anon;
grant execute on function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb,jsonb,text) to authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 revoke all on all functions in schema rpg_private from service_role;
 grant execute on function public.rpg_runtime(uuid,uuid,text,jsonb,jsonb) to service_role;
 grant execute on function public.rpg_memory(uuid,uuid,text,jsonb,jsonb) to service_role;
end if; end $$;
commit;
