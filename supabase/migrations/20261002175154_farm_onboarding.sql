alter table public.profiles add column farm_name text check (farm_name is null or (char_length(btrim(farm_name)) between 1 and 80));

-- A profile exists immediately even when email confirmation returns no session.
create function private.create_user_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(user_id) values(new.id) on conflict(user_id) do nothing;
 return new;
end; $$;
revoke all on function private.create_user_profile() from public,anon,authenticated;
create trigger aurafarming_auth_profile after insert on auth.users for each row execute function private.create_user_profile();
insert into public.profiles(user_id) select id from auth.users on conflict(user_id) do nothing;

-- Preserve explicit old names; recover legacy signup names without copying gardens.
update public.profiles set farm_name=btrim(display_name) where btrim(display_name) not in ('Farmer AUR','Farmer','') and char_length(btrim(display_name)) between 1 and 80;
update public.profiles p set farm_name=btrim(u.raw_user_meta_data->>'display_name'),display_name=btrim(u.raw_user_meta_data->>'display_name')
from auth.users u where p.user_id=u.id and p.farm_name is null and not coalesce(u.is_anonymous,false)
and char_length(btrim(u.raw_user_meta_data->>'display_name')) between 1 and 80
and btrim(u.raw_user_meta_data->>'display_name') not in ('Farmer AUR','Farmer');

create function private.set_farm_name(new_name text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if new_name is null or char_length(btrim(new_name)) not between 1 and 80 then raise exception 'Farm name must be 1 to 80 characters'; end if;
 insert into public.profiles(user_id) values(auth.uid()) on conflict(user_id) do nothing;
 update public.profiles set farm_name=btrim(new_name),display_name=btrim(new_name) where user_id=auth.uid();
end; $$;
create function public.set_farm_name(new_name text) returns void language sql security invoker set search_path='' as $$ select private.set_farm_name(new_name) $$;
revoke all on function private.set_farm_name(text),public.set_farm_name(text) from public,anon,authenticated;
grant execute on function private.set_farm_name(text),public.set_farm_name(text) to authenticated;
