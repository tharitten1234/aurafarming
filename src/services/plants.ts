import type { Plant, PlacementConfig, PlantCandidate, ScanResult } from '../types';
import { db, check } from './supabase';
import { signedImage } from './images';
import { ensureSession } from './auth';
import { calculateAuraScore, lightLabels, locationLabels } from './auraScore';
import { ASSETS } from '../data/mockData';
import { canSaveCandidate, identificationSchema } from '../../supabase/functions/_shared/identification';
import {careStatus} from './careRules';
import {careWarnings} from '../../supabase/functions/_shared/care-sources';

export function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }) : 'ยังไม่มีบันทึก';
}
export function candidateFeatures(candidate: PlantCandidate) {
  return [lightLabels[candidate.sunlightRequirement],
    candidate.wateringIntervalDays ? `ตรวจดินทุก ${candidate.wateringIntervalDays} วัน` : 'ตรวจดินก่อนรดน้ำ',
    ...careWarnings(candidate.scientificName,candidate.warnings).slice(0, 2)];
}
export async function listPlants(): Promise<Plant[]> {
  const { data, error } = await db().from('plants').select('*').is('archived_at', null).order('created_at', { ascending: false });
  check(error);
  const {data:events,error:historyError}=await db().from('care_events').select('*').order('created_at',{ascending:false}); check(historyError);
  const eventLabels:Record<string,string>={water:'รดน้ำ',dry:'ตรวจดิน: แห้ง',moist:'ตรวจดิน: ชื้น',wet:'ตรวจดิน: แฉะ',move:'ย้ายตำแหน่งปลูก'};
  return Promise.all((data ?? []).map(async row => {
    const identification = identificationSchema.parse(row.identification);
    return {
      id: row.id, name: row.common_name, scientificName: row.scientific_name,
      nickname: row.nickname, daysPlanted: Math.max(1, Math.floor((Date.now() - Date.parse(row.created_at)) / 86400000) + 1),
      auraScore: row.aura_score, plantMatchScore: row.aura_score, source: row.source,
      location: locationLabels[row.placement as PlacementConfig['location']],
      sunlight: lightLabels[row.light as PlacementConfig['light']], image: row.source === 'manual' ? ASSETS.plant1Thumb : await signedImage(row.image_path),
      imagePath: row.image_path, pixelSprite: /cact|succul|Opuntia/i.test(row.scientific_name) ? ASSETS.plant3Thumb : /Ocimum|basil/i.test(row.scientific_name) ? ASSETS.plant4Thumb : /Jasmin/i.test(row.scientific_name) ? ASSETS.plant2Thumb : ASSETS.plant1Thumb, potType: row.pot_type,
      features: candidateFeatures(identification),
      careStatus: careStatus(row,identification),
      lastWatered: displayDate(row.last_watered_at), lastCheckedMoisture: displayDate(row.last_checked_at),
      lastWateredAt: row.last_watered_at, lastCheckedAt: row.last_checked_at,
      identification, createdAt: row.created_at,
      careHistory:(events??[]).filter(event=>event.plant_id===row.id).map(event=>({id:event.id,date:displayDate(event.created_at),label:eventLabels[event.kind]??event.kind})),
    };
  }));
}
export function placementFromLabels(location: string, sunlight: string): PlacementConfig {
  const position = Object.entries(locationLabels).find(([,label]) => location === label)?.[0] as PlacementConfig['location'] | undefined;
  return { location: position ?? 'window', light: /น้อย/.test(sunlight) ? 'low' : /มาก|จัด/.test(sunlight) ? 'high' : 'medium' };
}
export async function addManualPlant(name: string, nickname: string, config: PlacementConfig, scientificName?: string) {
  const { error } = await db().rpc('add_manual_plant', {common_name:name,nickname,placement:config.location,light:config.light,scientific_name:scientificName ?? null}); check(error);
}
export async function movePlant(id: string, location: string, sunlight: string) {
  const config=placementFromLabels(location,sunlight);
  const { error } = await db().rpc('move_plant',{target_plant:id,new_placement:config.location,new_light:config.light}); check(error);
}
export async function archivePlant(id: string) {
  const { error } = await db().rpc('archive_plant',{target_plant:id}); check(error);
}
export async function savePlant(scan: ScanResult, candidate: PlantCandidate, placement: PlacementConfig) {
  if (!canSaveCandidate(scan.identification, candidate)) throw new Error('ยังระบุชนิดพืชไม่ได้ กรุณาถ่ายภาพใหม่');
  const { user } = await ensureSession();
  const identification = { ...candidate, isPlant: true, alternativeCandidates: scan.identification.alternativeCandidates };
  const { error } = await db().from('plants').insert({
    user_id: user.id, scan_id: scan.scanId, nickname: candidate.commonName,
    common_name: candidate.commonName, scientific_name: candidate.scientificName,
    category: candidate.category, image_path: scan.imagePath, identification,
    care_info: candidate, aura_score: calculateAuraScore(candidate, placement).totalScore,
    placement: placement.location, light: placement.light,
  });
  check(error);
}
export async function renamePlant(id: string, nickname: string) {
  const { error } = await db().from('plants').update({ nickname }).eq('id', id).select('id').single();
  check(error);
}
export async function recordCare(id: string, kind: 'water' | 'dry' | 'moist' | 'wet') {
  const { error } = await db().rpc('record_care', { target_plant: id, care_kind: kind });
  if(error?.message?.includes('Fresh dry soil check required'))throw new Error('กรุณาตรวจดินก่อนรดน้ำ หากดินยังชื้นหรือแฉะให้งดรดน้ำ');
  check(error);
}
