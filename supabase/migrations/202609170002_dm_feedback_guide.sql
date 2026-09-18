-- Additive Phase 1 owner feedback and an ordinary versioned reference document.
-- Does not interpret messages, alter canon, generate replies or execute gameplay.
begin;
create table public.rpg_dm_feedback (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.rpg_campaigns(id),
  body text not null check(length(body) <= 20000 and length(btrim(body)) >= 1), created_at timestamptz not null default now(),
  unique(campaign_id,id)
);
create table public.rpg_dm_guides (
  campaign_id uuid primary key references public.rpg_campaigns(id), document_id uuid not null unique,
  foreign key(campaign_id,document_id) references public.rpg_documents(campaign_id,id)
);
create trigger immutable_feedback before update or delete on public.rpg_dm_feedback for each row execute function rpg_private.immutable_history();

create function rpg_private.create_dm_guide(cid uuid) returns void language plpgsql set search_path = '' as $$
declare doc uuid := gen_random_uuid(); ver uuid := gen_random_uuid();
begin
  if exists(select 1 from public.rpg_dm_guides where campaign_id=cid) then return; end if;
  insert into public.rpg_documents(id,campaign_id,title,status,body,current_version_id,revision) values(doc,cid,'DM Guide','reference','',ver,1);
  insert into public.rpg_document_versions(id,campaign_id,document_id,version,title,status,body) values(ver,cid,doc,1,'DM Guide','reference','');
  insert into public.rpg_dm_guides(campaign_id,document_id) values(cid,doc);
end;
$$;
create function rpg_private.initialize_dm_guide() returns trigger language plpgsql set search_path = '' as $$
begin perform rpg_private.create_dm_guide(new.id); return new; end;
$$;
create trigger initialize_dm_guide after insert on public.rpg_campaigns for each row execute function rpg_private.initialize_dm_guide();
do $$ declare cid uuid; begin
  for cid in select id from public.rpg_campaigns loop perform rpg_private.create_dm_guide(cid); end loop;
end $$;
create function rpg_private.protect_dm_guide_status() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status <> 'reference' and exists(select 1 from public.rpg_dm_guides where campaign_id=new.campaign_id and document_id=new.id) then
    raise exception 'rpg_validation' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger protect_dm_guide_status before update on public.rpg_documents for each row execute function rpg_private.protect_dm_guide_status();

-- Keep the base implementation once, inaccessible to ordinary API/database credentials.
alter function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) set schema rpg_private;
alter function rpg_private.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) rename to apply_base_mutation;
revoke all on function rpg_private.apply_base_mutation(uuid,text,uuid,integer,jsonb) from public,anon,authenticated;

create function public.rpg_apply_mutation(p_request_id uuid,p_operation text,p_campaign_id uuid,p_expected_revision integer,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); rid uuid; req jsonb; receipt rpg_private.mutation_receipts%rowtype; result jsonb;
begin
  if uid is null or not public.rpg_is_owner() then raise exception 'rpg_forbidden' using errcode = '42501'; end if;
  if p_operation is distinct from 'feedback.send' then
    return rpg_private.apply_base_mutation(p_request_id,p_operation,p_campaign_id,p_expected_revision,p_payload);
  end if;
  perform rpg_private.assert(p_request_id is not null and p_campaign_id is not null and p_expected_revision=0);
  perform rpg_private.fields(p_payload,array['body']);
  perform rpg_private.assert(jsonb_typeof(p_payload->'body')='string' and length(p_payload->>'body') <= 20000 and length(btrim(p_payload->>'body')) >= 1);
  req := jsonb_build_object('operation',p_operation,'campaign_id',p_campaign_id,'expected_revision',p_expected_revision,'payload',p_payload);
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  select * into receipt from rpg_private.mutation_receipts where request_id=p_request_id;
  if found then
    if receipt.owner_id <> uid or receipt.request <> req then raise exception 'rpg_conflict'; end if;
    return receipt.result;
  end if;
  perform 1 from public.rpg_campaigns where id=p_campaign_id for update;
  if not found then raise exception 'rpg_not_found'; end if;
  rid := gen_random_uuid();
  insert into public.rpg_dm_feedback(id,campaign_id,body) values(rid,p_campaign_id,p_payload->>'body');
  result := jsonb_build_object('id',rid,'campaign_id',p_campaign_id,'revision',1);
  insert into rpg_private.mutation_receipts(request_id,owner_id,campaign_id,request,result) values(p_request_id,uid,p_campaign_id,req,result);
  return result;
end;
$$;
revoke all on function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) from public,anon;
grant execute on function public.rpg_apply_mutation(uuid,text,uuid,integer,jsonb) to authenticated;
alter table public.rpg_dm_feedback enable row level security;
alter table public.rpg_dm_guides enable row level security;
revoke all on public.rpg_dm_feedback,public.rpg_dm_guides from public,anon,authenticated;
grant select on public.rpg_dm_feedback,public.rpg_dm_guides to authenticated;
create policy owner_read on public.rpg_dm_feedback for select to authenticated using ((select public.rpg_is_owner()));
create policy owner_read on public.rpg_dm_guides for select to authenticated using ((select public.rpg_is_owner()));
revoke all on all functions in schema rpg_private from public,anon,authenticated;
commit;
