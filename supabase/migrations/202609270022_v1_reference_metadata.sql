-- V1 owner annotation/visual metadata is representation, not gameplay evidence.
begin;
create or replace function rpg_private.memory_index(cid uuid, kind text, rid uuid, ver text, body text,
 visibility text default 'public', sid uuid default null, entities uuid[] default '{}', witnesses uuid[] default '{}',
 authority text default 'history', statement text default 'record', refs jsonb default '[]', factkey text default null, factvalue text default null)
returns void language plpgsql set search_path='' as $$
declare span text; n integer:=0; tbl text; unresolved boolean; significance integer;
begin
 -- Reserved owner UI metadata retains document versions/correction fencing,
 -- but never becomes gameplay Memory, Canon or Actor knowledge.
 if kind='document' and (left(body,length(E'Personal RPG Console · Places of Belonging · v1\n'))=E'Personal RPG Console · Places of Belonging · v1\n' or left(body,length(E'RPG_VISUAL_FRAME_V0\n'))=E'RPG_VISUAL_FRAME_V0\n') then return; end if;
 if length(btrim(coalesce(body,'')))=0 then return; end if;
 if visibility='public' and exists(select 1 from rpg_private.memory_restrictions r where r.campaign_id=cid and r.kind=memory_index.kind and r.source_id=rid) then visibility:='private'; end if;
 if cardinality(entities)=0 and visibility='public' then
  select coalesce(array_agg(distinct entity_id),'{}') into entities from rpg_private.memory_aliases where campaign_id=cid and length(alias)>=3 and position(lower(alias) in lower(body))>0;
 end if;
 tbl:=case visibility when 'public' then 'memory_public_sources' when 'private' then 'memory_private_sources' end;
 perform rpg_private.assert(tbl is not null);
 unresolved:=body ~* '(promis|owe|obligat|unresolved|intend|plan to|обещ|долж|намер|планир|неразреш)';
 significance:=case when unresolved then 10 when authority in ('correction','canon') then 8 else 2 end;
 for span in select btrim(value) from regexp_split_to_table(body,E'\n[[:space:]]*\n') value where length(btrim(value))>0 loop
   execute format('insert into rpg_private.%I(campaign_id,kind,source_id,version,part,session_id,text,entity_ids,known_by,authority,statement_kind,significance,unresolved,source_refs,fact_key,fact_value,oversized) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) on conflict(campaign_id,kind,source_id,version,part) do nothing',tbl)
    using cid,kind,rid,ver,n,sid,span,entities,witnesses,authority,statement,significance,unresolved,refs,factkey,factvalue,octet_length(span)>24000;
   n:=n+1;
 end loop;
end $$;
commit;
