import { z } from 'zod';
import { identificationSchema, type PlantCandidate } from './identification.ts';

export const plantnetResponseSchema = z.object({
  results: z.array(z.object({
    score: z.number().min(0).max(1),
    species: z.object({
      scientificNameWithoutAuthor: z.string().trim().min(1).max(200),
      commonNames: z.array(z.string().max(160)).optional().default([]),
      family: z.object({ scientificNameWithoutAuthor: z.string().max(100) }).optional(),
    }),
  })).max(100),
  version: z.string().max(100).optional(),
  remainingIdentificationRequests: z.number().optional(),
});

export function normalizePlantnet(raw: unknown) {
  const response = plantnetResponseSchema.parse(raw);
  const seen = new Set<string>();
  const candidates: PlantCandidate[] = response.results.sort((a, b) => b.score - a.score)
    .filter(result => {
      const name = result.species.scientificNameWithoutAuthor.toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name); return true;
    }).slice(0, 5).map(({score, species}) => ({
      commonName: species.commonNames.find(name => name.trim())?.trim() || species.scientificNameWithoutAuthor,
      scientificName: species.scientificNameWithoutAuthor,
      category: species.family?.scientificNameWithoutAuthor ?? '',
      confidence: score,
      description: 'ระบุชนิดพืชด้วย Pl@ntNet กรุณาตรวจชื่อและลักษณะพืชก่อนเพิ่มเข้าสวน ข้อมูลการดูแลเฉพาะชนิดยังไม่ทราบ',
      wateringIntervalDays: null, sunlightRequirement: 'unknown',
      temperatureMinC: null, temperatureMaxC: null, careDifficulty: 'unknown',
      warnings: ['ตรวจความชื้นดินก่อนรดน้ำ และตรวจข้อมูลการดูแลเฉพาะชนิดเพิ่มเติม'],
    }));
  const empty = {commonName:'',scientificName:'',category:'',confidence:0,
    description:'Pl@ntNet ไม่พบชนิดพืชในภาพ กรุณาถ่ายใบหรือดอกให้ชัดเจนแล้วลองใหม่',
    wateringIntervalDays:null,sunlightRequirement:'unknown',temperatureMinC:null,temperatureMaxC:null,
    careDifficulty:'unknown',warnings:[]};
  return {identification: identificationSchema.parse({
    isPlant: candidates.length > 0, ...(candidates[0] ?? empty), alternativeCandidates: candidates.slice(1),
  }), response};
}
