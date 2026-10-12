import { z } from 'zod';
import {candidateSchema,type PlantIdentification} from './identification.ts';
import {thaiPlantNames} from './thai-plant-names.ts';
const shape=candidateSchema.shape;
const careSchema=z.object({commonName:shape.commonName,description:shape.description,wateringIntervalDays:shape.wateringIntervalDays,sunlightRequirement:shape.sunlightRequirement,temperatureMinC:shape.temperatureMinC,temperatureMaxC:shape.temperatureMaxC,careDifficulty:shape.careDifficulty,warnings:shape.warnings});
export const datasetSchema=z.array(z.object({scientific_name:z.string(),aliases:z.array(z.string()),care:careSchema})).max(5);
const normalize=(name:string)=>name.trim().replace(/\s+/g,' ').toLowerCase();
export function enrichWithDataset(result:PlantIdentification,raw:unknown):PlantIdentification {
 if(!result.isPlant)return result;
 const rows=datasetSchema.parse(raw);
 const candidates=[result,...result.alternativeCandidates].map(candidate=>{
  const row=rows.find(row=>[row.scientific_name,...row.aliases].some(name=>normalize(name)===normalize(candidate.scientificName)));
  const care=row?.care ?? {commonName:thaiPlantNames[normalize(candidate.scientificName)]??candidate.commonName,description:'ยังไม่มีข้อมูลดูแลที่ตรงกับชนิดนี้ใน dataset สาธิตของ Supabase กรุณาตรวจข้อมูลเฉพาะชนิดเพิ่มเติม',wateringIntervalDays:null,sunlightRequirement:'unknown',temperatureMinC:null,temperatureMaxC:null,careDifficulty:'unknown',warnings:['พืชนี้อยู่นอก dataset สาธิต 5 ชนิด']};
  return candidateSchema.parse({...candidate,...care,scientificName:candidate.scientificName,confidence:candidate.confidence,category:candidate.category});
 });
 return {...candidates[0],isPlant:true,alternativeCandidates:candidates.slice(1)};
}
