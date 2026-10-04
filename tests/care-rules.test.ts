import test from 'node:test';
import assert from 'node:assert/strict';
import {bangkokDate,bangkokWeek,currentCareStreak,careStatus,missionCare} from '../src/services/careRules';
import {careWarnings,verifiedCareContext} from '../supabase/functions/_shared/care-sources';
import type {PlantCandidate} from '../src/types';
import {deriveBadges,emptyProfile} from '../src/services/profile';
const candidate:PlantCandidate={commonName:'ชบา',scientificName:'Hibiscus rosa-sinensis',category:'',confidence:.09,description:'ตรวจดินก่อนรดน้ำ',wateringIntervalDays:2,sunlightRequirement:'high',temperatureMinC:null,temperatureMaxC:null,careDifficulty:'unknown',warnings:[]};
test('Bangkok week and streak follow local dates across Sunday/Monday and year boundaries',()=>{
  assert.equal(bangkokDate(new Date('2026-10-04T17:01:00Z')),'2026-10-05');
  assert.equal(bangkokWeek(new Date('2026-10-04T16:59:00Z')),'2026-09-28');
  assert.equal(bangkokWeek(new Date('2026-10-04T17:01:00Z')),'2026-10-05');
  assert.equal(bangkokWeek(new Date('2027-01-01T00:00:00Z')),'2026-12-28');
  const now=new Date('2026-10-05T03:00:00Z');
  assert.equal(currentCareStreak(7,'2026-10-04',now),7);
  assert.equal(currentCareStreak(7,'2026-10-03',now),0);
  assert.equal(currentCareStreak(7,null,now),0);
});
test('Soil observations take precedence over elapsed watering reminders',()=>{
  const now=Date.parse('2026-10-05T03:00:00Z');
  const row={care_status:'needs-water' as const,created_at:'2026-09-01T00:00:00Z',last_watered_at:null,last_checked_at:'2026-10-05T02:00:00Z',moisture_result:'moist'};
  assert.equal(careStatus(row,candidate,now),'good');
  assert.equal(careStatus({...row,moisture_result:'wet'},candidate,now),'good');
  assert.equal(careStatus({...row,moisture_result:'dry'},candidate,now),'needs-water');
  assert.equal(careStatus({...row,last_checked_at:'2026-10-01T00:00:00Z',moisture_result:'dry'},candidate,now),'good','Stale observations require another soil check');
  assert.equal(careStatus({...row,last_checked_at:null},candidate,now),'good','No automatic water demand after arbitrary seven days');
});
test('Mission care is species-specific and unverified toxicity is explicitly unknown',()=>{
  assert.match(missionCare('moisture',candidate).instruction,/ชบา/);
  assert.match(missionCare('wipe',{...candidate,scientificName:'Echinopsis calochlora'}).title!,/ตรวจพืช/);
  assert.match(missionCare('wipe',{...candidate,scientificName:'Monstera deliciosa'}).title!,/เช็ดฝุ่น/);
  const warnings=careWarnings(candidate.scientificName,['ปลอดภัยต่อสัตว์เลี้ยง','ระวังดินแฉะ']);
  assert.match(warnings[0],/ยังไม่มีข้อมูลเพียงพอ/);
  assert.equal(warnings.includes('ปลอดภัยต่อสัตว์เลี้ยง'),false);
  assert.match(careWarnings('Monstera deliciosa',[])[0],/ASPCA/);
  assert.match(verifiedCareContext,/exact Monstera deliciosa only/);
});

test('Earned badges remain unlocked after archiving plants or breaking current streak',()=>{
  const badges=deriveBadges({...emptyProfile,plantCount:0,daysStreak:0,plantsAdded:1,bestCareStreak:7,photosRecorded:5},0);
  assert.ok(badges.every(b=>b.status==='unlocked'));
});
