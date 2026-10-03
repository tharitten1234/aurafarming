import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { calculateAuraScore } from '../src/services/auraScore';

// Real PostgreSQL engine with minimal Auth/Storage schemas, not hosted Supabase.
test('migration: ownership, scan validation, deterministic score, atomic rewards and storage policies', async () => {
  const pg = new PGlite();
  const alice = '11111111-1111-4111-8111-111111111111';
  const bob = '22222222-2222-4222-8222-222222222222';
  const scanId = '33333333-3333-4333-8333-333333333333';
  const species = { isPlant: true, commonName: 'มอนสเตอร่า', scientificName: 'Monstera deliciosa', category: 'foliage',
    confidence: 0.85, description: 'พืชใบ', wateringIntervalDays: 7, sunlightRequirement: 'medium' as const,
    temperatureMinC: 18, temperatureMaxC: 32, careDifficulty: 'easy', warnings: [], alternativeCandidates: [] };
  const path = `${alice}/scans/44444444-4444-4444-8444-444444444444.jpg`;
  try {
    await pg.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create schema storage;
      create table auth.users(id uuid primary key,is_anonymous boolean default false,raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text);
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;
      alter table storage.objects enable row level security;
      grant usage on schema auth,storage,public to authenticated,anon,service_role;
      grant select,insert,update,delete on storage.objects to authenticated;
      insert into auth.users(id) values ('${alice}'),('${bob}');
    `);
    await pg.exec(await readFile(new URL('../supabase/migrations/20261002083143_seminar_mvp.sql', import.meta.url), 'utf8'));
    await pg.exec(await readFile(new URL('../supabase/migrations/20261002084821_security_indexes.sql', import.meta.url), 'utf8'));
    await pg.exec(await readFile(new URL('../supabase/migrations/20261002112622_friend_ui_features.sql', import.meta.url), 'utf8'));
    await pg.exec(await readFile(new URL('../supabase/migrations/20261002175154_farm_onboarding.sql', import.meta.url), 'utf8'));
    const newcomer='99999999-9999-4999-8999-999999999999';
    await pg.query('insert into auth.users(id) values ($1)',[newcomer]);
    assert.equal((await pg.query<{farm_name:string|null}>('select farm_name from public.profiles where user_id=$1',[newcomer])).rows[0].farm_name,null,'Signup creates a profile before onboarding, without a fake farm name');
    await pg.query('insert into public.plant_scans(id,user_id,image_path,gemini_model,identification,status) values ($1,$2,$3,$4,$5,$6)',
      [scanId, alice, path, 'test-model', JSON.stringify(species), 'completed']);
    const become = async (id: string) => {
      await pg.exec('reset role');
      await pg.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
      await pg.exec('set role authenticated');
    };
    await become(alice);
    await pg.exec('select public.initialize_profile()');
    const saved = await pg.query<{ id: string; aura_score: number }>(`insert into public.plants(user_id,scan_id,nickname,common_name,scientific_name,category,image_path,identification,care_info,aura_score,placement,light)
      values ($1,$2,'น้องมอน','fake','Monstera deliciosa','fake',$3,$4,$4,1,'window','medium') returning id,aura_score`,
    [alice, scanId, path, JSON.stringify(species)]);
    const plantId = saved.rows[0].id;
    assert.equal(saved.rows[0].aura_score, calculateAuraScore(species, { location: 'window', light: 'medium' }).totalScore);
    assert.equal((await pg.query('select * from public.user_missions')).rows.length, 3);
    const profile = async () => (await pg.query<{ xp: number; coins: number; level: number; streak: number; aura_points:number }>('select xp,coins,level,streak,aura_points from public.profiles')).rows[0];
    assert.equal((await profile()).xp, 40);
    const task = (await pg.query<{ id: string }>("select id from public.user_missions where mission_id='wipe'")).rows[0].id;
    await pg.query("select public.set_mission_status($1,'completed')", [task]);
    const afterComplete = await profile();
    await pg.query("select public.set_mission_status($1,'completed')", [task]);
    await pg.query("select public.set_mission_status($1,'skipped')", [task]);
    assert.deepEqual(await profile(), afterComplete, 'Completed missions cannot be reopened or rewarded twice');
    await pg.query("select public.record_care($1,'water')", [plantId]);
    const watered = await profile();
    await pg.query("select public.record_care($1,'water')", [plantId]);
    assert.deepEqual(await profile(), watered, 'Same-day water reward must not repeat');
    await pg.query("select public.record_care($1,'dry')", [plantId]);
    const beforeGrowth = await profile();
    await pg.query('insert into public.growth_logs(user_id,plant_id,image_path,note) values ($1,$2,$3,$4)',
      [alice, plantId, `${alice}/growth/new.jpg`, 'ใบใหม่']);
    assert.equal((await profile()).xp, beforeGrowth.xp + 40); // Log + one-time photo mission.
    assert.equal((await profile()).streak, 1);
    assert.equal((await profile()).aura_points,95,'Plant + three missions + growth + weekly bonus');
    await pg.query('insert into storage.objects(bucket_id,name) values ($1,$2)', ['plant-images', path]);
    assert.equal((await pg.query('select * from storage.objects')).rows.length, 1);
    await assert.rejects(pg.exec('update public.profiles set xp=399'), /permission denied/);
    await assert.rejects(pg.exec('update public.plants set aura_score=100'), /permission denied/);
    await assert.rejects(pg.exec("update public.plant_scans set status='completed'"), /permission denied/);
    await become(bob);
    await pg.exec('select public.initialize_profile()');
    for (const table of ['plants','plant_scans','growth_logs','user_missions','care_events'])
      assert.equal((await pg.exec(`select * from public.${table}`))[0].rows.length, 0, `Bob cannot read Alice's ${table}`);
    assert.equal((await pg.query('select * from storage.objects')).rows.length, 0);
    await assert.rejects(pg.query('insert into storage.objects(bucket_id,name) values ($1,$2)', ['plant-images', path]), /row-level security/);
    await assert.rejects(pg.query("select public.record_care($1,'water')", [plantId]), /Plant not found/);
    await assert.rejects(pg.query("select public.set_mission_status($1,'completed')", [task]), /Mission not found/);
    await assert.rejects(pg.query('insert into public.growth_logs(user_id,plant_id,image_path) values ($1,$2,$3)',
      [bob, plantId, `${bob}/growth/new.jpg`]), /foreign key|Active plant required/);
    await become(alice);
    assert.equal((await pg.query('select * from public.plants')).rows.length, 1, 'Saved plant still exists after changing sessions');
    assert.equal((await pg.query('select * from public.growth_logs')).rows.length, 1);
    const manual=(await pg.query<{id:string}>("select public.add_manual_plant('มอนสเตอร่า','Manual test','indoor','medium','Monstera deliciosa') as id")).rows[0].id;
    const added=(await pg.query<{source:string;aura_score:number}>('select source,aura_score from public.plants where id=$1',[manual])).rows[0];
    assert.equal(added.source,'manual');assert.equal(added.aura_score,100,'Catalog preferred indoor position');
    await pg.query("select public.move_plant($1,'porch','high')",[manual]);
    assert.equal((await pg.query<{aura_score:number}>('select aura_score from public.plants where id=$1',[manual])).rows[0].aura_score,calculateAuraScore(species,{location:'porch',light:'high'}).totalScore);
    assert.ok((await pg.query('select * from public.care_events where plant_id=$1',[manual])).rows.length>0,'Placement history persists');
    await assert.rejects(pg.exec('update public.profiles set aura_points=999'),/permission denied/);
    await pg.exec("update public.profiles set display_name='My garden'");
    await become(bob);
    await assert.rejects(pg.query("select public.move_plant($1,'window','medium')",[manual]),/Plant not found/);
    await assert.rejects(pg.query('select public.archive_plant($1)',[manual]),/Plant not found/);
    await become(alice);
    await pg.query('select public.archive_plant($1)',[manual]);
    await assert.rejects(pg.query("select public.record_care($1,'water')",[manual]),/Plant not found/);
    assert.equal((await pg.query('select * from public.plants where id=$1 and archived_at is not null',[manual])).rows.length,1,'Archive preserves recoverable row');
    await pg.exec('reset role');
    await pg.exec("update public.user_missions set week_start=week_start-7");
    await become(alice);
    await pg.exec('select public.initialize_profile()');
    const weekly=(await pg.query<{count:number}>("select count(*)::int as count from public.user_missions where week_start=(date_trunc('week',now() at time zone 'Asia/Bangkok'))::date")).rows[0].count;
    assert.equal(weekly,3,'New week creates missions only for active plants');
    await pg.exec('select public.initialize_profile()');
    assert.equal((await pg.query("select * from public.user_missions where status='pending'")).rows.length,6,'Reinitialization does not duplicate missions');
    await pg.exec('reset role');
    await pg.query("update public.plant_scans set status='not_plant', identification=$1", [JSON.stringify({ ...species, isPlant: false })]);
    await become(bob);
    await assert.rejects(pg.query(`insert into public.plants(user_id,scan_id,nickname,common_name,scientific_name,category,image_path,identification,care_info,aura_score,placement,light)
      values ($1,$2,'fake','fake','Monstera deliciosa','fake',$3,$4,$4,100,'window','medium')`,
      [bob, scanId, `${bob}/scans/fake.jpg`, JSON.stringify(species)]), /valid plant scan/);
    await become(alice);
    await pg.query('select public.set_farm_name($1)',['สวน Alice']);
    assert.equal((await pg.query<{farm_name:string|null}>('select farm_name,display_name from public.profiles')).rows[0].farm_name,'สวน Alice');
    await assert.rejects(pg.query('select public.set_farm_name($1)',['   ']),/Farm name/);
    await assert.rejects(pg.query('select public.set_farm_name($1)',['x'.repeat(81)]),/Farm name/);
    await become(bob);
    await pg.query('select public.set_farm_name($1)',['สวน Bob']);
    assert.equal((await pg.query<{farm_name:string|null}>('select farm_name from public.profiles')).rows[0].farm_name,'สวน Bob');
    assert.equal((await pg.query('select * from public.profiles where user_id=$1',[alice])).rows.length,0,'Another farm profile stays private');
    assert.equal((await pg.query('select * from public.plants')).rows.length,0,'New account does not inherit existing garden plants');
    await pg.exec('reset role');
    assert.equal((await pg.query<{farm_name:string|null}>('select farm_name from public.profiles where user_id=$1',[alice])).rows[0].farm_name,'สวน Alice','Other account naming cannot change the first farm');
    await pg.exec('set role anon');
    await assert.rejects(pg.exec("select public.set_farm_name('Unauthorized')"),/permission denied/);
    await assert.rejects(pg.exec('select public.initialize_profile()'), /permission denied/);
  } finally { await pg.close(); }
});


