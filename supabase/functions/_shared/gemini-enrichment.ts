import {enrichWithGemini,GeminiCareError} from './gemini-care.ts';
import {localizePlantName} from './thai-plant-names.ts';
import type {PlantIdentification} from './identification.ts';
import {careWarnings} from './care-sources.ts';

export async function enrichWithGeminiOutcome(result:PlantIdentification){
 if(!result.isPlant)return {identification:result,careStatus:'not_requested' as const,careError:null};
 try {
  const enriched=await enrichWithGemini(result);
  return {identification:{...localizePlantName(enriched),alternativeCandidates:enriched.alternativeCandidates.map(localizePlantName)},careStatus:'available' as const,careError:null};
 } catch(error){
  if(!(error instanceof GeminiCareError))throw error;
  console.warn('analyze-plant care unavailable',error.code);
  const reason=error.code==='GEMINI_CARE_RATE_LIMIT'?'Gemini จำกัดการใช้งานหรือโควตาไม่เพียงพอ':'Gemini ยังไม่พร้อมให้คำแนะนำการดูแล';
  const candidates=[result,...result.alternativeCandidates].map(candidate=>localizePlantName({...candidate,
   description:`${reason}ในขณะนี้ ผลระบุชนิดและความมั่นใจเป็นของ Pl@ntNet กรุณาตรวจข้อมูลดูแลเฉพาะชนิดเพิ่มเติม`,
   warnings:careWarnings(candidate.scientificName,[reason]),
  }));
  return {identification:{...candidates[0],isPlant:result.isPlant,alternativeCandidates:candidates.slice(1)},careStatus:'unavailable' as const,careError:error.code};
 }
}
export async function enrichWithGeminiSafely(result:PlantIdentification):Promise<PlantIdentification>{
 return (await enrichWithGeminiOutcome(result)).identification;
}
