-- Seminar MVP: private images, anonymous authenticated ownership, atomic rewards.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Farmer AUR' check (char_length(display_name) between 1 and 80),
  avatar_path text,
  xp integer not null default 0 check (xp between 0 and 399),
  level integer not null default 1 check (level >= 1),
  coins integer not null default 0 check (coins >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_care_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (avatar_path is null or avatar_path like user_id::text || '/avatars/%')
);
create table public.plant_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  gemini_model text not null,
  identification jsonb,
  raw_response jsonb,
  status text not null default 'processing' check (status in ('processing','completed','not_plant','uncertain','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (image_path like user_id::text || '/scans/%')
);
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_id uuid not null unique,
  nickname text not null check (char_length(nickname) between 1 and 80),
  common_name text not null,
  scientific_name text not null,
  category text not null,
  image_path text not null,
  identification jsonb not null,
  care_info jsonb not null,
  aura_score integer not null check (aura_score between 0 and 100),
  placement text not null check (placement in ('indoor','window','balcony','porch')),
  light text not null check (light in ('low','medium','high')),
  pot_type text not null default 'terracotta' check (pot_type in ('terracotta','porcelain','wood','clay')),
  care_status text not null default 'good' check (care_status in ('good','happy','needs-water','needs-wipe')),
  last_watered_at timestamptz,
  last_checked_at timestamptz,
  moisture_result text check (moisture_result in ('dry','moist','wet')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (scan_id, user_id) references public.plant_scans(id, user_id),
  check (image_path like user_id::text || '/scans/%')
);
create table public.growth_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id uuid not null,
  image_path text not null,
  note text not null default '' check (char_length(note) <= 1000),
  badge_label text not null default 'ภาพใหม่' check (char_length(badge_label) <= 80),
  ai_assessment jsonb,
  created_at timestamptz not null default now(),
  foreign key (plant_id, user_id) references public.plants(id, user_id) on delete cascade,
  check (image_path like user_id::text || '/growth/%')
);
create table public.missions (
  id text primary key,
  title text not null,
  kind text not null unique check (kind in ('moisture','wipe','photo')),
  reward_xp integer not null check (reward_xp between 0 and 100),
  reward_coins integer not null check (reward_coins between 0 and 100),
  icon text not null,
  instruction text not null,
  tip text not null,
  action_text text not null
);
create table public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null references public.missions(id),
  plant_id uuid not null,
  status text not null default 'pending' check (status in ('pending','completed','postponed','skipped')),
  due_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plant_id, mission_id),
  foreign key (plant_id, user_id) references public.plants(id, user_id) on delete cascade
);

create index plant_scans_owner_created on public.plant_scans(user_id, created_at desc);
create index plants_owner_created on public.plants(user_id, created_at desc);
create index growth_logs_owner_plant_created on public.growth_logs(user_id, plant_id, created_at desc);
create index user_missions_owner_status on public.user_missions(user_id, status);
create index user_missions_plant on public.user_missions(plant_id);
create index user_missions_definition on public.user_missions(mission_id);
create index growth_logs_plant on public.growth_logs(plant_id);

alter table public.profiles enable row level security;
alter table public.plants enable row level security;
alter table public.plant_scans enable row level security;
alter table public.growth_logs enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
create policy own_profile_read on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy own_plants_read on public.plants for select to authenticated using ((select auth.uid()) = user_id);
create policy own_plants_insert on public.plants for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_plants_update on public.plants for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_scans_read on public.plant_scans for select to authenticated using ((select auth.uid()) = user_id);
create policy own_logs_read on public.growth_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy own_logs_insert on public.growth_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy mission_definitions_read on public.missions for select to authenticated using (true);
create policy own_progress_read on public.user_missions for select to authenticated using ((select auth.uid()) = user_id);

-- Grants are explicit: browser cannot edit scan results, XP, rewards or ownership.
revoke all on public.profiles, public.plants, public.plant_scans, public.growth_logs, public.missions, public.user_missions from anon, authenticated;
grant select on public.profiles, public.plants, public.plant_scans, public.growth_logs, public.missions, public.user_missions to authenticated;
grant insert on public.plants, public.growth_logs to authenticated;
grant update (nickname) on public.plants to authenticated;
grant all on public.profiles, public.plants, public.plant_scans, public.growth_logs, public.missions, public.user_missions to service_role;

insert into public.missions (id,title,kind,reward_xp,reward_coins,icon,instruction,tip,action_text) values
('moisture','ตรวจความชื้นดิน','moisture',15,10,'💧','ตรวจดินก่อนรดน้ำ หากยังชื้นหรือแฉะให้งดน้ำ','ระยะรดน้ำเป็นเพียงประมาณการ ต้องตรวจดินจริง','บันทึกตรวจดินแล้ว'),
('wipe','เช็ดใบ','wipe',25,10,'🍃','ใช้ผ้านุ่มชุบน้ำบิดหมาด เช็ดใบเบา ๆ','หากใบสะอาดอยู่ สามารถเลื่อนได้','เช็ดใบเรียบร้อยแล้ว'),
('photo','ถ่ายภาพต้นไม้','photo',20,15,'📷','เลือกภาพใหม่และบันทึกในหน้าบันทึกการเติบโต','ใช้มุมและแสงใกล้เคียงเดิมเพื่อเปรียบเทียบ','บันทึกภาพแล้ว');

create function private.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function private.touch_updated_at();
create trigger plants_touch before update on public.plants for each row execute function private.touch_updated_at();
create trigger scans_touch before update on public.plant_scans for each row execute function private.touch_updated_at();
create trigger missions_touch before update on public.user_missions for each row execute function private.touch_updated_at();

create function private.initialize_profile() returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.profiles(user_id) values (auth.uid()) on conflict do nothing;
end; $$;
create function public.initialize_profile() returns void language sql security invoker set search_path = '' as $$ select private.initialize_profile(); $$;

-- Internal helper, accessible only through ownership-checked operations/triggers.
create function private.award(owner_id uuid, earned_xp integer, earned_coins integer, care boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'Asia/Bangkok')::date;
begin
  insert into public.profiles(user_id) values (owner_id) on conflict do nothing;
  update public.profiles set level = level + (xp + earned_xp) / 400,
    xp = (xp + earned_xp) % 400, coins = coins + earned_coins,
    streak = case when not care then streak when last_care_date = today then streak
      when last_care_date = today - 1 then streak + 1 else 1 end,
    last_care_date = case when care then today else last_care_date end
  where user_id = owner_id;
end; $$;

create function private.validate_plant() returns trigger language plpgsql security definer set search_path = '' as $$
declare scan public.plant_scans; candidate jsonb; requirement text; distance integer; position_score integer;
begin
  select * into scan from public.plant_scans where id = new.scan_id and user_id = new.user_id;
  if scan.id is null or scan.status not in ('completed','uncertain') or coalesce((scan.identification->>'isPlant')::boolean,false) = false then
    raise exception 'A valid plant scan is required';
  end if;
  if new.image_path <> scan.image_path then raise exception 'Image does not match scan'; end if;
  if scan.identification->>'scientificName' = new.scientific_name then candidate := scan.identification;
  else select value into candidate from jsonb_array_elements(scan.identification->'alternativeCandidates') where value->>'scientificName' = new.scientific_name limit 1; end if;
  if candidate is null or coalesce(candidate->>'scientificName','') = '' or coalesce(candidate->>'commonName','') = '' then raise exception 'Unknown species'; end if;
  new.common_name := candidate->>'commonName'; new.category := candidate->>'category';
  new.care_info := candidate;
  new.identification := candidate || jsonb_build_object('isPlant', true, 'alternativeCandidates', scan.identification->'alternativeCandidates');
  requirement := candidate->>'sunlightRequirement';
  if requirement = 'unknown' then new.aura_score := 50;
  else
    distance := abs((case requirement when 'low' then 0 when 'medium' then 1 else 2 end) - (case new.light when 'low' then 0 when 'medium' then 1 else 2 end));
    position_score := case requirement
      when 'low' then case new.placement when 'indoor' then 60 when 'window' then 45 when 'balcony' then 15 else 30 end
      when 'medium' then case new.placement when 'indoor' then 30 when 'window' then 60 when 'balcony' then 35 else 45 end
      else case new.placement when 'indoor' then 10 when 'window' then 35 when 'balcony' then 60 else 50 end end;
    new.aura_score := (case distance when 0 then 40 when 1 then 20 else 0 end) + position_score;
  end if;
  -- Initial care timestamps cannot be fabricated by inserts.
  new.last_watered_at := null; new.last_checked_at := null; new.care_status := 'good';
  return new;
end; $$;
create trigger plants_validate before insert on public.plants for each row execute function private.validate_plant();

create function private.plant_created() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_missions(user_id, plant_id, mission_id) select new.user_id, new.id, id from public.missions;
  perform private.award(new.user_id,40,30); return new;
end; $$;
create trigger plants_created after insert on public.plants for each row execute function private.plant_created();

create function private.mission_reward() returns trigger language plpgsql security definer set search_path = '' as $$
declare definition public.missions;
begin
  if new.status = 'completed' and old.status <> 'completed' then
    select * into definition from public.missions where id = new.mission_id;
    perform private.award(new.user_id,definition.reward_xp,definition.reward_coins,true);
  end if;
  return new;
end; $$;
create trigger mission_reward after update on public.user_missions for each row execute function private.mission_reward();

create function private.set_mission_status(target_mission uuid, next_status text) returns void language plpgsql security definer set search_path = '' as $$
declare progress public.user_missions; kind text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if next_status not in ('completed','postponed','skipped') then raise exception 'Invalid status'; end if;
  select * into progress from public.user_missions where id = target_mission and user_id = auth.uid() for update;
  if progress.id is null then raise exception 'Mission not found'; end if;
  if progress.status = 'completed' then return; end if;
  select m.kind into kind from public.missions m where m.id = progress.mission_id;
  if next_status = 'completed' and kind = 'photo' and not exists(select 1 from public.growth_logs where plant_id = progress.plant_id and user_id = auth.uid()) then
    raise exception 'Save a growth photo first';
  end if;
  update public.user_missions set status = next_status,
    completed_at = case when next_status = 'completed' then now() else null end,
    due_at = case when next_status = 'postponed' then now() + interval '1 day' when next_status = 'skipped' then now() + interval '7 days' else due_at end
  where id = progress.id;
end; $$;
create function public.set_mission_status(target_mission uuid, next_status text) returns void language sql security invoker set search_path = '' as $$ select private.set_mission_status(target_mission,next_status); $$;

create function private.record_care(target_plant uuid, care_kind text) returns void language plpgsql security definer set search_path = '' as $$
declare plant public.plants; today date := (now() at time zone 'Asia/Bangkok')::date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if care_kind not in ('water','dry','moist','wet') then raise exception 'Invalid care'; end if;
  select * into plant from public.plants where id = target_plant and user_id = auth.uid() for update;
  if plant.id is null then raise exception 'Plant not found'; end if;
  if care_kind = 'water' then
    update public.plants set last_watered_at = now(), care_status = 'happy' where id = plant.id;
    if plant.last_watered_at is null or (plant.last_watered_at at time zone 'Asia/Bangkok')::date <> today then perform private.award(plant.user_id,10,5,true); end if;
  else
    update public.plants set last_checked_at = now(), moisture_result = care_kind,
      care_status = case when care_kind = 'dry' then 'needs-water' else 'good' end where id = plant.id;
    -- Complete the one-time intro mission; its trigger awards once, atomically.
    update public.user_missions set status = 'completed', completed_at = now()
    where plant_id = plant.id and user_id = auth.uid() and mission_id = 'moisture' and status <> 'completed';
    perform private.award(plant.user_id,0,0,true);
  end if;
end; $$;
create function public.record_care(target_plant uuid, care_kind text) returns void language sql security invoker set search_path = '' as $$ select private.record_care(target_plant,care_kind); $$;

create function private.growth_created() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.award(new.user_id,20,15);
  update public.user_missions set status = 'completed', completed_at = now()
  where user_id = new.user_id and plant_id = new.plant_id and mission_id = 'photo' and status <> 'completed';
  return new;
end; $$;
create trigger growth_created after insert on public.growth_logs for each row execute function private.growth_created();

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.initialize_profile(), private.set_mission_status(uuid,text), private.record_care(uuid,text) to authenticated;
revoke all on function public.initialize_profile(), public.set_mission_status(uuid,text), public.record_care(uuid,text) from public, anon;
grant execute on function public.initialize_profile(), public.set_mission_status(uuid,text), public.record_care(uuid,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('plant-images','plant-images',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy plant_images_select on storage.objects for select to authenticated
using (bucket_id = 'plant-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy plant_images_insert on storage.objects for insert to authenticated
with check (bucket_id = 'plant-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy plant_images_update on storage.objects for update to authenticated
using (bucket_id = 'plant-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'plant-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy plant_images_delete on storage.objects for delete to authenticated
using (bucket_id = 'plant-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
