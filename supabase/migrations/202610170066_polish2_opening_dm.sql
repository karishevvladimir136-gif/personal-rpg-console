-- Polish 2, part 5 (docs/stages/POLISH_2.md §5): the opening proposal written by
-- the campaign's own DM whichever provider serves it. The bootstrap ticket's
-- execution profile for «world.compose» may now name the Anthropic DM model
-- (the same set the dm.turn choice admits); OpenAI profiles are unchanged.
-- The usage check stays: the reply's model must be the ticket's model.
begin;

create or replace function rpg_private.lab_execution_profile(profile jsonb,task text) returns void
language plpgsql immutable set search_path='' as $$
begin
 perform rpg_private.fields(profile,array['schemaVersion','id','policyRevision','registryVersion','task','providerId','modelId','reasoning']);
 perform rpg_private.assert(profile->>'schemaVersion'='1' and (profile->>'id')::uuid is not null
  and profile->>'registryVersion'='openai-responses-v1' and profile->>'task'=task and task in ('world.compose','world.resolve')
  and jsonb_typeof(profile->'policyRevision')='number' and (profile->>'policyRevision')::numeric=trunc((profile->>'policyRevision')::numeric)
  and (profile->>'policyRevision')::numeric between 0 and 2147483646 and profile->'reasoning'<>'null'::jsonb);
 if task='world.compose' and profile->>'providerId'='anthropic' then
  perform rpg_private.dm_turn_model_selection(jsonb_build_object('providerId',profile->'providerId','modelId',profile->'modelId','reasoning',profile->'reasoning'));
 else
  perform rpg_private.wave2_model_selection(jsonb_build_object('providerId',profile->'providerId','modelId',profile->'modelId','reasoning',profile->'reasoning'));
 end if;
end $$;

commit;
