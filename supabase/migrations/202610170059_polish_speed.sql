-- Polish stage, group 3 (docs/stages/POLISH.md items 13–14): the public turn's
-- stats carry the first word measured from the player's send (whatever request
-- it came in) and the depth chosen for the turn with its reason. Additive only.
begin;

alter function rpg_private.runtime_public_turn(rpg_private.turns) rename to runtime_public_turn_before_polish_speed;
create function rpg_private.runtime_public_turn(t rpg_private.turns)
returns jsonb language plpgsql stable set search_path='' as $$
declare result jsonb:=rpg_private.runtime_public_turn_before_polish_speed(t); stats jsonb; begin
 if t.runtime_identity='dm-loop-v1' and t.status='committed' and jsonb_typeof(result->'stats')='object' then
   stats:=(result->'stats')||jsonb_build_object(
     'firstWordMs',(select (u.value->>'firstWordMs')::numeric from jsonb_array_elements(coalesce(t.checkpoint#>'{dmLoop,usage}','[]'::jsonb)) u
        where u.value->>'firstWordMs' is not null order by 1 limit 1),
     'depthReason',t.checkpoint#>'{dmLoop,pin,depth,reason}',
     'depthTension',t.checkpoint#>'{dmLoop,pin,depth,tension}');
   result:=jsonb_set(result,'{stats}',jsonb_strip_nulls(stats)||jsonb_build_object('firstTextMs',coalesce(stats->'firstTextMs','null'::jsonb),'cacheReadShare',coalesce(stats->'cacheReadShare','null'::jsonb),'effort',coalesce(stats->'effort','null'::jsonb)));
 end if;
 return result;
end $$;
revoke all on function rpg_private.runtime_public_turn_before_polish_speed(rpg_private.turns),rpg_private.runtime_public_turn(rpg_private.turns) from public,anon,authenticated;

commit;
