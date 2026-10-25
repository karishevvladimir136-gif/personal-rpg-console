-- Fix S3-accept Ж1 (docs/stages/FIX_S3_ACCEPT.md): «Пожелания к приключению» — a second owner-only text on a campaign,
-- beside «Тайны»: free length (the store's own 20 000 limit), a wish about the adventure (genre, tone, what should
-- happen), never the truth itself. Additive only:
--  1. rpg_private.dm_secrets admits the scope 'wishes' (the subject is the campaign).
--  2. public.rpg_dm_secrets reads and saves it as 'campaign_wishes' (the owner's settings screen and the new-campaign
--     wizard go through the server, as for «Тайны»); everything else in the function is as migration 74 wrote it.
--  3. The turn's source carries it as `dmSecrets.wishes` (server-only, like «Тайны»): the DM's hidden-layer prep reads
--     it; the player's snapshot never does.
begin;

do $$ declare c text; begin
 select con.conname into c from pg_constraint con where con.conrelid='rpg_private.dm_secrets'::regclass and con.contype='c'
   and pg_get_constraintdef(con.oid) like '%scope%';
 if c is not null then execute format('alter table rpg_private.dm_secrets drop constraint %I',c); end if;
end $$;
alter table rpg_private.dm_secrets add constraint dm_secrets_scope_check check (scope in ('campaign','world','wishes'));

create or replace function public.rpg_dm_secrets(p_owner_id uuid,p_scope text,p_subject uuid,p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare row_value rpg_private.dm_secrets%rowtype; world_title text; begin
 if p_owner_id is null or not exists(select 1 from rpg_private.owner_registry where user_id=p_owner_id)
   then raise exception 'rpg_forbidden' using errcode='42501'; end if;
 perform rpg_private.assert(p_scope in ('campaign','world','campaign_world','campaign_wishes') and p_subject is not null and p_action in ('read','save'));
 -- 'campaign_world': the world this campaign is bound to (the owner's campaign screen edits its world's secrets).
 if p_scope='campaign_world' then
   if not exists(select 1 from public.rpg_campaigns c where c.id=p_subject) then raise exception 'rpg_not_found'; end if;
   p_subject:=nullif(rpg_private.adventure_binding(p_subject)->>'worldId','')::uuid;
   if p_subject is null then return jsonb_build_object('scope','world','subjectId',null,'title',null,'body','','revision',0,'updatedAt',null); end if;
   p_scope:='world';
 end if;
 -- Fix S3-accept Ж1: 'campaign_wishes' — the owner's «Пожелания к приключению» of this campaign.
 if p_scope='campaign_wishes' then p_scope:='wishes'; end if;
 if p_scope in ('campaign','wishes') and not exists(select 1 from public.rpg_campaigns c where c.id=p_subject) then raise exception 'rpg_not_found'; end if;
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
 if p_scope='world' then select w.title into world_title from rpg_private.adventure_world_versions w where w.id=p_subject order by w.version desc limit 1; end if;
 return jsonb_build_object('scope',p_scope,'subjectId',p_subject,'title',world_title,'body',coalesce(row_value.body,''),'revision',coalesce(row_value.revision,0),
   'updatedAt',row_value.updated_at);
end $$;
revoke all on function public.rpg_dm_secrets(uuid,text,uuid,text,jsonb) from public,anon,authenticated;
do $$ begin if exists(select 1 from pg_roles where rolname='service_role') then
 grant execute on function public.rpg_dm_secrets(uuid,text,uuid,text,jsonb) to service_role;
end if; end $$;

alter function rpg_private.runtime_source(uuid,uuid,text) rename to runtime_source_before_wishes;
create function rpg_private.runtime_source(cid uuid,uid uuid,mode text default 'game') returns jsonb
language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_source_before_wishes(cid,uid,mode); wishes_body text; begin
 select s.body into wishes_body from rpg_private.dm_secrets s where s.scope='wishes' and s.subject_id=cid;
 return result||jsonb_build_object('dmSecrets',coalesce(result->'dmSecrets','{}'::jsonb)||jsonb_build_object('wishes',coalesce(wishes_body,'')));
end $$;
revoke all on function rpg_private.runtime_source_before_wishes(uuid,uuid,text),rpg_private.runtime_source(uuid,uuid,text) from public,anon,authenticated;

revoke all on all functions in schema rpg_private from public,anon,authenticated;
revoke all on all tables in schema rpg_private from public,anon,authenticated;

commit;
