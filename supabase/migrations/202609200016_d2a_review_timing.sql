-- Additive validation only: immutable historical rows, manifests and run inputs
-- are unchanged. New approvals must resolve timing and bind owner confirmation
-- to exact answers. No natural-language time parsing and no resolver change.
create function rpg_private.lab_composition_timing(r jsonb,p jsonb) returns boolean
language plpgsql immutable set search_path='' as $$
declare needs_review boolean; expected jsonb; begin
 if jsonb_typeof(r->'offsetMinutes') is distinct from 'number' or jsonb_typeof(r->'horizonMinutes') is distinct from 'number' then return false; end if;
 if (r->>'offsetMinutes')::numeric<>trunc((r->>'offsetMinutes')::numeric) or (r->>'horizonMinutes')::numeric<>trunc((r->>'horizonMinutes')::numeric)
  or (r->>'offsetMinutes')::numeric<0 or (r->>'offsetMinutes')::numeric>=(r->>'horizonMinutes')::numeric or (r->>'horizonMinutes')::numeric>43200 then return false; end if;
 needs_review:=r ? 'timingReview' or p->'offsetMinutes'='null'::jsonb or p->'horizonMinutes'='null'::jsonb
  or r->'offsetMinutes' is distinct from p->'offsetMinutes' or r->'horizonMinutes' is distinct from p->'horizonMinutes' or r->'timingText' is distinct from p->'timingText'
  or exists(select 1 from jsonb_array_elements(p->'ambiguities') q where q->>'consequential'='true');
 if not needs_review then return true; end if;
 expected:=jsonb_build_object('timingText',r->'timingText','offsetMinutes',r->'offsetMinutes','horizonMinutes',r->'horizonMinutes','ambiguityAnswers',r->'ambiguityAnswers');
 return (r->'timingReview'=expected) is true;
end $$;
revoke all on function rpg_private.lab_composition_timing(jsonb,jsonb) from public,anon,authenticated;

create or replace function rpg_private.lab_composition_history() returns trigger language plpgsql set search_path='' as $$
declare previous jsonb; a jsonb:=new.body->'composition'; b jsonb; begin
 if new.kind<>'scenario' or not new.body ? 'composition' then return new; end if;
 if a->>'phase'='approved' then perform rpg_private.assert(rpg_private.lab_composition_timing(a->'review',a->'originalProposal')); end if;
 perform rpg_private.lab_composition_valid(new.owner_id,(a#>>'{basis,campaignId}')::uuid,(a#>>'{basis,baseManifestId}')::uuid,new.body);
 if new.previous_version_id is null then perform rpg_private.assert(a->>'phase'='requested'); return new; end if;
 select body into strict previous from rpg_private.library_records where owner_id=new.owner_id and version_id=new.previous_version_id and id=new.id and kind='scenario';
 b:=previous->'composition'; perform rpg_private.assert(b is not null);
 perform rpg_private.assert(a->'basis'=b->'basis' and a->'choices'=b->'choices' and a->'premise'=b->'premise' and a->'language'=b->'language');
 if a->>'phase'='requested' then perform rpg_private.assert(b->>'phase'='requested');
 elsif b->>'phase'='requested' then perform rpg_private.assert(a->>'phase'='review' and a->'composeProfile'=b->'composeProfile' and a->'simulationProfile'=b->'simulationProfile' and a->'ownerEdit'='null'::jsonb);
 else
  perform rpg_private.assert(a->'originalProposal'=b->'originalProposal' and a->'usage'=b->'usage' and a->'composeProfile'=b->'composeProfile' and a->'operationId'=b->'operationId');
  if a->>'phase'='approved' then perform rpg_private.assert(b->>'phase'='review' and (a-'phase')=(b-'phase'));
  else perform rpg_private.assert(a#>>'{ownerEdit,ownerId}'=new.owner_id::text and a#>>'{ownerEdit,fromVersionId}'=new.previous_version_id::text); end if;
 end if;
 return new;
end $$;
