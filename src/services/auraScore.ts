import type { PlacementConfig } from '../types';
import type { PlantCandidate } from '../../supabase/functions/_shared/identification';
import { PLANT_DATABASE } from '../data/plantDatabase';

export const lightLabels = { low: 'แสงน้อย', medium: 'แสงรำไร', high: 'แสงมาก แดดตรง', unknown: 'ยังไม่ทราบระดับแสง' };
export const locationLabels = { indoor: 'ในห้อง', window: 'ริมหน้าต่าง', balcony: 'ระเบียง', porch: 'หน้าบ้าน' };
export function calculateAuraScore(plant: Pick<PlantCandidate, 'sunlightRequirement'> & { scientificName?: string }, config: PlacementConfig) {
  const lightLevels = { low: 0, medium: 1, high: 2 };
  const expected = plant.sunlightRequirement;
  if (expected === 'unknown') return {
    totalScore: 50, lightScore: 30, posScore: 20,
    reasons: ['ยังไม่ทราบความต้องการแสง คะแนน 50 เป็นค่ากลางชั่วคราว', 'ตรวจสอบชนิดพืชและความต้องการแสงก่อนเลือกมุมถาวร'],
  };
  const difference = Math.abs(lightLevels[expected] - lightLevels[config.light]);
  const lightScore = [60, 38, 18][difference];
  // Placement is a declared exposure proxy, not an actual air/temperature sensor.
  const catalog = PLANT_DATABASE.find(p => p.scientificName === plant.scientificName);
  const preferred: readonly string[] = catalog?.optimalLocations ?? (expected === 'low' ? ['ในห้อง','ริมหน้าต่าง'] : expected === 'medium' ? ['ริมหน้าต่าง'] : ['ระเบียง','หน้าบ้าน']);
  const location = locationLabels[config.location];
  const posScore = preferred.includes(location) ? 40 :
    (location === 'ในห้อง' && preferred.includes('ริมหน้าต่าง')) || (location === 'ระเบียง' && preferred.includes('หน้าบ้าน')) ? 26 : 14;
  return {
    totalScore: lightScore + posScore, lightScore, posScore,
    reasons: [difference === 0 ? `แสงที่เลือกตรงกับความต้องการ: ${lightLabels[expected]}`
      : `พืชต้องการ${lightLabels[expected]} แต่เลือก${lightLabels[config.light]}`,
    `${location}ได้ ${posScore}/40 คะแนนจากเกณฑ์ตำแหน่ง (ยังไม่ได้วัดแสงจริง)`],
  };
}

