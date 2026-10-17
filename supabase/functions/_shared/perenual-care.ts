import { z } from 'zod';
import { candidateSchema, type PlantCandidate, type PlantIdentification } from './identification.ts';
import { careWarnings } from './care-sources.ts';
import { thaiPlantNames } from './thai-plant-names.ts';

const speciesSchema = z.object({ id:z.number().int().positive(), scientific_name:z.array(z.string()) });
const listSchema = z.object({data:z.array(speciesSchema)});
const detailSchema = speciesSchema.extend({
  watering:z.string().nullable().optional(), sunlight:z.array(z.string()).nullable().optional(),
  care_level:z.string().nullable().optional(),
});
const cache = new Map<string,{expires:number; detail:z.infer<typeof detailSchema>|null}>();
let unavailableUntil = 0;
export class PerenualCareError extends Error {
  constructor(public code:string, public status=503, public retryAfterSeconds=60) {super(code);}
}
const normalize = (name:string) => name.trim().replace(/\s+/g,' ').toLowerCase();
export function perenualRetryAfter(value:string|null,now=Date.now()) {
  if(!value?.trim())return 60;
  const numeric=Number(value);
  const seconds=Number.isFinite(numeric)?numeric:(Date.parse(value)-now)/1000;
  return Number.isFinite(seconds)?Math.max(1,Math.min(86400,Math.ceil(seconds))):60;
}

async function lookup(name:string,key:string,signal:AbortSignal) {
  const normalized=normalize(name);
  const saved=cache.get(normalized);
  if(saved && saved.expires>Date.now())return saved.detail;
  const get=async(path:string,query?:string) => {
    const url=new URL(`https://www.perenual.com/api/v2/${path}`);
    url.searchParams.set('key',key);
    if(query)url.searchParams.set('q',query);
    let response:Response;
    try {response=await fetch(url,{signal});}
    catch {throw new PerenualCareError(signal.aborted?'PERENUAL_CARE_TIMEOUT':'PERENUAL_CARE_UNAVAILABLE',signal.aborted?504:503);}
    if(response.status===429)throw new PerenualCareError('PERENUAL_CARE_RATE_LIMIT',429,perenualRetryAfter(response.headers.get('Retry-After')));
    if([401,403].includes(response.status))throw new PerenualCareError('PERENUAL_CARE_CONFIGURATION');
    if(response.status===404)return null;
    if(!response.ok)throw new PerenualCareError('PERENUAL_CARE_UNAVAILABLE');
    try{return await response.json();}catch{throw new PerenualCareError('PERENUAL_CARE_INVALID',502);}
  };
  const raw=await get('species-list',name);
  const list=listSchema.safeParse(raw);
  if(!list.success)throw new PerenualCareError('PERENUAL_CARE_INVALID',502);
  // Never borrow care from a different species or cultivar returned by keyword search.
  const match=list.data.data.find(row=>row.scientific_name.some(n=>normalize(n)===normalized));
  let detail:z.infer<typeof detailSchema>|null=null;
  if(match){
    const parsed=detailSchema.safeParse(await get(`species/details/${match.id}`));
    if(parsed.success && parsed.data.scientific_name.some(n=>normalize(n)===normalized))detail=parsed.data;
  }
  if(cache.size>=200)cache.delete(cache.keys().next().value!);
  cache.set(normalized,{expires:Date.now()+3600000,detail});
  return detail;
}

export async function enrichWithPerenual(identification:PlantIdentification, signal?:AbortSignal) {
  if(!identification.isPlant)return identification;
  const key=Deno.env.get('PERENUAL_API_KEY');
  // Recognition already succeeded; optional care must not consume the client's remaining scan timeout.
  const deadline=signal?AbortSignal.any([signal,AbortSignal.timeout(8000)]):AbortSignal.timeout(8000);
  let careUnavailable = !key || Date.now()<unavailableUntil;
  const enrich=async(candidate:PlantCandidate) => {
    let detail:z.infer<typeof detailSchema>|null=null;
    if(!careUnavailable){
      try {detail=await lookup(candidate.scientificName,key!,deadline);}
      catch(error){
        if(!(error instanceof PerenualCareError))throw error;
        // Care is optional: preserve the successful identification even during provider outages.
        careUnavailable=true;
        unavailableUntil=Date.now()+error.retryAfterSeconds*1000;
        console.warn('analyze-plant care unavailable',error.code);
      }
    }
    const watering=detail?.watering?.toLowerCase();
    const waterText:Record<string,string>={frequent:'ต้องการน้ำค่อนข้างมาก',average:'ต้องการน้ำปานกลาง',minimum:'ต้องการน้ำน้อย',none:'ฐานข้อมูลระบุว่าไม่ต้องให้น้ำ'};
    const sunlight=detail?.sunlight?.map(s=>s.toLowerCase())??[];
    const levels=sunlight.map(s=>['full sun'].includes(s)?'high':['part shade','partial shade','sun-part shade','filtered shade'].includes(s)?'medium':['full shade','deep shade'].includes(s)?'low':'unknown');
    const light=levels.length>0 && levels.every(v=>v===levels[0])?levels[0]:'unknown';
    const lightText:Record<string,string>={high:'แดดเต็มวัน',medium:'แสงรำไรหรือร่มบางส่วน',low:'ร่มเงา',unknown:'ยังระบุระดับแสงที่เหมาะสมไม่ได้แน่ชัด'};
    const difficulty=detail?.care_level?.toLowerCase();
    const thaiName=thaiPlantNames[normalize(candidate.scientificName)] ?? (/[\u0e01-\u0e5b]/.test(candidate.commonName)?candidate.commonName:'พืชที่ยังไม่มีชื่อไทยในฐานข้อมูล');
    return candidateSchema.parse({...candidate,commonName:thaiName,
      description:detail?`ข้อมูลจาก Perenual: ${waterText[watering??'']??'ยังไม่มีข้อมูลปริมาณน้ำ'}; ${lightText[light]}. ตรวจความชื้นดินก่อนรดน้ำ ปรับตามสภาพแวดล้อมจริง`:careUnavailable?'Pl@ntNet ระบุชนิดพืชได้ แต่ Perenual ไม่พร้อมให้ข้อมูลดูแลชั่วคราว ตรวจความชื้นดินก่อนรดน้ำ และตรวจข้อมูลเฉพาะชนิดเพิ่มเติม':'Perenual ไม่มีข้อมูลดูแลที่ตรงกับชนิดนี้ หรือข้อมูลอยู่นอกสิทธิ์แผนที่ใช้ กรุณาตรวจข้อมูลเฉพาะชนิดเพิ่มเติม',
      wateringIntervalDays:null,sunlightRequirement:light,temperatureMinC:null,temperatureMaxC:null,
      careDifficulty:['easy','moderate','hard'].includes(difficulty??'')?difficulty:'unknown',
      warnings:careWarnings(candidate.scientificName,[...(!detail?['ยังไม่มีข้อมูลดูแลเฉพาะชนิดจาก Perenual']:[]),...(!thaiPlantNames[normalize(candidate.scientificName)]?['ยังไม่มีชื่อไทยที่ยืนยันได้ โปรดอ้างอิงชื่อวิทยาศาสตร์']:[])]),
    });
  };
  const candidates:PlantCandidate[]=[];
  for(const candidate of [identification,...identification.alternativeCandidates])candidates.push(await enrich(candidate));
  return {...candidates[0],isPlant:true,alternativeCandidates:candidates.slice(1)};
}
